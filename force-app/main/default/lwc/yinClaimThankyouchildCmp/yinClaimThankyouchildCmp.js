/**
 * @description       : 
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : SKI
 * @last modified on  : 12-02-2025
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
**/
import { LightningElement, api, track  } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import customCSS from '@salesforce/resourceUrl/customCSS';
import { loadStyle } from 'lightning/platformResourceLoader';
import { NavigationMixin } from 'lightning/navigation';

export default class YinClaimThankyouchildCmp extends NavigationMixin (LightningElement) {
@api objFromReviewChild;
@track wearPercent;
@track chargeableAmount = '';
@api isServiceEngineer = false;
@track showText1 = '';
@track showText2 = '';
@track warrantyExpired = false;
@track highWearPercent = false;
@track warrantyRegistrationDate = false;


connectedCallback(){
    console.log('inside Thank you :', JSON.stringify(this.objFromReviewChild));
    this.objFromReviewChild = {...this.objFromReviewChild};
    console.log('inside thank you warr date:', this.objFromReviewChild.warrantyStartDate);
    console.log('inside thank you invoiceDate:',this.objFromReviewChild.invoiceDate);
    if(this.isServiceEngineer && this.objFromReviewChild.chargeableAmount){
    this.showText1 = 'Chargeable Amount* : ';
      this.chargeableAmount = 'INR '+this.objFromReviewChild.chargeableAmount;
      this.showText2 = ' (inclusive all taxes) T & C* :';
    }else{
        this.chargeableAmount = '';
        this.showText1 = '';
        this.showText2 = '';
    }
    this.wearPercent = this.objFromReviewChild.wearPercent ? this.objFromReviewChild.wearPercent + '%' :'0%';
    if (this.objFromReviewChild.wearPercent >= 50) {
        this.highWearPercent = true;
    }

    let warrantyEndDate = new Date('2022-07-01'); // Example warranty end date
    let warrantyStartDate = new Date(this.objFromReviewChild.warrantyStartDate);
    let months18FromWarrantyStart = new Date(warrantyStartDate);
    months18FromWarrantyStart.setMonth(months18FromWarrantyStart.getMonth() + 18);
    let currentDate = new Date();

    console.log('Warranty Start Date:', warrantyStartDate);
    console.log('18 Months from Warranty Start:', months18FromWarrantyStart);
    console.log('Current Date:', currentDate);
    if (warrantyStartDate < warrantyEndDate && currentDate > months18FromWarrantyStart) {
        this.warrantyExpired = true;
    }

    let invoiceDate = new Date(this.objFromReviewChild.invoiceDate);
    let timeDifference = warrantyStartDate.getTime() - invoiceDate.getTime();
    let daysDifference = timeDifference / (1000 * 3600 * 24);

    console.log('Invoice Date:', invoiceDate);
    console.log('Days Difference:', daysDifference);

    if (daysDifference > 7) {
        this.warrantyRegistrationDate = true;
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

handleClose(){
    //console.log('inside Close TY:');
   // this.dispatchEvent(new CloseActionScreenEvent());
   window.close();
   this[NavigationMixin.Navigate]({
    type: 'standard__recordPage',
    attributes: {
        recordId: this.objFromReviewChild.claimRecordId,
        actionName: 'view'
    }
});
    
}




}