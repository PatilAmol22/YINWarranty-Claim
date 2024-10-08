/**
 * @description       : Create Warranty Child Component.
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : SKI
 * @last modified on  : 18-04-2024
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
**/
import { LightningElement,api,track,wire} from 'lwc';
import customCSS from '@salesforce/resourceUrl/customCSS';
import { loadStyle } from 'lightning/platformResourceLoader';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import  getBarcodeDetails from '@salesforce/apex/YINBarCodeController.getBarcodeDetails';
import  validateAsset from '@salesforce/apex/YINWarrantyController.validateAsset';
import  assetDelete from '@salesforce/apex/YINWarrantyController.assetDelete';


export default class YinWarrantyScannerChildCmp extends LightningElement {
 
@api warrantyScannerChildObj;
@track tyreList = [];
@track productObj = {tyrePattern : '',tyreSize : '',plantCode : '',spectCode : '',weekYear : '',productCode:''};
@track qrCode;
@track spectOpts = [];
@track isVerifyDisabled = true;
@track nextDisabled = true;
@track isAddDisabled = true;
@track showLoading = true;
@track qrCodeDisabled = false;
@track numValue = /^\d{4}$/;
@track productCode;

@api getTyreList(val){
    
    this.tyreList = [...val];
    for (let index = 0; index < this.tyreList.length; index++) {
        this.tyreList[index].index = index + 1;
            }
    //console.log('inside gettyre API meth:', JSON.stringify(this.tyreList));

}

connectedCallback(){
    //console.log('inside con call  3rd:', JSON.stringify(this.warrantyScannerChildObj.tyreList));
    //console.log('inside con call  3rdrrr:', JSON.stringify(this.warrantyScannerChildObj));
    if(this.warrantyScannerChildObj.tyreList && Array.isArray(this.warrantyScannerChildObj.tyreList) && this.warrantyScannerChildObj.tyreList.length > 0){
        this.tyreList = [...this.warrantyScannerChildObj.tyreList];
        this.productCode = this.tyreList[0].productCode;
    }
    this.checkNextDisabled();
    this.showLoading = false;
}

renderedCallback() {
        Promise.all([
            loadStyle(this, customCSS)
        ]);
}

get options() {
    return this.spectOpts;
}

handleChange(event) {
    this.productObj.spectCode = event.detail.value;
}

async handleVerify(e){
    this.showLoading = true;
    this.qrCodeDisabled = true;
    this.spectOpts = [];
    this.productObj = {};
    try {
    //console.log('inside next Child:');
    let getBarcodeDetail = await getBarcodeDetails({qrCode:this.qrCode})
    let parsedgetBarcodeDetail =  JSON.parse(getBarcodeDetail);
    if(parsedgetBarcodeDetail.status == 'success'){
         parsedgetBarcodeDetail.additionalSpectCode.forEach(element => {
            this.spectOpts = [...this.spectOpts,{label:element,value:element}];
           });

        //console.log('SpectOPTS list :', JSON.stringify(this.spectOpts));
        this.productObj = parsedgetBarcodeDetail;
        //this.productCode = parsedgetBarcodeDetail.productCode;
        //console.log('productCode:', this.productCode);
        //console.log('this.productObj  :', JSON.stringify(this.productObj));
        //console.log('this.productObj.plantCode:', this.productObj.plantCode);
        if(this.productObj.plantCode == null){
            //console.log('!!!this.productObj.plantCode:', this.productObj.plantCode);
            this.isAddDisabled = true;
            this.showToastmessage('Error', 'Serial Number is null.','error');
            this.productObj = {};
            this.isVerifyDisabled = true;
            this.qrCodeDisabled = false;
            this.qrCode = '';
            this.showLoading = false;
        }
        // if(this.productCode !=parsedgetBarcodeDetail.productCode){
        //     this.isAddDisabled = true;
        //     this.showToastmessage('Error', 'Product Code Mismatch.','error');
        //     this.productObj = {};
        //     this.isVerifyDisabled = true;
        //     this.qrCodeDisabled = false;
        //     this.qrCode = '';
        // }
        this.isAddDisabled = false;
        this.isVerifyDisabled = true;
        this.showLoading = false;
       
    }else if(parsedgetBarcodeDetail.status =='error'){
        this.showToastmessage('Error',parsedgetBarcodeDetail.message,'error');
        this.qrCodeDisabled = false;
        this.qrCode = '';
        this.isAddDisabled = true;
        this.isVerifyDisabled = true;
        this.productObj = {};
        this.showLoading = false;
    }
    // }else if(parsedgetBarcodeDetail.status =='' || !parsedgetBarcodeDetail.status){
    //     this.showToastmessage('Error','Failed to fetch the data.','error');
    //     this.qrCodeDisabled = false;
    //     this.qrCode = '';
    //     this.isAddDisabled = true;
    //     this.isVerifyDisabled = true;
    //     this.productObj = {};
    //     this.showLoading = false;
    // }
    } catch (error) {
        console.error('Error Fetching Data :', error);
        this.showLoading = false;
        this.qrCodeDisabled = false;
        this.qrCode = '';
    }
}
    
async addDataInTable(e){
    this.isAddDisabled = true;
    this.showLoading = true;
    this.qrCodeDisabled = false;
    try {

        //console.log('inside add try:',this.productCode,this.productObj.productCode);
        if(this.productCode && this.productCode != this.productObj.productCode){
            //console.log('inside if prod check:',this.productCode);
            this.showToastmessage('Error', 'Product Code Mismatch.','error');
            this.productObj = {};
            this.qrCodeDisabled = false;
            this.qrCode = '';
            this.showLoading = false;
        }else{
            //console.log('inside Add Else:');
            //console.log('inside else prod check:',this.productCode);
            if(this.tyreList.length == 0){
                let obj =  JSON.parse(JSON.stringify(this.productObj));
                this.productCode = obj.productCode;
            }
            
            let getAssetDetail = await validateAsset({barcode:this.qrCode})
            let parsedgetAssetDetail =  JSON.parse(getAssetDetail);
            //console.log('inside next Child:',JSON.stringify(parsedgetAssetDetail));
            if(parsedgetAssetDetail.status == 'success'){
                //console.log('inside add verify barcode:',this.tyreList.length );
    
            if(this.tyreList.length < 5 ){
                if(this.tyreList.some(tyre => tyre.barCode === this.qrCode)){
                    this.showToastmessage('Error','Duplicate QR Code found.','error');
                }else {
                    this.createRow(this.tyreList);
                }
                
            }else if(this.tyreList.length > 5){
                this.showToastmessage('Error','Asset limit exceeded.','error');
            }
            this.checkNextDisabled();
            //console.log('inside add:',JSON.stringify(this.tyreList));
            this.warrantyScannerChildObj = { ...this.warrantyScannerChildObj, tyreList: this.tyreList };
            //console.log('inside after add:',JSON.stringify(this.warrantyScannerChildObj.tyreList));
            this.productObj = {};
            this.qrCode = '';
            this.showLoading = false;
            }else if(parsedgetAssetDetail.status =='error'){
                this.showToastmessage('Error','QRcode is already used. Duplicate records are not allowed.','error');
                this.isAddDisabled = true;
                this.isVerifyDisabled = true;
                this.productObj = {};
                this.qrCode = '';
                this.showLoading = false;
            }
        }
    } catch (error) {
        console.error('Error Fetching Data :', error);
        this.qrCode = '';
        this.showLoading = false;
    }
    
}

async onRemoveRow(e){
    this.showLoading = true;
    let tyreList = this.tyreList;
    //console.log('inside remove:',this.tyreList[e.target.name - 1].id);
    let name = e.target.name;
    if(this.tyreList[name - 1].id){
        //console.log('inside remove11:',this.tyreList[e.target.name - 1].id);
        let deleteAssetDetail = await assetDelete({assetId:tyreList[name - 1].id})
        let parsedDelAssetDetail =  JSON.parse(deleteAssetDetail);
        //console.log('inside remove22:');
        if(parsedDelAssetDetail.status == 'success'){
            this.showLoading = false;
            //console.log('inside remove33:');
            this.showToastmessage('Success','Asset Deleted Successfully.','success')
        }else if(parsedDelAssetDetail.status == 'error'){
            this.showLoading = false;
            this.showToastmessage('Error','Failed to delete asset.','error')
        }
        }
       
    this.tyreList.splice(this.tyreList.findIndex(param => name === param.index), 1);
    this.tyreList = [...this.tyreList];
    //console.log('inside remove44:',JSON.stringify(this.tyreList));
    if(this.tyreList.length > 0){
        for (let i = 0; i < this.tyreList.length; i++) {
            //console.log('inside remove55:',JSON.stringify(this.tyreList));
            this.tyreList[i].index = i + 1;
            this.productCode = this.tyreList[i].productCode;
            }
            this.showLoading = false;
    }else{
        this.productCode = null;
        this.showLoading = false;
    }
   
        //console.log('inside remove66:',JSON.stringify(this.tyreList));
       
        this.warrantyScannerChildObj = { ...this.warrantyScannerChildObj, tyreList: this.tyreList };
        this.checkNextDisabled();
        this.showLoading = false;
    }

createRow(params) {
    let paramsObject = {...this.productObj};
    if(params.length > 0) {
        //console.log('@@@@@@:', (params[params.length - 1].index + 1));
        paramsObject.index = params[params.length - 1].index + 1;
    } else {
        paramsObject.index = 1;
    }
    //console.log('#####:', paramsObject.index);
    paramsObject.name = paramsObject.productName;
    paramsObject.customerId = this.warrantyScannerChildObj.customerId;
    paramsObject.tyreSerialNo = paramsObject.plantCode + paramsObject.spectCode + paramsObject.weekYear;
    params.push({...paramsObject});
}

handleQRCodeChange(e){
    this.qrCode = e.target.value;
    if(this.qrCode){
        this.isVerifyDisabled = false;
    }else{
        this.isVerifyDisabled = true;
    }
    }
    
handleYearChange(e){
    const val = e.target.value;
    if(!this.numValue.test(val)){
        //console.log('inside if weakyear:');
        this.isAddDisabled = true;
        this.showToastmessage('Error', 'Invalid input format. Please enter a valid two-digit date and two-digit year .', 'error');
    }else{
        //console.log('inside else weakyear:');
        this.productObj.weekYear = val;
        this.isAddDisabled = false;
    }
    }

checkNextDisabled(){
    if(this.tyreList.length > 0){
        this.nextDisabled = false;
    }else{
        this.nextDisabled =true;
    }
}

handleClick(e){
    //console.log('#####inside scanner:', JSON.stringify(this.warrantyScannerChildObj));
    if(e.target.label == 'Back'){
        this.dispatchEvent(new CustomEvent('back',
        {detail:this.warrantyScannerChildObj}
        ));
    }else if(e.target.label == 'Next'){
        this.dispatchEvent(new CustomEvent('next',
        {detail:this.warrantyScannerChildObj}
        ));
    }else if(e.target.label == 'Save As Draft'){
        this.dispatchEvent(new CustomEvent('savedraft',
        {detail:this.warrantyScannerChildObj}
        ));
    }
    
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