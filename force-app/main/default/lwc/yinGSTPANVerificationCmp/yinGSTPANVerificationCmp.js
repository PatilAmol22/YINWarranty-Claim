/**
 * @description       : PAN And GST Number Verification component.
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : SKI
 * @last modified on  : 16-07-2024
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
 * Modifications Log
 * Ver   Date         Author                                      Modification
 * 1.0   15-07-2024   Amol Patil/amol.patil@skinternational.com   Initial Version
**/
import { LightningElement,api,track,wire } from 'lwc';
import customCSS from '@salesforce/resourceUrl/customCSS';
import { CurrentPageReference } from 'lightning/navigation';
import {FlowNavigationBackEvent,FlowNavigationNextEvent} from "lightning/flowSupport";
import { NavigationMixin } from 'lightning/navigation';
import { RefreshEvent } from 'lightning/refresh';
import { getRecord } from "lightning/uiRecordApi";
import { loadStyle } from 'lightning/platformResourceLoader';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import updatePanStatus from '@salesforce/apex/YINCustomerOnBoardingController.updatePanStatus';
import updateGstStatus from '@salesforce/apex/YINCustomerOnBoardingController.updateGstStatus';
import getAccountRec from '@salesforce/apex/YINCustomerOnBoardingController.getAccountRec';
import  callPANAPIService from '@salesforce/apex/YINGSTAndPANApiService.callPANAPIService';
import  callGSTAPIService from '@salesforce/apex/YINGSTAndPANApiService.callGSTAPIService';

const FIELDS = ['Account.PAN_Verified__c','Account.GST_Number_Verified__c'];

