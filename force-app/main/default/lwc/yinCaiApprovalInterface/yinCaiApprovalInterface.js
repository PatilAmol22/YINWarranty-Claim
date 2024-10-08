import {LightningElement,track,wire,api} from 'lwc';
import getSobjects from '@salesforce/apex/YINApprovalInterface.getSobjects';
import getEditAccess from '@salesforce/apex/YINApprovalInterface.getEditAccess';
import getStage from '@salesforce/apex/YINApprovalInterface.getStage';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import Child_Level_1__c from '@salesforce/schema/YIN_Approval_Interface_Configuration__c.Child_Level_1__c';
import getConfiguration from '@salesforce/apex/YINApprovalInterface.getConfiguration';
import createAndSendCustomNotifications from '@salesforce/apex/YINPromotionalActivityController.createAndSendCustomNotifications';
import getApprovalConfiguration from '@salesforce/apex/YINApprovalInterface.getApprovalConfiguration';
import getStageRecords from '@salesforce/apex/YINApprovalInterface.getStageRecords';
import getDefaultStage from '@salesforce/apex/YINApprovalInterface.getDefaultStage';
import processRecord from '@salesforce/apex/YINApprovalInterface.processRecord';
import getChildCmpForButton from '@salesforce/apex/YINApprovalInterface.getChildCmpForButton';
import {NavigationMixin} from 'lightning/navigation';
import Approval_Interface from '@salesforce/label/c.Approval_Interface';
import Select_Module from '@salesforce/label/c.Select_Module';
import Approved_Rejected from '@salesforce/label/c.Approved_Rejected';
import Loading from '@salesforce/label/c.Loading';
import Page from '@salesforce/label/c.Page';
import Close from '@salesforce/label/c.Close';
import You_are_about_to_Approve_Reject_the_seleted_records from '@salesforce/label/c.You_are_about_to_Approve_Reject_the_seleted_records';
import Comments from '@salesforce/label/c.COMMENTS';
import Successful_action from '@salesforce/label/c.Successful_action';
import Approve from '@salesforce/label/c.Approve';
import Reject from '@salesforce/label/c.Reject';
import Cancel from '@salesforce/label/c.Cancel';
import Search from '@salesforce/label/c.Search';
import Pending from '@salesforce/label/c.Pending';
import Pending_At_Higher_Authority from '@salesforce/label/c.Pending_At_Higher_Authority';
import Approved from '@salesforce/label/c.Approved';
import Rejected from '@salesforce/label/c.Rejected';
import Cancelled from '@salesforce/label/c.Cancelled';
import Open from '@salesforce/label/c.Open';
import Rejected_Closed from '@salesforce/label/c.Rejected_Closed';


export default class CaiApprovalInterface extends NavigationMixin(LightningElement) {
    @track isModalOpen = false;
    isUpdateSubStatus = false;
    isUpdateStatus = false;
    comment = '';
    currentPage = 0;
    @track enable_app_rej;
    @track count = 0;
    value = '';
    isSearchable = true;
    sObject = '';
    _sObject = [];
    _options = [];
    records = [];
    gridDataPagination = [];
    formulaField = [];
    gridData = [];
    getRecords = [];
    allSelectedRecords = [];
    showLoading = false;
    childItem = '';
    status = '';
    defaultStage = '';
    virtualGriddata = [];
    selectedIds = []; //currently visible selected checkbox
    lstSelectedRecords = [];
    bypassrowselection = false;
    selectedRows = [];
    selectedRecordEditId = '';
    userUGDN = '';
    @track demandId;
    @track filters = {
        sobject: '',
        stage: ''
    }

    @track showApprovalButton = true;
    @track childCmpName = '';

    @wire(getSobjects)
    getObject({data,error}) 
    {
        if (data) {
            console.log('object data ', data);
            let array = [];

            for (let property in data) {
                array.push({
                    label: data[property],
                    value: property
                });
            }
            this._sObject = array;
        }
        if (error) {
            //console.log('error ', error);
        }
    };

    @wire(getEditAccess,{selectedObject:'$sObject'})
    getEditAccess({data,error}) 
    {
        console.log(' Edit data',data);
        if (data) {
           this.enable_app_rej=data;
        }
        if (error) {
            console.log('error getEditAccess', error);
        }
    };

    @wire(getApprovalConfiguration, {selectedObject: '$sObject',selectedStage: '$defaultStage'}) 
    getObjectApprovalConfiguration({
        data,error}) 
        {
            if (data) {
                console.log('inside getapproval if :', this.sObject);
                console.log('selectedObject 123:', this.sObject);
                console.log('selectedStage 123:', this.defaultStage);
                console.log('data column', data);
                this.gridColumns = JSON.parse(data);
                //this.gridColumns = data;
                console.log('data column 123', this.gridColumns);
            }
            if (error) {
                console.log('selectedObject 234:', this.sObject);
                console.log('selectedStage 234:', this.defaultStage);
                console.log('error 1234 ', error);
            }
    };


