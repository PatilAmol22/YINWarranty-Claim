/**
 * @description       : Create Warranty Invoice child cmp.
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : SKI 
 * @last modified on  : 18-04-2024
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
**/
import { LightningElement, api, track } from 'lwc';
import customCSS from '@salesforce/resourceUrl/customCSS';
import { loadStyle } from 'lightning/platformResourceLoader';
import { RefreshEvent } from 'lightning/refresh';
import sampleImages from '@salesforce/resourceUrl/sampleImages';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import  deleteImages from '@salesforce/apex/YINWarrantyController.deleteImages';

export default class YinWarrantyInvoiceChildCmp extends LightningElement { 

// @api childObj;
@api warrantyChildObj;
@track images={};
@track submitDisabled = true;
@api myRecordId;
@track checkboxLabel; 
@track isTermsModalOpen = false;
@track image1;
@track showImgPopup1 = false;
@track showLoading = true;



connectedCallback(){
    this.showLoading = false;
    //console.log('inside child con:',JSON.stringify(this.warrantyChildObj));
    this.warrantyChildObj = {...this.warrantyChildObj};
    this.images = {...this.warrantyChildObj.images};
    if(this.warrantyChildObj.tyreList && Array.isArray(this.warrantyChildObj.tyreList) && this.warrantyChildObj.tyreList.length > 0){
        this.warrantyChildObj.tyreQuantity = this.warrantyChildObj.tyreList.length;
    }else {
        this.warrantyChildObj.tyreQuantity = 0;
    }
   // this.checkboxLabel =  "I've read and accept the" <a href="#" onclick={openModal}>Terms & Conditions</a>";
    this.checkSubmitDisabled();
    this.image1 = sampleImages;
    //console.log('inside Conne War child img:',this.image1);
    
    //console.log('inside Conne War child:',JSON.stringify(this.warrantyChildObj));
}

renderedCallback() {
    Promise.all([
        loadStyle(this, customCSS)
    ]);
}

handleCheckboxChange(event) {
    this.warrantyChildObj.isCheckboxChecked = event.target.checked;
    this.checkSubmitDisabled();
}

checkSubmitDisabled(){
if(this.warrantyChildObj.images.invoiceImgDoc
    && this.warrantyChildObj.invoiceNumber 
    && this.warrantyChildObj.invoiceDate
    && new Date(this.warrantyChildObj.invoiceDate) <= new Date()
    && this.warrantyChildObj.invoiceAmount
    && this.warrantyChildObj.tyreQuantity
    && this.warrantyChildObj.tyreQuantity <= 5
    && this.warrantyChildObj.isCheckboxChecked
    ){
        //console.log('inside if false:');
        this.submitDisabled = false;
    }else{
        //console.log('inside else false:');
        this.submitDisabled = true;
    }
}

get acceptedFormats() {
    return ['.jpeg', '.png', '.jpg' ];
}

handleUploadFinished(event) {
    this.showLoading = true;
    const name = event.target.name;
    const uploadedFiles = event.detail.files;
    //console.log('No. of files uploaded : ' + uploadedFiles.length);
    if(name == 'fileUploader1'){
        this.showLoading = false;
        this.images.noPlateImgChange = true;
        this.images.noPlateImgName = uploadedFiles[0].name;
        this.images.noPlateImgDoc = uploadedFiles[0].documentId;
        this.images.noPlateImg = uploadedFiles[0].contentVersionId;
    }
    else if(name == 'fileUploader2'){
        this.showLoading = false;
        this.images.invoiceImgChange= true;
        this.images.invoiceImgName = uploadedFiles[0].name;
        this.images.invoiceImgDoc = uploadedFiles[0].documentId;
        this.images.invoiceImg = uploadedFiles[0].contentVersionId;
    }
    else if(name == 'fileUploader3'){
        this.showLoading = false;
       this.images.odometerImgChange =true;
        this.images.odometerImgName = uploadedFiles[0].name;
        this.images.odometerImgDoc = uploadedFiles[0].documentId;
        this.images.odometerImg = uploadedFiles[0].contentVersionId;
    }
    else if(name == 'fileUploader4'){
        this.showLoading = false;
        this.images.extraImgChange = true;
        this.images.extraImgName = uploadedFiles[0].name;
        this.images.extraImgDoc = uploadedFiles[0].documentId;
        this.images.extraImg = uploadedFiles[0].contentVersionId;
    }
    this.warrantyChildObj.images = this.images;
    this.checkSubmitDisabled();
    this.dispatchEvent(new RefreshEvent());
    //console.log('this.warrantyChildObj:', JSON.stringify(this.warrantyChildObj));
}


//MEthod does not given yet
async handledeleteImages(documentId){
    this.showLoading = true;
    let deleteImg = await deleteImages({conDocId:documentId});
    let parseDeletedImgObj = JSON.parse(deleteImg);
    if(parseDeletedImgObj.status == 'success'){
        this.showLoading = false;
        //console.log('File Deleted :');
        this.showToastmessage('Success', 'Aattachment deleted successfully', 'success');
    }else if(parseDeletedImgObj.status == 'error'){
        this.showLoading = false;
        //console.log('Failed to delete record:');
        this.showToastmessage('Error', 'Failed to delete attachment', 'error');
    }
}

async handleRemoveAttachment(e){
    
    const dataName = e.target.dataset.name;
    //console.log('remove file :', dataName);
    if(dataName == 'file1'){
       await this.handledeleteImages(this.images.noPlateImgDoc);
        this.warrantyChildObj.noPlateImgChange = false;
        this.images.noPlateImgName = '';
        this.images.noPlateImgDoc = '';
        this.images.noPlateImg = '';
    }
    else if(dataName == 'file2'){
        await this.handledeleteImages(this.images.invoiceImgDoc);
        this.images.invoiceImgChange= false;
        this.images.invoiceImgName = '';
        this.images.invoiceImgDoc = '';
        this.images.invoiceImg = '';
    }
    else if(dataName == 'file3'){
        await this.handledeleteImages(this.images.odometerImgDoc);
        this.images.odometerImgChange =false;
        this.images.odometerImgName = '';
        this.images.odometerImgDoc = '';
        this.images.odometerImg = '';
    }
    else if(dataName == 'file4'){
        await this.handledeleteImages(this.images.extraImgDoc);
        this.images.extraImgChange = false;
        this.images.extraImgName = '';
        this.images.extraImgDoc = '';
        this.images.extraImg = '';
    }
    this.warrantyChildObj.images = this.images;
    this.checkSubmitDisabled();
}

handleInputChange(e){
    const label = e.target.label;
    const value = e.target.value;

    // const date1 = 
    // const diffTime = Math.abs(date2 - date1);
    // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if(label == 'Invoice Number'){
        this.warrantyChildObj.invoiceNumber = value;
    }else if(label == 'Invoice Date'){
        this.warrantyChildObj.invoiceDate = value.toString();
        if(new Date(value) > new Date()){
            //console.log('Inside Invoice date :',value);
            this.showToastmessage('Error', 'Invoice date cannot be greater than today', 'error');
        }
        // if(new Date(value) - new Date()){
        //     this.showToastmessage('Warning', 'Invoice date cannot be greater than today', 'warning');
        // }


    }else if(label == 'Invoice Amount'){
        this.warrantyChildObj.invoiceAmount = value;
    }
    this.checkSubmitDisabled();
     
}

openTermsAndConditions(){

    //console.log('openTermsAndConditions');
    this.isTermsModalOpen = true;
}

closeTermsModal(){
    this.isTermsModalOpen = false;
}



handleClick(e){
    if(e.target.label == 'Modify'){
        this.dispatchEvent(new CustomEvent('modify',{
            detail:this.warrantyChildObj
        }));
        //console.log('inside Child Back:');
    
    }else if(e.target.label == 'Submit Details'){
        this.dispatchEvent(new CustomEvent('submitdetails',{
            detail: this.warrantyChildObj
        }));
        //console.log('inside Child Next:');
    
    }
    }

    showSampleImage(){
        this.showImgPopup1 = true;
        
    }

    hideSampleImage(){
        this.showImgPopup1 = false;

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