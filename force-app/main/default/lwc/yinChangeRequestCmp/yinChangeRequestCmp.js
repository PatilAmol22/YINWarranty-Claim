/**
  @description       : Email,Phone And Address Change Request.
  @author            : Amol Patil/amol.patil@skinternational.com
  @group             : SkI 
  @last modified on  : 12-11-2024
  @last modified by  : Amol Patil/amol.patil@skinternational.com
**/
import { LightningElement,track,api,wire} from 'lwc';
import customCSS from '@salesforce/resourceUrl/customCSS';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import { NavigationMixin } from 'lightning/navigation';
import { CloseActionScreenEvent } from 'lightning/actions';
// import getRecord  from '@salesforce/apex/YINChangeRequestController.getRecord';
import createRecord  from '@salesforce/apex/YINChangeRequestController.createRecord';
import getShipToAddress  from '@salesforce/apex/YINChangeRequestController.getShipToAddress';
import getPinCodeDetail  from '@salesforce/apex/YINChangeRequestController.getPinCodeDetail';
import getDealerAcc  from '@salesforce/apex/YINChangeRequestController.getDealerAcc';

export default class YinChangeRequest extends NavigationMixin(LightningElement) {
    valueSelected1 = true;
    valueSelected2 = false;
    valueSelected3 = false;
    valueSelected4 = false;
    valueSelected5 = false;
    showButtons = true;
    showButtons1 = false;
    @track ShowLoding = true;
    value5 = 'email';
    @track changeRequestObj = {};
    @api recordId;
    @track crType = 'Email';
    @track uploadedFileName;
    @track filter1 = {};
    @track objArrey = [];
    @track aadharVerificationParam = {epId:'',emailId:'',phoneNo:'',module:'',erpCustomerCode:''};
    
   async connectedCallback() {
        this.changeRequestObj.type = this.crType;
        this.ShowLoding = false;
        this.objArrey = await this.fetchDealerAccounts();
        console.log('Inside Fetch Account:',this.objArrey );
    }

    get ischangeVisible(){
        return this.shippinglable === 'Change';
        
    }
    get isnewVisible(){
        return this.shippinglable === 'New';
    }
    

    get options5() {
        return [
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Secondary Phone',value: 'phone1'},
            { label: 'Change Billing Address', value: 'changeBilingaddress'},
            { label: 'Change Shipping Address',value: 'changeshippingaddress'},
            { label: 'New Shipping Address',value: 'newshippingaddress'},
        ];
    };

    matchingInfo = {
        primaryField: { fieldPath: "Pincode__c" },
        additionalFields: [{ fieldPath: "City__r.Name"}] 
    };

    displayInfo = {
        additionalFields: ["Combined_Address__c"]
    };

    filter = {
        criteria: [
            {
                fieldPath: "Pincode__c",
                operator: "ne",
                value: "",
            }
        ],
    };

    matchingInfo1 = {
        primaryField: { fieldPath: "Name" },
        additionalFields: [{ fieldPath: "Combined_Address__c"}],
        
    };

    displayInfo1 = {
        additionalFields: ['Combined_Address__c'],
        // additionalFields: ['Address2__c'],
    };

