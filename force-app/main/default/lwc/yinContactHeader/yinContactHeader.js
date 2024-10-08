/**
 * @description       : Dealer Dashboard Contact Header
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : SKI
 * @last modified on  : 23-05-2024
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
**/
// import { LightningElement,api,track,wire } from 'lwc';
// import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
// import customcss from '@salesforce/resourceUrl/resourceOrderMangmt';
// import crown from '@salesforce/resourceUrl/crown';
// import { getRecord, getFieldValue } from "lightning/uiRecordApi";
// import Id from '@salesforce/user/Id';
// import ContactName from '@salesforce/schema/User.Account.DSM__r.Name';
// import ContactNumber from '@salesforce/schema/User.Account.DSM_Contact_Number__c';
// import ErpCustCode from '@salesforce/schema/User.Account.ERP_Customer_Code__c';
// import RecordTypeName from '@salesforce/schema/User.Account.RecordType.Name';

// const fields = [ContactName,ContactNumber, ErpCustCode, RecordTypeName];
// export default class YinContactHeader extends LightningElement {

//     @track userId = Id;
//     crown=crown;

//     @wire(getRecord, {
//         recordId: "$userId",
//         fields
//       })
//       user;

//     get erpCustCode() {
//         console.log('getFieldValue:',getFieldValue(this.user.data, ErpCustCode) );
//     return getFieldValue(this.user.data, ErpCustCode);
//     }

//     get recordTypeName() {
//         console.log('getFieldValue1:',getFieldValue(this.user.data, RecordTypeName) );
//     return getFieldValue(this.user.data, RecordTypeName);
//     }

//     get contactNumber() {
//         console.log('getFieldValue2:',getFieldValue(this.user.data, ContactNumber) );
//     return getFieldValue(this.user.data, ContactNumber);
//     }

//     get contactName() {
//         console.log('getFieldValue2:',getFieldValue(this.user.data, ContactName) );
//     return getFieldValue(this.user.data, ContactName);
//     }
    
    

//     renderedCallback(){
        
//         if(!this.hasRendered){
//             this.loadStyling();
//             this.hasRendered = true;
//         }
//     }

//     async loadStyling(){
//         console.log('css resource ',customcss);
//         Promise.all([
//             loadStyle(this, customcss + '/resource/Fontawesome/css/all.css'),
//             loadStyle(this, customcss + '/resource/Fontawesome/css/regular.css'),
//             loadStyle(this, customcss + '/resource/bootstrap.css'),
//             loadStyle(this, customcss + '/resource/cartcss.css'),
//             loadStyle(this, customcss + '/resource/customcss.css'),
//             loadScript(this, customcss + '/resource/js/custom.js'),         
//             loadScript(this, customcss + '/resource/js/jquerymin.js'), 
//             loadStyle(this, customcss + '/resource/Fontawesome/css/regular.css')
//         ]).then(() => { /* callback */ });
//     }
// }
import { LightningElement,api,track,wire } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import customcss from '@salesforce/resourceUrl/resourceOrderMangmt';
import crown from '@salesforce/resourceUrl/crown';
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import Id from '@salesforce/user/Id';
import ContactName from '@salesforce/schema/User.Account.DSM__r.Name';
import ContactNumber from '@salesforce/schema/User.Account.DSM_Contact_Number__c';
import ErpCustCode from '@salesforce/schema/User.Account.ERP_Customer_Code__c';
import RecordTypeName from '@salesforce/schema/User.Account.RecordType.Name';

const fields = [ContactName,ContactNumber, ErpCustCode, RecordTypeName];
export default class YinContactHeader extends LightningElement {

    @track userId = Id;
    crown=crown;

    @wire(getRecord, {
        recordId: "$userId",
        fields
      })
      user;

    get erpCustCode() {
        console.log('getFieldValue:',getFieldValue(this.user.data, ErpCustCode) );
    return getFieldValue(this.user.data, ErpCustCode);
    }

    get recordTypeName() {
        console.log('getFieldValue1:',getFieldValue(this.user.data, RecordTypeName) );
    return getFieldValue(this.user.data, RecordTypeName);
    }

    get contactNumber() {
        console.log('getFieldValue2:',getFieldValue(this.user.data, ContactNumber) );
    return getFieldValue(this.user.data, ContactNumber);
    }

    get contactName() {
        console.log('getFieldValue2:',getFieldValue(this.user.data, ContactName) );
    return getFieldValue(this.user.data, ContactName);
    }
    
    

    renderedCallback(){
        
        if(!this.hasRendered){
            this.loadStyling();
            this.hasRendered = true;
        }
    }

    async loadStyling(){
        console.log('css resource ',customcss);
        Promise.all([
            loadStyle(this, customcss + '/resource/Fontawesome/css/all.css'),
            loadStyle(this, customcss + '/resource/Fontawesome/css/regular.css'),
            loadStyle(this, customcss + '/resource/bootstrap.css'),
            loadStyle(this, customcss + '/resource/cartcss.css'),
            loadStyle(this, customcss + '/resource/customcss.css'),
            loadScript(this, customcss + '/resource/js/custom.js'),         
            loadScript(this, customcss + '/resource/js/jquerymin.js'), 
            loadStyle(this, customcss + '/resource/Fontawesome/css/regular.css')
        ]).then(() => { /* callback */ });
    }
}