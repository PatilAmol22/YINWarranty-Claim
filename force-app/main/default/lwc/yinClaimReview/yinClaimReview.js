/**
 * @description       : 
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : SKI
 * @created date      : 11-10-2024
 * @last modified on  : 11-10-2024
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
 * Modifications Log
 * Ver   Date         Author                                      Modification
 * 1.0   12-09-2024   Amol Patil/amol.patil@skinternational.com   Initial Version
**/
import { LightningElement, api, track, wire} from 'lwc';
//import customCSS from '@salesforce/resourceUrl/customCSS';
import { loadStyle } from 'lightning/platformResourceLoader';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi'; 
import CLAIM_OBJECT from '@salesforce/schema/YIN_Claim__c';
import OE_REPLACEMENT from '@salesforce/schema/YIN_Claim__c.OE_Replacement__c';
import POLICY from '@salesforce/schema/YIN_Claim__c.Claim_Policy__c';
import DAMAGE_CONDITION from '@salesforce/schema/YIN_Claim__c.Damage_Condition__c';
import DAMAGE_CAUSES from '@salesforce/schema/YIN_Claim__c.Damage_Causes__c';
import reviewClaim from '@salesforce/apex/YINClaimReviewController.reviewClaim';
import processRecord from '@salesforce/apex/YINApprovalInterface.processRecord';
import updateReview from '@salesforce/apex/YINClaimReviewController.updateReview';
import saveImages from '@salesforce/apex/YINClaimReviewController.saveImages';

export default class YinClaimReview extends LightningElement {

    @api recordId;
    @track showSpinner = false;
    @track claimObj = {};
    @track tyreObj = {};
    @track imageObj = {};
    @track condition = {};
    @track isDisable = true;
    @track disableAll = true;
    @track disableFields = true;
    @track baseUrl = '/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=';
    @track serialUrl = '';
    @track outUrl = '';
    @track inUrl = '';
    @track odoUrl = '';
    @track extraUrl = '';
    @track dgUrl = '';
    @track causes = [];
    @track runningTime = 0;
    @track oeOptions = [];
    @track policyOptions = [];
    @track warrantyURL = '';
    @track claimURL = '';
    @track prevClaimURL = '';
    @track conditionOptions = [];
    @track causeOptions = [];
    //added by Amol
    @track isRejected = true;
    @track isRejected1 = true;
    @track disableOTP = false;
    @track isSaveDisabled = false;

    claimObjectInfo;
    causesFieldData;
    //New Change By Amol 9thOCt
    @track isModalOpen = false;
    @track selectedImageType = '';
    @track updatedImages = {serialImg : '',
        outsideImg : '',
        insideImg : '',
        depthGaugeImg : '',
        odometerImg :'',
        extraImg : '',
        serialFlag : false,
        outFlag : false,
        inFlag : false,
        depthFlag : false,
        odoFlag : false,
        extraFlag : false
       };

    connectedCallback(){
        console.log('inside Cont:');
        this.init();
        this.handleValidation();
        this.handleImageUpload();

    }

    @wire(getObjectInfo, {objectApiName: CLAIM_OBJECT})
    claimObjectInfo;

    // now retriving the field picklist values of object
    @wire(getPicklistValues,
        {
            recordTypeId: '012000000000000AAA',// hardcoded value for null recordTypeid...//'$rsoMetadata.data.defaultRecordTypeId', 
            fieldApiName: OE_REPLACEMENT
        }
    )
    wiredOEReplcement({error, data}){
        if(data){
            this.oeOptions = data.values;
        }
        else if(error){
            console.log('wiredOEReplcement error- ', error);
        }
    }

     // now retriving the field picklist values of object
    @wire(getPicklistValues,
    {
        recordTypeId: '012000000000000AAA',// hardcoded value for null recordTypeid...//'$rsoMetadata.data.defaultRecordTypeId', 
        fieldApiName: POLICY
    }
    )
    wiredPolicy({error, data}){
        if(data){
            this.policyOptions = data.values;
            //console.log('wiredPWR data- ', data.values);
        }
        else if(error){
            console.log('wiredPolicy error- ', error);
        }
    }

