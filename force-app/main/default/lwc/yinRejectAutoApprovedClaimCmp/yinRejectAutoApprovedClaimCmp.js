/**
 * @description       : To Reject Atuo Approved Claim
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : SKI
 * @created date      : 06-02-2025
 * @last modified on  : 06-02-2025
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
 * Modifications Log
 * Ver   Date         Author                                      Modification
 * 1.0   23-01-2025   Amol Patil/amol.patil@skinternational.com   Initial Version
**/
import { LightningElement,api, track } from 'lwc';
import customCSS from '@salesforce/resourceUrl/customCSS';
import { loadStyle } from 'lightning/platformResourceLoader';
import rejectClaim from '@salesforce/apex/YINClaimRejectController.rejectClaim';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';

export default class YinRejectAutoApprovedClaimCmp extends LightningElement {
    @api recordId;
    @track showLoading = true;
    @track isRejectDisabled = true;
    @track rejectRemark;

    connectedCallback() {
        this.showLoading = false;
    }

    renderedCallback() {
        Promise.all([
            loadStyle(this, customCSS)
        ]);
    }

    handleRejectRemark(e){
        this.rejectRemark = e.target.value;
        if(this.rejectRemark){
            this.isRejectDisabled = false;
        }else{
            this.isRejectDisabled = true;
        }
       
     }
    handleRejectclaim() {
        this.showLoading = true; 
    
        rejectClaim({ claimId: this.recordId,rejectRemark:this.rejectRemark })
            .then(() => {
                this.showLoading = false;
                this.showToast('Success', 'Claim has been rejected successfully.', 'success');
                this.dispatchEvent(new CloseActionScreenEvent());

                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            })
            .catch(error => {
                this.showLoading = false;
                this.showToast('Error', error.body.message, 'error');
            });
    }
    
    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }
}