    async handleRadioChange(event) {
        this.ShowLoding = true;
        this.cleardata();
        this.value5 = event.detail.value;
        this.crType = event.target.options.find(opt => opt.value === event.detail.value).label;
        this.changeRequestObj.type = this.crType;
        if(this.value5 =='email'){
            this.valueSelected1 = true;
            this.valueSelected2 = false;
            this.valueSelected3 = false;
            this.valueSelected4 = false;
            this.valueSelected5 = false;
            this.showButtons = true;
            this.showButtons1 = false;
            this.ShowLoding = false;
        }else if (this.value5 == 'phone') {
            this.valueSelected1 = false;
            this.valueSelected5 = false;
            this.valueSelected2 = true;
            this.valueSelected3 = false;
            this.valueSelected4 = false;
            this.showButtons = true;
            this.showButtons1 = false;
            this.ShowLoding = false;
        } 
        else if(this.value5 =='phone1'){
            this.valueSelected1 = false;
            this.valueSelected5 = true;
            this.valueSelected2 = false;
            this.valueSelected3 = false;
            this.valueSelected4 = false;
            this.showButtons = false;
            this.showButtons1 = true;
            this.ShowLoding = false;
        }
        else if(this.value5 =='changeBilingaddress'){
            this.valueSelected1 = false;
            this.valueSelected5 = false;
            this.valueSelected2 = false;
            this.valueSelected3 = true;
            this.valueSelected4 = false;
            this.showButtons = false;
            this.showButtons1 = false;
            this.handleRemoveAttachment();
            console.log('Inside Fetch Account:',this.objArrey );
            this.changeRequestObj.name = this.objArrey[0].Name;
            this.changeRequestObj.dealerName = this.objArrey[0].Name;
            this.changeRequestObj.dealerCode = this.objArrey[0].ERP_Customer_Code__c;
            this.ShowLoding = false;
        
        }
        else if(this.value5 =='changeshippingaddress'){
            this.valueSelected1 = false;
            this.valueSelected2 = false;
            this.valueSelected5 = false;
            this.valueSelected3 = false;
            this.valueSelected4 = true;
            this.showButtons = false;
            this.showButtons1 = false;
            this.filter1 = {
                criteria: [
                    {
                        fieldPath: "Account_Type__c",
                        operator: "eq",
                        value: "Ship To Party",
                    },
                    {
                        fieldPath: "ParentId",
                        operator: "eq",
                        value: this.recordId,
                    }
                ],
                filterLogic: '1 AND 2'
            };
            this.handleRemoveAttachment();
            this.shippinglable = 'Change';
            this.changeRequestObj.dealerName = this.objArrey[0].Name;
            this.changeRequestObj.dealerCode = this.objArrey[0].ERP_Customer_Code__c;
            this.ShowLoding = false;
        }
        else if(this.value5 =='newshippingaddress'){
            this.valueSelected1 = false;
            this.valueSelected2 = false;
            this.valueSelected5 = false;
            this.valueSelected3 = false;
            this.valueSelected4 = true;
            this.showButtons = false;
            this.showButtons1 = false;
            this.handleRemoveAttachment();
            this.shippinglable = 'New';
            this.changeRequestObj.name = this.objArrey[0].Name;
            this.changeRequestObj.dealerName = this.objArrey[0].Name;
            this.changeRequestObj.dealerCode = this.objArrey[0].ERP_Customer_Code__c;
            this.ShowLoding = false;
        }
    };

    renderedCallback() {
        Promise.all([
            loadStyle(this, customCSS)
        ]);
    }

    handleNavigation(epId,emailId,phoneNo,erpCode){
      console.log('ERP Code:',erpCode);
    this.aadharVerificationParam = {epId:epId,emailId:emailId,phoneNo:phoneNo,module:'changeRequest',erpCustomerCode:erpCode};
    }

    async fetchDealerAccounts(){
        console.log('@@@recordId:', this.recordId);
       return await getDealerAcc ({dealerAccount:this.recordId});

    }

    async handlePincode(e){
        console.log('e.target.value:', e.detail.recordId);
        this.changeRequestObj.pincodeId = e.detail.recordId;
        if(this.changeRequestObj.pincodeId != null){
            let pincodes = await getPinCodeDetail({pincode:this.changeRequestObj.pincodeId})
            this.changeRequestObj.city=pincodes[0].City__c !== null && pincodes[0].City__c !== undefined ? pincodes[0].City__r.Name:'';
            this.changeRequestObj.state=pincodes[0].State__c !== null && pincodes[0].State__c !== undefined ? pincodes[0].State__r.Name:'';
            this.changeRequestObj.country = pincodes[0].Country__c !== null && pincodes[0].Country__c !== undefined ? pincodes[0].Country__r.Name:'';
            this.changeRequestObj.district= pincodes[0].District__c !== null && pincodes[0].District__c !== undefined ? pincodes[0].District__r.Name:'';
            // //console.log('@@@@klcm:',pincodes);
            this.changeRequestObj.subDistrict= pincodes[0].Sub_District__c !== null && pincodes[0].Sub_District__c !== undefined ? pincodes[0].Sub_District__r.Name:'';
            this.changeRequestObj.cityId= pincodes[0].City__c === null || pincodes[0].City__c === undefined ? '':pincodes[0].City__c;
            this.changeRequestObj.stateId= pincodes[0].State__c === null || pincodes[0].State__c === undefined ? '':pincodes[0].State__c;
            this.changeRequestObj.countryId= pincodes[0].Country__c === null || pincodes[0].Country__c === undefined ?'': pincodes[0].Country__c;
            this.changeRequestObj.districtId= pincodes[0].District__c === null || pincodes[0].District__c === undefined ? '':pincodes[0].District__c;
            this.changeRequestObj.subDistrictId= pincodes[0].Sub_District__c === null || pincodes[0].Sub_District__c === undefined ? '':pincodes[0].Sub_District__c;
            //this.changeRequestObj.pincode= pincodes[0].Name;
        }else if(this.changeRequestObj.pincodeId === null){
               //console.log('@@@@klcm:');
               await this.clearPincodeDetails();

        }
    }

