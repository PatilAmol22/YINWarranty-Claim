/**
 * @description       : File Upload
 * @author            : Vinayak Godhade/vinayak.godhade@skinternational.com
 * @group             : SKI
 * @created date      : 04-09-2024
 * @last modified on  : 04-09-2024
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
 * Modifications Log
 * Ver   Date         Author                                               Modification
 * 1.0   04-09-2024   Vinayak Godhade/vinayak.godhade@skinternational.com  Initial Version
**/
import { LightningElement, track } from 'lwc';
import ReadCSVFile from '@salesforce/apex/YINImportCSVHandler.ReadCSVFile';
import customCSS from '@salesforce/resourceUrl/customCSS';
import { loadStyle } from 'lightning/platformResourceLoader';
import SaveFile from '@salesforce/apex/YINImportCSVHandler.SaveFile';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import CSV_Template from '@salesforce/resourceUrl/CSV_Template';

export default class YinCsvFileUploader extends LightningElement {

    @track data;
    @track fileName = '';   
    @track showLoadingSpinner = false;
    @track isTrue = true;   
    filesUploaded = [];
    file;
    fileContents;
    fileReader;   
    MAX_FILE_SIZE = 1500000;

    connectedCallback(){
        console.log('inside conn callback');
        
    }

    renderedCallback() {
        Promise.all([
            loadStyle(this, customCSS)
        ]);
    }      

    handleFilesChange(event) {
        if(event.target.files.length > 0) {
            this.filesUploaded = event.target.files;
            if(this.filesUploaded[0].size > this.MAX_FILE_SIZE){
                this.isTrue = true;
                this.fileName = 'File size is too large!!';
            }
            else{
                this.isTrue = false;			
                this.fileName = event.target.files[0].name;
                this.file = this.filesUploaded[0];			
                this.showLoadingSpinner = true;
                this.fileReader= new FileReader();
                this.fileReader.onloadend = (() => {
                    this.fileContents = this.fileReader.result;
                    this.ReadFile();
                });
                this.fileReader.readAsText(this.file);
            }
        }
        else{
            this.isTrue = true;
            this.fileName = 'Please select a CSV file to upload!!';
        }
    }

    ReadFile() {
        ReadCSVFile({ base64Data: JSON.stringify(this.fileContents)})
        .then(result => {           
            console.log(result);
            this.data = result;           
            this.showLoadingSpinner = false;
        })
        .catch(error => {
            console.log(error);
            this.isTrue = true;
            this.showLoadingSpinner = false;
            this.showToastmessage('Error', error.message, 'error');
        });
    }

    handleSave() {
        console.log('Inside Save File:');
        if(!this.isTrue) {
            this.showLoadingSpinner = true;
            SaveFile({ jsonString: JSON.stringify(this.data) })
            .then(result => {
                this.showLoadingSpinner = false;
                console.log('SaveFile result:', result);
                if(result === 'SUCCESS') {
                    this.isTrue = true;
                    console.log('showToastmessage: Success!!', this.file.name + ' - Uploaded Successfully!!');
                    this.showToastmessage('Success!!', this.file.name + ' - Uploaded Successfully!!', 'success');
                } else {
                    console.log('showToastmessage: Error', result);
                    this.showToastmessage('Error', result, 'error');
                }
            })
            .catch(error => {
                console.log('showToastmessage: Error', error.message);
                this.showToastmessage('Error', error.message, 'error');
            });
        }       
    }
    
    handleTemplateDownload() {
        const link = document.createElement('a');
        link.href = CSV_Template;
        link.download = 'CSV_Template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    showToastmessage(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }
}