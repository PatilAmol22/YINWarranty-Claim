/**
 * @description       : 
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : SKI
 * @created date      : 01-10-2024
 * @last modified on  : 01-10-2024
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
 * Modifications Log
 * Ver   Date         Author                                      Modification
 * 1.0   01-10-2024   Amol Patil/amol.patil@skinternational.com   Initial Version
**/
import { LightningElement, track, wire } from 'lwc';
import customCSS from '@salesforce/resourceUrl/customCSS';
import { loadStyle } from 'lightning/platformResourceLoader';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import Id from '@salesforce/user/Id';
import getProfileName from '@salesforce/apex/YINDemandPlanningController.getProfileName';
import getDSMRecords from '@salesforce/apex/YINDemandPlanningController.getDSMRecords';
import getDemandCSV from '@salesforce/apex/YINDemandPlanningController.getDemandScheduleCSV';
import fileUpload from '@salesforce/apex/YINDemandPlanningController.uploadFile';

export default class YinDemandPlanning extends LightningElement {

    @track showSpinner = false;
    @track scheduleObj = {};
    @track userId = Id;
    @track error;
    @track profileName = '';
    @track showModal = false;
    @track options = [];

    filesUploaded = [];
    file;
    fileContents;
    fileReader;
    content;
    MAX_FILE_SIZE = 1500000;
    @track fileName = '';

    connectedCallback(){
        this.loadProfile();
    }

    loadProfile(){
        this.showSpinner = true;
        try {
            getProfileName({recordId: Id})
            .then(result => {
                this.profileName = result;
            })
            .catch(error => {
                console.error(error);
                this.showSpinner = false;
                this.showToast('Error', 'Error while getting Profile.', 'error');
            });
        }
        catch (error) {
            console.error(error);
            this.showSpinner = false;
            this.showToast('Error', 'An unexpected error occurred.', 'error');
        }
        finally{
            this.showSpinner = false;
        }
    }

    renderedCallback() {
        Promise.all([
            loadStyle(this, customCSS)
        ]);
    }      

    get acceptedFormats() {
        return ['.csv'];
    }

    handleFilesChange(event) {
        if (event.target.files.length > 0) {
            this.filesUploaded = event.target.files;
            this.fileName = this.filesUploaded[0].name;
        }
    }

    handleSave() {
        if (this.filesUploaded.length > 0) {
            this.uploadFile();
        } 
        else {
            this.fileName = 'Please select a CSV file to upload';
        }
    }

    uploadFile() {
        if (this.filesUploaded[0].size > this.MAX_FILE_SIZE) {
            this.showToast('Error', 'File Size is too large', 'error');
            return;
        }
        
        this.showSpinner = true;
        this.fileReader = new FileReader();

        this.fileReader.onloadend = () => {
            this.fileContents = this.fileReader.result;
            this.validateCSV();
        };
        this.fileReader.readAsText(this.filesUploaded[0]);
    }

    validateCSV(){
        var arr = [];
        arr = this.fileContents.split('\n');
        arr.pop();
        let flag = true;
        for(var i = 1; i < arr.length; i++) {
            var re = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/g;				// /,(?=(?:(?:[^"]*"){2})*[^"]*$)/; 
            var data = [].map.call(arr[i].split(re), function(el) {
                return el.replace(/^"|"$/g, '');
            });
            if(data.length == 19){
                if(data[0].trim().length == 0 || data[1].trim().length == 0 || data[2].trim().length == 0 || data[3].trim().length == 0){
                    flag = false;
                    this.showToast('Error', 'Record Id in any of first four columns is missing or null. Please download the latest template and try again.', 'error');
                    break;
                }
                else if((data[0].trim().length < 15 || data[0].trim().length > 18) || (data[1].trim().length < 15 || data[1].trim().length > 18) || (data[2].trim().length < 15 || data[2].trim().length > 18) || (data[3].trim().length < 15 || data[3].trim().length > 18)){
                    flag = false;
                    this.showToast('Error', 'Record Id in any of first four columns is wrong. Please download the latest template and try again.', 'error');
                    break;
                }
                else if(data[13].trim().length == 0 || data[15].trim().length == 0 || data[16].trim().length == 0 || data[17].trim().length == 0){
                    flag = false;
                    this.showToast('Error', 'Quantity value for any of future four months is null or empty. Please add values and try again.', 'error');
                    break;
                }
                else if(isNaN(data[14].trim()) || isNaN(data[15].trim()) || isNaN(data[16].trim()) || isNaN(data[17].trim())){
                    flag = false;
                    this.showToast('Error', 'Please check the Quantity value for any of future four months, it should be number only.', 'error');
                    break;
                }
                else if(! /^[0-9][0-9]*$/.test(data[14].trim()) || ! /^[0-9][0-9]*$/.test(data[15].trim()) || ! /^[0-9][0-9]*$/.test(data[16].trim()) || ! /^[0-9][0-9]*$/.test(data[17].trim())){
                    flag = false;
                    this.showToast('Error', 'Please check the Quantity value for any of future four months, negative and decimal values are not allowed.', 'error');
                    break;
                }
                else if(data[18].trim().length == 0){
                    flag = false;
                    this.showToast('Error', 'Please check the Supplier value, it should not be empty or null.', 'error');
                    break;
                }
                
            }
            else{
                flag = false;
                this.showToast('Error', 'Wrong file uploaded or number of columns mismatched. Please download the latest template and try again.', 'error');
                break;
            }
        }
        
        if(flag){
            this.saveFile();
        }
        else{
            this.showSpinner = false;
        }
    }