    @wire(getPicklistValues,
    {
        recordTypeId: '012000000000000AAA',// hardcoded value for null recordTypeid...//'$rsoMetadata.data.defaultRecordTypeId', 
        fieldApiName: DAMAGE_CONDITION
    }
    )
    wiredCondition({error, data}){
        if(data){
            this.conditionOptions = data.values;
            //console.log('wiredPWR data- ', data.values);
        }
        else if(error){
            console.log('wiredCondition error- ', error);
        }
    }

    @wire(getPicklistValues,
    {
        recordTypeId: '012000000000000AAA',// hardcoded value for null recordTypeid...//'$rsoMetadata.data.defaultRecordTypeId', 
        fieldApiName: DAMAGE_CAUSES
    }
    )
    wiredCauses({error, data}){
        if(data){
            this.causesFieldData = data;
        }
        else if(error){
            console.log('wiredCauses error- ', error);
        }
    }

    async init() {
        this.showSpinner = true;
        try {
            let obj = await reviewClaim({ claimId: this.recordId});
            this.claimObj = JSON.parse(obj);
            this.tyreObj = this.claimObj.tyreWrap;
            this.imageObj = this.claimObj.images;
            console.log('this.imageObj:', this.imageObj);
            this.condition = this.claimObj.conditions;

            this.serialUrl = this.baseUrl+this.imageObj.serialImg;
            this.outUrl = this.baseUrl+this.imageObj.outsideImg;
            this.inUrl = this.baseUrl+this.imageObj.insideImg;
            this.odoUrl = this.baseUrl+this.imageObj.odometerImg;
            this.extraUrl = this.baseUrl+this.imageObj.extraImg;
            this.dgUrl = this.baseUrl+this.imageObj.depthGaugeImg;
            
            let str = this.claimObj.damageCause;
            if(str.length > 0){
                let arr = [];
                str = str.replaceAll(';','#');
                arr = str.split('#');
                this.causes = arr;
                //this.causes = arr.join("\n");               
            }
            if(this.claimObj.warrantyId != null){
                console.log('inside log check:');
                this.warrantyURL = '/'+this.claimObj.warrantyId;
            }else{
                this.warrantyURL = null;
            }

            
            this.claimURL = '/'+this.claimObj.id;
            if(this.claimObj.prevClaimId.length > 0){
                this.prevClaimURL = '/'+this.claimObj.prevClaimId;
            }
            
            if(this.claimObj.status == 'Pending'){
                this.disableAll = false;
            }
            
            if(this.claimObj.isServiceEngineer == true){
                this.disableFields = false;
                this.disableAll = false;

                if(this.claimObj.policy == 'Commercial'){ 
                    this.isDisable = false;
                }
                //added by Amol
                // else if(this.claimObj.status == 'Rejected Closed' || this.claimObj.status == 'Rejected' ){
                //     console.log('inside Rej State:', this.claimObj.status);
                //     if(this.claimObj.status == 'Rejected Closed'){
                //         console.log('inside rej Closed:', this.claimObj.status);
                //         this.isSaveDisabled = true;
                //         this.isRejected = false;
                //         this.isRejected1 = false;
                //     }else if(this.claimObj.status == 'Rejected'){
                //         console.log('inside rej1:', this.claimObj.status);
                //         this.isRejected = false;
                //         this.isRejected1 = false;
                //     }
                //     this.isRejected = false;
                //     this.isRejected1 = false;
                // }else if(this.claimObj.manualOtpVerified == true){
                //     this.disableOTP = true;
                // }else  if(this.claimObj.status == 'Approved'){
                //     console.log('inside Save disa:', this.claimObj.status);
                //     this.isSaveDisabled = true;
                // }
            }
            if(this.claimObj.claimDate.length > 0 && this.claimObj.warrantyStartDate.length > 0){
                let date1 = new Date(this.claimObj.claimDate);
                let date2 = new Date(this.claimObj.warrantyStartDate);
    
                let Difference_In_Time = date1.getTime() - date2.getTime();
                this.runningTime = Math.round(Difference_In_Time / (1000 * 3600 * 24));
            }

            this.loadCauseOptions(this.claimObj.damageCondition);   
            
        } catch (error) {
            console.log('error in init:' + error);
        } finally {
            this.showSpinner = false;
        }
    }

