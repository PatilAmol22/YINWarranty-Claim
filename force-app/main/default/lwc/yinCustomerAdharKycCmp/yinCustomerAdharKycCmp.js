/**
 * @description       : 
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : 
 * @last modified on  : 10-06-2024
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
**/
import { LightningElement, api , track, wire} from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import aadharVerification from '@salesforce/apex/YINSecurityDepositAadharVer.aadharVerification';
import otpVerification from '@salesforce/apex/YINSecurityDepositOtpVer.otpVerification';
import updateAccRec from '@salesforce/apex/YINCustomerOnBoardingController.updateAccRec';
import getAccountRec from '@salesforce/apex/YINCustomerOnBoardingController.getAccountRec';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
//import OtpVerified from '@salesforce/schema/Account.OTP_Verified__c';
import {FlowNavigationNextEvent} from "lightning/flowSupport";
import { NavigationMixin } from 'lightning/navigation';
import { getRecord } from "lightning/uiRecordApi";
//import customCSS from '@salesforce/resourceUrl/customCSS';
//import { loadStyle } from 'lightning/platformResourceLoader';

const FIELDS = ['Account.OTP_Verified__c'];
  

export default class YinCustomerAdharKycCmp extends NavigationMixin(LightningElement) {

  

@api customerDetails = [];
@api recordId;
@api Email;
@api Phone;
@api TerritoryMappingId;
@track territoryMappingCodeId;
@track maskedAadhar;
@track booleandisabled=true;
@api securityId;
@api AdharNumber = '';
@api IsOtpVerified;
@api module;
@track InputVariables = [];
@track isOtpVerify = false;
showOtpInput = false;
@track showLoading = false;
@track securityId1 = '';
@track checkboxValue;
@track isDisabled = true;
@track isChecked = false;
hasRender=false;  
@api availableActions = [];
account;
@track accountData= {};
//@track accountId;


// @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
// wiredRecord({ error, data }) {
//   if(data){
//     this.account = data;
//     //console.log('In wired:', data);
//     this.isOtpVerify = data.fields.OTP_Verified__c.value;
//     //console.log('In wired:OTP===>', data.fields.OTP_Verified__c.value);

//   }
//   else if ( error ) {

//     //console.error( JSON.stringify( error ) );

// }
// }



// @wire(CurrentPageReference) getStateParameters(currentPageReference) {
//   if (currentPageReference) {
//       this.recordId = currentPageReference.state.recordId;
//       //console.log(this.recordId);
//   }
// }

connectedCallback() {
  this.isDisabled = false;
  //console.log('AdharNumber:', this.AdharNumber);
    this.maskedAadhar = 'XXXX-XXXX-' + String(this.AdharNumber).slice(-4);
    this.territoryMappingCodeId = this.TerritoryMappingId;
    //this.isOtpVerify = this.IsOtpVerified;
    //console.log('IsOtpVerified:', this.isOtpVerify);
    //console.log('Territory Mapping Code Id:', this.territoryMappingCodeId);


    this.fetchAccountData();
    

    this.InputVariables = [

      {

          name: 'varIsOTPVerified',

          type: 'Boolean',

          value: this.isOtpVerify

      }

  ];
    
}

fetchAccountData() {
  getAccountRec({ accountId: this.recordId })
      .then((result) => {
          this.accountData = JSON.parse(JSON.stringify(result));
          //console.log('Account Data==>', JSON.stringify(this.accountData));
          this.isOtpVerify = this.accountData[0].OTP_Verified__c;
          //console.log('OTP Status==>', this.isOtpVerify);
      })
      .catch((error) => {
          //console.error('Error occurred', error);
      });
}

// renderedCallback() {
  ///this.isOtpVerify = this.IsOtpVerified;
  ////console.log('IsOtpVerified:', this.isOtpVerify);
 //}

@track showComponenet=false;
@track componentParamter= {
  securityrecId:"",
  access1: "",
  aadharNo: "",
  module2: "",
  email: "",
  phone: ""
}

//for CheckBox
@track value = 'Y';
@track consentVal = 'N';
@track message='I authorize to Verify My Aadhaar';

handleChange1(e) {
  this.value = e.target.value;
  this.isChecked = e.target.checked;
  if (this.value == 'Y' && e.target.checked) {
    ////console.log('inside If aadhaar:');
    this.showLoading = true;
    this.consentVal = 'Y';
    this.showLoading = false;
    this.booleandisabled=false;
  }
  else if(!e.target.checked){
    ////console.log('inside else aadhaar:');
    this.booleandisabled=true;
  }
}

//For Check Box

handleChange(event){
    let value = event.target.value;
    let field = event.target.name;
    this.AdharNumber= value;
    //this.maskedAadhar = this.AdharNumber;
    
} 

handlereset(event) {
  this.AdharNumber=null;
  this.value = 'Y';
  this.isChecked = false;
  this.booleandisabled = true;
  this.maskedAadhar = null;

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

handleNavigation(recId, accessTokan, aadhar) {

  this.componentParamter= {
    securityrecId: recId,
    access1: accessTokan,
    aadharNo: aadhar,
    module2: this.module1,
    email: this.emailId2,
    phone: this.phoneNo2

  }
}

handleGenerateOtp(event) {
  this.showLoading = true;
  this.showOtpInput = true;
  let flag = true;


  if (this.AdharNumber == '' || this.AdharNumber == null) {
    flag = false;
    this.showToastmessage('Error','Please share the consent for Aadhaar authentication.', 'Error');
    this.showLoading = false;
  }

  if (flag) {
  aadharVerification({ recordId: this.securityId, AdharNumber: this.AdharNumber, module: this.module1, consent1: this.consentVal,consentMessage:this.message })
    .then((data) => {
      

      if (data.status == 'success') {

        this.showToastmessage('Success', 'OTP has been sent to registered mobile number.', 'Success');

        this.showLoading = false;

        this.handleNavigation(this.securityId1, data.accessTokanOtp, data.aadhar);

      }

      else if (data.status == 'Consent Not Accepted') {

        this.showToastmessage('Error', 'Consent not accepted', 'Error');
        this.showLoading = false;

      }

      else if (data.status == 'Otp generation fail') {

        this.showToastmessage('Error', 'OTP generation failed.', 'Error');
        this.showLoading = false;

      }
    })
  }
}

handleOtpChange(event) {
  let value = event.target.value;
  let field = event.target.name;
  this.otpNumber = value;
  ////console.log('value is', value);
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

handleReset(event) {
  this.otpNumber = null;
}

handleVerifyOtp(event) {
  this.showLoading = true;
  otpVerification({ recordId: this.securityrecId1, otpNumber: this.otpNumber, accessTokan: this.access2, aadharNumber: this.aadharNo1, module: this.module3, email: this.email1, phone: this.phone1 })
    .then(data => {
      if (data.status == 'Success') {
        
        this.isOtpVerify = true;
          //console.log('IOtp verify',this.isOtpVerify);
        this.showToastmessage('Success', 'OTP has been verified successfully.', 'Success');
        //console.log('Input Variables = ',this.InputVariables);
          this.showLoading = false;

          let updateData={
           
            accountId: this.recordId,
            territoryMappingId: this.territoryMappingCodeId,
            
        }
      
        let updateVar = JSON.stringify(updateData);
      
            //console.log('Form Data-->',updateVar);
          updateAccRec({
            updateVar : updateVar,
          })
          .then(result =>{
            //console.log('Result==>',result);
            this.isOtpVerify = true;
          })

          
        }
      
      else if (data.status == 'error') {
        this.isOtpVerify = false;
        this.showLoading = false;
        this.showToastmessage('Error', 'OTP verification has been failed', 'Error');
      }
    })
}

handleNext(event){
  //console.log('In handleNext Event');
  
  
   if(this.isOtpVerify){
  
    if (this.availableActions.find((action) => action === 'NEXT')) {
      //console.log('In Next Butt');
        const navigateNextEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(navigateNextEvent);
    
   
  }
}
else{

  //console.log('OTP Verify');
           
  this.showToastmessage('Error', 'Please verify Adhar OTP!!', 'Error');
  
}
}

}