   async handleShipToAddress(e){
        this.changeRequestObj.shipToAddressId = e.detail.recordId;
        
        if(this.changeRequestObj.shipToAddressId != null){
            let shipToAddress = await getShipToAddress({shipToId:this.changeRequestObj.shipToAddressId})
            console.log('@@@@@@@:', JSON.stringify(shipToAddress));
            this.changeRequestObj.address1=shipToAddress[0].Address__c === null || shipToAddress[0].Address__c === undefined ? '':shipToAddress[0].Address__c;
            this.changeRequestObj.address2=shipToAddress[0].Address2__c === null || shipToAddress[0].Address2__c === undefined ? '':shipToAddress[0].Address2__c;
            this.changeRequestObj.city=shipToAddress[0].City__c !== null && shipToAddress[0].City__c !== undefined ? shipToAddress[0].City__r.Name:'';
            this.changeRequestObj.state=shipToAddress[0].State__c !== null && shipToAddress[0].State__c !== undefined ? shipToAddress[0].State__r.Name:'';
            this.changeRequestObj.country = shipToAddress[0].Country__c !== null && shipToAddress[0].Country__c !== undefined ? shipToAddress[0].Country__r.Name:'';
            this.changeRequestObj.district= shipToAddress[0].District__c !== null && shipToAddress[0].District__c !== undefined ? shipToAddress[0].District__r.Name:'';
            this.changeRequestObj.subDistrict= shipToAddress[0].Sub_District__c !== null && shipToAddress[0].Sub_District__c !== undefined ? shipToAddress[0].Sub_District__r.Name:'';
            this.changeRequestObj.cityId= shipToAddress[0].City__c === null || shipToAddress[0].City__c === undefined ? '':shipToAddress[0].City__c;
            this.changeRequestObj.stateId= shipToAddress[0].State__c === null || shipToAddress[0].State__c === undefined ? '':shipToAddress[0].State__c;
            this.changeRequestObj.countryId= shipToAddress[0].Country__c === null || shipToAddress[0].Country__c === undefined ?'': shipToAddress[0].Country__c;
            this.changeRequestObj.districtId= shipToAddress[0].District__c === null || shipToAddress[0].District__c === undefined ? '':shipToAddress[0].District__c;
            this.changeRequestObj.subDistrictId= shipToAddress[0].Sub_District__c === null || shipToAddress[0].Sub_District__c === undefined ? '':shipToAddress[0].Sub_District__c;
            this.changeRequestObj.pincodeId= shipToAddress[0].Pincode__c === null || shipToAddress[0].Pincode__c === undefined ? '':shipToAddress[0].Pincode__c;
            this.changeRequestObj.pincode= shipToAddress[0].Pincode__c === null || shipToAddress[0].Pincode__c === undefined ? '':shipToAddress[0].Pincode__r.Name;
           
        }else if(this.changeRequestObj.shipToAddressId === null){
            //console.log('Inside Else:');
            await this.clearPincodeDetails();
        }
    }
    //record.Locations__r.Location_Code__c === null || record.Locations__r.Location_Code__c === undefined  ? "" : record.Locations__r.Location_Code__c;