    get options() {
        return this._options;
    }

    get optionSobject() {
        return this._sObject;

    }

    gridColumns = [];

    labels = {
        Approval_Interface: Approval_Interface,
        Select_Module: Select_Module,
        Approved_Rejected: Approved_Rejected,
        Loading: Loading,
        Page: Page,
        Close: Close,
        You_are_about_to_Approve_Reject_the_seleted_records: You_are_about_to_Approve_Reject_the_seleted_records,
        Comments: Comments,
        Successful_action: Successful_action,
        Approve: Approve,
        Reject: Reject,
        Cancel: Cancel,
        Search: Search,
        Pending: Pending,
        Pending_At_Higher_Authority: Pending_At_Higher_Authority,
        Approved: Approved,
        Rejected: Rejected,
        Cancelled: Cancelled,
        Open: Open,
        Rejected_Closed : Rejected_Closed
    }

    handleChangeSobject(event) {
        let objectApiName = event.target.value;
        console.log('Order ',objectApiName);
        
        // this._sObject = objectApiName;

        if (objectApiName == 'YIN_Claim__c') {
            this.modalHeader = 'Claim Review';
            this.showApprovalButton = false;
        }
        else if (objectApiName == 'Order-Promotional Activity') {
            this.modalHeader = 'Promotional Activity';
        }else if(objectApiName == 'Account'){
            this.modalHeader = 'Account On Boarding';
        }
        else if(objectApiName == 'YIN_Change_Request__c-Credit Limit Proposal'){
            this.modalHeader = 'Credit Limit Proposal';
        }
        if(objectApiName == 'Order-Promotional Order'){
            this.showApprovalButton = true;
            this.enable_app_rej = false;
        }
        this.getButtonCmpName(objectApiName);
        this.sObject = objectApiName;
        this.filters = {
            sobject: objectApiName,
            stage: this.defaultStage
        };

        getStage({selectedObject: objectApiName})
        .then(stages => {
            
            let stageOptions = stages.map(ele => ({
                label: this.labels[ele.replaceAll(' ', '_')],
                value: ele.replaceAll(' ', '_')
            }))
            this._options = stageOptions;
            getDefaultStage({selectedObject: objectApiName})
            .then(defaultStage => {
                this.getGridData(objectApiName, defaultStage);
                defaultStage = defaultStage.replaceAll(' ', '_');
                let selectedValue = this.template.querySelector(`[data-name='${defaultStage}']`)?.value;
                this.defaultStage = selectedValue;
                this.template.querySelector(`[data-name=${defaultStage}]`).checked = true;
                let obj = {
                    sobject: this.sObject,
                    stage: defaultStage
                };
                this.filters = obj;
                console.log('this.filters',this.filters);
                getConfiguration({selectedObject: objectApiName})
                .then(fetchingChild => {
                        this.childItem = fetchingChild.Child_Level_1__c;
                        this.status = fetchingChild.Approve_Reject_By_Status__c;
                        console.log('.this.status',this.status);
                        console.log('this.defaultStage',this.defaultStage);
                        //  this.userUGDN = fetchingChild.UGDN_Number__c;
                        // if (this.status?.split(';').includes(this.defaultStage) && this.defaultStage) {
                        //     this.enable_app_rej = false;
                        // } else {
                        //     this.enable_app_rej = true;
                        // }
                        //console.log('this.enable_app_rej',this.enable_app_rej);
                    })
                    .catch(error => {
                        //console.log('error fetching Default stages', error);
                    });

            }).catch(error => {
                //console.log('error fetching Default stages', error);
            });
        }).catch(error => {
            //console.log('error fetching stages', error);
        })

    }

