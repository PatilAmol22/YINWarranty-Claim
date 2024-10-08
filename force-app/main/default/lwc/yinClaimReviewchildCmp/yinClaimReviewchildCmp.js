/**
 * @description       : YIN Claim Review Child Cmp to Review Details of Claim.
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : SKI
 * @last modified on  : 30-08-2024
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
**/
import { LightningElement, api, track  } from 'lwc';
import customCSS from '@salesforce/resourceUrl/customCSS';
import { loadStyle } from 'lightning/platformResourceLoader';

export default class YinClaimReviewchildCmp extends LightningElement {
@api objFromRegisterChild;
@api damageCause;
@track submitDisabled = true;
@track isChekedClaim = false;
@track baseUrl = '/sfc/servlet.shepherd/document/download/';
@track image1;
@track image2;
@track image3;
@track image4;
@track image5;
@track image6;
@track wearPercent;
@api pickupOptions = [];
@track pickupValue;
@track WithWarranty = true;
@track WithOutWarranty = false;


connectedCallback(){
// console.log('inside Review :', JSON.stringify(this.objFromRegisterChild));
console.log('inside Review damageCause :', this.damageCause);
//this.checkAcceptCondition();
this.objFromRegisterChild = {...this.objFromRegisterChild};
console.log('inside Review :', JSON.stringify(this.objFromRegisterChild));
this.image1 = this.baseUrl+this.objFromRegisterChild.tyreSerialImgId;
this.image2 = this.baseUrl+this.objFromRegisterChild.defectImgOutsideId;
this.image3 = this.baseUrl+this.objFromRegisterChild.defectImgInsideId;
this.image4 = this.baseUrl+this.objFromRegisterChild.treadDepthGaugeId;
this.image5 = this.baseUrl+this.objFromRegisterChild.odometerReadingId;
this.image6 = this.baseUrl+this.objFromRegisterChild.extraImgId;

this.objFromRegisterChild.serialImgChange = false;
this.objFromRegisterChild.outsideImgChange = false;
this.objFromRegisterChild.insideImgChange = false;
this.objFromRegisterChild.depthGaugeImgChange = false;
this.objFromRegisterChild.odometerImgChange = false;
this.objFromRegisterChild.extraImgChange = false;
this.wearPercent = this.objFromRegisterChild.wearPercent ? this.objFromRegisterChild.wearPercent + '%' :'0%';
console.log('inside Review  conne:', this.pickupOptions );
console.log('inside Review  conne11:', this.objFromRegisterChild.pickupLocation);
if(this.pickupOptions != [] && Array.isArray(this.pickupOptions) && this.objFromRegisterChild.pickupLocation && this.pickupOptions.length > 0){
    this.pickupValue = this.pickupOptions.find(opt => opt.value === this.objFromRegisterChild.pickupLocation).label;
}

if(this.objFromRegisterChild.warrenty == 'With Warranty'){
    this.WithWarranty = true;
    this.WithOutWarranty = false;
}
else if(this.objFromRegisterChild.warrenty == 'Without Warranty'){

    this.WithWarranty = false;
    this.WithOutWarranty = true;
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


handleClick(e){
if(e.target.label == 'Modify'){
    this.dispatchEvent(new CustomEvent('modify',{detail:this.objFromRegisterChild}));
}else if(e.target.label == 'Submit Details'){
    this.dispatchEvent(new CustomEvent('submitdetails',{detail:this.objFromRegisterChild}));
}
}

zoomIn(event) {
    event.currentTarget.querySelector('img').classList.add('zoomed');
}

zoomOut(event) {
    event.currentTarget.querySelector('img').classList.remove('zoomed');
}




}