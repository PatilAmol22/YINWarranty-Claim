import { LightningElement, api, track, wire } from 'lwc';

import { loadStyle } from 'lightning/platformResourceLoader';
//import security from '@salesforce/resourceUrl/resource';
import getSecurityDeposit from '@salesforce/apex/YINSecurityDepositGet.getSecurityDeposit';
import saveSecurityDeposit from '@salesforce/apex/YINSecurityDepositSave.saveSecurityDeposit';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';

export default class YinSecurityDepositIncreaseCmp extends NavigationMixin(LightningElement) {

  @api recordId;
  @track securityWrap = {};
  @track status = [];
  showLoading = false;
  @track aadharVerificationParam = { sdId: '', emailId: '', phoneNo: '', module: '', erpCustomerCode: '' };
  @track flag = true;
  renderedCallback() {
    /*
    Promise.all([
        loadStyle(this, security + '/resource/security.css'),
  ]).then(() => { /* callback */   //}); */
  }

  value = 'Draft';

  connectedCallback() {
    console.log('recordid>>>', this.recordId);
    this.getSecurityDep();
  }

  getSecurityDep() {
    this.showLoading = true;
    let urlString = location.href;
    let url = new URL(urlString);
      if(url.searchParams.get('recordId')){
            this.recordId = url.searchParams.get('recordId');
        }
    console.log(' this.showLoading is', this.recordId);
    getSecurityDeposit({recordId:this.recordId})
      .then((data) => {
        this.securityWrap = data;
        this.showLoading = false;
        console.log('data is', this.securityWrap);
        console.log(' this.showLoading is', this.showLoading);
        if (this.securityWrap.status == 'Failed') {
          this.showToastmessage('Error', this.securityWrap.msg, 'Error');
          this.showLoading = false;
        }
      })
  }

  handleChange(event) {
    let value = event.target.value;
    let field = event.target.name;
    console.log('In Change Event');
    console.log('Event name', field);
    console.log('Event value', value);
    if (field == 'Available Security Deposit') {
      this.securityWrap.availableSD = value;
    }
    if (field == 'Request for Increase') {
      if (value.includes('.') || value <= 0 || isNaN(value)) {
        this.flag = false;
        this.securityWrap.increaseAmount = value;
        console.log('increase req', this.securityWrap.increaseAmount);
        this.securityWrap.balanceAmount = Number(this.securityWrap.availableSD) + Number(this.securityWrap.increaseAmount);

        // this.showToastmessage('Error','Please enter Valid amount.', 'Error');
      } else {
        this.flag = true;
        this.securityWrap.increaseAmount = value;
        console.log('increase req', this.securityWrap.increaseAmount);
        this.securityWrap.balanceAmount = Number(this.securityWrap.availableSD) + Number(this.securityWrap.increaseAmount);

      }
    }
    if (field == 'Balance Amount') {
    }
    if (field == 'Remark') {
      this.securityWrap.remarks = value;
    }
    if (field == 'status') {
      this.securityWrap.status = value;
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

  handleNavigation(sdId) {
    console.log('sdId>>>>' + sdId);
    let compDetails = {
      componentDef: "c:yinEnterAadhaarVerificationCmp",
      attributes: {
        securityId: sdId,
        module: 'securityDeposit'
      }
    }
    let encodedComponentDef = btoa(JSON.stringify(compDetails));
    this[NavigationMixin.Navigate]({
      type: 'standard__webPage',
      attributes: {
        url: '/one/one.app#' + encodedComponentDef
      }
    })
  }

  handleClick(event) {
    this.showLoading = true;
    if (this.flag == false) {
      this.showToastmessage('Error', 'Please Enter valid Amount', 'Error');
      this.showLoading = false;
      return '';
    }
    if (this.securityWrap.increaseAmount == '' || this.securityWrap.increaseAmount == null) {
      this.flag = false;
      this.showToastmessage('Error', 'Please Enter Increase Amount', 'Error');
      this.showLoading = false;
      return '';
    }
    if (this.flag) {
      saveSecurityDeposit({ wrapperData: JSON.stringify(this.securityWrap) })
        .then(result => {
          console.log('results>>>>', result);
          if (result.id != null) {
            if (result.resultwrap == 'success') {
              this.showLoading = false;
              this.showToastmessage('Success', 'Security Deposit Saved Successfully', 'Success');
              this.handleNavigation(result.id, result.emailId, result.phoneNumber, result.erpCustomerCode);
            }
          }
        })
    }
  }
  handleCancel() {
    this.securityWrap.increaseAmount = 0;
    this.securityWrap.balanceAmount = this.securityWrap.availableSD;
    this.securityWrap.remarks = '';
  }
  handleNavigation(sdId, emailId, phoneNo, erpCode) {
    console.log('ERP Code:', erpCode);
    this.aadharVerificationParam = { sdId: sdId, emailId: emailId, phoneNo: phoneNo, module: 'securityDeposit', erpCustomerCode: erpCode };
  }
}