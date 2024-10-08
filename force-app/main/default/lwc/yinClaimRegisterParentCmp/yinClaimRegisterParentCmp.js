/**
 * @description       : Claim Register Parent.
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : SKI
 * @created date      : 30-08-2024
 * @last modified on  : 30-08-2024
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
 * Modifications Log
 * Ver   Date         Author                                      Modification
 * 1.0    02-04-2024   Amol Patil/amol.patil@skinternational.com   Initial Version
**/


import { LightningElement,api,track } from 'lwc';
import customCSS from '@salesforce/resourceUrl/customCSS';
import { loadStyle } from 'lightning/platformResourceLoader';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import  searchWarranty from '@salesforce/apex/YINClaimController.searchWarranty';
import  getWarrantyDetails from '@salesforce/apex/YINClaimController.getWarrantyDetails';
import  getWarrantyTyres from '@salesforce/apex/YINClaimController.getWarrantyTyres';
import  createNewClaim from '@salesforce/apex/YINClaimController.createNewClaim';
import  createCustomer from '@salesforce/apex/YINWarrantyController.createCustomer';
import  getCustomerDetails from '@salesforce/apex/YINWarrantyController.getCustomerDetails';
import  getVehicleInfoById from '@salesforce/apex/YINWarrantyController.getVehicleInfoById';
import  createVehicle from '@salesforce/apex/YINWarrantyController.createVehicle';
import  getPickupLocations  from '@salesforce/apex/YINClaimController.getPickupLocations';
import  reloadClaim from '@salesforce/apex/YINClaimController.reloadClaim';
import  getDealerInfo from '@salesforce/apex/YINClaimController.getDealerInfo';
import  validateCustomer from '@salesforce/apex/YINWarrantyController.validateCustomer';
import  validateVehicle from '@salesforce/apex/YINWarrantyController.validateVehicle';
import  sendOTP from '@salesforce/apex/YINOTPGenerator.sendOTP';
import  getTyrePatterns from '@salesforce/apex/YINBarCodeController.getTyrePatterns';
import  getTyreSizeByPatterns from '@salesforce/apex/YINBarCodeController.getTyreSizeByPatterns';
import  getProductBasedOnSizePattern from '@salesforce/apex/YINBarCodeController.getProductBasedOnSizePattern';



export default class YinClaimRegisterParentCmp extends LightningElement {

@track showLoading = true;
@track WithWarranty = true;
@track WithoutWarranty = false;
@track showClaimParent = true;
@track showChildRegister = false;
@track showChildReview = false;
@track showChildThankYou = false;
@track bShowModal2 = false; 
@track bShowModal = false;
@track isDisableWarrenty = false;
@track isDisableWarrenty1 = false;
@track vehicalDisabled = true;
@track warrantyDisabled = true;
@track serialNoDisabled = true;
@track nextDisabled = true;
@track disabletyreSize = true;
@track disablePattern = true;
@track disabledCustumorSave = true;
@track disabledVehicleSave = true;
@track isServiceEngineer = false;
@track isSpectCodeDisable = true;
@track isWeekYearDisable = true;
@track objFromRegisterChild={};
@track objFromReviewChild = {};
@track dealerObj = {};
@track pickListOptions = [];
@track filter = {};
@track warrentyOpts = [];
@track serialNoOpts = [];
@track dealerOpts = [];
@track tyreMap = new Map();
@track customerName;
@track customerPhoneNo;
@track damageCause;
@track tempRegistrationNo = '';
@track custName;
@track custPhoneNo; 
@track countryName;
@track countryId;
@track stateName;
@track stateId;
@track districtName;
@track districtId;
@track cityName;
@track cityId;
@track pincode;
@track pincodeName;
@track address;
@track registrationNumber;
@track registrationDate;
@track vehicleModel;
@track vehicleCompanyName;
@track odrReading;
@track chassisNumber;
@track numValue = /^[0-9]+$/;
@api recordId;
@track selectedDealer = '';
@track pickupOptions = [];
@track OTPWrapper = {};
@track isOtpButtonDisabled = false;
@track otp;
@track oTPButtons = 'Send OTP';
@track isEnterOTPDisabled = true;
@track warrTypeCheck = 'Replacement';
@track otpValidation = false;
@track warrantyDate;
@track patternOpts = [];
@track tyreOpts = [];
@track spectOpts = [];
@track productObj = {plantCode : '',spectCode : '',weekYear : ''}
 
@track claimRegisterObj = {editOrNew:'', claimRecordId:'',dealerId:'',dealerName:'',dealerCode:'',warrentytype:'Replacement',warrenty:'With Warranty',
                            registrationNo:'', warrantyName:'',warrantyNumber:'', customerId:'', customerName:'',
                            customerPhoneNo:'',vehicleId:'',registrationNumber:'',vehicleMake:'',vehicleModel:'',
                            tyreName:'', serialNumber:'',serialId:'',barCode:'',dealer:'',searchCustomer:'',
                            registrationDate:null,tyreSize:'',pattern:'',enterOTP:'',dealerCity:'',chargeableAmount:0,
                            dealerState:'',dealerCityId:'',dealerStateId:'',originalGrooveDepth:'',pickupLocation:'',natureOfComplaint:'',
                            tyreSerialImgId : '',defectImgOutsideId:'',defectImgInsideId:'',treadDepthGaugeId:'',odometerReadingId:'',
                            extraImgId:'', tyreSerialVersionId:'',defectImgOutsideVersionId:'', defectImgInsideVersionId:'',
                            treadDepthGaugeVersionId:'',odometerReadingVersionId:'',extraImgVersionId:'',damageCondition:'',
                            damageCause:[],claimPolicy:'',remainingGrooveDepth:'',wearPercent:0,totalRunningKms:'',
                            claimRemarks:'',uploadedFileName1:'',uploadedFileName2:'',uploadedFileName3:'',uploadedFileName4:'',
                            uploadedFileName5:'',uploadedFileName6:'',serialImgChange:false,outsideImgChange:false,insideImgChange:false,
                            depthGaugeImgChange:false,odometerImgChange:false,extraImgChange:false,isEditable:false,warrantyStartDate:new Date(),
                            warrantyDate:null,pattern1:'',tyreSize1:'',serialNumber1:''};
                           

