/**
 * @description       : Child component
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : SKI
 * @last modified on  : 24-09-2024
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
**/
import { LightningElement,api, track,wire} from 'lwc';
import customCSS from '@salesforce/resourceUrl/customCSS';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import DamageCondition from '@salesforce/schema/YIN_Claim__c.Damage_Condition__c';
import DamageCause from '@salesforce/schema/YIN_Claim__c.Damage_Causes__c';
import ClaimPolicy from '@salesforce/schema/YIN_Claim__c.Claim_Policy__c';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import CLAIM_OBJECT from '@salesforce/schema/YIN_Claim__c';
import  deleteImages from '@salesforce/apex/YINClaimController.deleteImages';
export default class YinClaimRegisterchildCmp extends LightningElement {
@track picklistValuesObj;
@track conditionOptions = [];
@track claimPolicyOptions = [];
@track causeOpts = [];
@api myRecordId;
@api childClaimObj = {};
@track claimCombineChildObj = {};
@track nextDisabled = true;
@track wearPercent = '0%';
@api pickupOptions = [];
@track numValue = /^[0-9]+$/;
@track showLoading = true;

                          
connectedCallback(){
    this.showLoading = false;
    //console.log('inside coponent2:',JSON.stringify(this.claimCombineChildObj));
    this.claimCombineChildObj = {...this.childClaimObj};
    console.log('@@@inside coponent2:',JSON.stringify(this.claimCombineChildObj));
    this.wearPercent = this.claimCombineChildObj.wearPercent ? this.claimCombineChildObj.wearPercent + '%':'0%';
    this.checkfileUpload();
    //console.log('@@@inside coponent2:',JSON.stringify(this.claimCombineChildObj));
    console.log('@@@inside coponent2 pickupOptions :',JSON.stringify(this.pickupOptions)); 
}

@wire(getObjectInfo, { objectApiName: CLAIM_OBJECT })
claimInfo;

@wire(getPicklistValues,
     {
      recordTypeId: '$claimInfo.data.defaultRecordTypeId',
       fieldApiName: DamageCause }
       )
    causeFieldInfo({ data, error }) {

        if (data){
            console.log('inside wire 1:');
            this.picklistValuesObj = data
            console.log('inside wire 1:', JSON.stringify(this.claimCombineChildObj.damageCondition));
            let key = this.picklistValuesObj.controllerValues[this.claimCombineChildObj.damageCondition];
            this.causeOpts = this.picklistValuesObj.values.filter(opt => opt.validFor.includes(key));
    }
    else if(error){
        console.log('inside damage Condition Fetch error:',error);
    }
    }

@wire(getPicklistValues,
    {
        recordTypeId: '$claimInfo.data.defaultRecordTypeId',
        fieldApiName: DamageCondition
    }
)
conditionValues({ error, data }) {
    if (data) {
        console.log('inside wire 2:');
        this.error = null;
        let conditionValslist = data.values;
        console.log('inside wire 2:',JSON.stringify(conditionValslist));
        let conditionOptions = [];
        for (let i = 0; i < conditionValslist.length; i++) {
            console.log('inside for wire 2:');
            conditionOptions = [...conditionOptions,{
                label: conditionValslist[i].label,
                value: conditionValslist[i].value
            }];
        }
         console.log('outside wire for @@@2:');
        this.conditionOptions = conditionOptions;
        console.log('outside wire for @@@22:');
    }
    else if (error) {
        this.error = JSON.stringify(error);
        console.log(JSON.stringify(error));
    }
}

@wire(getPicklistValues,
    {
        recordTypeId: '$claimInfo.data.defaultRecordTypeId',
        fieldApiName: ClaimPolicy
    }
)
claimPolicyValues({ error, data }) {
    if (data) {
        console.log('inside wire 3:');
        this.error = null;
        let policyValslist = data.values;
        console.log('inside wire 3:',JSON.stringify(policyValslist));
        let claimPolicyOptions = [];
        for (let i = 0; i < policyValslist.length; i++) {
            claimPolicyOptions.push({
                label: policyValslist[i].label,
                value: policyValslist[i].value
            });
        }
        this.claimPolicyOptions = claimPolicyOptions;
        this.claimCombineChildObj.claimPolicy = this.claimCombineChildObj.claimPolicy && this.claimCombineChildObj.claimPolicy != '' ? this.claimCombineChildObj.claimPolicy :'YPP';
    }
    else if (error) {
        this.error = JSON.stringify(error);
        console.log(JSON.stringify(error));
    }

}

renderedCallback() {
    Promise.all([
    loadStyle(this, customCSS)
    ]);
}

handleRadioChange(e){
    this.claimCombineChildObj.customRadioGroup = e.detail.value;
}

handleConditionChange(event) {
    console.log('causes opt picklistValuesObj:',JSON.stringify(this.picklistValuesObj));
    this.claimCombineChildObj.damageCondition = event.detail.value;
    let key = this.picklistValuesObj.controllerValues[event.detail.value];
    this.causeOpts = this.picklistValuesObj.values.filter(opt => opt.validFor.includes(key));
    this.claimCombineChildObj.damageCause = [];
    this.checkfileUpload();
    
   
}

handleCauseChange(event) {
    //this.pickupOptions = [];
    this.claimCombineChildObj.damageCause = event.detail.value;
    console.log('selceted causes:',JSON.stringify(this.claimCombineChildObj.damageCause));
    this.checkfileUpload();
}

handlepickupLocationChange(event){

    this.claimCombineChildObj.pickupLocation = event.detail.value;
    console.log('selceted location:',JSON.stringify(this.claimCombineChildObj.pickupLocation));
    this.checkfileUpload();
}

handleInputChange(e){
    const val = e.target.value;
    const label = e.target.label;
    if(label =='Total Running Kms'){
        if(!this.numValue.test(val)){
            this.showToastmessage('Error','Please enter valid Total Running Kms.','error')
            return;
        }
        this.claimCombineChildObj.totalRunningKms = val;
    }
    else if(label =='Claim Remarks'){
        this.claimCombineChildObj.claimRemarks = val;
    }else if(label =='Nature of complaint'){
        this.claimCombineChildObj.natureOfComplaint = val;
    }
    this.checkfileUpload();
}

handleRGDChange(e){
    this.claimCombineChildObj.remainingGrooveDepth = e.target.value;
    let rgd = this.claimCombineChildObj.remainingGrooveDepth;
    let rgdPattern = /^\d{0,2}(\.\d{0,2})?$/;
    if(!rgdPattern.test( rgd)){
        this.showToastmessage('Error', 'Please enter a valid value for Remaining Groove Depth.', 'error');
        this.claimCombineChildObj.remainingGrooveDepth = null;
        this.claimCombineChildObj.wearPercent = null;
        this.wearPercent = null;
        return;
    }else if (parseFloat(rgd) < 0) {
        this.showToastmessage('Error', 'Remaining Groove Depth cannot be negative.', 'error');
        this.claimCombineChildObj.remainingGrooveDepth = null;
        this.claimCombineChildObj.wearPercent = null;
        this.wearPercent = null;
        return;
    }else if (parseFloat(rgd) > parseFloat(this.claimCombineChildObj.originalGrooveDepth)) {
        this.showToastmessage('Error', 'Remaining Groove Depth cannot be greater than Original Groove Depth.', 'error');
        this.claimCombineChildObj.remainingGrooveDepth = null;
        this.claimCombineChildObj.wearPercent = null;
        this.wearPercent = null;
        return;
    }
    console.log('inside RGD change:', rgd);
    console.log('inside RGD change11:', this.claimCombineChildObj.originalGrooveDepth);
    if(rgd == ''){
        rgd = 0;
    }else if(this.claimCombineChildObj.originalGrooveDepth == ''){
        this.claimCombineChildObj.originalGrooveDepth == 0
    }
    let percentWear = ((parseFloat(this.claimCombineChildObj.originalGrooveDepth) - parseFloat(rgd)) / parseFloat(this.claimCombineChildObj.originalGrooveDepth))*100;
    console.log('inside RGD change1:', percentWear);
    if(percentWear >= 50 ){
        this.showToastmessage('Warning', 'Wear % is more than 50%', 'warning');
    }
    this.wearPercent = percentWear.toFixed(2) + '%';
    this.claimCombineChildObj.wearPercent = percentWear.toFixed(2);
    console.log('inside RGD change2:', this.claimCombineChildObj.wearPercent);

    let warrantyRegistrationDate = new Date(this.claimCombineChildObj.warrantyDate);
    console.log('warrantyStartDate11:', this.claimCombineChildObj.warrantyDate);
    console.log('warrantyStartDate:', warrantyRegistrationDate);
    let currentDate = new Date();
    let timeDifference = currentDate.getTime() - warrantyRegistrationDate.getTime();
    let daysDifference = timeDifference / (1000 * 3600 * 24);

    if (daysDifference <= 30 && percentWear >= 15) {
        this.showToastmessage('Warning', 'Wear % is more than 15% within 30 days', 'warning');
    }

    this.checkfileUpload();

}

handleclaimPolicyChange(e){
    this.claimCombineChildObj.claimPolicy = e.detail.value;
    this.checkfileUpload();
}

handleStepBlur(event) {
const stepIndex = event.detail.index;
}

get acceptedFormats() {
    return ['.jpeg', '.png', '.jpg' ];
}

handleUploadFinished(event) {
    this.showLoading = true;
    const name = event.target.name;
    console.log('inside File upload:', name);
    const uploadedFiles = event.detail.files;
    console.log('inside File uploadedFiles:', JSON.stringify(uploadedFiles));
    if(name == 'fileUploader'){
        this.showLoading = false;
        this.claimCombineChildObj.serialImgChange = true;
        this.claimCombineChildObj.uploadedFileName1 = uploadedFiles[0].name;
        this.claimCombineChildObj.tyreSerialImgId = uploadedFiles[0].documentId;
        this.claimCombineChildObj.tyreSerialVersionId = uploadedFiles[0].contentVersionId;
    }
    else if(name == 'fileUploader2'){
        this.showLoading = false;
        this.claimCombineChildObj.outsideImgChange= true;
        this.claimCombineChildObj.uploadedFileName2 = uploadedFiles[0].name;
        this.claimCombineChildObj.defectImgOutsideId = uploadedFiles[0].documentId;
        this.claimCombineChildObj.defectImgOutsideVersionId = uploadedFiles[0].contentVersionId;
    }
    else if(name == 'fileUploader3'){
        this.showLoading = false;
        this.claimCombineChildObj.insideImgChange =true;
        this.claimCombineChildObj.uploadedFileName3 = uploadedFiles[0].name;
        this.claimCombineChildObj.defectImgInsideId = uploadedFiles[0].documentId;
        this.claimCombineChildObj.defectImgInsideVersionId = uploadedFiles[0].contentVersionId;
    }
    else if(name == 'fileUploader4'){
        this.showLoading = false;
        this.claimCombineChildObj.depthGaugeImgChange = true;
        this.claimCombineChildObj.uploadedFileName4 = uploadedFiles[0].name;
        this.claimCombineChildObj.treadDepthGaugeId = uploadedFiles[0].documentId;
        this.claimCombineChildObj.treadDepthGaugeVersionId = uploadedFiles[0].contentVersionId;
    }
    else if(name == 'fileUploader5'){
        this.showLoading = false;
        this.claimCombineChildObj.odometerImgChange = true;
        this.claimCombineChildObj.uploadedFileName5 = uploadedFiles[0].name;
        this.claimCombineChildObj.odometerReadingId = uploadedFiles[0].documentId;
        this.claimCombineChildObj.odometerReadingVersionId = uploadedFiles[0].contentVersionId;
    }
    else if(name == 'fileUploader6'){
        this.showLoading = false;
        this.claimCombineChildObj.extraImgChange = true;
        this.claimCombineChildObj.uploadedFileName6 = uploadedFiles[0].name;
        this.claimCombineChildObj.extraImgId = uploadedFiles[0].documentId;
        this.claimCombineChildObj.extraImgVersionId = uploadedFiles[0].contentVersionId;
    }  
    this.checkfileUpload();
}

async handledeleteImages(documentId){
    this.showLoading = true;
    let deleteImg = await deleteImages({conDocId:documentId});
    let parseDeletedImgObj = JSON.parse(deleteImg);
    if(parseDeletedImgObj.status == 'success'){
        console.log('File Deleted :');
        this.showLoading = false;
        this.showToastmessage('Success', 'Aattachment deleted successfully', 'success');
    }else if(parseDeletedImgObj.status == 'error'){
        console.log('Failed to delete record:');
        this.showLoading = false;
        this.showToastmessage('Error', 'Failed to delete attachment', 'error');
    }
}

async handleRemoveAttachment(e){
    const dataName = e.target.dataset.name;
    console.log('remove file :', dataName);
    if(dataName == 'file1'){
        await this.handledeleteImages(this.claimCombineChildObj.tyreSerialImgId);
        this.claimCombineChildObj.serialImgChange = false;
        this.claimCombineChildObj.uploadedFileName1 = '';
        this.claimCombineChildObj.tyreSerialImgId = '';
        this.claimCombineChildObj.tyreSerialVersionId = '';
    }
    else if(dataName == 'file2'){
        await this.handledeleteImages(this.claimCombineChildObj.defectImgOutsideId);
        this.claimCombineChildObj.outsideImgChange= false;
        this.claimCombineChildObj.uploadedFileName2 = '';
        this.claimCombineChildObj.defectImgOutsideId = '';
        this.claimCombineChildObj.defectImgOutsideVersionId = '';
    }
    else if(dataName == 'file3'){
        await this.handledeleteImages(this.claimCombineChildObj.defectImgInsideId);
        this.claimCombineChildObj.insideImgChange =false;
        this.claimCombineChildObj.uploadedFileName3 = '';
        this.claimCombineChildObj.defectImgInsideId = '';
        this.claimCombineChildObj.defectImgInsideVersionId = '';
    }
    else if(dataName == 'file4'){
        await this.handledeleteImages(this.claimCombineChildObj.treadDepthGaugeId);
        this.claimCombineChildObj.depthGaugeImgChange = false;
        this.claimCombineChildObj.uploadedFileName4 = '';
        this.claimCombineChildObj.treadDepthGaugeId = '';
        this.claimCombineChildObj.treadDepthGaugeVersionId = '';
    }
    else if(dataName == 'file5'){
        await this.handledeleteImages(this.claimCombineChildObj.odometerReadingId);
        this.claimCombineChildObj.odometerImgChange = false;
        this.claimCombineChildObj.uploadedFileName5 = '';
        this.claimCombineChildObj.odometerReadingId = '';
        this.claimCombineChildObj.odometerReadingVersionId = '';
    }
    else if(dataName == 'file6'){
        await this.handledeleteImages(this.claimCombineChildObj.extraImgId);
        this.claimCombineChildObj.extraImgChange = false;
        this.claimCombineChildObj.uploadedFileName6 = '';
        this.claimCombineChildObj.extraImgId = '';
        this.claimCombineChildObj.extraImgVersionId = '';
    }
    this.checkfileUpload();
}

checkfileUpload(){
    if(this.claimCombineChildObj.tyreSerialImgId != '' && this.claimCombineChildObj.defectImgOutsideId !='' && this.claimCombineChildObj.defectImgInsideId != '' && this.claimCombineChildObj.treadDepthGaugeId != '' && this.claimCombineChildObj.extraImgId != ''
       && this.claimCombineChildObj.tyreSerialImgId  && this.claimCombineChildObj.defectImgOutsideId  && this.claimCombineChildObj.defectImgInsideId  && this.claimCombineChildObj.treadDepthGaugeId  && this.claimCombineChildObj.extraImgId
       && this.claimCombineChildObj.natureOfComplaint && this.claimCombineChildObj.remainingGrooveDepth && this.claimCombineChildObj.totalRunningKms
      // && parseInt(this.claimCombineChildObj.remainingGrooveDepth) > 0 && parseInt(this.claimCombineChildObj.totalRunningKms) > 0 
       && this.claimCombineChildObj.pickupLocation && this.claimCombineChildObj.claimPolicy
       && this.claimCombineChildObj.damageCause && Array.isArray(this.claimCombineChildObj.damageCause) && this.claimCombineChildObj.damageCause.length > 0
       && this.claimCombineChildObj.damageCondition ){
        this.nextDisabled = false;
    }
    else {
        this.nextDisabled = true;
    }
}

handleClick(e){
if(e.target.label == 'Back'){
    this.dispatchEvent(new CustomEvent('back',{
        detail:this.claimCombineChildObj
    }));

}else if(e.target.label == 'Next'){
    this.dispatchEvent(new CustomEvent('next',{
        detail: this.claimCombineChildObj
    }));
    console.log('inside Child Next:',this.claimCombineChildObj);

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