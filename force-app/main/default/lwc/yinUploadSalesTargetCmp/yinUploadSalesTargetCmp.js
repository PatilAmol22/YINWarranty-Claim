/**
 * @description       : Mass Upload Sales Target.
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : SKI
 * @last modified on  : 02-05-2024
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
**/

import { LightningElement, api,wire,track } from 'lwc';
import customCSS from '@salesforce/resourceUrl/customCSS';
import { loadStyle } from 'lightning/platformResourceLoader';
import { NavigationMixin } from 'lightning/navigation';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import USER_ID from '@salesforce/user/Id';
import MeasureType from '@salesforce/schema/YIN_Target__c.MeasureType__c';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import TARGET_OBJECT from '@salesforce/schema/YIN_Target__c';
import createSalesTarget from '@salesforce/apex/YinSalesTargetMassUploadController.createSalesTarget';

export default class YinUploadSalesTargetCmp extends NavigationMixin (LightningElement) {

    @track showLoading = true;
    @track myRecordId = USER_ID;
    @track measureTypeOptions = [];
    @track targetObj = {};
    @track isSubmitDisable = true;
    @track uploadedFileName;
    @track documentId;


connectedCallback() {
    this.showLoading = false;
    console.log('Inside Connected :');
}

renderedCallback() {
    Promise.all([
        loadStyle(this, customCSS)
    ]);
}


@wire(getObjectInfo, { objectApiName: TARGET_OBJECT })
MeasureTypeInfo;

@wire(getPicklistValues,
    {
        recordTypeId: '$MeasureTypeInfo.data.defaultRecordTypeId',
        fieldApiName: MeasureType
    }
)
MeasureTypeValues({ error, data }) {
    if (data) {
        console.log('inside wire 1:');
        this.error = null;
        let policyValslist = data.values;
        console.log('inside wire 2:',JSON.stringify(policyValslist));
        let measureTypeOptions = [];
        for (let i = 0; i < policyValslist.length; i++) {
            measureTypeOptions.push({
                label: policyValslist[i].label,
                value: policyValslist[i].value
            });
        }
        this.measureTypeOptions = measureTypeOptions;
        this.targetObj.MeasureType ='Revenue';
        //this.targetObj.MeasureType = this.targetObj.MeasureType && this.targetObj.MeasureType != '' ? this.targetObj.MeasureType :'Revenue';
    }
    else if (error) {
        this.error = JSON.stringify(error);
        console.log(JSON.stringify(error));
    }
}

handleComboboxChange(e){
    this.showLoading = false;
    this.targetObj.MeasureType = e.detail.value;
    this.checkSubmitDisable();
}

    get acceptedFormats() {
        return ['.csv'];
    }

handleUploadFinished(event) {
    
    let uploadedFiles = event.detail.files[0];
    this.targetObj.uploadedFileName = uploadedFiles.name;
    console.log('uploadedFiles name:', this.targetObj.uploadedFileName);
    console.log('uploadedFiles@@:', uploadedFiles);
    this.documentId = uploadedFiles.documentId;
    this.checkSubmitDisable();
        
}

handleRemoveAttachment(e){
        this.targetObj.uploadedFileName = '';
        this.documentId = '';
    }

async handleSubmit(){
    this.showLoading = true;
    let responseObj = await createSalesTarget({contentDocumentId:this.documentId,measuretype:this.targetObj.MeasureType})
    console.log('responseObj:',JSON.stringify(responseObj));
    if(responseObj.status == 'success'){
        this.showToastmessage('Success',responseObj.message,'success');
        this.handleClose();
        this.isSubmitDisable = true;
    }
    else if(responseObj.status == 'error'){
        this.showToastmessage('Error',responseObj.message,'error');
    }
    this.showLoading = false;

}

checkSubmitDisable(){

    if(this.targetObj.MeasureType && this.documentId){
        this.isSubmitDisable = false;
    }
    else{
        this.isSubmitDisable = true;
    }
}

handleClose(){
    this[NavigationMixin.Navigate]({
        type: 'standard__webPage',
        attributes: {
            url: '/lightning/o/YIN_Target__c/list?filterName=Recent'
        },
    });
}

downloadCSV() {
    let downloadElement = document.createElement('a');
    document.body.appendChild(downloadElement);
    if(this.targetObj.MeasureType == 'Revenue'){
        console.log('inside Revenue:' );
        downloadElement.href = '/resource/RevenueTemplateCSV';
        downloadElement.download = 'RevenueSalesTarget.csv'; 
    }else if(this.targetObj.MeasureType == 'Quantity'){
        console.log('inside Quantity:' );
        downloadElement.href = '/resource/QuantityTemplateCSV';
        downloadElement.download = 'QuantitySalesTarget.csv';
    }
    downloadElement.target = '_self'; 
    downloadElement.click();
    document.body.removeChild(downloadElement);
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