    getGridData(sObject, stageValue) {
        this.showLoading = true;
        this.gridData = [];
        console.log('sObject records', sObject);
        console.log('stageValue records', stageValue);
        getStageRecords({
            selectedObject: sObject,
            selectedStage: stageValue.replaceAll(' ', '_')
        }).then(gridRecord => {
            //let paramField1 = getFieldValue(gridRecord.Child_Level_1__c, Child_Level_1__c);
            console.log('GridData records', gridRecord);
            let lineitem = this.childItem;
            let parseData = JSON.parse(JSON.stringify(gridRecord));
            for (let i = 0; i < parseData.length; i++) {
                parseData[i]._children = parseData[i][lineitem];
                parseData[i].link = "/" + parseData[i].Id;
                delete parseData[i][lineitem];
            }
            parseData = parseData.map(ele => {
                for (let [key, value] of Object.entries(ele)) {
                    if (key.match('__r') && key != (this.childItem) && value) {
                        for (let [keyo, valueo] of Object.entries(value)) {
                            ele[key + '_' + keyo] = valueo;
                        }
                    }
                    // else{
                    //     // if(key.endsWith('Id') && key.match('Id') && key != (this.childItem) && value)
                    //     for (let [keyo, valueo] of Object.entries(value)) {
                    //         ele[key + '_' + keyo] = valueo;
                    //     } 
                    // }
                }
                return ele;
            })
            console.log('parse Data',JSON.stringify(parseData) );
             if(this.sObject.includes('YIN_Change_Request__c')){
                console.log('inside YIN_Change_Request__c');
                parseData = parseData.map(ele=>{
                    console.log('inside YIN_Change_Request__c 1');
                    return {...ele,Id:'/'+ele.Id,Account_Name:ele.Account__r.Name,ZSM:ele.ZSM__r.Name}
                })
                console.log('inside YIN_Change_Request__c 123',JSON.stringify(parseData));
             }

             if(this.sObject.includes('Order')){
                //console.log('inside order');
                parseData = parseData.map(ele=>{
                    //console.log('inside order 1');
                    return {...ele,Id:'/'+ele.Id,Account_Name:ele.Account.Name,Pricebook2_Name:ele.Pricebook2.Name,RecordType_Name:ele.RecordType.Name}
                })
                //console.log('inside order 123',JSON.stringify(parseData));
             }

            //console.log('parseData', parseData)
            this.gridData = parseData;
            this.gridDataPagination = parseData;
            this.virtualGriddata = parseData
            setTimeout(() => {

                this.showLoading = false;
            }, 200);


        }).catch(error => {
            console.log('error fetching records', error);
            this.showLoading = false;
        })

    }


    handleStageSelected(event) {
        this.showLoading = true;
        console.log('Stages This object', this.sObject);
        console.log('Stages This object', this.stage);
        let obj = {
            sobject: this.sObject,
            stage: event.target.value
        };
        this.filters = obj;
        let stageValue = event.target.value.replaceAll('_', ' ');
        console.log('Stages This object', this.stageValue);
        this.defaultStage = event.target.value;
        console.log('defaultStage Stages This object', this.defaultStage);
        this.getGridData(this.sObject, stageValue);
        //console.log('this.status?.split Handle ', this.status, ' ', this.defaultStage);
        // if (this.status?.split(';').includes(this.defaultStage)) {
        //     this.enable_app_rej = false;
        // } else {
        //     this.enable_app_rej = true;
        // }

    }

    handlePaginationAction(event) {
        setTimeout(() => {
            //console.log('curret Page ', event.detail.currentPage);
            this.currentPage = event.detail.currentPage;
            this.gridDataPagination = event.detail.values;
            let selectedRowstemp = this.lstSelectedRecords[this.lstSelectedRecords.findIndex(ele => ele.pageNumber == this.currentPage)]?.selectedRows;
            this.selectedRows = selectedRowstemp ? selectedRowstemp : [];
            //console.log('this.selectedRows pagination', this.selectedRows);

        }, 200);
    }

    handleEdit(event) {
        this.selectedRecordEditId = event.detail.row.Id;
        //console.log(' this.selectedRecordEditId>>>', event.detail.row.Id);
        //this.selectedRecordEditId='';
        this.demandId = event.detail.row.Id;
        this.isUpdateSubStatus = true;
        //  if(this.sObject == 'Demand_Generation__c'){
        //     this.isUpdateStatus = true;
        //     if(this.demandId !=null)
        //     {
        //       this.handleNavigation(this.demandId);
        //     }
        //   }
        //   else if (this.sObject == 'Return_Sales_Order__c') {
        //     this.isUpdateSubStatus = true;
        //   }	
        this.isModalOpen = false;

    }


    setSelectedRows(event) {
        let selectRows = this.template.querySelector('lightning-tree-grid').getSelectedRows();
        //console.log('selectRows', selectRows);
        let ids = '';
        if (selectRows.length > 0) {
            selectRows.forEach(currentItem => {
                ids = ids + ',' + currentItem.Id;
            });
            this.selectedIds = ids.replace(/^,/, '')?.split(',');
        } else {
            this.selectedIds = [];
        }

        let index = this.lstSelectedRecords.findIndex(ele => ele.pageNumber == this.currentPage);
        let obj = {
            pageNumber: this.currentPage,
            selectedRows: this.selectedIds
        };
        if (index == -1) {
            this.lstSelectedRecords.push(obj);
        } else {
            this.lstSelectedRecords[index].selectedRows = obj.selectedRows;
        }
        //console.log('Hello objevt', this.lstSelectedRecords);
    }