    async handleValidation(){
        let obj = await reviewClaim({ claimId: this.recordId});
        this.claimObj = JSON.parse(obj);
        console.log('inside Rej State111:', this.claimObj.status);
        if(this.claimObj.status == 'Approved'){
            if(this.claimObj.status == 'Approved' && this.claimObj.isServiceEngineer == true){
                console.log('inside Save disaable for engineer:', this.claimObj.status);
                this.isSaveDisabled = true;
            }else{
                console.log('inside Save disaable for Head:', this.claimObj.status);
                this.isSaveDisabled = true;
            }
           
        }
        else if(this.claimObj.status == 'Rejected Closed' || this.claimObj.status == 'Rejected' ){
        console.log('inside Rej State:', this.claimObj.status);
            if(this.claimObj.status == 'Rejected Closed'){
                console.log('inside rej Closed:', this.claimObj.status);
                this.isSaveDisabled = true;
                this.isRejected = false;
                this.isRejected1 = false;
            }else if(this.claimObj.status == 'Rejected'){
                console.log('inside rej1:', this.claimObj.status);
                this.isRejected = false;
                this.isRejected1 = false;
            }
        }else if(this.claimObj.manualOtpVerified == true){
            this.disableOTP = true;
        }
    }

    handleOEChange(event){
        this.claimObj.oeReplacement = event.target.value;
    }
    handlePolicyChange(event){
        this.claimObj.policy = event.target.value;
        if(this.claimObj.policy == 'Commercial'){ 
            this.isDisable = false;
        }
    }
    handleConditionChange(event){
        this.claimObj.damageCondition = event.target.value;
        this.loadCauseOptions(event.target.value);        
    }
    handleCausesChange(event){
        let arr = event.target.value;
        this.claimObj.damageCause = arr.join(';');
    }

    loadCauseOptions(val){
        let key = this.causesFieldData.controllerValues[val];
        this.causeOptions = this.causesFieldData.values.filter(opt => opt.validFor.includes(key));
    }

    handleRGDChange(event){
        this.claimObj.remainingGrooveDepth = parseFloat(event.target.value);
        let val = parseFloat((this.claimObj.ogd - this.claimObj.remainingGrooveDepth).toFixed(2));
        let wear = parseFloat(((val / this.claimObj.ogd)*100).toFixed(2));
        this.claimObj.wear = wear;
        this.claimObj.revisedWear = wear;
        this.calculateAmount();
    }

    handleReviseChange(event){
        this.claimObj.revisedWear = parseFloat(event.target.value);
        this.calculateAmount();
    }

    calculateAmount(){
        let obj = this.claimObj;
        let rwVal = obj.revisedWear;
        if(rwVal >= 0 && rwVal <= 100){
            let baseAmt = (obj.unitPrice * rwVal) / 100;
            let gst = (baseAmt * 28)/100;
            obj.amount = parseFloat((baseAmt + gst + obj.handlingPrice).toFixed(2));
            obj.invoiceAmount = parseFloat((baseAmt + gst).toFixed(2));
            this.claimObj = obj;
        }
        
    }

    get statusOptions() {
        return [
            { label: 'Accept', value: 'Approved' },
            { label: 'Reject - Closed', value: 'Rejected Closed' },
            { label: 'Reject - Send Back to Dealer', value: 'Rejected' },
            { label: 'Pending', value: 'Pending'} //Added by Amol
        ];
    }

    handleStatusChange(event) {
        this.claimObj.status = event.target.value;
        
    }

    get filteredStatusOptions() {
    
        if (this.claimObj.status == 'Pending') {
            return this.statusOptions;
        } else {
            return this.statusOptions.filter(option => option.value != 'Pending');
        }

    }

    handleRemark(event){
        this.claimObj.reviewRemark = event.target.value;
    }

