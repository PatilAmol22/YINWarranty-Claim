import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord } from 'lightning/uiRecordApi';
import uploadFile from '@salesforce/apex/YINBrandingRequisitionController.uploadFile';
import getZSMByAccountId from '@salesforce/apex/YINBrandingRequisitionController.getZSMByAccountId';
import { NavigationMixin } from 'lightning/navigation';
import Branding_Requition__c from '@salesforce/schema/Branding_Requition__c';

export default class BrandingRequisition extends NavigationMixin(LightningElement) {
    @track recordId;
    @track isPartSelected = false;
    @track Status = '';
    @track inShop = '';
    @track Brandingname='';
    @track outside = '';
    @track pop = '';
    @track others = '';
    @track budget = '';
    @track accountId;
    @track channelCodeId;
    @track fileData = { 
        noc: [], 
        balanceConfirmation: [], 
        requestletter: [] 
    };
    @track uploadedFilenames = {
        noc: [],
        balanceConfirmation: [],
        requestletter: []
    };

    filter = {
        criteria: [
            {
                fieldPath: 'Account_Type__c',
                operator: 'eq',
                value: 'sold to party'
            }]
    }

    get options() {
        return [
            { label: 'Sun board', value: 'Sun board' },
            { label: 'One Way Vision Glass', value: 'One Way Vision Glass' },
        ];
    }

    get options2() {
        return [
            { label: 'Signage', value: 'Signage' },
            { label: 'Standee', value: 'Standee' },
            { label: 'Non-lit boards', value: 'Non-lit boards' },
            { label: 'Certificate', value: 'Certificate' },
        ];
    }

    get options3() {
        return [
            { label: 'Poster', value: 'Poster' },
            { label: 'Tent Card', value: 'Tent Card' },
            { label: 'Leaflet', value: 'Leaflet' },
            { label: 'Brochure', value: 'Brochure' },
        ];
    }

    get options4() {
        return [
            { label: 'Pending', value: 'Pending' },
            { label: 'Approved', value: 'Approved' },
        ];
    }

    handleInputChange(event) {
        const field = event.target.dataset.id;
        this[field] = event.target.value;
        console.log(`Input changed for field '${field}': ${this[field]}`);
    }

    handleComboboxChange(event) {
        const field = event.target.name;
        this[field] = event.target.value;
        console.log(`Combobox changed for field '${field}': ${this[field]}`);
    }

    handleDealerChange(event) {
        console.log("Event Detail:", event.detail);
        this.isPartSelected = event.detail.recordId != null;
        if (this.isPartSelected) {
            this.recordId = event.detail.recordId;
            console.log("Record ID set:", this.recordId);
        } else {
            this.recordId = null;
            console.log("No record ID found.");
        }
    }

    handleChannelCodeSearch(event) {
        this.channelCodeId = event.detail.id;
        console.log(`Selected ChannelCodeId: ${this.channelCodeId}`);
    }

    async handleFileUpload(event) {
        const files = event.target.files;

        if (!files || files.length === 0) {
            console.error('No files selected.');
            return;
        }

        const inputName = event.target.name;

        // Process only the first file
        const file = files[0];

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            const filename = file.name;

            // Replace existing file with the new file
            this.fileData[inputName] = [{ filename, base64 }];
            this.uploadedFilenames[inputName] = [filename];

            console.log(`File uploaded for ${inputName}: ${filename}`);
        };

        reader.readAsDataURL(file);
    }

    async uploadFiles(recordId) {
        const allFilePromises = Object.keys(this.fileData).map(async (inputName) => {
            const files = this.fileData[inputName];
            const promises = files.map(file => {
                return uploadFile({ base64: file.base64, filename: file.filename, recordId })
                    .then(result => {
                        console.log(`${file.filename} uploaded successfully. Result:`, result);
                    })
                    .catch(error => {
                        console.error('Error uploading file:', error);
                        this.showToast('Error', `Failed to upload ${file.filename}. Please try again.`, 'error');
                    });
            });
            await Promise.all(promises);
        });
    
        try {
            await Promise.all(allFilePromises);
        } catch (error) {
            console.error('Error uploading files:', error);
            this.showToast('Error', 'Failed to upload one or more files. Please try again.', 'error');
        }
    }
    
    removeFile(event) {
        const filename = event.target.dataset.filename;
        const inputName = event.target.dataset.inputname;
    
        this.uploadedFilenames[inputName] = this.uploadedFilenames[inputName].filter(file => file !== filename);
        this.fileData[inputName] = this.fileData[inputName].filter(file => file.filename !== filename);
    }
    
    handleCancel() {
        const fieldsToClear = ['Status', 'inShop', 'outside', 'pop', 'others', 'budget'];
        fieldsToClear.forEach(field => {
            this[field] = '';
        });
        this.accountId = undefined;
        this.channelCodeId = undefined;
        this.recordId = null;
        this.fileData = { noc: [], balanceConfirmation: [], requestletter: [] };
        this.uploadedFilenames = { noc: [], balanceConfirmation: [], requestletter: [] };
        console.log('Form cancelled and cleared.');
    }
    
    async handleSubmit() {
        if (!this.validateFields()) {
            this.showToast('Error', 'Please fill in all required fields', 'error');
            console.error('Validation failed. Fields are missing.');
            return;
        }
    
        if (!this.recordId) {
            this.showToast('Error', 'Dealer name is required', 'error');
            console.error('Dealer name is required but not selected.');
            return;
        }
    
        // Check if all required files are attached
        if (
            this.uploadedFilenames.noc.length === 0 ||
            this.uploadedFilenames.balanceConfirmation.length === 0 ||
            this.uploadedFilenames.requestletter.length === 0
        ) {
            this.showToast('Error', 'Please attach all required files (NOC, Balance Confirmation, and Request Letter).', 'error');
            console.error('Required files are missing.');
            return;
        }
        try {
            // Fetch ZSM from Account
            const zsm = await getZSMByAccountId({ accountId: this.recordId });

            const fields = {
                Status__c: 'Pending', // Set the status to 'Pending'
                In_shop__c: this.inShop,
                Outside__c: this.outside,
                POP__c: this.pop,
                Others__c: this.others,
                Budget__c: this.budget,
                Dealer_Name__c: this.recordId,
                ZSM__c: zsm // Assign ZSM__c field value
            };
    
            const recordInput = { apiName: Branding_Requition__c.objectApiName, fields };
            const result = await createRecord(recordInput);
            console.log('Record creation result:', result);
            this.showToast('Success', 'Brand Requisition created', 'success');
    
            // Upload files after record creation and clear the form only after files are uploaded
            await this.uploadFiles(result.id);
            this.handleCancel(); // Clear the form after successful submission
            this.navigateToRecordPage(result.id); // Redirect to the created record page
        } catch (error) {
            console.error('Error creating record:', error);
            this.showToast('Error', error.body.message, 'error');
        }
    }
    
        

    navigateToRecordPage(recordId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'view'
            }
        });
    }
    
    validateFields() {
        let isValid = true;
        let requiredFields = ['inShop', 'outside', 'pop'];
    
        requiredFields.forEach(field => {
            if (!this[field]) {
                isValid = false;
                console.error(`Field '${field}' is required but not filled.`);
            }
        });
    
        return isValid;
    }
    
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            }),
        );
    }
}