export default class YinGSTPANVerificationCmp  extends NavigationMixin(LightningElement) {

@api recordId;
@api PANNumber;
@api GSTNumber;
@track booleandisabled=true;
@track booleandisabled1 =true;
@track panNumber = '';
@track gstNumber = '';
@track showLoading = true;
@track checkboxValue;
@track isDisabled = true;
@track isDisabled1 = true;
@track isChecked = false;
@track isChecked1 = false;
@track isPanVerified = false;
@track isGSTVerified = false;
@track value = 'Y';
@api availableActions = [];

// @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
// wiredRecord({ error, data }) {
//   if(data){
//     this.account = data;
//     //console.log('In wired:', data);
//     this.isPanVerified = data.fields.PAN_Verified__c.value;
//     this.isGSTVerified = data.fields.GST_Number_Verified__c.value;
//     //console.log('Wired PAN Status===>', data.fields.PAN_Verified__c.value);
//     //console.log('Wired GST Number Status===>', data.fields.GST_Number_Verified__c.value);


//   }
//   else if ( error ) {

//     //console.error( JSON.stringify( error ) );

// }
// }


@wire(CurrentPageReference) getStateParameters(currentPageReference) {
    if (currentPageReference) {
        this.recordId = currentPageReference.state.recordId;
        //console.log(this.recordId);
    }
  }
  

connectedCallback() {
    //console.log('inside Connected Pan & GST:');
    this.showLoading = false;
    this.panNumber = this.PANNumber;
    this.gstNumber =this.GSTNumber;
    //console.log('panNumber:', this.panNumber);
    //console.log('gstNumber:', this.gstNumber);
    this.isDisabled = false;
    this.isDisabled1 = false;
    this.maskPanNumber();
    this.maskGstNumber();
    this.fetchAccountData();

}

fetchAccountData() {
  getAccountRec({ accountId: this.recordId })
      .then((result) => {
          this.accountData = JSON.parse(JSON.stringify(result));
          //console.log('Account Data==>', JSON.stringify(this.accountData));
          this.isPanVerified = this.accountData[0].PAN_Verified__c;
          this.isGSTVerified = this.accountData[0].GST_Number_Verified__c;
          //console.log('PAN Status==>', this.isPanVerified);
          //console.log('GST Status==>', this.isGSTVerified);
      })
      .catch((error) => {
          //console.error('Error occurred', error);
      });
}

renderedCallback() {
    Promise.all([
        loadStyle(this, customCSS)
    ]);
}

maskPanNumber() {
    if (this.panNumber.length >= 6) {
        const firstPart = this.panNumber.substring(0, 5);
        const lastPart = this.panNumber.substring(this.panNumber.length - 1);
        this.maskedPanNumber = `${firstPart}XXXX${lastPart}`;
    } else {
        this.maskedPanNumber = this.panNumber;
    }
}

maskGstNumber() {
    if (this.gstNumber.length == 15) {
        const firstPart = this.gstNumber.substring(0, 2);
        const lastPart = this.gstNumber.substring(12);
        this.maskedGstNumber = `${firstPart}XXXXXXXXXX${lastPart}`;
    } else {
        this.maskedGstNumber = this.gstNumber;
    }
}

handleChange(e){
   let value = e.target.value;
    if(e.target.label == 'PAN Number'){
        this.panNumber = value;
        this.maskPanNumber();
        this.isDisabled = false;
    }else if(e.target.label == 'GST Registration Number'){
        this.gstNumber = value;
        this.maskGstNumber();
        this.isDisabled1 = false;
    }
 }

handlePANCheked(e) {
    this.value = e.target.value;
    this.isChecked = e.target.checked;
    if (this.value == 'Y' && e.target.checked) {
        this.showLoading = false;
        this.booleandisabled=false;
    }
    else if(!e.target.checked){
        this.showLoading = false;
        this.booleandisabled=true;

    }
}

handleGSTCheked(e) {
    this.value = e.target.value;
    this.isChecked1 = e.target.checked;
    if (this.value == 'Y' && e.target.checked) {
        this.showLoading = false;
        this.booleandisabled1=false;
    }
    else if(!e.target.checked){
        this.showLoading = false;
        this.booleandisabled1=true;

    }
}

  
async handleVerifyPAN() {
    this.showLoading = true;
    //console.log('inside PAN:',this.recordId);
    //console.log('inside PAN:',this.panNumber);
    let responsePAN = await callPANAPIService({recordId:this.recordId,panNumber:this.panNumber})
    //console.log('inside PAN data:',responsePAN);
    if(responsePAN[0].success == 'success'){
        this.showLoading = false;
        this.isPanVerified = true;
        this.booleandisabled = true;
        this.isChecked = true;
        this.showToastmessage('Success','PAN number verified  successfully.','success');

            updatePanStatus({ accountId: this.recordId})
          .then(result =>{
            //console.log('Result==>',result);
            this.isPanVerified = true;
          })
        
    }else {
        this.showLoading = false;
        this.isPanVerified = false;
        this.booleandisabled = false;
        this.isChecked = false;
        this.showToastmessage('Error','PAN number verification failed.','error');

    }
}


async handleVerifyGST(){
    this.showLoading = true;
    //console.log('inside GST:',this.recordId);

    let responseGST = await callGSTAPIService({recordId:this.recordId,gstNumber:this.gstNumber})
    //console.log('inside GST data:',responseGST);
    if(responseGST[0].success == 'success'){
        this.showLoading = false;
        this.booleandisabled1 = true;
        this.isChecked1 = true;
        this.isGSTVerified = true;
        this.showToastmessage('Success','GST number verified  successfully.','success');

        updateGstStatus({ accountId: this.recordId})
          .then(result =>{
            //console.log('Result==>',result);
            this.isGSTVerified = true;
          })

    }else {
        this.showLoading = false;
        this.booleandisabled1 = false;
        this.isChecked1 = false;
        this.isGSTVerified = false;
        this.showToastmessage('Error','GST number verification failed.','error');
    }
}

showToastmessage(title, message, varient) {
    this.dispatchEvent(
      new ShowToastEvent({
        title: title,
        message: message,
        variant: varient,
      }),
    );
  }

  handleNext(event){
    //console.log('In handleNext Event');
    
    //console.log('GST Value',this.isGSTVerified);
     if(this.isGSTVerified){
         
      if (this.availableActions.find((action) => action === 'NEXT')) {
        //console.log('In Next Butt');
          const navigateNextEvent = new FlowNavigationNextEvent();
          this.dispatchEvent(navigateNextEvent);
      
     
    }
  }
  else{
  
    //console.log('OTP Verify');
             
    this.showToastmessage('Error', 'Please verify PAN & GST Number', 'Error');
    
  }
  }

  handlePrevious(event){

    if (this.availableActions.find((action) => action === "BACK")) {
        const navigateBackEvent = new FlowNavigationBackEvent();
        this.dispatchEvent(navigateBackEvent);

        //this.dispatchEvent(new RefreshEvent());
      }

}
  
  }