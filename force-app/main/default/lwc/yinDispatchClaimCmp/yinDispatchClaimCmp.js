/**
 * @description       : SERVICE
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : SKI
 * @last modified on  : 18-04-2024
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
**/

import { LightningElement,track,api } from 'lwc';
import customCSS from '@salesforce/resourceUrl/customCSS';
import { loadStyle } from 'lightning/platformResourceLoader';
// import { CloseActionScreenEvent } from 'lightning/actions';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import  claimService from '@salesforce/apex/YinClaimDispatchService.claimService';
import  getOnloadClaimDetails from '@salesforce/apex/YINClaimController.getOnloadClaimDetails';



export default class YinDispatchClaimCmp extends LightningElement {

@track showLoading = true;
@track isDispatchDisabled = true;
@track disabledRemark = true;
@track dispatchRemark;
@api recordId;

async connectedCallback(){
//this.bShowModal = true;
this.showLoading = true;
if(this.recordId) {
    let claimIds = [];
    claimIds = [...claimIds,this.recordId];
    let claimList = await getOnloadClaimDetails({claimIds:claimIds})
    if(claimList && Array.isArray(claimList) && claimList.length > 0){
        //console.log('claimList[0]:',claimList[0].Status__c,claimList[0].Claim_Sent_To_ERP__c,claimList[0].Dispatch_Sent_To_ERP__c, claimList[0].Dispatched__c);
        
        if(claimList[0].Claim_Sent_To_ERP__c == true && claimList[0].Status__c == 'Approved' && claimList[0].Dispatch_Sent_To_ERP__c == false && claimList[0].Dispatched__c == false){
            //console.log('claimList[0] If 1:' );
             this.disabledRemark = false;
             this.showLoading = false;
        }else if((claimList[0].Status__c == 'Draft' || claimList[0].Status__c == 'Pending' || claimList[0].Status__c == 'In Progerss') && claimList[0].Claim_Sent_To_ERP__c == false){
            //console.log('claimList else :',claimList[0].Claim_Sent_To_ERP__c,claimList[0].Status__c );
            this.showToastmessage('Error','Claim Status is not Approved,you cant dispatch claim','error');
            this.isDispatchDisabled = true;
            this.disabledRemark = true;
            this.showLoading = false;
        }else if(claimList[0].Claim_Sent_To_ERP__c == false && claimList[0].Status__c == 'Approved' && claimList[0].Dispatch_Sent_To_ERP__c == false && claimList[0].Dispatched__c == false){
            //console.log('claimList[0] If 3:' );
            this.showLoading = false;
            this.isDispatchDisabled = true;
            this.disabledRemark = true;
            this.showToastmessage('Error','Claim Status is Approved but not sent to ERp,you cant dispatch claim','error');
        }
        else if(claimList[0].Claim_Sent_To_ERP__c == true && claimList[0].Status__c == 'Approved' && claimList[0].Dispatch_Sent_To_ERP__c == true && claimList[0].Dispatched__c == true){
            //console.log('claimList else last:',claimList[0].Claim_Sent_To_ERP__c,claimList[0].Status__c ,claimList[0].Dispatch_Sent_To_ERP__c);
            this.showLoading = false;
            this.isDispatchDisabled = true;
            this.disabledRemark = true;
            this.showToastmessage('Error','Claim Status is already dispatched','error');
        }

    }
}
this.showLoading = false;

}

renderedCallback() {
    Promise.all([
        loadStyle(this, customCSS)
    ]);
}

 closeModal() {    
    const closeEvent = new CustomEvent('close');
    this.dispatchEvent(closeEvent);
 };

 handleDispatchRemark(e){
    this.dispatchRemark = e.target.value;
    if(this.dispatchRemark){
        this.isDispatchDisabled = false;
    }else{
        this.isDispatchDisabled = true;
    }
   
 }

 async dispatchClaim(){
    this.showLoading = true;
    this.isDispatchDisabled = true;
    //console.log('inside Dispach:');
    let responseClaim = await claimService({recordId:this.recordId,remarks:this.dispatchRemark})
    //console.log('inside Dispach11:',responseClaim);
    if(responseClaim == 'success'){
        this.showLoading = false;
        this.showToastmessage('Success','Claim dispatch successfully','success');
    }else {
        this.showLoading = false;
        this.showToastmessage('Error','Claim dispatch failed','error');

    }
    const closeEvent = new CustomEvent('close');
    this.dispatchEvent(closeEvent);
    
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