/**
 * @description       : YIN Warranty Create.
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : SKI
 * @last modified on  : 26-08-2024
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
**/

import { LightningElement, track,api } from 'lwc';
import customCSS from '@salesforce/resourceUrl/customCSS';
import { loadStyle } from 'lightning/platformResourceLoader';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import LightningConfirm from 'lightning/confirm';
import { NavigationMixin } from 'lightning/navigation';
import  createCustomer from '@salesforce/apex/YINWarrantyController.createCustomer';
import  getCustomerDetails from '@salesforce/apex/YINWarrantyController.getCustomerDetails';
import  getVehicleInfoById from '@salesforce/apex/YINWarrantyController.getVehicleInfoById';
import  createVehicle from '@salesforce/apex/YINWarrantyController.createVehicle';
import  createWarranty from '@salesforce/apex/YINWarrantyController.createWarranty';
import  editWarranty from '@salesforce/apex/YINWarrantyController.editWarranty';
import  validateCustomer from '@salesforce/apex/YINWarrantyController.validateCustomer';
import  validateVehicle from '@salesforce/apex/YINWarrantyController.validateVehicle';
import  sendOTP from '@salesforce/apex/YINOTPGenerator.sendOTP';


export default class YinWarrantyParentCmp extends NavigationMixin (LightningElement){

@track showLoading = true;
@track bShowModal = false;
@track bShowModal = false; 
@track bShowModal2 = false;
@track bShowModal2 = false; 
@track newPurchase = true;
@track claimReplacement = false;
@track showWarrantyParent = true;
@track showWarrantyInvoiceChild = false;
@track showWarrantyScannerChild = false;
@track showWarrantyThankYouChild = false;
@track isOtpButtonDisabled = false;
@track searchCustomer;
@track warrantyChildObj = {};
@track warrantyScannerChildObj = {};
@track vehicleObj = {};
@track customerObj = {};
@track OTPWrapper = {};
@track filter = {};
@track numValue = /^[0-9]+$/;
@api recordId;
@track otp;
@track oTPButtons = 'Send OTP';
@track isEnterOTPDisabled = true;
@track isDisableWarranty = false;
@track isOTPvalidate = false;
@track dealerObj = {name:'',id:''};
@track warrantyParentObj = {images:{noPlateImgChange:false,noPlateImgName: '',noPlateImgDoc: '',noPlateImg:'',
                                    invoiceImgChange: false,invoiceImgName : '',invoiceImgDoc : '',invoiceImg : '',
                                    odometerImgChange :false,odometerImgName : '',odometerImgDoc : '',odometerImg : '',
                                    extraImgChange : false,  extraImgName : '',extraImgDoc : '', extraImg : ''},tyreList:[],isEditable:false};

@track disabledObj = { vehicalDisabled:true,disabledCustumorSave:true,disabledVehicleSave:true,isNextDisabled:true}



async connectedCallback(){
    //console.log('inside Parent connected:',this.recordId);
    this.warrantyParentObj.type = 'New Purchase';
    this.isEnterOTPDisabled = true; 
    this.warrantyParentObj.id = this.recordId;
    //console.log('inside Parent:',JSON.stringify(this.warrantyParentObj));
    await this.editWarrantyDetails();
    this.showLoading = false;

}

renderedCallback() {
        Promise.all([
            loadStyle(this, customCSS)
        ]);
}

filter={
    criteria: [
    {
        fieldPath: "Customer__r.Id",
        operator: "eq",
        value:null,
        
    }
]}

matchingInfo = {
    primaryField: { fieldPath: "Vehicle_Registration_Number__c" },
};

displayInfo = {
    additionalFields: ["Customer__r.Name"]
};

get options() {
    return [
        { label: 'New Purchase', value: 'New Purchase' },
        { label: 'Claim Replacement', value: 'Claim Replacement' },
    ];
}


handleRadioChange(event) {
    this.showLoading = true;
    const selectedOption = event.detail.value;
    this.clearWarrantyPage();
    this.warrantyParentObj.type = selectedOption;
    this.showLoading = false;
}

openModal() {    
   this.bShowModal = true;
}

closeModal() {    
   this.bShowModal = false;
   this.clearPopupDetails('Customer');
};

openModal2() {    
   this.bShowModal2 = true;
}

closeModal2() {    
   this.bShowModal2 = false;
   this.clearPopupDetails('Vehicle');
};

async editWarrantyDetails(){
    
    let editWarrantydetail = await editWarranty({recordId:this.warrantyParentObj.id ?? null})
    let parsedWarrantyDetailObj = JSON.parse(editWarrantydetail);
    //console.log('Inside Edit Warranty :', JSON.stringify(parsedWarrantyDetailObj));
    if(this.recordId){
        this.isDisableWarranty = true;
        this.warrantyParentObj = parsedWarrantyDetailObj;
        // this.productCode = parsedWarrantyDetailObj.tyreList[0].productCode;
        // //console.log('product code on Edit :', this.productCode );
        if(parsedWarrantyDetailObj.status == 'Draft' || parsedWarrantyDetailObj.status == '' || !parsedWarrantyDetailObj.status){
            //console.log('Inside Edit Warranty if :', parsedWarrantyDetailObj.status);
            this.warrantyParentObj.isEditable = false;
            this.template.querySelector('.newCustomer').disabled = true;
            this.template.querySelector('.newVehicle').disabled = true;
        }else {
            //console.log('Inside Edit Warranty  else:', parsedWarrantyDetailObj.status);
            this.isDisableWarranty = false;
            this.isEnterOTPDisabled = true;
            this.isOtpButtonDisabled = true;
            this.disabledObj.isNextDisabled = false;
            this.warrantyParentObj.isEditable = true;
            this.showToastmessage('Warning','Warranty is already Active you cannot modify.','warning');
        }
        this.warrantyParentObj.monthlyKm = parsedWarrantyDetailObj.monthlyKm.toString();
        this.searchCustomer = parsedWarrantyDetailObj.customerMobile;
        for (let index = 0; index < this.warrantyParentObj.tyreList.length; index++) {
            this.warrantyParentObj.tyreList[index].index = index + 1;
                }
                //console.log('Inside Edit Warranty@@ :', JSON.stringify(this.warrantyParentObj));
    }else if(!this.recordId){

        this.warrantyParentObj.dealerId = parsedWarrantyDetailObj.dealerId ?? '0010T00000fYTVBQA4';
        //console.log('Inside Edit Warranty@@ :',  this.warrantyParentObj.dealerId);
        this.warrantyParentObj.dealerName = parsedWarrantyDetailObj.dealerName ?? '';
        this.dealerObj.id = this.warrantyParentObj.dealerId;
        this.dealerObj.name = this.warrantyParentObj.dealerName;
        this.template.querySelector('.newVehicle').disabled = true;

    }
}

//Search methods
async handleSearchInput(e){
    this.showLoading = true;
    const value = e.target.value;
    this.searchCustomer = value;
    if(this.searchCustomer){
        if(!this.numValue.test(value) || value.length < 10 || value.length > 10){
            this.showLoading = false;
            this.showToastmessage('Error','Please enter a valid 10-digit phone number.','error');
            return;
        }
        let customerobj = await getCustomerDetails({mobileNo:this.searchCustomer})
        let parsedCustomerObj = JSON.parse(customerobj);
        if(parsedCustomerObj.status == 'success'){
            this.showLoading = false;
           // class="newVehicle"
            this.template.querySelector('.newCustomer').disabled = true;
            this.warrantyParentObj.customerId = parsedCustomerObj.id;
    
            //console.log('Cust Id:', this.warrantyParentObj.customerId);
            this.warrantyParentObj.customerName = parsedCustomerObj.name;
            this.warrantyParentObj.customerMobile = parsedCustomerObj.mobile;
            this.filter = {
                criteria: [
                    {
                        fieldPath: "Customer__r.Id",
                        operator: "eq",
                        value:this.warrantyParentObj.customerId,
                        
                    }
                ],
            };
            this.disabledObj.vehicalDisabled = false;
            this.template.querySelector('.newVehicle').disabled = false;
            if(!this.template.querySelector('.clear').value){
                this.template.querySelector('.clear').focus();
                this.template.querySelector('.clear').setCustomValidity('Please Select the vehicle Registration Number');
                }else{
                    this.template.querySelector('.clear').blur();
                    this.template.querySelector('.clear').setCustomValidity('');
                }
                this.template.querySelector('.clear').reportValidity();
        }
        else if(parsedCustomerObj.status == 'error'){
            this.showLoading = false;
            this.showToastmessage('Error','No record found.','error');
            this.template.querySelector('.newCustomer').disabled = false;
            this.template.querySelector('.newVehicle').disabled = true;
            this.disabledObj.vehicalDisabled = true;
        }
    }else if(this.searchCustomer == '' || !this.searchCustomer){
        //console.log('inside search del:');
        this.disabledObj.vehicalDisabled = true;
        this.disabledObj.isNextDisabled = true;
        this.warrantyParentObj.customerId = '';
        this.warrantyParentObj.customerName = '';
        this.warrantyParentObj.customerMobile = '';
        this.warrantyParentObj.registrationNumber= '';
        this.warrantyParentObj.vehicleNo= '';
        this.warrantyParentObj.companyName = '';
        this.warrantyParentObj.modelName = '';
        this.warrantyParentObj.registrationDate = '';
        this.showLoading = false;
        this.template.querySelector('.clear').clearSelection();
        this.template.querySelector('.newCustomer').disabled = false;
        this.template.querySelector('.newVehicle').disabled = true;

    }
    
}

async handleSearchVehicle(e){
    this.showLoading = true;
    let value = e.detail.recordId;
    //console.log('vehical no:', value);
    this.warrantyParentObj.registrationNumber = value;
    if(!value){
        this.template.querySelector('.clear').focus();
        this.template.querySelector('.clear').setCustomValidity('Please Select the vehicle Registration Number');
        }else{
            this.template.querySelector('.clear').blur();
            this.template.querySelector('.clear').setCustomValidity('');
        }
        this.template.querySelector('.clear').reportValidity();
    if(this.warrantyParentObj.registrationNumber != null){
        //console.log('vehical ABC :', value);
        let vehicleobj = await getVehicleInfoById({vehicleId:this.warrantyParentObj.registrationNumber})
        let parsedVehicleObj = JSON.parse(vehicleobj);
        //console.log('vehical data:',JSON.stringify(parsedVehicleObj));
    if(parsedVehicleObj.status == 'success'){
        this.showLoading = false;
        //console.log('vehical if success:');
        this.warrantyParentObj.companyName = parsedVehicleObj.companyName;
        this.warrantyParentObj.modelName = parsedVehicleObj.modelName;
        let formattedDate = parsedVehicleObj.registrationDate.split('-');
        this.warrantyParentObj.registrationDate = formattedDate[2] + '/' + formattedDate[1] + '/' +formattedDate[0];
        this.warrantyParentObj.vehicleNo = parsedVehicleObj.registrationNumber;
        this.template.querySelector('.newVehicle').disabled = true;
    }
    else if(parsedVehicleObj.status == 'error'){
        this.showLoading = false;
        //console.log('vehical else err:');
        this.showToastmessage('Error','No record found.','error'); 
        this.template.querySelector('.newVehicle').disabled = false;
    }
  }else if(this.warrantyParentObj.vehicleId == null){
    this.showLoading = false;
    this.template.querySelector('.clear').clearSelection();
    this.warrantyParentObj.companyName = '';
    this.warrantyParentObj.modelName = '';
    this.warrantyParentObj.registrationDate = '';
    this.warrantyParentObj.vehicleNo = '';
    this.template.querySelector('.newVehicle').disabled = false;
  }

  
}

//Create Customer and Vehical data 
async createNewRecord(e){
    this.showLoading = true;
    const name = e.target.name;
    if(name =='Add Customer'){
        //console.log('inside add cust:');
        let validatecustomerobj =  await validateCustomer({mobileNo:this.customerObj.mobile})
        let parsedCustomerObj = JSON.parse(validatecustomerobj);
        if(parsedCustomerObj.status =='success'){
            let createcustomerobj =  await createCustomer({customerJson:JSON.stringify(this.customerObj)})
            let parsedCustObj = JSON.parse(createcustomerobj);
            //console.log('parsedCustObj:', JSON.stringify(parsedCustObj));
            if(parsedCustObj.status =='success'){
            //console.log('inside add cust save:');
            this.warrantyParentObj.customerId = parsedCustObj.id;
            this.searchCustomer = parsedCustObj.mobile;
            this.warrantyParentObj.customerName = parsedCustObj.name;
            this.warrantyParentObj.customerMobile = parsedCustObj.mobile;
            this.clearPopupDetails('Customer');
            this.showLoading = false;
            this.showToastmessage('Success','Customer record created successfully','success');
            this.disabledObj.vehicalDisabled = false;
            this.disabledObj.disabledCustumorSave = true;
            this.template.querySelector('.newCustomer').disabled = true;
            this.template.querySelector('.newVehicle').disabled = false;
            this.bShowModal = false;
        }else if(parsedCustObj.status =='error'){
            this.clearPopupDetails('Customer');
            this.showLoading = false;
            this.showToastmessage('Error','Failed to create customer record.','error');
            this.disabledObj.vehicalDisabled = true;
            this.disabledObj.disabledCustumorSave = true;
            this.template.querySelector('.newCustomer').disabled = false;
            this.template.querySelector('.newVehicle').disabled = true;
            this.bShowModal = false;
        }else if(parsedVehicleObj.status =='failed'){
            this.clearPopupDetails('Customer');
            this.showLoading = false;
            this.showToastmessage('Error','Failed to create customer record.','error');
            this.disabledObj.disabledVehicleSave = true;
            this.template.querySelector('.newCustomer').disabled = false;
            this.template.querySelector('.newVehicle').disabled = true;
            this.bShowModal = false;
        }
        }else if(parsedCustomerObj.status =='error'){
            this.clearPopupDetails('Customer');
            this.showLoading = false;
            this.showToastmessage('Error','Mobile number is already used. Duplicate records are not allowed.','error');
            this.disabledObj.disabledVehicleSave = true;
            this.disabledObj.disabledCustumorSave = true;
            this.template.querySelector('.newCustomer').disabled = false;
            this.template.querySelector('.newVehicle').disabled = true;
            this.bShowModal = false;
        }
        
        
    }else if(name =='Add Vehicle'){
        this.vehicleObj.registrationNumber = this.vehicleObj.registrationNumber.replace(/\s/g, '').toUpperCase();
        let validateVehicalobj = await validateVehicle({vehicleNo:this.vehicleObj.registrationNumber})
        let parsedVehicleDetailObj = JSON.parse(validateVehicalobj);
        if(parsedVehicleDetailObj.status =='success'){
            this.vehicleObj.name = this.vehicleObj.registrationNumber;
            this.vehicleObj.customerId = this.warrantyParentObj.customerId;
            this.vehicleObj.registrationDate = this.vehicleObj.registrationDate ?? '';
            let createVehicalobj = await createVehicle({vehicleJson:JSON.stringify(this.vehicleObj)})
            let parsedVehicleObj = JSON.parse(createVehicalobj);
            //console.log('parsedVehicalObj:',JSON.stringify(parsedVehicleObj));
            if(parsedVehicleObj.status =='success'){
                this.warrantyParentObj.registrationNumber = parsedVehicleObj.id;
                this.warrantyParentObj.companyName = parsedVehicleObj.companyName;
                this.warrantyParentObj.modelName = parsedVehicleObj.modelName;
                let formattedDate = parsedVehicleObj.registrationDate.split('-');
                this.warrantyParentObj.registrationDate = formattedDate[2] + '/' + formattedDate[1] + '/' +formattedDate[0];
                this.warrantyParentObj.vehicleNo = parsedVehicleObj.registrationNumber;
                //console.log(' this.warrantyParentObj:',JSON.stringify( this.warrantyParentObj));
                this.clearPopupDetails('Vehicle');
                this.showLoading = false;
                this.showToastmessage('Success','Vehicle record created successfully','success');
                this.disabledObj.disabledVehicleSave = true;
                this.template.querySelector('.newVehicle').disabled = true;
                this.bShowModal2 = false;
            }else if(parsedVehicleObj.status =='error'){
                this.clearPopupDetails('Vehicle');
                this.showLoading = false;
                this.showToastmessage('Error','Failed to create Vehicle record.','error');
                this.disabledObj.disabledVehicleSave = true;
                this.template.querySelector('.newVehicle').disabled = false;
                this.bShowModal2 = false;
            }else if(parsedVehicleObj.status =='failed'){
                this.clearPopupDetails('Vehicle');
                this.showLoading = false;
                this.showToastmessage('Error','Failed to create Vehicle record.','error');
                this.disabledObj.disabledVehicleSave = true;
                this.template.querySelector('.newVehicle').disabled = false;
                this.bShowModal2 = false;
            }
        }else if(parsedVehicleDetailObj.status =='error'){
            this.clearPopupDetails('Vehicle');
            this.showLoading = false;
            this.showToastmessage('Error','Vehicle Number is already exist. Duplicate records are not allowed.','error');
            this.disabledObj.disabledVehicleSave = true;
            this.template.querySelector('.newVehicle').disabled = false;
            this.bShowModal2 = false;
        }
          
    }
}

clearPopupDetails(val){
    if(val == 'Customer'){
        this.customerObj.name =  null;
        this.customerObj.mobile =  null;
        this.customerObj.address = null;
        
    }
    else if(val == 'Vehicle'){
        this.vehicleObj.vehicleId = null;
        this.vehicleObj.companyName = null;
        this.vehicleObj.modelName = null;
        this.vehicleObj.vehicleNo = null;
        this.vehicleObj.registrationDate = null;
        this.vehicleObj.registrationNumber = null;
        this.vehicleObj.odometerReading = null;
        this.vehicleObj.chassisNumber = null;

    }   
}

///////buttons call
async handleNextParent(e){
    this.showLoading = true;
    this.isDisableWarranty = true;

    try{
        if(this.warrantyParentObj.status == 'Draft' || this.warrantyParentObj.status == '' || !this.warrantyParentObj.status){
            //console.log('inside next Parent:',JSON.stringify(this.warrantyParentObj));
            this.warrantyParentObj.status = 'Draft';
            this.warrantyParentObj.monthlyKm = parseInt(this.warrantyParentObj.monthlyKm);
            if(!this.numValue.test(this.warrantyParentObj.monthlyKm.toString().trim())){
                //console.log('inside next Parent3:');
                this.showLoading = false;
                this.showToastmessage('Error','Please enter valid monthly Kms.','error');
                return;
            }
            //console.log('inside next Parent4:');
            let createWarrantyObj = await createWarranty({warrantyJson:JSON.stringify(this.warrantyParentObj)})
            let parsedWarrantyObj = JSON.parse(createWarrantyObj);
            //console.log('inside next Parent4:',parsedWarrantyObj);
            if(parsedWarrantyObj.status == 'success'){
                this.showLoading = false;
                this.warrantyParentObj.id = parsedWarrantyObj.warrantyId;
                this.warrantyParentObj.warrantyNo = parsedWarrantyObj.warrantyNo;
                this.warrantyParentObj.cardId = parsedWarrantyObj.cardId;
                this.showToastmessage('Success','Warranty created successfully.','success');
                this.showWarrantyParent = false;
                this.showWarrantyInvoiceChild = false;
                this.showWarrantyScannerChild = true;
                this.showWarrantyThankYouChild = false;
            }else if(parsedWarrantyObj.status =='error'){
                this.showLoading = false;
                this.showToastmessage('Error','Failed to create Warranty record.','error');
                this.showWarrantyParent = true;
                this.showWarrantyInvoiceChild = false;
                this.showWarrantyScannerChild = false;
                this.showWarrantyThankYouChild = false;
            }
        }else {
            this.showLoading = false;
                this.showWarrantyParent = false;
                this.showWarrantyInvoiceChild = false;
                this.showWarrantyScannerChild = true;
                this.showWarrantyThankYouChild = false;
        }
    } catch(error) {
        console.error('Error creating warranty:', error);
        this.showLoading = false;
        
    }
    
}

async handleNextChild(e){
    this.showLoading = true;
    try {
        this.warrantyChildObj = {...e.detail};
        if(this.warrantyParentObj.status == 'Draft' || this.warrantyParentObj.status == '' || !this.warrantyParentObj.status){
            this.warrantyChildObj.status = 'Draft';
            this.disabledObj.isNextDisabled = false;
        // this.warrantyChildObj.dealerId = '0010T00000fYTVBQA4';
            //console.log('inside next Child:');
            let createWarrantyObj = await createWarranty({warrantyJson:JSON.stringify(this.warrantyChildObj)})
            let parsedWarrantyObj = JSON.parse(createWarrantyObj);
            if(parsedWarrantyObj.status == 'success'){
                this.showLoading = false;
                this.template.querySelector('c-yin-warranty-scanner-child-cmp').getTyreList(parsedWarrantyObj.tyreWrapList);
                this.warrantyChildObj.id = parsedWarrantyObj.warrantyId;
                this.warrantyChildObj.warrantyNo = parsedWarrantyObj.warrantyNo;
                this.warrantyChildObj.cardId = parsedWarrantyObj.cardId;
                this.warrantyChildObj.tyreList = parsedWarrantyObj.tyreWrapList;
                this.showToastmessage('Success','Warranty Updated successfully.','success');
                this.showWarrantyParent = false;
                this.showWarrantyInvoiceChild = true;
                this.showWarrantyScannerChild = false;
                this.showWarrantyThankYouChild = false;
            }else if(parsedWarrantyObj.status =='error'){
                this.showLoading = false;
                this.showToastmessage('Error','Failed to Update Warranty record.','error');
                this.showWarrantyParent = false;
                this.showWarrantyInvoiceChild = false;
                this.showWarrantyScannerChild = true;
                this.showWarrantyThankYouChild = false;
            }
            //console.log('inside next Child:');
        }else{
                this.showLoading = false;
                this.showWarrantyParent = false;
                this.showWarrantyInvoiceChild = true;
                this.showWarrantyScannerChild = false;
                this.showWarrantyThankYouChild = false;
        }
        } catch (error) {
            console.error('Error updating warranty:', error);
            this.showLoading = false;
        }
   
}

async handleSaveAsDraft(e){
    this.showLoading = true;
    try {
        this.warrantyChildObj = {...e.detail};
        if(this.warrantyParentObj.status == 'Draft' || this.warrantyParentObj.status == '' || !this.warrantyParentObj.status){
            this.warrantyChildObj.status = 'Draft';
            //console.log('inside  handleSaveAsDraft:');
            let createWarrantyObj = await createWarranty({warrantyJson:JSON.stringify(this.warrantyChildObj)})
            let parsedWarrantyObj = JSON.parse(createWarrantyObj);
            if(parsedWarrantyObj.status == 'success'){
                //console.log('inside  handleSaveAsDraft success:');
                this.template.querySelector('c-yin-warranty-scanner-child-cmp').getTyreList(parsedWarrantyObj.tyreWrapList);
                this.showLoading = false;
                this.warrantyChildObj.id = parsedWarrantyObj.warrantyId;
                this.warrantyChildObj.warrantyNo = parsedWarrantyObj.warrantyNo;
                this.warrantyChildObj.cardId = parsedWarrantyObj.cardId;
                this.warrantyChildObj.tyreList = parsedWarrantyObj.tyreWrapList;
                this.showToastmessage('Success','Warranty saved as draft.','success');
                this.showWarrantyParent = false;
                this.showWarrantyInvoiceChild = false;
                this.showWarrantyScannerChild = true;
                this.showWarrantyThankYouChild = false;
            }else if(parsedWarrantyObj.status =='error'){
                this.showLoading = false;
                this.showToastmessage('Error','Failed to save Warranty record.','error');
                this.showWarrantyParent = false;
                this.showWarrantyInvoiceChild = false;
                this.showWarrantyScannerChild = true;
                this.showWarrantyThankYouChild = false;
            }
            //console.log('inside Save Draft Child:');
        }else{
                this.showLoading = false;
                this.showWarrantyParent = false;
                this.showWarrantyInvoiceChild = false;
                this.showWarrantyScannerChild = true;
                this.showWarrantyThankYouChild =false;
        }
    } catch (error) {
        console.error('Error updating warranty:', error);
        this.showLoading = false;
    }
   
}

async handleSubmitDetails(e){
    try{
        this.warrantyScannerChildObj = {...e.detail};
        if(this.warrantyScannerChildObj.status == 'Draft' || this.warrantyScannerChildObj.status == '' || !this.warrantyScannerChildObj.status){
            const diffTime = Math.abs(new Date() - new Date( this.warrantyScannerChildObj.invoiceDate));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            let result;
            //console.log('inside Diff Chek111:',diffDays);
            if(diffDays > 7){
                //console.log('inside Diff Chek:');
                   result = await LightningConfirm.open({
                    message: '',
                    variant: 'default',
                    label: 'You are registering the sale more than Seven (7) days old, this warranty may be void. Do you still want to continue?',
                    
                });
            }
            if(result == true || diffDays <= 7){
                //console.log('inside Diff @@@:');
                this.showLoading = true;
                this.warrantyScannerChildObj.status = 'Active';
                let createWarrantyObj = await createWarranty({warrantyJson:JSON.stringify(this.warrantyScannerChildObj)})
                let parsedWarrantyObj = JSON.parse(createWarrantyObj);
                if(parsedWarrantyObj.status == 'success'){
                    this.showLoading = false;
                    this.warrantyScannerChildObj.id = parsedWarrantyObj.warrantyId;
                    this.warrantyScannerChildObj.warrantyNo = parsedWarrantyObj.warrantyNo;
                    this.warrantyScannerChildObj.cardId = parsedWarrantyObj.cardId;
                    this.showToastmessage('Success','Warranty Updated successfully.','success');
                    this.showWarrantyParent = false;
                    this.showWarrantyInvoiceChild = false;
                    this.showWarrantyScannerChild = false;
                    this.showWarrantyThankYouChild = true;
                }else if(parsedWarrantyObj.status =='error'){
                    this.showLoading = false;
                    this.showToastmessage('Error',parsedWarrantyObj.message,'error');
                    this.showWarrantyParent = false;
                    this.showWarrantyInvoiceChild = true;
                    this.showWarrantyScannerChild = false;
                    this.showWarrantyThankYouChild = false;
                }
            }
             if(result == false){
                window.close();
                this[NavigationMixin.Navigate]({
                 type: 'standard__recordPage',
                 attributes: {
                     recordId: this.warrantyScannerChildObj.id,
                     actionName: 'view'
                 }
             });
            }
        }else{
            this.showLoading = false;
               // this.showToastmessage('Warning','Warranty is already Active.','warning');
                this.showWarrantyParent = false;
                this.showWarrantyInvoiceChild = false;
                this.showWarrantyScannerChild = false;
                this.showWarrantyThankYouChild = true;
        }
    } catch(error) {
        console.error('Error creating warranty:', error);
        this.showLoading = false;
    }
}

handleBack(e){
    this.warrantyParentObj = {...e.detail};
    //console.log('inside Back :');
    //this.checkWarrntyType(this.warrantyParentObj.type);
    this.showWarrantyParent = true;
    this.showWarrantyInvoiceChild = false;
    this.showWarrantyScannerChild = false;
    this.showWarrantyThankYouChild = false;
}

handleModify(e){
    //console.log('inside Modify :');
    this.warrantyParentObj = {...e.detail};
    //console.log('inside Modify :',JSON.stringify(this.warrantyParentObj));
    //this.checkWarrntyType(this.warrantyParentObj.type);
    this.showWarrantyParent = true;
    this.showWarrantyInvoiceChild = false;
    this.showWarrantyScannerChild = false;
    this.showWarrantyThankYouChild = false;
}


// checkWarrntyType(val){
//     this.showLoading = true;
//     this.warrantyParentObj.type = val;
//     if(val == 'New Purchase'){
//         this.showLoading = false;
       
//     }else if(val == 'Claim Replacement'){
//         this.showLoading = false;
        
//     }
// }

clearWarrantyPage(){
    this.warrantyParentObj = {images:{noPlateImgChange:false,noPlateImgName: '',noPlateImgDoc: '',noPlateImg:'',
    invoiceImgChange: false,invoiceImgName : '',invoiceImgDoc : '',invoiceImg : '',
    odometerImgChange :false,odometerImgName : '',odometerImgDoc : '',odometerImg : '',
    extraImgChange : false,  extraImgName : '',extraImgDoc : '', extraImg : ''},tyreList:[],isEditable:false};
    this.searchCustomer = '';
    this.warrantyParentObj.registrationNumber = '';
    this.template.querySelector('.clear').clearSelection();
    this.template.querySelector('.newCustomer').disabled = false;
    this.template.querySelector('.newVehicle').disabled = true;
    this.disabledObj.vehicalDisabled = true;
    this.warrantyParentObj.dealerId = this.dealerObj.id;
    this.warrantyParentObj.dealerName = this.dealerObj.name;
}

async handleOTP(e){
    this.showLoading = true;
        const label = e.target.label;
        if(label == 'Send OTP'){
            this.isOtpButtonDisabled = true;
            //console.log('inside  handleSendOTP:');
        try {
                //console.log('inside  handleSendOTP:');
                this.OTPWrapper.mobile = this.warrantyParentObj.customerMobile;
                this.OTPWrapper.type = 'Warranty';
                let sendWarrantyOTP = await sendOTP({wrapperString:JSON.stringify(this.OTPWrapper)})
                let parsedsendOTP = JSON.parse(sendWarrantyOTP);
                //console.log('inside  handleSendOTP parsedsendOTP:',parsedsendOTP);
                if(parsedsendOTP.status == 'success'){
                    //console.log('inside  handleSendOTP success:');
                    this.otp = parsedsendOTP.otp;
                    ////console.log('inside  handleSendOTP success:',this.otp);
                    this.isEnterOTPDisabled = false;
                    this.showToastmessage('Success', 'OTP has been sent to registered mobile number.', 'Success');
                    this.showLoading = false;
                    setTimeout(() => {
                        this.isOtpButtonDisabled = false;
                    }, 60000); 
                }else if(parsedsendOTP.status == 'error'){
                    //console.log('inside  handleSendOTP error:');
                    this.isOtpButtonDisabled = false;
                    this.isEnterOTPDisabled = true;
                    this.showToastmessage('Error', 'OTP generation failed.', 'Error');
                    this.showLoading = false;
                }
            
            }catch(error) {
            console.error('Error sending OTP:', error);
            this.isOtpButtonDisabled = false;
            this.showLoading = false;
        }
        }else if(label == 'Validate OTP'){
            //console.log('inside handleValidateOTP:');
        try {
            if(this.otp == this.warrantyParentObj.enterOTP){
                this.showToastmessage('Success', 'OTP has been validated successfully.', 'Success');
                this.isEnterOTPDisabled = true;
                this.isOTPvalidate = true;
                this.isOtpButtonDisabled = true;
                this.disabledObj.isNextDisabled = false;
                this.showLoading = false;
            }else if(this.otp != this.warrantyParentObj.enterOTP){
                this.showToastmessage('Error', 'OTP validation failed.', 'Error');
                this.isEnterOTPDisabled = false;
                this.isOTPvalidate = false;
                this.isOtpButtonDisabled = false;
                this.disabledObj.isNextDisabled = true;
                this.showLoading = false;
            }
            
        } catch (error) {
            console.error('Error sending OTP:', error);
            this.isOtpButtonDisabled = false;
            this.isOTPvalidate = false;
            this.isEnterOTPDisabled = false;
            this.disabledObj.isNextDisabled = true;
            this.showLoading = false;
        }
        }
    
}

handleInputChange(e){
    const label = e.target.label;
    const value = e.target.value;
    const regex = /^[a-zA-Z0-9]*$/;
        if(label == 'Monthly Running KM'){
            this.warrantyParentObj.monthlyKm = value;
            this.checkNextDisabled();
        }else if(label == 'Customer Name'){
            this.customerObj.name = value;
        }else if(label == 'Customer Phone Number'){
            if(!this.numValue.test(value) || value.length < 10 || value.length > 10){
                this.showToastmessage('Error','Please enter a valid 10-digit phone number.','error')
                this.disabledObj.disabledCustumorSave = true;
                return;

            }
            this.customerObj.mobile = value;
            this.disabledObj.disabledCustumorSave = false;
        }else if(label == 'Address'){
            this.customerObj.address = value;
        }else if(label == 'Registration Number'){
            const val= value;
            if (!regex.test(val)) {
                //console.log('inside Registration:');
                this.showToastmessage('Error', 'Please Enter Valid Registration Number', 'error');
                this.vehicleObj.registrationNumber = val;
            }else if(regex.test(val)){
                this.vehicleObj.registrationNumber = val;
                
            }
            this.checkNextDisabled();
        }else if(label == 'Registration Date'){
            this.vehicleObj.registrationDate = value;
            if(new Date(value) > new Date()){
                //console.log('inside date:');
                this.showToastmessage('Error', 'Registration Date cannot be greater than today', 'error');
            }
        }else if(label == 'Vehicle Company'){
            this.vehicleObj.companyName = value;
        }else if(label == 'Vehicle Model'){
            this.vehicleObj.modelName = value;
        }else if(label == 'Odometer Reading'){
            this.vehicleObj.odometerReading = value;
        }else if(label == 'Chassis Number'){
            this.vehicleObj.chassisNumber = value;
        }else if(label == 'Enter OTP'){
            this.warrantyParentObj.enterOTP = value;
            if(this.warrantyParentObj.enterOTP){
                this.oTPButtons = 'Validate OTP';
                this.isOtpButtonDisabled = false;
                
            }else if(!this.warrantyParentObj.enterOTP){
                this.oTPButtons = 'Send OTP';
                this.isOtpButtonDisabled = false;
            }
        }
        

        if( this.customerObj.name && this.customerObj.mobile){
            this.disabledObj.disabledCustumorSave = false;
        }else {
            this.disabledObj.disabledCustumorSave = true;
        }

        if(this.vehicleObj.registrationNumber && regex.test(this.vehicleObj.registrationNumber) && this.vehicleObj.companyName && this.vehicleObj.modelName){
            //console.log('inside date@@@:');
            this.disabledObj.disabledVehicleSave = false;
        }else {
            this.disabledObj.disabledVehicleSave = true;
        }

}

checkNextDisabled(){
    if(this.warrantyParentObj.registrationNumber && this.warrantyParentObj.monthlyKm && this.warrantyParentObj.customerMobile){
        this.isOtpButtonDisabled = false;
    }else{
        this.isOtpButtonDisabled = true;
    }
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