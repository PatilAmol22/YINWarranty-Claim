/**
 * @description       : 
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : SKI
 * @last modified on  : 18-04-2024
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


connectedCallback(){
    //console.log('inside Thank you :', JSON.stringify(this.objFromReviewChild));
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