    async clearPincodeDetails() {
        this.changeRequestObj.pincode =  null;
        this.changeRequestObj.pincodeId =  null;
        this.template.querySelector('.clear').clearSelection();
        this.changeRequestObj.city = null;
        this.changeRequestObj.state = null;
        this.changeRequestObj.country = null;
        this.changeRequestObj.district = null;
        this.changeRequestObj.subDistrict = null;
        this.changeRequestObj.cityId = null;
        this.changeRequestObj.stateId = null;
        this.changeRequestObj.countryId = null;
        this.changeRequestObj.districtId = null;
        this.changeRequestObj.subDistrictId = null;
        this.changeRequestObj.address1 = null;
        this.changeRequestObj.address2 = null;
    }
      

    
    handleAddress(e){
        if(e.target.label == 'Billing Address 1' || e.target.label == 'Shipping Address 1'){
            this.changeRequestObj.address1 = e.target.value;
        }else  if(e.target.label == 'Billing Address 2' || e.target.label == 'Shipping Address 2'){
            this.changeRequestObj.address2 = e.target.value;
        }
    }

    handleNameChange(e){
        if(e.target.label == 'Name'){
            this.changeRequestObj.name = e.target.value;
        }else if(e.target.label == 'Name2'){
            this.changeRequestObj.name2 = e.target.value;
        }
    }

    handleContactChange(e){
        this.changeRequestObj.contactName = e.target.value;
    }

    handlePhoneChange(e){
        this.changeRequestObj.phoneNo = e.target.value;
    }

    handlePhone1Change(e){
        this.changeRequestObj.phoneNo1 = e.target.value;
    }

    handleEmailChange(e){
        this.changeRequestObj.emailId = e.target.value;
    }

    handleGSTChange(e){
        this.changeRequestObj.gstRegistration = e.target.value;
    }

    handleWebsiteChange(e){
        this.changeRequestObj.website = e.target.value;
    }