    handleSearch(event) {
        let input = event.detail.input;
        let fieldName = event.detail.fieldName;
        //console.log('input:', input);
        //console.log('fieldName', fieldName);
        this.virtualGriddata = JSON.parse(JSON.stringify(this.virtualGriddata));
        //console.log('Data ', this.virtualGriddata);

        if (input) {
            this.gridData = this.virtualGriddata.filter(ele => {
                //console.log('fieldName 1 ', ele[fieldName]);
                return (ele[fieldName].toString())?.includes(input);
            });
        } else {
            this.gridData = this.virtualGriddata;
        }

    }

    openModal() {
        // to open modal set isModalOpen tarck value as true

        this.getRecords = this.lstSelectedRecords.map((item) => item.selectedRows);
        this.getRecords = this.getRecords.flat(1);
        this.count = this.getRecords.length;
        if (this.count > 0) {
            this.isModalOpen = true;
        } else {
            this.showToast('Warning', 'Please select atleast one record.', 'warning');
        }
    }
    closeModal() {
        // to close modal set isModalOpen tarck value as false
        this.isModalOpen = false;
        this.comment = '';
    }
    submitDetails() {
        // to close modal set isModalOpen tarck value as false
        //Add your code to call apex method or do some processing
        this.isModalOpen = false;
    }

    connectedCallback() {
        //console.log('this.status?.split ', this.status, ' ', this.defaultStage);
        // if (this.status?.split(';').includes(this.defaultStage) && this.defaultStage) {
        //     this.enable_app_rej = false;
        // } else {
        //     this.enable_app_rej = true;
        // }

    }

    handleChangeComment(event) {
        this.comment = event.target.value;
    }


    handleconformClick(event) {
        if (event.target.name === 'Approve') {
            this.showLoading = true;
            //console.log('label' + event.target.label);
            this.originalMessage = event.target.label;
            this.processRecords('Approve', this.comment);
            this.isModalOpen = false;
            this.comment = '';
        } else if (event.target.name === 'Reject') {
            this.showLoading = true;
            //console.log('label' + event.target.label);
            this.originalMessage = event.target.label;
            this.processRecords('Reject', this.comment);
            this.isModalOpen = false;
            this.comment = '';
        }
    }

    processRecords(status, comment) {
        //console.log('lstSelectedRecords', JSON.stringify(this.lstSelectedRecords));
        processRecord({
            records: JSON.stringify(this.getRecords),
            status: status,
            comment: comment
        }).then(result => {
            //console.log('result', result);
            //console.log('sObject', this.sObject);
            //console.log('sObject', JSON.stringify(this.getRecords));
            //this.showToast('Success', 'Successfully Saved', 'success');
            if(this.sObject == 'Order'){
                createAndSendCustomNotifications({orderList:JSON.stringify(this.getRecords)})
                .then(res =>{
                    if(res == 'success'){
                        this.showToast('Success', 'Successfully Saved', 'success');
                    } else if(res == 'error'){
                        //console.log('error in sending bell notification');
                    }  
                }).catch(error => {
                    //console.log('error in sending bell notification 1', error);
                    this.showToast('Error', 'Error' + error, 'error');
                })
            }else{
                this.showToast('Success', 'Successfully Saved', 'success');
            }
           
            this.showLoading = false;
            this.getGridData(this.sObject, this.defaultStage);
        }).catch(error => {
            //console.log('error fetching Default stages', error);
            this.showToast('Error', 'Error' + error, 'error');
            this.showLoading = false;
        })
    }

    getButtonCmpName(objName) {
        this.showLoading = true;
        getChildCmpForButton({selectedObject: objName})
        .then(result => {
            console.log('Button Component ', result);
            if(result.trim().length != 0){
                console.log(' inside if Button Component ', result);
                import(result)
                .then(({ default: ctor }) => (this.childCmpName = ctor))
                .catch((err) => console.log("Error importing component - ", err));
            }
            
            this.showLoading = false;
           
        }).catch(error => {
            console.log('error fetching Button Component - ', error);
            this.showLoading = false;
        })
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }

    handleClose() {
        this.getGridData(this.sObject, this.defaultStage);
        //this.isUpdateSubStatus = false;
        this.isUpdateStatus = false;
    }



    handleNavigation(demandId) {
        //console.log('Demand Generation ID is:' + demandId);
        let compDetails = {
            componentDef: "c:demandGeneration",
            attributes: {
                newdgid: null,
                newdgname: null,
                newdgdata: demandId


            }
        };
        let encodedComponentDef = btoa(JSON.stringify(compDetails));
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + encodedComponentDef
            }
        })
    }

    closeChildModal() {
        this.getGridData(this.sObject, this.defaultStage);
        this.isUpdateSubStatus = false;
    }


}