 async connectedCallback(){
    //this.showLoading = true;
    if(!this.recordId){
    let urlString = location.href;
    let url = new URL(urlString);
    console.log('url:', url);
    console.log('urlString:', urlString);

      if(url.searchParams.get('recordId')){

            this.recordId = url.searchParams.get('recordId');
        }
    }   
    this.claimRegisterObj.claimRecordId = this.recordId;
    console.log('inside connectedCallback Parent:',this.recordId);
    if(this.recordId){
        this.claimRegisterObj.editOrNew = 'Edit';
        this.isDisableWarrenty = true;
        this.isDisableWarrenty1 = true;
        await this.fetchOnLoadClaim();
    }else if(!this.recordId){
        this.claimRegisterObj.editOrNew = 'New';
        this.isDisableWarrenty = false;
        this.isDisableWarrenty1 = false;
        this.claimRegisterObj.warrenty = 'With Warranty';
        await this.fetchOnLoadClaim();
        // this.claimRegisterObj.warrentytype = 'OE';
    }
   
    this.isEnterOTPDisabled = true; 
    this.showLoading = false;
    this.getVehicleFilter();
    
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

matchingInfo1 = {
    primaryField: { fieldPath: "Pincode__c" },
    additionalFields: [{ fieldPath: "City__r.Name",operator: "ne",
    value: "",}],
    
};

displayInfo1 = {
    additionalFields: ["Combined_Address__c"]
};

filter1 = {
    criteria: [
        {
            fieldPath: "Pincode__c",
            operator: "ne",
            value: "",
        }
    ],
};


async fetchOnLoadClaim(){
   console.log('Inside fetchOnLoadClaim Check :',this.claimRegisterObj.warrenty);
   let claimInfo =  await reloadClaim({claimId:this.claimRegisterObj.claimRecordId ?? null});
   console.log('ClaimInfo Check :', claimInfo );
   let parseClaimInfo = JSON.parse(claimInfo);
   this.isServiceEngineer = parseClaimInfo.isServiceEngineer;
   
   
if(this.isServiceEngineer){
    console.log('ClaimInfo inside Service E 11:',JSON.stringify(parseClaimInfo.claimWrap));
    this.claimRegisterObj.chargeableAmount = parseClaimInfo.claimWrap.amount ?? 0;
    console.log('ClaimInfo inside Service E 12:' );
    if(parseClaimInfo.dealerList.length > 0 && Array.isArray(parseClaimInfo.dealerList) && parseClaimInfo.dealerList){
        console.log('ClaimInfo inside Service E 13:' );
        for(let i=0;i<parseClaimInfo.dealerList.length;i++){
            console.log('ClaimInfo inside Service E 14:' );
            this.dealerOpts = [...this.dealerOpts,{label:parseClaimInfo.dealerList[i].name,value:parseClaimInfo.dealerList[i].id}]
            console.log('this.dealerOpts Check :', JSON.stringify(this.dealerOpts));
            }
        } 
        if(this.recordId){
            this.claimRegisterObj.dealer = parseClaimInfo.claimWrap.dealerId;
            this.claimRegisterObj.dealerId = parseClaimInfo.claimWrap.dealerId;
            let getDelInfo = await getDealerInfo({accId:this.claimRegisterObj.dealer})
            let parsedGetDelInfo = JSON.parse(getDelInfo);
            this.claimRegisterObj.dealerCode = parsedGetDelInfo.erpCode;
            this.claimRegisterObj.dealerName = parsedGetDelInfo.name;
            this.claimRegisterObj.dealerCity = parsedGetDelInfo.city
            this.claimRegisterObj.dealerState = parsedGetDelInfo.state;
            this.dealerObj = parsedGetDelInfo;
    
            let pickupList = await getPickupLocations({accId:this.claimRegisterObj.dealer})
            let parsedPickupList = JSON.parse(pickupList);
            console.log('parsedPickupList:',JSON.stringify(parsedPickupList));
            this.pickupOptions = []; 
            this.pickListOptions = [];
            for(let i=0;i<parsedPickupList.length;i++){
            this.pickupOptions = [...this.pickupOptions,{label:parsedPickupList[i].address,value:parsedPickupList[i].recordId}];
            this.pickListOptions = [...this.pickListOptions,{label:parsedPickupList[i].address,value:parsedPickupList[i].recordId}];
        }
        this.claimRegisterObj.pickupLocation = this.claimRegisterObj.dealer;
        }
        // else if(!this.recordId){
        //     this.claimRegisterObj.dealer = this.selectedDealer;
        //     this.claimRegisterObj.dealerId = this.selectedDealer;
        // }
        
    
}else if(!this.isServiceEngineer){
    if(parseClaimInfo.claimWrap.status == 'Draft' || parseClaimInfo.claimWrap.status == 'Rejected' || parseClaimInfo.claimWrap.status == ''){
        this.claimRegisterObj.isEditable = false;
       }else{
        this.claimRegisterObj.isEditable = true;
       }
    console.log('@@@@@inside dealer :');
    this.claimRegisterObj.dealerId = parseClaimInfo.dealerList[0].id;
    console.log('@@@@@inside if :',this.claimRegisterObj.dealerId);
    this.claimRegisterObj.dealerName = parseClaimInfo.dealerList[0].name;
    console.log('@@@@@inside if :',this.claimRegisterObj.dealerId);
    this.claimRegisterObj.dealerCode = parseClaimInfo.dealerList[0].erpCode;
    this.claimRegisterObj.dealerCity = parseClaimInfo.dealerList[0].city;
    this.claimRegisterObj.dealerState = parseClaimInfo.dealerList[0].state;
    this.dealerObj = parseClaimInfo.dealerList[0];
        if(parseClaimInfo.pickupList.length > 0 && Array.isArray(parseClaimInfo.pickupList) && parseClaimInfo.pickupList != []){
        console.log('@@@@@inside if :',this.pickupOptions.length);
        for(let i = 0;i < parseClaimInfo.pickupList.length;i++){
            console.log('this.pickupLocationOpts Check :', JSON.stringify(parseClaimInfo.pickupList));
            this.pickupOptions = [...this.pickupOptions,{label:parseClaimInfo.pickupList[i].address,value:parseClaimInfo.pickupList[i].recordId}];
            this.pickListOptions = [...this.pickListOptions,{label:parseClaimInfo.pickupList[i].address,value:parseClaimInfo.pickupList[i].recordId}];
           }
           this.claimRegisterObj.pickupLocation = this.claimRegisterObj.dealerId;
       }
}
console.log('this.recordId:',this.recordId);
   if(this.recordId){
    console.log('inside this.recordId:',this.recordId);
    this.claimRegisterObj.warrenty = parseClaimInfo.claimWrap.type;
    this.checkWarrntyType(this.claimRegisterObj.warrenty);
    this.claimRegisterObj.status = parseClaimInfo.claimWrap.status;
    console.log('status:',  this.claimRegisterObj.status);
    console.log('inside check Reload when RecordId:',this.claimRegisterObj.warrenty);
    this.claimRegisterObj.customerName= parseClaimInfo.claimWrap.customer.name;
    this.claimRegisterObj.customerId= parseClaimInfo.claimWrap.customer.id;
    this.claimRegisterObj.customerPhoneNo = parseClaimInfo.claimWrap.customer.mobile;
    this.claimRegisterObj.registrationNumber = parseClaimInfo.claimWrap.vehicle.vehicleNo;
    this.claimRegisterObj.vehicleId = parseClaimInfo.claimWrap.vehicle.vehicleId;
    this.claimRegisterObj.vehicleMake = parseClaimInfo.claimWrap.vehicle.companyName;
    this.claimRegisterObj.vehicleModel = parseClaimInfo.claimWrap.vehicle.modelName;
    let formattedDate = parseClaimInfo.claimWrap.vehicle.registrationDate.split('-');
    this.claimRegisterObj.registrationDate = formattedDate[2] + '/' + formattedDate[1] + '/' +formattedDate[0];
    if(parseClaimInfo.claimWrap.type =='With Warranty'){
    this.warrentyOpts = [...this.warrentyOpts,{label:parseClaimInfo.claimWrap.warrantyNumber,value:parseClaimInfo.claimWrap.warrantyId}];
    this.claimRegisterObj.warrantyName = parseClaimInfo.claimWrap.warrantyId;
    this.serialNoOpts = [...this.serialNoOpts,{label:parseClaimInfo.claimWrap.tyre.tyreSerialNo,value:parseClaimInfo.claimWrap.tyre.id}]
    this.claimRegisterObj.serialId = parseClaimInfo.claimWrap.tyre.id;
    this.claimRegisterObj.serialNumber = parseClaimInfo.claimWrap.tyre.tyreSerialNo;
    console.log('inside check Reload++'+this.claimRegisterObj.warrantyName +','+ this.claimRegisterObj.customerId +','+ this.claimRegisterObj.vehicleId +','+ this.claimRegisterObj.serialId);
    if(this.claimRegisterObj.warrantyName  && this.claimRegisterObj.customerId && this.claimRegisterObj.vehicleId && this.claimRegisterObj.serialId ){
        this.nextDisabled = false;
    }
   }
   else if(parseClaimInfo.claimWrap.type =='Without Warranty'){

    this.claimRegisterObj.searchCustomer = parseClaimInfo.claimWrap.customer.mobile;
    this.claimRegisterObj.serialNumber = parseClaimInfo.claimWrap.tyre.tyreSerialNo;
    this.getVehicleFilter();
    this.claimRegisterObj.vehicleId = parseClaimInfo.claimWrap.vehicle.vehicleId;
   }
   this.claimRegisterObj.pattern = parseClaimInfo.claimWrap.tyre.tyrePattern;
   this.claimRegisterObj.tyreSize = parseClaimInfo.claimWrap.tyre.tyreSize;
   this.claimRegisterObj.damageCondition = parseClaimInfo.claimWrap.damageCondition;
   if(this.claimRegisterObj.damageCondition){
    let selectedCauses = parseClaimInfo.claimWrap.damageCause;
    
        if(!Array.isArray(selectedCauses)){
            //selectedCauses = this.claimRegisterObj.damageCause.split(';');
            this.claimRegisterObj.damageCause = selectedCauses.split(';');
        }
        this.damageCause = this.claimRegisterObj.damageCause.join('\n');
        console.log('reload damage Cause:', JSON.stringify(this.claimRegisterObj.damageCause));
   }
   this.claimRegisterObj.originalGrooveDepth = (parseClaimInfo.claimWrap.originalGrooveDepth ?? 0).toString();
   this.claimRegisterObj.remainingGrooveDepth = (parseClaimInfo.claimWrap.remainingGrooveDepth ?? 0).toString();
   this.claimRegisterObj.wearPercent = typeof parseClaimInfo.claimWrap.wear =='object' ? 0: parseClaimInfo.claimWrap.wear;
   this.claimRegisterObj.totalRunningKms = (parseClaimInfo.claimWrap.totalkm ?? 0).toString();
   this.claimRegisterObj.claimPolicy = parseClaimInfo.claimWrap.policy;
   this.claimRegisterObj.natureOfComplaint = parseClaimInfo.claimWrap.natureOfComplaint;
   this.claimRegisterObj.pickupLocation = parseClaimInfo.claimWrap.pickupLocation;
   this.claimRegisterObj.claimRemarks = parseClaimInfo.claimWrap.remark;
//Showing Images 
   this.claimRegisterObj.tyreSerialVersionId = parseClaimInfo.claimWrap.images.serialImg;
   this.claimRegisterObj.tyreSerialImgId = parseClaimInfo.claimWrap.images.serialImgDoc;
   this.claimRegisterObj.uploadedFileName1 = parseClaimInfo.claimWrap.images.serialImgName;

   this.claimRegisterObj.defectImgOutsideVersionId = parseClaimInfo.claimWrap.images.outsideImg;
   this.claimRegisterObj.defectImgOutsideId = parseClaimInfo.claimWrap.images.outsideImgDoc;
   this.claimRegisterObj.uploadedFileName2 = parseClaimInfo.claimWrap.images.outsideImgName;

   this.claimRegisterObj.defectImgInsideVersionId = parseClaimInfo.claimWrap.images.insideImg;
   this.claimRegisterObj.defectImgInsideId = parseClaimInfo.claimWrap.images.insideImgDoc;
   this.claimRegisterObj.uploadedFileName3 = parseClaimInfo.claimWrap.images.insideImgName;

   this.claimRegisterObj.treadDepthGaugeVersionId = parseClaimInfo.claimWrap.images.depthGaugeImg;
   this.claimRegisterObj.treadDepthGaugeId = parseClaimInfo.claimWrap.images.depthGaugeImgDoc;
   this.claimRegisterObj.uploadedFileName4 = parseClaimInfo.claimWrap.images.depthGaugeImgName;

   this.claimRegisterObj.odometerReadingId = parseClaimInfo.claimWrap.images.odometerImgDoc;
   this.claimRegisterObj.odometerReadingVersionId = parseClaimInfo.claimWrap.images.odometerImg;
   this.claimRegisterObj.uploadedFileName5 = parseClaimInfo.claimWrap.images.odometerImgName;

   this.claimRegisterObj.extraImgId = parseClaimInfo.claimWrap.images.extraImgDoc;
   this.claimRegisterObj.extraImgVersionId = parseClaimInfo.claimWrap.images.extraImg;
   this.claimRegisterObj.uploadedFileName6 = parseClaimInfo.claimWrap.images.extraImgName;
    }
}

renderedCallback() {
    Promise.all([
        loadStyle(this, customCSS)
        ]);
}

handleStepBlur(event) {
    const stepIndex = event.detail.index;
}

get options() {
    return [
        { label: 'With Warranty', value: 'With Warranty' },
        { label: 'Without Warranty', value: 'Without Warranty' },
    ];
}

get warrOption() {
    return [
        { label: 'Replacement', value: 'Replacement' },
        { label: 'OE', value: 'OE' },
        
    ];
}

async handleRadioChange(event) {
    this.showLoading = true;
    await this.clearRegistrationPage();
    this.claimRegisterObj.warrentytype = this.warrTypeCheck;
    this.nextDisabled = true;
    this.warrantyDisabled = true;
    this.serialNoDisabled = true;

    const selectedOption = event.detail.value;
    this.claimRegisterObj.warrenty = selectedOption;
    this.checkWarrntyType(this.claimRegisterObj.warrenty);
    
}

handleRadioChange1(event){
    const selectedOption1 = event.detail.value;
    this.warrTypeCheck = selectedOption1;
    this.claimRegisterObj.warrentytype = selectedOption1;

}

getVehicleFilter(){
    this.filter={
        criteria: [
        {
            fieldPath: "Customer__r.Id",
            operator: "eq",
            value:this.claimRegisterObj.customerId,
            
        }
    ]}
}

async handleComboboxChange(event) {
    this.showLoading = true;
    const lable = event.target.label;
    const value = event.detail.value;
    if(lable =='Select Warranty Registration Number'){
            this.claimRegisterObj.warrantyName = value;
            this.serialNoOpts = [];
            console.log('inside combobox if@@@111:');
           
            if(!value){
                console.log('inside combobox if:');
                this.template.querySelector('.warrantyInput').focus();
                this.template.querySelector('.warrantyInput').setCustomValidity('Please select warranty registration number');
                }else{
                    this.template.querySelector('.warrantyInput').blur();
                    this.template.querySelector('.warrantyInput').setCustomValidity('');
                }
                this.template.querySelector('.warrantyInput').reportValidity();
                console.log('inside combobox if@@@:');
                this.claimRegisterObj.warrantyNumber =  event.target.options.find(opt => opt.value === value).label;
                console.log('inside combobox if!!!!:');
                let warrantyDetails = await getWarrantyDetails({warrantyId:this.claimRegisterObj.warrantyName});
                console.log('inside combobox if7777:');
                if(warrantyDetails){
                    this.showLoading = false;
                    let warrantyDetailsObj = JSON.parse(warrantyDetails);
                    // if(new Date(warrantyDetailsObj.warrantyStartDate) - new Date(warrantyDetailsObj.invoiceDate) > 7){
                    //     this.showToastmessage('Warning','Warranty date over 7 days from invoice date.','warning')
                    // }
                    let warrantyStartDate = new Date(warrantyDetailsObj.warrantyStartDate);
                    this.claimRegisterObj.warrantyDate = warrantyStartDate;
                    console.log('warrantyDate:', this.claimRegisterObj.warrantyDate);
                    console.log('warrantyStartDate:', warrantyStartDate);
                    let invoiceDate = new Date(warrantyDetailsObj.invoiceDate);
                    let timeDifference = warrantyStartDate.getTime() - invoiceDate.getTime();
                    let daysDifference = timeDifference / (1000 * 3600 * 24);
                    if (daysDifference > 7) {
                        this.showToastmessage('Warning', 'Warranty date over 7 days from invoice date.', 'warning');
                    }

                    let warrantyEndDate = new Date('2022-07-01');
                    let months18FromWarrantyStart = new Date(warrantyDetailsObj.warrantyStartDate);
                    months18FromWarrantyStart.setMonth(months18FromWarrantyStart.getMonth() + 18);
                    if ((warrantyDetailsObj.warrantyStartDate < warrantyEndDate && currentDate > months18FromWarrantyStart)) {
                        this.showToastmessage('Warning', 'Warranty period is over.', 'Warning');
                        return;
                    }
                    console.log('inside combobox:',JSON.stringify(warrantyDetailsObj));
                    this.claimRegisterObj.customerId = warrantyDetailsObj.customerId;
                    this.claimRegisterObj.customerName = warrantyDetailsObj.customerName;
                    this.claimRegisterObj.customerPhoneNo = warrantyDetailsObj.customerMobile;
                    this.claimRegisterObj.vehicleId = warrantyDetailsObj.vehicleId;
                    this.claimRegisterObj.registrationNumber = warrantyDetailsObj.registrationNumber;
                    this.claimRegisterObj.vehicleMake = warrantyDetailsObj.companyName;
                    this.claimRegisterObj.vehicleModel = warrantyDetailsObj.modelName;
                    let formattedDate = warrantyDetailsObj.registrationDate.split('-');
                    this.claimRegisterObj.registrationDate = formattedDate[2] + '/' + formattedDate[1] + '/' +formattedDate[0];
                    console.log('Inside Tyre detail date :',  this.claimRegisterObj.registrationDate);
                    let tyreResponse = await getWarrantyTyres({warrantyId:this.claimRegisterObj.warrantyName});
                    let tyreArr = JSON.parse(tyreResponse);
                    console.log('Inside Tyre detail tyrarr:', JSON.stringify(tyreArr));
                        if(tyreArr.status == 'error'){
                            console.log('inside If tyre serial:');
                            this.serialNoDisabled = true;
                            this.showToastmessage('Error', 'No Asset Found.', 'error'); 
                        }else if(tyreArr.status == 'success'){
                            tyreArr.tyreList.forEach(tyre => {
                                this.tyreMap.set(tyre.id, tyre);
                                this.serialNoOpts = [...this.serialNoOpts,{label:tyre.tyreSerialNo,value:tyre.id}]
                                this.serialNoDisabled = false;
                                console.log('tyreSerialNo 111:', tyre.tyreSerialNo);
                            });
                            if(!this.template.querySelector('.serialInput').value){
                                this.template.querySelector('.serialInput').focus();
                                this.template.querySelector('.serialInput').setCustomValidity('Please select Serial Number');
                                }else{
                                    this.template.querySelector('.serialInput').blur();
                                    this.template.querySelector('.serialInput').setCustomValidity('');
                                }
                                this.template.querySelector('.serialInput').reportValidity();
                                console.log('Inside Tyre detail map:', this.tyreMap);
                            }
                            
    
                }else {
                    this.warrantyDisabled = true;
                    this.serialNoDisabled = true;
                    this.showLoading = false; 
                }   
    }else if(lable =='Serial Number'){
        this.showLoading = false; 
        this.claimRegisterObj.serialId = value;
        if(!value){
            this.template.querySelector('.serialInput').focus();
            this.template.querySelector('.serialInput').setCustomValidity('Please select Serial Number');
            }else{
                this.template.querySelector('.serialInput').blur();
                this.template.querySelector('.serialInput').setCustomValidity('');
            }
            this.template.querySelector('.serialInput').reportValidity();
        if(this.claimRegisterObj.warrantyName != '' && this.claimRegisterObj.customerId != '' && this.claimRegisterObj.vehicleId != '' && this.claimRegisterObj.serialId != ''){
            this.nextDisabled = false;
        }
        this.claimRegisterObj.serialNumber = event.target.options.find(opt => opt.value === value).label;
        this.claimRegisterObj.tyreSize = this.tyreMap.get(value).tyreSize;
        this.claimRegisterObj.tyreName = this.tyreMap.get(value).name;
        this.claimRegisterObj.pattern = this.tyreMap.get(value).tyrePattern;
        this.claimRegisterObj.originalGrooveDepth = (this.tyreMap.get(value).ogd).toString();
        console.log('this.claimRegisterObj.originalGrooveDepth:', this.claimRegisterObj.originalGrooveDepth);
    }
    else if(lable == 'OE Customer' || lable == 'OE Customer/Dealer'){
        this.showLoading = false; 
        console.log('inside OE Value:');
        this.pickupOptions = [];
        this.claimRegisterObj.dealer = value;
        this.claimRegisterObj.dealerId = value;
        this.selectedDealer = value;
        let getDelInfo = await getDealerInfo({accId:this.claimRegisterObj.dealer})
        let parsedGetDelInfo = JSON.parse(getDelInfo);
        //this.claimRegisterObj.dealer = parsedGetDelInfo.id;
        this.claimRegisterObj.dealerCode = parsedGetDelInfo.erpCode;
        this.claimRegisterObj.dealerName = parsedGetDelInfo.name;
        this.claimRegisterObj.dealerCity = parsedGetDelInfo.city
        this.claimRegisterObj.dealerState = parsedGetDelInfo.state;
        this.dealerObj = parsedGetDelInfo;
        let pickupList = await getPickupLocations({accId:this.claimRegisterObj.dealer})
        let parsedPickupList = JSON.parse(pickupList);
        console.log('parsedPickupList:',JSON.stringify(parsedPickupList));
        //this.pickupOptions = [];
        //this.pickListOptions = [];
        for(let i=0;i<parsedPickupList.length;i++){
        this.pickupOptions = [...this.pickupOptions,{label:parsedPickupList[i].address,value:parsedPickupList[i].recordId}];
        this.pickListOptions = [...this.pickupOptions,{label:parsedPickupList[i].address,value:parsedPickupList[i].recordId}];
        }
        
        //this.showLoading = false;
    } 
}

get warrentyOptions(){
    return this.warrentyOpts;
}

get serialNoOptions(){
    return this.serialNoOpts;
}

get dealerOptions(){
    return this.dealerOpts;
}

// get pickupLocation(){
//     return this.pickupLocationOpts;
// }



async handleSearch(e){
    this.showLoading = true;
        if(this.tempRegistrationNo != ''){
            await this.clearRegistrationPage();
            
            this.claimRegisterObj.dealerId = this.selectedDealer == '' || !this.selectedDealer ? this.claimRegisterObj.dealerId:this.selectedDealer;
            this.claimRegisterObj.dealer = this.selectedDealer;
            this.claimRegisterObj.dealerCode = this.dealerObj.erpCode;
            this.claimRegisterObj.dealerName = this.dealerObj.name;
            this.claimRegisterObj.dealerCity = this.dealerObj.city
            this.claimRegisterObj.dealerState = this.dealerObj.state;
            this.pickupOptions = this.pickListOptions;
            console.log('this.claimRegisterObj.dealerId on Search:',this.claimRegisterObj.dealerId);
            this.claimRegisterObj.warrenty = 'With Warranty';
            this.claimRegisterObj.warrentytype = this.warrTypeCheck;

            let warrentyResponse = await searchWarranty({searchKey:this.tempRegistrationNo ,dealerId:this.claimRegisterObj.dealerId});
            let warrentyObj = JSON.parse(warrentyResponse);
            console.log('warrentyOBJ :', JSON.stringify(warrentyObj) );
                if(warrentyObj.status == 'success'){
                    this.showLoading = false;
                    //this.tempRegistrationNo = '';
                    console.log('inside if of search');
                    for(let i=0;i<warrentyObj.warrantyList.length;i++){
                        console.log('inside For:');
                        this.warrentyOpts = [...this.warrentyOpts,{label:warrentyObj.warrantyList[i].name,value:warrentyObj.warrantyList[i].id}];
                        
                    }
                    this.warrantyDisabled = false;
                        if(!this.template.querySelector('.warrantyInput').value){
                            this.template.querySelector('.warrantyInput').focus();
                            this.template.querySelector('.warrantyInput').setCustomValidity('Please select warranty registration number');
                            }else{
                                this.template.querySelector('.warrantyInput').blur();
                                this.template.querySelector('.warrantyInput').setCustomValidity('');
                            }
                            this.template.querySelector('.warrantyInput').reportValidity();
                }else if(warrentyObj.status == 'error'){
                    this.warrantyDisabled = true;
                    this.showLoading = false;
                    //this.tempRegistrationNo = '';
                    this.showToastmessage('Error', 'No Record Found', 'error');     
            }
        }
        else if(this.tempRegistrationNo == ''){
            this.showToastmessage('Error', 'Please Enter Value.', 'error');
            this.showLoading = false;
        }
}


async handleSearchInput(e){
    this.showLoading = true;
    const value = e.target.value;
    if(value != '' && value){
        if(!this.numValue.test(value) || value.length < 10 || value.length > 10){
            this.showLoading = false;
            this.showToastmessage('Error','Please enter a valid 10-digit phone number.','error')
            return;
        }
        this.claimRegisterObj.searchCustomer = value;
        let customerobj = await getCustomerDetails({mobileNo:this.claimRegisterObj.searchCustomer})
        let parsedCustomerObj = JSON.parse(customerobj);
        if(parsedCustomerObj.status == 'success'){
            this.showLoading = false;
            this.claimRegisterObj.customerId = parsedCustomerObj.id;
            console.log('Cust Id:', this.claimRegisterObj.customerId);
            this.claimRegisterObj.customerName = parsedCustomerObj.name;
            this.claimRegisterObj.customerPhoneNo = parsedCustomerObj.mobile;
             this.getVehicleFilter();
            this.vehicalDisabled = false;
        }
        else if(parsedCustomerObj.status == 'error'){
            this.showLoading = false;
            this.showToastmessage('Error','No record found.','error')
            this.vehicalDisabled = true;
        }
    }else if(value == '' || !value){
        this.showLoading = false;
        this.vehicalDisabled = true;
        this.claimRegisterObj.customerId = '';
        this.claimRegisterObj.customerName = '';
        this.claimRegisterObj.customerPhoneNo = '';
        this.claimRegisterObj.vehicleId= '';
        this.claimRegisterObj.vehicleMake= '';
        this.claimRegisterObj.vehicleModel = '';
        this.claimRegisterObj.registrationNumber = '';
        this.claimRegisterObj.registrationDate = '';
        this.template.querySelector('.clear').clearSelection();

    }
        

}

async handleSearchVehicle(e){
    this.showLoading = true;
    let value =e.detail.recordId;
    console.log('vehical no:', value);
    this.claimRegisterObj.vehicleId = value;
    if(this.claimRegisterObj.vehicleId != null){
        console.log('vehical ABC :', value);
        let vehicleobj = await getVehicleInfoById({vehicleId:this.claimRegisterObj.vehicleId})
        let parsedVehicleObj = JSON.parse(vehicleobj);
    if(parsedVehicleObj.status == 'success'){
        this.showLoading = false;
        console.log('vehical if success:');
        this.claimRegisterObj.vehicleMake = parsedVehicleObj.companyName;
        this.claimRegisterObj.vehicleModel = parsedVehicleObj.modelName;
        let formattedDate = parsedVehicleObj.registrationDate.split('-');
        this.claimRegisterObj.registrationDate = formattedDate[2] + '/' + formattedDate[1] + '/' +formattedDate[0];
        this.claimRegisterObj.registrationNumber = parsedVehicleObj.registrationNumber;
    }
    else if(parsedVehicleObj.status == 'error'){
        this.showLoading = false;
        console.log('vehical else err:');
        this.showToastmessage('Error','No record found.','error'); 
    }
  }else if(this.claimRegisterObj.vehicleId == null){
    this.template.querySelector('.clear').clearSelection();
    this.claimRegisterObj.vehicleMake = '';
    this.claimRegisterObj.vehicleModel = '';
    this.claimRegisterObj.registrationDate = '';
    this.claimRegisterObj.registrationNumber = '';
    this.showLoading = false;
  }
  
}

async createNewRecord(e){
    this.showLoading = true;
    const name = e.target.name;
    if(name =='Add Customer'){
        console.log('inside add cust:');
        let validatecustomerobj =  await validateCustomer({mobileNo:this.custPhoneNo})
        let parsedCustomerObj = JSON.parse(validatecustomerobj);
        if(parsedCustomerObj.status =='success'){
        let custObj={
            id : '',
            name :this.custName,
            mobile :this.custPhoneNo,
            address :this.address,
            status :'',
			message :''
        }
        let createcustomerobj =  await createCustomer({customerJson:JSON.stringify(custObj)})
        let parsedCustObj = JSON.parse(createcustomerobj);
        if(parsedCustObj.status =='success'){
            this.claimRegisterObj.searchCustomer = parsedCustObj.mobile;
            this.claimRegisterObj.customerId = parsedCustObj.id;
            this.getVehicleFilter();
            this.claimRegisterObj.customerName = parsedCustObj.name;
            this.claimRegisterObj.customerPhoneNo = parsedCustObj.mobile;
            this.clearPopupDetails('Customer');
            this.custName=null;
            this.custPhoneNo=null;
            this.address=null;
            this.showLoading = false;
            this.showToastmessage('Success','Customer record created successfully','success');
            this.vehicalDisabled = false;
            this.disabledCustumorSave = true;
            this.bShowModal = false;
        }else if(parsedCustObj.status =='error'){
            this.clearPopupDetails('Customer');
            this.custName=null;
            this.custPhoneNo=null;
            this.address=null;
            this.showLoading = false;
            this.showToastmessage('Error','Failed to create customer record.','error');
            this.vehicalDisabled = true;
            this.disabledCustumorSave = true;
            this.bShowModal = false;
        }else if(parsedCustObj.status =='failed'){
            this.clearPopupDetails('Customer');
            this.custName=null;
            this.custPhoneNo=null;
            this.address=null;
            this.showLoading = false;
            this.showToastmessage('Error','Failed to create record,Duplicate Phone Number..','error');
            this.vehicalDisabled = true;
            this.disabledCustumorSave = true;
            this.bShowModal = false;
        }
    }else if(parsedCustomerObj.status =='error'){
        this.clearPopupDetails('Customer');
        this.showLoading = false;
        this.showToastmessage('Error','Mobile number is already used. Duplicate records are not allowed.','error');
        this.custName=null;
        this.custPhoneNo=null;
        this.address=null;
        this.vehicalDisabled = true;
        this.disabledCustumorSave = true;
        this.bShowModal = false;
    }
        
    }else if(name =='Add Vehicle'){
        let validateVehicalobj = await validateVehicle({vehicleNo:this.registrationNumber})
        let parsedVehicleDetailObj = JSON.parse(validateVehicalobj);
        if(parsedVehicleDetailObj.status =='success'){
        let vehicalObj = {
            id : '',
            name : this.registrationNumber,
            customerId : this.claimRegisterObj.customerId,
            odometerReading :parseInt(this.odrReading),
            registrationNumber :this.registrationNumber,
            companyName : this.vehicleCompanyName,
            modelName : this.vehicleModel,
            registrationDate : this.registrationDate == null || this.registrationDate == undefined ? null:this.registrationDate.toString(),
            chassisNumber : this.chassisNumber,
            status : '',
			message : '',
        }
        let createVehicalobj = await createVehicle({vehicleJson:JSON.stringify(vehicalObj)})
        let parsedVehicalObj = JSON.parse(createVehicalobj);
        if(parsedVehicalObj.status =='success'){
            this.claimRegisterObj.vehicleId = parsedVehicalObj.id;
            console.log('vehicleId:', this.claimRegisterObj.vehicleId);
            this.claimRegisterObj.vehicleMake = parsedVehicalObj.companyName;
            this.claimRegisterObj.vehicleModel = parsedVehicalObj.modelName;
            this.claimRegisterObj.registrationNumber = parsedVehicalObj.registrationNumber;
            let formattedDate = parsedVehicalObj.registrationDate.split('-');
            this.claimRegisterObj.registrationDate = formattedDate[2] + '/' + formattedDate[1] + '/' +formattedDate[0];
            this.clearPopupDetails('Vehicle');
            this.showLoading = false;
            this.showToastmessage('Success','Vehicle record created successfully','success');
            this.disabledVehicleSave = true;
            this.bShowModal2 = false;
        }else if(parsedVehicalObj.status =='error'){
            this.clearPopupDetails('Vehicle');
            this.showLoading = false;
            this.showToastmessage('Error','Failed to create Vehicle record.','error');
            this.disabledVehicleSave = true;
            this.bShowModal2 = false;
        }
    }else if(parsedVehicleDetailObj.status =='error'){
        this.clearPopupDetails('Vehicle');
        this.showLoading = false;
        this.showToastmessage('Error','Vehicle Number is already exist. Duplicate records are not allowed.','error');
        this.disabledVehicleSave = true;
        this.bShowModal2 = false;
    }
    }
}

openModal() {    
    this.bShowModal = true;
}

closeModal() {    
    this.bShowModal = false;
    this.clearPopupDetails('Customer');
    this.custName=null;
    this.custPhoneNo=null;
    this.address=null;
    this.disabledCustumorSave = true;
};

openModal2() {    
    this.bShowModal2 = true;
}

closeModal2() {    
    this.bShowModal2 = false;
    this.clearPopupDetails('Vehicle');
    this.disabledVehicleSave = true;
};

async handleNextParent(){
    console.log('inside handleValidateOTP11:',this.otpValidation);
    console.log('this.claimRegisterObj.wear:', this.claimRegisterObj.wearPercent);
    console.log('this.claimRegisterObj.damageCause:',JSON.stringify(this.claimRegisterObj.damageCause));
    console.log('this.claimRegisterObj.tyreSize:', this.claimRegisterObj.tyreSize);
    console.log('this.claimRegisterObj.claimRecordId:', this.claimRegisterObj.claimRecordId);
    console.log('this.claimRegisterObj.wearPercent.includes @@@@@:',typeof this.claimRegisterObj.wearPercent);
    this.showLoading = true; 
    this.isDisableWarrenty = true;
    this.isDisableWarrenty1 = true;
    console.log('@@@@@:',this.claimRegisterObj.status);
    
    if(((this.claimRegisterObj.status == 'Draft' || this.claimRegisterObj.status == 'Rejected' || this.claimRegisterObj.status == '' || !this.claimRegisterObj.status) && !this.isServiceEngineer) || (this.isServiceEngineer && this.claimRegisterObj.status != 'Pending')){
        console.log('this. @@@@@:',this.claimRegisterObj.status);
    let claimObj = {
        id:this.claimRegisterObj.claimRecordId ?? '',
        name:'',
        type:this.claimRegisterObj.warrenty,
        oeReplacement:this.claimRegisterObj.warrentytype,
        warrantyId:this.claimRegisterObj.warrantyName ?? '',
        warrantyNumber:this.claimRegisterObj.warrantyNumber ?? '',
        tyreSerialNo:this.claimRegisterObj.serialNumber1 ?? '',
        tyrePattern:this.claimRegisterObj.pattern1 ?? '',
        tyreSize:this.claimRegisterObj.tyreSize1 ?? '',
        customer:{
            id : this.claimRegisterObj.customerId ?? '',
            name : this.claimRegisterObj.customerName ?? '',
            mobile : this.claimRegisterObj.customerPhoneNo ?? '' ,
            city : '',
            state : '',
            address : '',
            erpCode : ''
        },
        vehicle:{
            vehicleId : this.claimRegisterObj.vehicleId ?? '',
            vehicleNo : this.claimRegisterObj.registrationNumber ?? '' ,
            companyName : this.claimRegisterObj.vehicleMake ?? '',
            modelName : this.claimRegisterObj.vehicleModel ?? '',
            registrationDate : this.claimRegisterObj.registrationDate ?? ''
        },
        tyre:{
            id : this.claimRegisterObj.serialId ?? '',
            name : this.claimRegisterObj.tyreName ?? '',
            tyreSerialNo : this.claimRegisterObj.serialNumber ?? '',
            tyrePattern : this.claimRegisterObj.pattern ?? '',
            tyreSize : this.claimRegisterObj.tyreSize ?? '',
            rimSize : '',
            size :'',
            barCode : '',
            ogd : 0
        },
        otpValidation:this.otpValidation,
        images:{
            serialImg : this.claimRegisterObj.tyreSerialVersionId ?? '',
            outsideImg : this.claimRegisterObj.defectImgOutsideVersionId ?? '',
            insideImg : this.claimRegisterObj.defectImgInsideVersionId ?? '',
            depthGaugeImg : this.claimRegisterObj.treadDepthGaugeVersionId ?? '',
            odometerImg : this.claimRegisterObj.odometerReadingVersionId ?? '',
            extraImg : this.claimRegisterObj.extraImgVersionId ?? '',
            serialImgDoc : this.claimRegisterObj.tyreSerialImgId ?? '',
            outsideImgDoc : this.claimRegisterObj.defectImgOutsideId ?? '',
            insideImgDoc : this.claimRegisterObj.defectImgInsideId ?? '',
            depthGaugeImgDoc : this.claimRegisterObj.treadDepthGaugeId ?? '',
            odometerImgDoc : this.claimRegisterObj.odometerReadingId ?? '',
            extraImgDoc : this.claimRegisterObj.extraImgId ?? '',
            serialImgChange : this.claimRegisterObj.serialImgChange ?? false,
            outsideImgChange : this.claimRegisterObj.outsideImgChange ?? false,
            insideImgChange : this.claimRegisterObj.insideImgChange ?? false,
            depthGaugeImgChange : this.claimRegisterObj.depthGaugeImgChange ?? false,
            odometerImgChange : this.claimRegisterObj.odometerImgChange ?? false,
            extraImgChange : this.claimRegisterObj.extraImgChange ?? false
        },
        damageCondition:this.claimRegisterObj.damageCondition ?? '',
        damageCause:this.claimRegisterObj.damageCause ? this.claimRegisterObj.damageCause.join(';'):'',
        complaintNature:'',
        originalGrooveDepth:this.claimRegisterObj.originalGrooveDepth ? parseFloat(this.claimRegisterObj.originalGrooveDepth):0,
        remainingGrooveDepth:this.claimRegisterObj.remainingGrooveDepth ? parseFloat(this.claimRegisterObj.remainingGrooveDepth):0,
        wear:this.claimRegisterObj.wearPercent ?? 0,
        totalkm:this.claimRegisterObj.totalRunningKms ? parseFloat(this.claimRegisterObj.totalRunningKms):0,
        remark:this.claimRegisterObj.claimRemarks ?? '',
        dealerId :this.claimRegisterObj.dealerId ?? '',
        assetId:this.claimRegisterObj.serialId ?? '',
        barCode:this.claimRegisterObj.barCode ?? '',
        status:'Draft',
        policy:this.claimRegisterObj.claimPolicy ?? '',
        pickupLocation:this.claimRegisterObj.pickupLocation ?? '',
        natureOfComplaint:this.claimRegisterObj.natureOfComplaint ?? ''
        };
        console.log('inside Parrent save :',JSON.stringify(claimObj));
        let claimResponse =  await createNewClaim({claimJson:JSON.stringify(claimObj)});
        let parsedClaimResponse  = JSON.parse(claimResponse);
        console.log('inside Parrent parsedClaimResponse :',JSON.stringify(parsedClaimResponse));
        if(parsedClaimResponse.status == 'error'){
            this.showLoading = false; 
            this.showToastmessage('Error', 'Failed to create record.', 'error');
            this.showChildRegister = false;
            this.showChildReview = false;
            this.showChildThankYou = false;
            this.showClaimParent = true;
        }else if(parsedClaimResponse.status == 'success'){
            this.claimRegisterObj.claimRecordId = parsedClaimResponse.recordId;
            this.claimRegisterObj.chargeableAmount = parsedClaimResponse.amount;
            
            this.claimRegisterObj.serialId = parsedClaimResponse.assetId;
            console.log('this.claimRegisterObj.serialId :', this.claimRegisterObj.serialId );
            console.log('parsedClaimResponse 1111:', parsedClaimResponse);
            this.showLoading = false; 
            // this.showToastmessage('Success', 'Record Saved as Draft.', 'success');
            this.showChildReview = false;
            this.showChildThankYou = false;
            this.showClaimParent = false;
            this.showChildRegister = true;
        }
    }else{
        this.showLoading = false;
        this.showChildReview = false;
        this.showChildThankYou = false;
        this.showClaimParent = false;
        this.showChildRegister = true;
        this.nextDisabled = false;
    }
}

handleBack(e){
    this.showChildReview = false;
    this.showChildRegister = false;
    this.showChildThankYou = false;
    this.showClaimParent = true;
    this.checkWarrntyType(this.claimRegisterObj.warrenty);
    this.claimRegisterObj = e.detail;
    console.log('inside back :',JSON.stringify(this.claimRegisterObj));
}

async handleNext(e){
    this.showLoading = true;
    console.log('inside handleValidateOTP22:',this.otpValidation);
    console.log('inside NExt 11:');
    this.objFromRegisterChild = e.detail;
    console.log('image flags1:',this.objFromRegisterChild.serialImgChange);
    console.log('image flags2:',this.objFromRegisterChild.outsideImgChange);
    console.log('image flags3:',this.objFromRegisterChild.insideImgChange);
    console.log('inside NExt:',this.objFromRegisterChild.damageCause.join('\n'));
    
    if(((this.claimRegisterObj.status == 'Draft' || this.claimRegisterObj.status == 'Rejected' || this.claimRegisterObj.status == '' || !this.claimRegisterObj.status) && !this.isServiceEngineer) || (this.isServiceEngineer && this.claimRegisterObj.status != 'Pending')){
    let claimObj = {
        id:this.objFromRegisterChild.claimRecordId,
        name:'',
        type:this.objFromRegisterChild.warrenty,
        oeReplacement:this.objFromRegisterChild.warrentytype,
        warrantyId:this.objFromRegisterChild.warrantyName,
        warrantyNumber:this.objFromRegisterChild.warrantyNumber,
        tyreSerialNo:this.claimRegisterObj.serialNumber1 ?? '',
        tyrePattern:this.claimRegisterObj.pattern1 ?? '',
        tyreSize:this.claimRegisterObj.tyreSize1 ?? '',
        customer:{
            id : this.objFromRegisterChild.customerId,
            name : this.objFromRegisterChild.customerName ,
            mobile : this.objFromRegisterChild.customerPhoneNo ,
            city : '',
            state : '',
            address : '',
            erpCode : ''
        },
        vehicle:{
            vehicleId : this.objFromRegisterChild.vehicleId,
            vehicleNo : this.objFromRegisterChild.registrationNumber,
            companyName : this.objFromRegisterChild.vehicleMake,
            modelName : this.objFromRegisterChild.vehicleModel,
            registrationDate : this.objFromRegisterChild.registrationDate
        },
        tyre:{
            id : this.objFromRegisterChild.serialId,
            name : this.objFromRegisterChild.tyreName,
            tyreSerialNo : this.objFromRegisterChild.serialNumber,
            tyrePattern : this.objFromRegisterChild.pattern,
            tyreSize : this.objFromRegisterChild.tyreSize,
            rimSize : '',
            size :'',
            barCode : '',
            ogd : parseFloat(this.objFromRegisterChild.originalGrooveDepth)
        },
        otpValidation:this.otpValidation,
        images:{
            serialImg : this.objFromRegisterChild.tyreSerialVersionId,
            outsideImg : this.objFromRegisterChild.defectImgOutsideVersionId,
            insideImg : this.objFromRegisterChild.defectImgInsideVersionId,
            depthGaugeImg : this.objFromRegisterChild.treadDepthGaugeVersionId,
            odometerImg : this.objFromRegisterChild.odometerReadingVersionId,
            extraImg : this.objFromRegisterChild.extraImgVersionId,
            serialImgDoc : this.objFromRegisterChild.tyreSerialImgId,
            outsideImgDoc : this.objFromRegisterChild.defectImgOutsideId,
            insideImgDoc : this.objFromRegisterChild.defectImgInsideId,
            depthGaugeImgDoc : this.objFromRegisterChild.treadDepthGaugeId,
            odometerImgDoc : this.objFromRegisterChild.odometerReadingId,
            extraImgDoc : this.objFromRegisterChild.extraImgId,
            serialImgChange : this.objFromRegisterChild.serialImgChange,
            outsideImgChange : this.objFromRegisterChild.outsideImgChange,
            insideImgChange : this.objFromRegisterChild.insideImgChange,
            depthGaugeImgChange : this.objFromRegisterChild.depthGaugeImgChange,
            odometerImgChange : this.objFromRegisterChild.odometerImgChange,
            extraImgChange : this.objFromRegisterChild.extraImgChange
        },
        damageCondition:this.objFromRegisterChild.damageCondition,
        damageCause:this.objFromRegisterChild.damageCause.join(';'),
        complaintNature:'',
        originalGrooveDepth:parseFloat(this.objFromRegisterChild.originalGrooveDepth),
        remainingGrooveDepth:parseFloat(this.objFromRegisterChild.remainingGrooveDepth),
        // wear:this.objFromRegisterChild.wearPercent ?? 0,
        wear: !this.objFromRegisterChild.wearPercent || isNaN(this.objFromRegisterChild.wearPercent) ? 0 : this.objFromRegisterChild.wearPercent,
        totalkm:parseFloat(this.objFromRegisterChild.totalRunningKms),
        remark:this.objFromRegisterChild.claimRemarks,
        dealerId :this.objFromRegisterChild.dealerId,
        assetId:this.objFromRegisterChild.serialId,
        barCode:this.objFromRegisterChild.barCode,
        status:'Draft',
        policy:this.objFromRegisterChild.claimPolicy,
        pickupLocation:this.objFromRegisterChild.pickupLocation,
        natureOfComplaint:this.objFromRegisterChild.natureOfComplaint
        };

        let claimResponsechild =  await createNewClaim({claimJson:JSON.stringify(claimObj)});
        let parsedClaimResponsechild  = JSON.parse(claimResponsechild);
        if(parsedClaimResponsechild.status == 'error'){ 
            this.showToastmessage('Error', 'Failed to Update record.', 'error');
            this.showChildReview = false;
            this.showChildThankYou = false;
            this.showClaimParent = false;
            this.showChildRegister = true;
            this.showLoading = false;
        }else if(parsedClaimResponsechild.status == 'success'){
            this.objFromRegisterChild.claimRecordId = parsedClaimResponsechild.recordId; 
            this.objFromRegisterChild.chargeableAmount = parsedClaimResponsechild.amount;
            this.objFromRegisterChild.serialId = parsedClaimResponsechild.assetId;
            console.log('new assetID on 2nd click:', this.objFromReviewChild.serialId);
            // this.showToastmessage('Success', 'Record Saved as Draft.', 'success');
            this.damageCause = this.objFromRegisterChild.damageCause.join('\n');
            this.showChildRegister = false;
            this.showChildThankYou = false;
            this.showClaimParent = false;
            this.showChildReview = true;
            this.showLoading = false;
            console.log('inside  Next child:'); 
        }
    }else{
        this.showChildRegister = false;
            this.showChildThankYou = false;
            this.showClaimParent = false;
            this.showChildReview = true;
            this.showLoading = false;
    }
}

async handleSubmitDetails(e){
    this.showLoading = true;
    this.objFromReviewChild = e.detail;
    if(((this.claimRegisterObj.status == 'Draft' || this.claimRegisterObj.status == 'Rejected' || this.claimRegisterObj.status == '' || !this.claimRegisterObj.status) && !this.isServiceEngineer) || (this.isServiceEngineer && this.claimRegisterObj.status != 'Pending')){
    let claimObj = {
        id:this.objFromReviewChild.claimRecordId,
        name:'',
        type:this.objFromReviewChild.warrenty,
        oeReplacement:this.objFromReviewChild.warrentytype,
        warrantyId:this.objFromReviewChild.warrantyName,
        warrantyNumber:this.objFromReviewChild.warrantyNumber,
        tyreSerialNo:this.claimRegisterObj.serialNumber1 ?? '',
        tyrePattern:this.claimRegisterObj.pattern1 ?? '',
        tyreSize:this.claimRegisterObj.tyreSize1 ?? '',
        customer:{
            id : this.objFromReviewChild.customerId,
            name : this.objFromReviewChild.customerName ,
            mobile : this.objFromReviewChild.customerPhoneNo ,
            city : '',
            state : '',
            address : '',
            erpCode : ''
        },
        vehicle:{
            vehicleId : this.objFromReviewChild.vehicleId,
            vehicleNo : this.objFromReviewChild.registrationNumber,
            companyName : this.objFromReviewChild.vehicleMake,
            modelName : this.objFromReviewChild.vehicleModel,
            registrationDate : this.objFromReviewChild.registrationDate
        },
        tyre:{
            id : this.objFromReviewChild.serialId,
            name : this.objFromReviewChild.tyreName,
            tyreSerialNo : this.objFromReviewChild.serialNumber,
            tyrePattern : this.objFromReviewChild.pattern,
            tyreSize : this.objFromReviewChild.tyreSize,
            rimSize : '',
            size :'',
            barCode : '',
            ogd : parseFloat(this.objFromReviewChild.originalGrooveDepth)
        },
        otpValidation:this.otpValidation,
        images:{
            serialImg : this.objFromReviewChild.tyreSerialVersionId,
            outsideImg : this.objFromReviewChild.defectImgOutsideVersionId,
            insideImg : this.objFromReviewChild.defectImgInsideVersionId,
            depthGaugeImg : this.objFromReviewChild.treadDepthGaugeVersionId,
            odometerImg : this.objFromReviewChild.odometerReadingVersionId,
            extraImg : this.objFromReviewChild.extraImgVersionId,
            serialImgDoc : this.objFromReviewChild.tyreSerialImgId,
            outsideImgDoc : this.objFromReviewChild.defectImgOutsideId,
            insideImgDoc : this.objFromReviewChild.defectImgInsideId,
            depthGaugeImgDoc : this.objFromReviewChild.treadDepthGaugeId,
            odometerImgDoc : this.objFromReviewChild.odometerReadingId,
            extraImgDoc : this.objFromReviewChild.extraImgId,
            serialImgChange : this.objFromReviewChild.serialImgChange,
            outsideImgChange : this.objFromReviewChild.outsideImgChange,
            insideImgChange : this.objFromReviewChild.insideImgChange,
            depthGaugeImgChange : this.objFromReviewChild.depthGaugeImgChange,
            odometerImgChange : this.objFromReviewChild.odometerImgChange,
            extraImgChange : this.objFromReviewChild.extraImgChange
        },
        damageCondition:this.objFromReviewChild.damageCondition,
        damageCause:this.objFromReviewChild.damageCause.join(';'),
        complaintNature:'',
        originalGrooveDepth:parseFloat(this.objFromReviewChild.originalGrooveDepth),
        remainingGrooveDepth:parseFloat(this.objFromReviewChild.remainingGrooveDepth),
        //wear:this.objFromReviewChild.wearPercent ?? 0,
        wear: !this.objFromRegisterChild.wearPercent || isNaN(this.objFromRegisterChild.wearPercent) ? 0 : this.objFromRegisterChild.wearPercent,
        totalkm:parseFloat(this.objFromReviewChild.totalRunningKms),
        remark:this.objFromReviewChild.claimRemarks,
        dealerId :this.objFromReviewChild.dealerId,
        assetId:this.objFromReviewChild.serialId,
        barCode:this.objFromReviewChild.barCode,
        status:'In Progress',
        policy:this.objFromReviewChild.claimPolicy,
        pickupLocation:this.objFromReviewChild.pickupLocation,
        natureOfComplaint:this.objFromReviewChild.natureOfComplaint
        };
        
        let claimResponsechild =  await createNewClaim({claimJson:JSON.stringify(claimObj)});
        console.log('inside Submit detail Status@@:',this.objFromReviewChild.status);
        let parsedClaimResponsechild  = JSON.parse(claimResponsechild);
        if(parsedClaimResponsechild.status == 'error'){ 
            console.log('inside Error in:');
            this.showToastmessage('Error', 'Failed to create record.', 'error');
            this.showChildThankYou = false;
            this.showChildRegister = false;
            this.showClaimParent = false;
            this.showChildReview = true;
            this.showLoading = false;
        }else if(parsedClaimResponsechild.status == 'success'){
            console.log('inside Success in:',this.objFromReviewChild.claimRecordId); 
            //this.objFromReviewChild.claimRecordId = parsedClaimResponsechild.recordId; 
            //this.objFromReviewChild.chargeableAmount = parsedClaimResponsechild.amount;
            this.showToastmessage('Success', 'Record created succesfully.', 'success');
            this.showChildReview = false;
            this.showChildRegister = false;
            this.showClaimParent = false;          
            this.showChildThankYou = true;
            this.showLoading = false;
        }
    }else{
        this.showChildReview = false;
        this.showChildRegister = false;
        this.showClaimParent = false;          
        this.showChildThankYou = true;
        this.showLoading = false;
        this.showToastmessage('Warning', 'Record has been alredy sent for approval.', 'warning');
    }
}

handleModify(e){
    this.showChildReview = false;
    this.showChildRegister = false;
    this.showChildThankYou = false;
    this.showClaimParent = true;
    this.checkWarrntyType(this.claimRegisterObj.warrenty);
    this.claimRegisterObj = e.detail;
    this.claimRegisterObj={...this.claimRegisterObj};
    console.log('this.claim in modify:', JSON.stringify(this.claimRegisterObj));
    
}

async handleOTP(e){
    this.showLoading = true;
    const label = e.target.label;
    if(label == 'Send OTP'){
        this.isOtpButtonDisabled = true;
        console.log('inside  handleSendOTP:');
    try {
            console.log('inside  handleSendOTP:',this.claimRegisterObj.customerPhoneNo);
            this.OTPWrapper.mobile = this.claimRegisterObj.customerPhoneNo;
            this.OTPWrapper.type = 'Claim';
            let sendWarrantyOTP = await sendOTP({wrapperString:JSON.stringify(this.OTPWrapper)})
            let parsedsendOTP = JSON.parse(sendWarrantyOTP);
            console.log('inside  handleSendOTP parsedsendOTP:',parsedsendOTP);
            if(parsedsendOTP.status == 'success'){
                console.log('inside  handleSendOTP success:');
                this.otp = parsedsendOTP.otp;
                console.log('inside  handleSendOTP success:',this.otp);
                this.isEnterOTPDisabled = false;
                this.showToastmessage('Success', 'OTP has been sent to registered mobile number.', 'Success');
                this.showLoading = false;
            }else if(parsedsendOTP.status == 'error'){
                console.log('inside  handleSendOTP error:');
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
        console.log('inside handleValidateOTP:');
    try {
        if(this.otp == this.claimRegisterObj.enterOTP){
            this.otpValidation = true;
            console.log('inside handleValidateOTP:',this.otpValidation);
            this.showToastmessage('Success', 'OTP has been validated successfully.', 'Success');
            this.isEnterOTPDisabled = true;
            this.isOtpButtonDisabled = true;
            this.nextDisabled = false;
            this.showLoading = false;
        }else if(this.otp != this.claimRegisterObj.enterOTP){
            this.showToastmessage('Error', 'OTP validation failed.', 'Error');
            this.isEnterOTPDisabled = false;
            this.nextDisabled = true;
            this.showLoading = false;
        }
        
    } catch (error) {
        console.error('Error sending OTP:', error);
        this.showLoading = false;
    }
    }
    
}

async checkWarrntyType(val){
    console.log('inside !!!!!!!')
    if(val == 'With Warranty'){
        this.showLoading = false;
        this.WithWarranty = true;
        this.WithoutWarranty = false;
        this.disabletyreSize = true;
        this.disablePattern = true;
    }else if(val == 'Without Warranty'){
        this.showLoading = false;
        this.WithoutWarranty = true;
        this.WithWarranty = false;
       // this.disabletyreSize = false;
        this.disablePattern = false;
        this.nextDisabled = false;
        let getPattern = await getTyrePatterns({})
        let parsedgetPattern = JSON.parse(getPattern);
        console.log('inside  handleSendOTP parsedsendOTP:',parsedgetPattern);
        if(parsedgetPattern.status == 'success'){
            console.log('inside succes pattern:', );
            this.showLoading = false;
            parsedgetPattern.tyrePattern.forEach(element => {
                this.patternOpts = [...this.patternOpts,{label:element,value:element}];
               });
               console.log('inside succes pattern1:', this.patternOpts);
        }else if(parsedgetPattern.status == 'error'){
            this.showToastmessage('Error',parsedgetPattern.message,'error')
            this.showLoading = false;
        }

    }
}

async handlePopupInputChange(e){
    const label = e.target.label;
    let value = e.target.value;
    if(label == 'Customer Name'){
        console.log('inside Name cust :', value );
        this.custName = value;
    }
    else if(label == 'Customer Phone Number'){
        console.log('inside Phone num :', value );
        if(!this.numValue.test(value) || value.length < 10 || value.length > 10){
            this.showToastmessage('Error','Please enter a valid 10-digit phone number.','error')
            return;
        }
        this.custPhoneNo = value;
    } 
    else if(label == 'Address'){
        this.address = value;
    } 
    else if(label == 'Registration Number'){
        this.registrationNumber = value;
    } 
    else if(label =='Registration Date'){
        this.registrationDate = value;
        if(new Date(value) > new Date()){
            console.log('inside date:');
            this.showToastmessage('Error', 'Registration Date cannot be greater than today', 'error');
        }
    }
    else if(label =='Vehicle Model'){
        this.vehicleModel = value;
    }
    else if(label == 'Vehicle Company Name'){
        this.vehicleCompanyName = value;
    } 
    else if(label == 'Odometer Reading'){
        this.odrReading = value;
    } 
    else if(label == 'Chassis Number'){
        this.chassisNumber = value;
    } 
    if(this.registrationNumber && this.registrationDate && new Date(this.registrationDate) <= new Date() && this.vehicleModel && this.vehicleCompanyName){
        this.disabledVehicleSave = false;
    }else {
        this.disabledVehicleSave = true;
    }

    if(this.custName && this.custPhoneNo){
        this.disabledCustumorSave = false;
    }else {
        this.disabledCustumorSave = true;
    }
}

handleInputChange(e){
    const label = e.target.label;
    const value = e.target.value;
        if(label == 'Mobile/Warranty Registration Number/Vehicle Registration Number'){
            this.tempRegistrationNo = value;
            this.claimRegisterObj.registrationNo = value;
        }
        else if(label == 'Customer Name'){
            this.claimRegisterObj.customerName = value;
        }
        else if(label == 'Customer Phone Number'){
            this.claimRegisterObj.customerPhoneNo = value;
        } 
        else if(label =='Registration Number'){
            this.claimRegisterObj.registrationNumber = value;
        }
        else if(label == 'Vehicle Maker' || label == 'Vehicle Company Name'){
            this.claimRegisterObj.vehicleMake = value;
        } 
        else if(label == 'Vehicle Model'){
            this.claimRegisterObj.vehicleModel = value;
        } 
        else if(label == 'Vehicle Year'){
            this.claimRegisterObj.vehicleYear = value;
        } 
        else if(label == 'Serial Number'){
            this.claimRegisterObj.serialNumber = value;
            if(this.claimRegisterObj.serialNumber){
                this.claimRegisterObj.originalGrooveDepth = (this.tyreMap.get(value).ogd).toString();
                console.log('originalGrooveDepth in without:', this.claimRegisterObj.originalGrooveDepth);
            }
        } 
        else if(label == 'Enter OTP'){
            this.claimRegisterObj.enterOTP = value;
            if(this.claimRegisterObj.enterOTP){
                this.oTPButtons = 'Validate OTP';
                this.isOtpButtonDisabled = false;
                
            }else if(!this.claimRegisterObj.enterOTP){
                this.oTPButtons = 'Send OTP';
                this.isOtpButtonDisabled = false;
            }
        } 
        else if(label == 'Tyre Size'){
            this.claimRegisterObj.tyreSize = value;
            console.log('Size@@11:',   this.claimRegisterObj.tyreSize);
        } 
        else if(label == 'Pattern'){
            this.claimRegisterObj.pattern = value;
            console.log('Pattern:',  this.claimRegisterObj.pattern);
        }else if(label == 'Additional SpectCode'){
            this.productObj.spectCode = value;
            this.claimRegisterObj.serialNumber1 = '';
            console.log('Additional SpectCode :',  this.productObj.spectCode);
        }else if(label == 'WeekYear'){
            const weekYearval = /^\d{4}$/;
            if (weekYearval.test(value)) {
                
                this.productObj.weekYear = value;
                this.claimRegisterObj.serialNumber1 = '';
                console.log('WeekYear:', this.productObj.weekYear);
                this.claimRegisterObj.serialNumber1 = this.productObj.plantCode + this.productObj.spectCode +this.productObj.weekYear;
            } else {
                console.error('Invalid WeekYear:', value);
                this.showToastmessage('Error', 'WeekYear must be exactly 4 digits.', 'error');
                this.claimRegisterObj.serialNumber1 = '';
            }
        }
}

get patternOptions(){
    return this.patternOpts;
}
get tyreOptions(){
    return this.tyreOpts;
}

get additionalSpectCodeOptions(){
    return this.spectOpts;
}

async handleChange(e){
    const label = e.target.label;
    const value = e.target.value;
     if(label == 'Pattern'){
        this.productObj.spectCode = '';
        this.productObj.weekYear = '';
        this.productObj.plantCode = '';
        this.claimRegisterObj.serialNumber1 = '';

        this.claimRegisterObj.pattern1 = value;
        console.log('Pattern:',  this.claimRegisterObj.pattern1);
        if(this.claimRegisterObj.pattern1){
            this.showLoading = true;
            this.disabletyreSize = false;
            let getTyreSize = await getTyreSizeByPatterns({pattern:this.claimRegisterObj.pattern1})
            let parsedgetTyreSize = JSON.parse(getTyreSize);
            console.log('inside  parsedgetTyreSize:',parsedgetTyreSize);
                if(parsedgetTyreSize.status == 'success'){
                    console.log('inside succes tyreSize:', );
                    this.showLoading = false;
                    this.tyreOpts = [];
                    parsedgetTyreSize.tyreSize.forEach(element => {
                        this.tyreOpts = [...this.tyreOpts,{label:element,value:element}];
                        });
                        console.log('inside succes tyreOpts:', this.tyreOpts);
                }else if(parsedgetTyreSize.status == 'error'){
                    this.showToastmessage('Error',parsedgetTyreSize.message,'error')
                    this.showLoading = false;
                }
            }
        }else if(label == 'Tyre Size'){
            this.productObj.spectCode = '';
            this.productObj.weekYear = '';
            this.productObj.plantCode = '';
            this.claimRegisterObj.serialNumber1 = '';

            this.claimRegisterObj.tyreSize1 = value;
            console.log('Size@@11:',   this.claimRegisterObj.tyreSize1);
            console.log('Size@@1111:',   this.claimRegisterObj.pattern1);
            try {
                this.showLoading = true;
                this.isSpectCodeDisable = false;
                this.isWeekYearDisable = false;
                let getProductData = await getProductBasedOnSizePattern({
                    pattern: this.claimRegisterObj.pattern1,
                    tyreSize: this.claimRegisterObj.tyreSize1
                });
                let parsedgetProductData = JSON.parse(getProductData);
                console.log('inside parsedgetProductData:', parsedgetProductData);

                if (parsedgetProductData.status == 'success') {
                    console.log('inside success prod data:', parsedgetProductData);
                    this.showLoading = false;
                    this.spectOpts = [];
                    //this.productObj.plantCode = parsedgetProductData.spectCode;
                    this.productObj.plantCode = parsedgetProductData.plantCode;
                    this.claimRegisterObj.originalGrooveDepth = parsedgetProductData.ogd;
                    parsedgetProductData.additionalSpectCode.forEach(element => {
                        this.spectOpts = [...this.spectOpts, { label: element, value: element }];
                    });
                    console.log('inside success product:', this.spectOpts);
                } else if (parsedgetProductData.status == 'error') {
                    this.showToastmessage('Error', parsedgetProductData.message, 'error');
                    this.showLoading = false;
                }
            } catch (error) {
                console.error('Error fetching product data:', error);
                this.showToastmessage('Error', 'Failed to fetch product data', 'error');
                this.showLoading = false;
            }
        }
    }
    


async clearRegistrationPage(){
    this.claimRegisterObj = {};
    this.dealerOpts = [];
    this.pickupOptions = [];
    await this.fetchOnLoadClaim();
    this.serialNoOpts = [];
    this.warrentyOpts = []; 
  
}

clearPopupDetails(val){
    if(val == 'Customer'){
        this.pincode =  null;
        this.pincodeName =  null;
        this.cityName = null;
        this.stateName = null;
        this.countryName = null;
        this.districtName = null;
        this.cityId = null;
        this.stateId = null;
        this.countryId = null;
        this.districtId = null;
    }
    else if(val == 'Vehicle'){
        this.registrationNumber = null;
        this.registrationDate = null;
        this.vehicleModel = null;
        this.vehicleCompanyName = null;
        this.odrReading = null;
        this.chassisNumber = null;
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