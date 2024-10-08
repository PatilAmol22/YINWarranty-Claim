/**
 * @description       : Create Warranty Cmp
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : SKI
 * @last modified on  : 18-04-2024
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
**/
import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class YinWarrantyThankYouChildCmp extends NavigationMixin (LightningElement){

@api warrantyScannerChildObj = {};
@track cardLink;

connectedCallback(){
    //console.log('inside TY:',JSON.stringify(this.warrantyScannerChildObj.id));
    //console.log('inside TYOBJ:', JSON.stringify(this.warrantyScannerChildObj));
    this.warrantyScannerChildObj = {...this.warrantyScannerChildObj};
    //this.warrantyScannerChildObj.warrantyNo =  this.warrantyScannerChildObj.name;
    //console.log('inside if false111:', this.warrantyScannerChildObj.warrantyNo);
    this.cardLink = '/sfc/servlet.shepherd/version/download/'+ this.warrantyScannerChildObj.cardId;
    this.warrantyScannerChildObj.noPlateImgChange = false;
    this.warrantyScannerChildObj.invoiceImgChange= false;
    this.warrantyScannerChildObj.odometerImgChange =false;
    this.warrantyScannerChildObj.extraImgChange = false;
    //console.log('inside if false222:');
}

handleClose(){
    //console.log('inside Close TY:');
   window.close();
   this[NavigationMixin.Navigate]({
    type: 'standard__recordPage',
    attributes: {
        recordId: this.warrantyScannerChildObj.id,
        actionName: 'view'
    }
});
    
}

}