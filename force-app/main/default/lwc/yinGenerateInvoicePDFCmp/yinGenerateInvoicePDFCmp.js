/**
 * @description       : 
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : SKI
 * @created date      : 23-01-2025
 * @last modified on  : 23-01-2025
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
 * Modifications Log
 * Ver   Date         Author                                      Modification
 * 1.0   10-09-2024   Amol Patil/amol.patil@skinternational.com   Initial Version
**/
import { LightningElement, api, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getInvoicePDF from '@salesforce/apex/YINInvoiceServiceApi.getInvoicePDF';

const FIELDS = [
    'YIN_Invoice__c.Invoice_Number__c',
    'YIN_Invoice__c.Document_Type__c'
];

export default class YinGenerateInvoicePDFCmp extends LightningElement {
    @api recordId; 
    @api documentType;
    @track isModalOpen = false;
    @track showLoading = true;
    invoiceNumber;
    docType;

    connectedCallback() {
        //console.log('Inside Connected:');
        if (this.recordId) {
            //console.log('Record ID:', this.recordId);
            this.invoiceNumber = this.recordId;
                if(this.documentType == 'Credit Memo'){
                    //console.log('inside con Credit Memo:',);
                    this.docType = 'Credit Note';
                }
                else if(this.documentType == 'Invoice'){
                    //console.log('inside con inv:');
                    this.docType = 'Invoice';
                }
            //console.log('Record invoiceNumber & doctype by table:', this.invoiceNumber,this.docType);
            this.showLoading = false;
        }
        this.showLoading = false;
    }

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ error, data }) {
        if (data) {
            //console.log('Inside Data:',data);
            this.invoiceNumber = data.fields.Invoice_Number__c.value;
            this.docType = data.fields.Document_Type__c.value;
            //console.log('Record data:',this.invoiceNumber,this.docType);
            
        } else if (error) {
            console.error('Error fetching record:', error);
        }
    }


  /*  handleGetInvoicePDF() {
        this.showLoading = true;
        if (this.invoiceNumber) {
            //console.log('Inside Get:',this.invoiceNumber);
            getInvoicePDF({ invoiceNumber: this.invoiceNumber,documentType:this.docType })
                .then(result => {
                     console.log('Inside Result:');
                    this.showLoading = false;
                    console.log('PDF Base64:', result);
                    this.downloadPDF(result);
                    this.showLoading = false;
                    console.log('Inside Result:', result);
                if (result) {
                    console.log('PDF Base64:', result);
                    this.downloadPDF(result);
                    this.showToast('Success', 'Invoice PDF downloaded successfully', 'success');
                } else {
                    this.showToast('Warning', 'No PDF available for this invoice', 'warning');
                    return;
                }
                })
                .catch(error => {
                    this.showLoading = false;
                    console.error('Error:', error);
                    this.showToast('Error', 'Failed to fetch invoice PDF', 'error');
                });
        } else {
            this.showLoading = false;
            console.error('Invoice number is not available');
            this.showToast('Error', 'Invoice number is not available', 'error');
        }
    }

    downloadPDF(base64PDF) {
        //const fileName = `${this.docType}_${this.invoiceNumber}.pdf`;
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${base64PDF}`;
        if(this.docType == 'Credit Note'){
            this.docType = 'CREDITNOTE';
        }else if(this.docType == 'Invoice'){
            this.docType = 'INVOICE';
        }
        if (link.download !== undefined) {
            link.download = `${this.docType}_${this.invoiceNumber}.pdf`;
        }
        link.download = `${this.docType}_${this.invoiceNumber}.pdf`;
        link.click();
    }

    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }
})*/
handleGetInvoicePDF() {
    this.showLoading = true;
    getInvoicePDF({ invoiceNumber: this.invoiceNumber, documentType: this.docType })
        .then(result => {
            this.showLoading = false;
            if (result) {

                this.downloadPDF(result);
                this.showToast('Success', 'Invoice PDF downloaded successfully', 'success');
            } else {
                this.showToast('Warning', 'Failed to generate PDF', 'warning');
            }
        })
        .catch(error => {
            this.showLoading = false;
            console.error('Error:', error);
            this.showToast('Error', 'Failed to fetch invoice PDF', 'error');
        });
}

downloadPDF(base64PDF) {
    // Convert base64 string to Blob
    const pdfBlob = this.base64ToBlob(base64PDF, 'application/pdf');

    // Create a link and simulate a click to trigger the download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(pdfBlob);
    link.download = `${this.docType}_${this.invoiceNumber}.pdf`;
    link.click();
}

// Helper function to convert base64 to Blob
base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
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