    handleSubmit(){
        let dispoCMP = this.template.querySelector('[data-id="claimDispo"]');
        console.log('dispoCMP:',this.claimObj.status );
        let remCMP = this.template.querySelector('[data-id="claimRemark"]'); 
        let flag = true;

        if (this.claimObj.status == 'Approved' && !this.claimObj.manualOtpVerified && this.claimObj.isServiceEngineer == true) {
            this.showToast('Error', 'Please verify OTP before proceeding.', 'error');
            flag = false;
            console.log('inside OTP Check:', flag);
            return;
        }

        if(this.claimObj.status != 'Approved' || this.claimObj.status != 'Rejected Closed' || this.claimObj.status != 'Rejected' || this.claimObj.status != 'Pending') {
            dispoCMP.setCustomValidity('Please select Claim Disposition.');
            flag = false;
            console.log('inside if ');
        } else {
            console.log('inside else ');
            dispoCMP.setCustomValidity('');
            flag = true;
            console.log('inside else ',flag);
        }
        dispoCMP.reportValidity();

        if(this.claimObj.reviewRemark.length == 0){
            remCMP.setCustomValidity('Please enter remark.');
            flag = false;
        } else {
            remCMP.setCustomValidity('');
            flag = true;
        }
        remCMP.reportValidity();

        if(flag){
            console.log('inside flag');
            this.showSpinner = true;
            this.claimObj.tyreWrap = this.tyreObj;
            if(this.claimObj.status == 'Pending'){
                this.updateRecord();
            }
            else{
                let arry = [];
                arry.push(this.recordId);
                processRecord({
                    records: JSON.stringify(arry),
                    status: this.getStatus(this.claimObj.status),
                    comment: this.claimObj.reviewRemark
                }).then(result => {
                    console.log('Success processing Record', result);
                    this.updateRecord();
                }).catch(error => {
                    console.log('error processing Record', error);
                    this.showToast('Error', 'Error' + error, 'error');
                    this.showSpinner = false;
                })
            }
        }
    }

    getStatus(val){
        const map = new Map();
        map.set('Approved', 'Approve');
        map.set('Rejected', 'Reject');
        map.set('Rejected Closed', 'Reject');
        map.set('Pending', 'Pending');//Added By Amol

        return map.get(val);
    }

    handleOTPCheckbox(event){
        this.claimObj.manualOtpVerified = event.target.checked;
        
        if (this.claimObj.manualOtpVerified && this.claimObj.isServiceEngineer == true) {
            this.disableOTP = true;
        }else{
            this.disableOTP = false;
        }
    }

    updateRecord(){
        // saveImages(
        //     {
        //         imagesJson: JSON.stringify(this.updatedImages),
        //         claimId:this.recordId,
        //     })
        // .then(result1 => {
        //     updateReview({
        //         jsonString: JSON.stringify(this.claimObj)
    
        //     }).then(result => {
        //         let obj = JSON.parse(result);
        //         if(obj.status == 'success'){
        //             this.showToast('Success', 'Successfully Saved', 'success');
                    
        //             this.resetComp();
        //             this.dispatchEvent(new CustomEvent('close'));
        //         }
        //         else{
        //             this.showToast('Error', obj.message, 'error');
        //         }
                
        //         this.showSpinner = false;
        //     }).catch(error => {
        //         console.log('error updating claim record', error);
        //         this.showToast('Error', 'Error' + error, 'error');
        //         this.showSpinner = false;
        //     })
        // })
        // .catch(error => {
        //     console.log('error in saving images',error);
        // })

        updateReview({
            jsonString: JSON.stringify(this.claimObj)

        }).then(result => {
            let obj = JSON.parse(result);
            if(obj.status == 'success'){
                this.showToast('Success', 'Successfully Saved', 'success');
                
                this.resetComp();
                this.dispatchEvent(new CustomEvent('close'));
            }
            else{
                this.showToast('Error', obj.message, 'error');
            }
            
            this.showSpinner = false;
        }).catch(error => {
            console.log('error updating claim record', error);
            this.showToast('Error', 'Error' + error, 'error');
            this.showSpinner = false;
        })    
    }

    handleImageClick(event){
        //console.log('nik url - ', event.target.src);
        window.open(event.target.src, '_blank');
    }