    cleardata(){
        this.changeRequestObj = {};
    }

async handleSubmit() {
    this.ShowLoding = true;
    let numValue = /^[0-9]+$/;
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const closeEvent = new CustomEvent('close');
    try {
        console.log('@@crType===', JSON.stringify(this.changeRequestObj))
        console.log('!@!@!@@:', this.changeRequestObj.attachmentId);
        this.changeRequestObj.dealerId = this.recordId;
        // if (!this.changeRequestObj.emailId && (this.value5 == 'email')) {
        //     this.ShowLoding = false;
        //     this.showToastmessage('Error', 'Email is required.', 'error');
        //     return;}else 
        if(this.value5 == 'email' && (!this.changeRequestObj.emailId || !emailPattern.test(this.changeRequestObj.emailId))) {
            //console.log('inside Email Condition:'); 
            this.ShowLoding = false;
            this.showToastmessage('Error', 'Please enter a valid email address.', 'error');
            return;
        }    
        // else if (!this.changeRequestObj.phoneNo && (this.value5 == 'phone')) {
        //     this.ShowLoding = false;
        //     this.showToastmessage('Error', 'Phone number is required.', 'error');
        //     return;
        // }
        else if (this.value5 == 'phone' && (!this.changeRequestObj.phoneNo || !numValue.test(this.changeRequestObj.phoneNo) || this.changeRequestObj.phoneNo.length < 10 || this.changeRequestObj.phoneNo.length > 10)) {
            //console.log('inside Phone Condition:'); 
            this.ShowLoding = false;
            this.showToastmessage('Error', 'Please enter a valid 10-digit phone number.', 'error');
            return;
        }else if (this.value5 == 'phone1' && (!this.changeRequestObj.phoneNo1 || !numValue.test(this.changeRequestObj.phoneNo1) || this.changeRequestObj.phoneNo1.length < 10 || this.changeRequestObj.phoneNo1.length > 10)) {
            //console.log('inside Phone Condition:'); 
            this.ShowLoding = false;
            this.showToastmessage('Error', 'Please enter a valid 10-digit phone number.', 'error');
            return;
        }
         else if (!this.changeRequestObj.attachmentId && (this.value5 == 'changeBilingaddress' ||this.value5 == 'changeshippingaddress' ||this.value5 == 'newshippingaddress')) {
            this.ShowLoding = false;
            this.showToastmessage('Error', 'Attachment is mandatory.', 'error');
            return;
        }else if (!this.changeRequestObj.pincodeId && (this.value5 == 'changeBilingaddress' ||this.value5 == 'changeshippingaddress' ||this.value5 == 'newshippingaddress')) {
            this.ShowLoding = false;
            this.showToastmessage('Error', 'Please select valid pincode', 'error');
            return;
        }else if (!this.changeRequestObj.address1 && (this.value5 == 'changeBilingaddress' ||this.value5 == 'changeshippingaddress' ||this.value5 == 'newshippingaddress')) {
            this.ShowLoding = false;
            this.showToastmessage('Error', 'Please enter address details.', 'error');
            return;
        }

        let result = await createRecord({
            jsonString: JSON.stringify(this.changeRequestObj)
        });
        let obj = JSON.parse(result);

        if (obj.status == 'success') {
            this.ShowLoding = false;
            if (this.value5 == 'email') {
                this.showToastmessage('Success', 'Email Address change request has been sent successfully for approval.', 'Success');
                this.handleNavigation(obj.changeRequestId, this.changeRequestObj.emailId, this.changeRequestObj.phoneNo,this.objArrey[0].ERP_Customer_Code__c);

                   
            } else if (this.value5 == 'phone') {
                //console.log('inside Phone:',this.changeRequestObj.phoneNo);
                this.showToastmessage('Success', 'Phone Number change request has been sent successfully for approval.', 'Success');
                this.handleNavigation(obj.changeRequestId, this.changeRequestObj.emailId, this.changeRequestObj.phoneNo,this.objArrey[0].ERP_Customer_Code__c);
                //console.log('recID:',obj.changeRequestId);
                
            
            }else if (this.value5 == 'phone1') {
                //console.log('inside Phone:',this.changeRequestObj.phoneNo);
                this.showToastmessage('Success', 'Secondary Phone Number change request has been sent successfully for approval.', 'Success');
                //this.handleNavigation(obj.changeRequestId, this.changeRequestObj.emailId, this.changeRequestObj.phoneNo,this.objArrey[0].ERP_Customer_Code__c);
                //console.log('recID:',obj.changeRequestId);
                this.dispatchEvent(new CloseActionScreenEvent());
                this.dispatchEvent(closeEvent);
                
            
            } 
            else if (this.value5 == 'changeBilingaddress' ) {
                    this.showToastmessage('Success', 'Billing Address change request has been sent successfully for approval.', 'Success');
                    this.dispatchEvent(new CloseActionScreenEvent());
                    this.dispatchEvent(closeEvent);
                
            } else if (this.value5 == 'changeshippingaddress') {
                this.showToastmessage('Success', 'Shipping Address change request has been sent successfully for approval. ', 'Success');
                this.dispatchEvent(new CloseActionScreenEvent());
                this.dispatchEvent(closeEvent);

            } else if (this.value5 == 'newshippingaddress') {
                this.showToastmessage('Success', 'New shipping address created successfully and sent for approval.', 'Success');
                this.dispatchEvent(new CloseActionScreenEvent());
                this.dispatchEvent(closeEvent);
            }
        } else {
            this.ShowLoding = false;
            this.showToastmessage('Error', 'Unable to create record. Please verify the details again.', 'error');
            this.dispatchEvent(new CloseActionScreenEvent());
            this.dispatchEvent(closeEvent);
        }
    } catch (error) {
        //console.log(' inside Catch block:', error);
        this.ShowLoding = false;
        this.showToastmessage('Error', error, 'error');
        alert(error.line);
    }
}


    handleUploadFinished(event){
        //console.log('Inside File Upload:',JSON.stringify(event.detail.files[0]));
        this.changeRequestObj.attachmentId = event.detail.files[0].documentId;
        this.changeRequestObj.attachmentName = event.detail.files[0].name;
        this.uploadedFileName = event.detail.files[0].name;
    }

    handleRemoveAttachment() {
        this.changeRequestObj.attachmentId = null;
        this.changeRequestObj.attachmentName = null;
        this.uploadedFileName = null;
    }

    handleClose(){
        const closeEvent = new CustomEvent('close');
        this.dispatchEvent(new CloseActionScreenEvent());
        this.dispatchEvent(closeEvent);
    }

    showToastmessage(title,message,varient){
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: varient,
            }),
        );
    } 

}