    saveFile(){
        this.showSpinner = true;
        try {
            fileUpload({base64Data: JSON.stringify(this.fileContents)})
            .then(result => {
                let obj = JSON.parse(result);
                if (obj.status == 'error') {
                    this.showSpinner = false;
                    this.showToast('Error', obj.message, 'error');
                }
                else{
                    this.showSpinner = false;
                    this.showToast('Success', 'The CSV file Uploaded Successfully.', 'success');
                    this.filesUploaded = [];
                    this.fileName = '';
                }
            })
            .catch(error => {
                console.error(error);
                this.showSpinner = false;
                this.showToast('Error', 'Error while uploading File', 'error');
            });
        }
        catch (error) {
            console.error(error);
            this.showSpinner = false;
            this.showToast('Error', 'An unexpected error occurred.', 'error');
        }
    
    }

    handleCancel(){
        this.filesUploaded = [];
        this.fileName = '';
    }

    handleTemplateDownload(){
        if(this.profileName == 'Branded Retail Manager' || this.profileName == 'Branded Retail Head' || this.profileName == 'Marketing Operation Head' || this.profileName == 'Marketing Head'){
            this.showModal = true;
            this.getDSMs();
        }
        else{
            this.downloadCSV();
        }
    }

    async getDSMs(){
        this.showSpinner = true;
        try {
            let resp = await getDSMRecords();
            let obj = JSON.parse(resp);
            if(obj.status == 'success'){
                let arr = [];
                let data = obj.dsmList;
                for (var key in data) {
                    // Here key will have index of list of records starting from 0,1,2,....
                    arr.push({ label: data[key].dsmName, value: data[key].dsmId });                    
                }
                this.options = arr;
            }
            else{
                this.showToast('Error', obj.message, 'error');
            }
        } catch (error) {
            this.showToast('Error', 'Error - ' + error, 'error');
        } finally {
            this.showSpinner = false;
        }
    }

    handleDSMChange(event){
        this.userId = event.target.value;
    }

    closeModal(){
        this.showModal = false;
    }

    async downloadCSV() {
        this.showSpinner = true;
        try {
            let obj = await getDemandCSV({userId:this.userId});
            this.scheduleObj = JSON.parse(obj);
            
            if(this.scheduleObj.status == 'success'){
                // Creating anchor element to download
                let downloadElement = document.createElement('a');

                // This  encodeURI encodes special characters, except: , / ? : @ & = + $ # (Use encodeURIComponent() to encode these characters).
                downloadElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(this.scheduleObj.csvData);
                downloadElement.target = '_self';
                // CSV File Name
                downloadElement.download = this.scheduleObj.csvName;
                // below statement is required if you are using firefox browser
                document.body.appendChild(downloadElement);
                // click() Javascript function to download CSV file
                downloadElement.click(); 
            }
            else{
                this.showToast('Error', this.scheduleObj.message, 'error');
            }
        } catch (error) {
            this.showToast('Error', 'Error - ' + error, 'error');
        } finally {
            this.showSpinner = false;
        }
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