    renderedCallback() {
        /* Promise.all([
            loadStyle(this, customCSS)
        ]); */
    }
    
    resetComp(){
        this.claimObj = {};
        this.tyreObj = {};
        this.imageObj = {};
        this.condition = {};
        this.isDisable = true;
        this.disableAll = true;
        this.serialUrl = '';
        this.outUrl = '';
        this.inUrl = '';
        this.odoUrl = '';
        this.extraUrl = '';
        this.dgUrl = '';
        this.causes = [];
        this.runningTime = 0;
    }

    // //New Change By Amol on 9thOct
    handleUpdateImageClick(event) {
        this.selectedImageType = event.currentTarget.dataset.id;
        if(this.selectedImageType == 'serial' ){
            this.updatedImages.serialFlag = true;
        }
        else if(this.selectedImageType == 'outside'){
            this.updatedImages.outFlag = true;
        }
        else if(this.selectedImageType == 'inside'){
            this.updatedImages.inFlag = true;
        }
        else if(this.selectedImageType == 'depthGuege'){
            this.updatedImages.depthFlag = true;
        }
        else if(this.selectedImageType == 'odometer'){
            this.updatedImages.odoFlag = true;
        }
        else if(this.selectedImageType == 'extra'){
            this.updatedImages.extraFlag = true;
        }

        this.isModalOpen = true; 
    }

    handleCloseModal() {
        this.isModalOpen = false;
    }


    async handleImageUpload(event) {
        console.log('inside Upload :');
        const uploadedFiles = event.detail.files;

        console.log('uploadedFiles:', uploadedFiles);
       
        this.claimObj.images1 = this.claimObj.images1 || {}; 
        if(this.updatedImages.serialFlag == true ){
            this.updatedImages.serialImg = uploadedFiles[0].contentVersionId;
            this.serialUrl = this.baseUrl+uploadedFiles[0].contentVersionId;
        }
        else if(this.updatedImages.outFlag == true){
            this.updatedImages.outsideImg = uploadedFiles[0].contentVersionId;
            this.outUrl = this.baseUrl+uploadedFiles[0].contentVersionId;
        }
        else if(this.updatedImages.inFlag  == true){
            this.updatedImages.insideImg = uploadedFiles[0].contentVersionId;
            this.inUrl = this.baseUrl+uploadedFiles[0].contentVersionId;
        }
        else if(this.updatedImages.depthFlag == true){
            this.updatedImages.depthGaugeImg = uploadedFiles[0].contentVersionId;
            this.dgUrl= this.baseUrl+uploadedFiles[0].contentVersionId;
        }
        else if(this.updatedImages.odoFlag == true){
            this.updatedImages.odometerImg = uploadedFiles[0].contentVersionId;
            this.odoUrl = this.baseUrl+uploadedFiles[0].contentVersionId;
        }
        else if(this.updatedImages.extraFlag == true){
            this.updatedImages.extraImg = uploadedFiles[0].contentVersionId;
            this.extraUrl = this.baseUrl+uploadedFiles[0].contentVersionId;
        }
        
        this.showToast('Success', 'Images uploaded successfully', 'success');
        this.isModalOpen = false;
        
        //  saveImages(
        //     {
        //         imagesJson: JSON.stringify(this.updatedImages),
        //         claimId:this.recordId,
        //     })
        // .then(result1 => {
        //     console.log('inside Image save Method Success');
        //     this.resetImageFlags();
        //     })
        // .catch(error => {
        //     console.log('error in saving images',error);
        // })
        try {
            await saveImages({
                imagesJson: JSON.stringify(this.updatedImages),
                claimId: this.recordId,
            });
            console.log('Image save method success');
            this.resetImageFlags(); // Reset flags after successful save
        } catch (error) {
            console.error('Error in saving images', error);
        }

    }
    
    resetImageFlags() {
        this.updatedImages.serialFlag = false;
        this.updatedImages.outFlag = false;
        this.updatedImages.inFlag = false;
        this.updatedImages.depthFlag = false;
        this.updatedImages.odoFlag = false;
        this.updatedImages.extraFlag = false;
    }
    
    

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
}