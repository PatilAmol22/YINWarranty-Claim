/**
 * @description       : 
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : 
 * @last modified on  : 17-10-2024
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
**/
import { LightningElement, track,wire } from 'lwc';

import customCSS from '@salesforce/resourceUrl/customCSS';
import { loadStyle } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { IsConsoleNavigation,closeTab,getFocusedTabInfo } from 'lightning/platformWorkspaceApi';
import SECURITYDEPOSIT_OBJECT from '@salesforce/schema/YIN_Security_Deposit__c';
import Status from '@salesforce/schema/YIN_Security_Deposit__c.Status__c';
//import getSecurityDeposit from '@salesforce/apex/YINSecurityDepositGetDecrease.getSecurityDeposit';
import createSecurityDepositDecrease from '@salesforce/apex/YINSecurityDepositGetDecrease.createSecurityDepositDecrease';
import getSDAmount  from '@salesforce/apex/YINSecurityDepositGetDecrease.getSDAmount';

export default class YinSecurityDepositDecreaseCmp extends NavigationMixin (LightningElement){


@track securityWrap={};
@track statusOption = [];
@track isSubmitDisable = true;
@track isDecreaseDisable = true;
@track isRemarkDisable = true;
@track showLoading = true;

@wire(IsConsoleNavigation) 
isConsoleNavigation;

connectedCallback(){
  //console.log('Inside Connected :',);
 // this.getSecurityDep();
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
  fieldPath: "Account_Type__c",
  operator: "eq",
  value: "Sold To Party",
}
]}

matchingInfo = {
primaryField: { fieldPath: "Name" },
additionalFields:[{ fieldPath: 'Combine_Name_and_Code__c'}],
};

displayInfo = {
additionalFields: ["Combine_Name_and_Code__c"]
};


@wire(getObjectInfo, { objectApiName: SECURITYDEPOSIT_OBJECT })
statusInfo;

@wire(getPicklistValues,
  {
      recordTypeId: '$statusInfo.data.defaultRecordTypeId',
      fieldApiName: Status
  }
)
statusValues({ error, data }) {
  if (data) {
      //console.log('inside wire 3:');
      this.error = null;
      let statusValslist = data.values;
      //console.log('inside wire 3:',JSON.stringify(statusValslist));
      let statusOption = [];
      for (let i = 0; i < statusValslist.length; i++) {
        statusOption.push({
              label: statusValslist[i].label,
              value: statusValslist[i].value
          });
      }
      this.statusOption = statusOption;
     this.securityWrap.status = this.securityWrap.status && this.securityWrap.status != '' ? this.securityWrap.status :'Draft';
     //console.log('status::', this.securityWrap.status);
    }
  else if (error) {
      this.error = JSON.stringify(error);
      //console.log(JSON.stringify(error));
  }

}

handlestatusChange(e){
  this.securityWrap.status = e.detail.value;
}

handleInputChange(e){
  const label = e.target.label;
  const value = e.target.value;
    //console.log('Inside  handleInputChange Event');
    //console.log('Event name',label);
    //console.log('Event value',value);

    if (label == 'Decrease Security Deposit Amount') {
        this.securityWrap.decreaseAmount = value;
        //console.log('decrease req',this.securityWrap.decreaseAmount);
        if (isNaN(value)) {
          this.showToastmessage('Error', 'Please enter a valid number', 'Error');
          this.isRemarkDisable = true;
          this.isSubmitDisable = true;
        }
        if(value > 0){
          if (Number(this.securityWrap.decreaseAmount) > Number(this.securityWrap.availableSD)) {
            this.showToastmessage('Error', 'Decrease amount should not be greater than available amount', 'Error');
            this.isRemarkDisable = true;
            this.isSubmitDisable = true;
        } else {
            this.securityWrap.balanceAmount = Number(this.securityWrap.availableSD) - Number(this.securityWrap.decreaseAmount);
            this.isRemarkDisable = false;
            this.isSubmitDisable = false;
        }
        }
        else if(value <= 0){
          this.showToastmessage('Error','Balance amount should not less then zero', 'Error');
          this.isRemarkDisable = true;
          this.isSubmitDisable = true;
        }
    }else if(label == 'Remark') {
      this.securityWrap.remarks = value; 
    }
}


async handleDealerChange(e){
  this.showLoading = true;
  let value = e.detail.recordId;
  //console.log('dealer Is:', value);
  this.securityWrap.dealerId = value;
  if(!value){
      this.template.querySelector('.clear').focus();
      this.template.querySelector('.clear').setCustomValidity('Please Select the Dealer Name/Code');
      }else{
          this.template.querySelector('.clear').blur();
          this.template.querySelector('.clear').setCustomValidity('');
      }
      this.template.querySelector('.clear').reportValidity();
        if(this.securityWrap.dealerId != null){
          this.showLoading = false;
          this.isDecreaseDisable = false;
          let getsdAmount = await getSDAmount({dealerId:this.securityWrap.dealerId})
          let parsedSDAmount = JSON.parse(getsdAmount);
          if(parsedSDAmount.status == 'success'){
            //console.log('Inside parsed getamount If success:',parsedSDAmount.sdAmount);
            this.showLoading = false;
            this.securityWrap.availableSD = parsedSDAmount.sdAmount;
            this.securityWrap.erpCode = parsedSDAmount.erpCustCode;
          }
          else if(parsedSDAmount.status == 'error'){
            this.showLoading = false;
            //console.log('Inside parsed getamount If Error:',parsedSDAmount.message);
            this.showToastmessage('Error',parsedSDAmount.message, 'Error');
          }
         // this.securityWrap.availableSD = sdAmount[0].SD_Amount__c == null || sdAmount[0].SD_Amount__c === undefined ? '':sdAmount[0].SD_Amount__c;
        }else if(this.securityWrap.dealerId == null){
            this.showLoading = false;
            //console.log('Inside Else:');
            this.template.querySelector('.clear').clearSelection();
            this.securityWrap.availableSD = '';
            this.securityWrap.decreaseAmount = '';
            this.securityWrap.balanceAmount = '';
            this.securityWrap.remarks = '';
            this.isDecreaseDisable = true;
          
    }
}

async handleSubmit(){
  this.showLoading = true;
  let createSDDecrease =  await createSecurityDepositDecrease({decreaseJson: JSON.stringify(this.securityWrap) })
  let parsedSDDecrease = JSON.parse(createSDDecrease);
    if(parsedSDDecrease.status == 'success'){
        this.showLoading = false;
        this.showToastmessage('Success', parsedSDDecrease.message, 'Success');
        this.securityWrap.id = parsedSDDecrease.recordId;
        this.navigateToRecordPage(this.securityWrap.id);
        this.clearData();
    }else if(parsedSDDecrease.status == 'error'){
        this.showLoading = false;
        this.showToastmessage('Error',parsedSDDecrease.message, 'Error');
        this.clearData();
    }
    }

 handleClose() {
  //console.log('inside close:',this.isConsoleNavigation);
  window.close();
  this[NavigationMixin.Navigate]({
      type: 'standard__objectPage',
      attributes: {
          objectApiName: 'YIN_Security_Deposit__c',
          actionName: 'list'
      }
  });
}

navigateToRecordPage(){
  window.close();
  this[NavigationMixin.Navigate]({
    type: 'standard__recordPage',
    attributes: {
        recordId: this.securityWrap.id,
        actionName: 'view'
    }
 });
}

clearData(){
  this.securityWrap = {Status:'Draft'};
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

}