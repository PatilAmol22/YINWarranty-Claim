import { LightningElement,api, track, wire  } from 'lwc';
import customCSS from '@salesforce/resourceUrl/customCSS';
import { loadStyle } from 'lightning/platformResourceLoader';
import { NavigationMixin } from 'lightning/navigation';
import getAccountDetails from '@salesforce/apex/YINCreditLimitProposalController.getAccountDetails';
import getPicklistValues from '@salesforce/apex/YINCreditLimitProposalController.getPicklistValues';
import processRecord from '@salesforce/apex/YINApprovalInterface.processRecord';
import getProfileById from '@salesforce/apex/YINCreditLimitProposalController.getProfileById';
import getLedgerData from '@salesforce/apex/YINCreditLimitProposalController.getLedgerData';
import getChangeRequestWithFiles from '@salesforce/apex/YINCreditLimitProposalController.getChangeRequestWithFiles';
import saveChangeRequest from '@salesforce/apex/YINCreditLimitProposalController.saveChangeRequest';
import getSalesAndCollection from '@salesforce/apex/YINCreditLimitProposalController.getSalesAndCollection';
import getPaymentTrendsData from '@salesforce/apex/YINCreditLimitProposalController.getPaymentTrendsData';
import uploadChunkToServer from '@salesforce/apex/YINCreditLimitProposalController.uploadChunkToServer';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Quantity from '@salesforce/schema/Asset.Quantity';
const CHUNK_SIZE = 750000; // ~750 KB per chunk
const MAX_FILE_SIZE = 5242880; // 5 MB
export default class YinCreditLimitProposal extends NavigationMixin (LightningElement) {
    @track isChecked = false; // Tracks the checkbox state
    @track location;
    @track doc;
    @track type;
    @track expirationDate;
    @track comments;
    @track profile = [];
    @track proposedCreditLimit = 0.00;
    @track currentAssets = '';
    @track currentLiabilities = '';
    @track currentRatio = '';
    @track workingCapital = '';
    @track typeOptions = [];
    @track creditDaysOptions = [];
    @track currentSecurityDeposite;
    @track currentRatio1;
    @track proposedRatio;
    @track currentCreditLimit;
    @track currentOutStanding;
    @api recordId;
    @track zsm;
    @track creditTeam;
    @track salesDirector;
    @track relatedToId;
    @track recordType;
    @track creditLimitStatus = 'Pending';
    @track creditLimitSubStatus = 'Pending at ZSM';
    @track status;
    @track accountName = '';
    @track accountId = '';
    @track locationId = '';
    @track filesData = [];
    @track showLoading = true;
    @track securityChequeFiles = [];
    @track limitRequestFiles = [];
    @track financialFiles = [];
    @track description;
    @track shouldShowRemoveButton = true;
    @track showExpirationDate = false;
    @track showCreditDays = false;
    @track zeroToThirtydaysOutstanding = 0;
    @track thirtyOneToSixtydaysOutstanding = 0;
    @track greaterThanNintydayssOutstanding = 0;
    @track greaterThanNintydaysOutstanding = 0;
    @track creditDays;
    @track showDiv = true;
    @track showDiv2 = false;
    @track showDiv3 = false;
    @track existingFileIds = [];
    @track isExpirationDateReuired = false;
    @track isProposedAmountRequired = false;
    @track isSubmitDisabled = false; // Track the submit button state
    @track disableStatusField = false;
    @track showProposedLimit =true;
    @track showDoc = false;
    @track showDiv4 = false;
    @track showDiv5 =true;
    @track totalCreditLimit;
    @track salesCollectionData = [];
    @track paymentTrendsData = [];
    months = [];
    @track collectionData =[];
    @track isRegionalSalesManager = true;
    @track FourtySixToSixtydaysOutstanding = 0 ;
    @track thirtyOneToFourtyFivedaysOutstanding = 0;
    @track erpCustomerCode;
    @track isFinancialFieldRequired = true;
    filter={
        criteria: [
            {
              fieldPath: "Account_Type__c",
              operator: "eq",
              value: "Sold To Party",
            }
            ]}
        
        matchingInfo = {
        primaryField: { fieldPath: "Name" },
        additionalFields: [{ 
                            fieldPath: "Combine_Name_and_Code__c",
        }],
        };
        
        displayInfo = {
        additionalFields: ["Combine_Name_and_Code__c"]
        };
        

    @api myRecordId;  // You can pass the recordId from the parent component

   acceptedFormats = '.pdf,.docx,.jpg,.png,.csv'; 
    // Add picklist options
    statusOptions = [
        // { label: 'Pending', value: 'Pending' },
        // { label: 'Pending', value: 'Pending' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Rejected', value: 'Rejected' }
    ];

    renderedCallback() {
            Promise.all([
                loadStyle(this, customCSS)
            ]);
    }

    // This getter dynamically determines if the "Security Cheque" field should be required
    get isSecurityChequeRequired() {
        return !this.isChecked;
    }


    @wire(getPicklistValues)
    wiredPicklistValues({ error, data }) {
        if (data) {
            this.typeOptions = data.Credit_Limit_Type__c.map(value => ({ label: value, value }));
            this.creditDaysOptions = data.Credit_Days__c.map(value => ({ label: value, value }));
            console.log('wiredPicklistValues credit days',this.creditDaysOptions);
        } else if (error) {
            console.error(error);
        }
    }


    @wire(getChangeRequestWithFiles, { changeRequestId: '$recordId' })
    wiredChangeRequest({ error, data }) {
        console.log('inside getchangeRequest wire');
        if (data && data.length > 0) {
            this.relatedToId = data[0].Id;
            this.recordType = data[0].RecordType.Name;
            this.type = data[0].Credit_Limit_Type__c;
            console.log('relatedToId', this.relatedToId);
            console.log('RecordType Name ', this.recordType);
            console.log('type Name ', this.type);
        } else if (error) {
            console.error(error);
            //this.showToast('Error', 'Failed to fetch change request data', 'error');
        }
    }

    async connectedCallback() {
        // Initialize months dynamically for the last 6 months from current month
        this.initMonths();
       // this.showLoading = true;
        this.showDoc = true;
        this.showDiv4 = false;
        this.showDiv5 = true;
        this.currentLiabilities = '';
        this.currentRatio = '';
        try {
            this.profile = await getProfileById({});
            console.log('Profile:', this.profile);
            // Determine profile-based permissions
            const profileName = this.profile[0].Name;
    
            if (profileName === 'System Administrator' || profileName === 'Regional Sales Manager') {
                this.disableSecondFormFields = true;
              //  this.disableCurrentRatioFields = true;
               // this.disableWorkingCapitalFields = true;
                this.disableStatusField = true;
            } else if (profileName === 'Finance Team') {
                this.disableFirstFormFields = true;
                this.disableSecondFormFields = false;
                this.disableCurrentRatioFields = true;
                this.disableWorkingCapitalFields = true;
                this.disableStatusField = false;
            } else {
                this.disableFirstFormFields = true;
                this.disableSecondFormFields = true;
                this.disableCurrentRatioFields = true;
                this.disableWorkingCapitalFields = true;
                this.disableStatusField = false;
                //this.currentLiabilities = 0;
            }
    
            // Fetch data if the profile is not System Admin or Regional Sales Manager
            if (profileName !== 'System Administrator' && profileName !== 'Regional Sales Manager') {
                this.isRegionalSalesManager = false;
                this.shouldShowRemoveButton = false;
                if (this.recordId) {
                    this.recordId = this.recordId.replace('/', '');
                    console.log('inside if block', this.recordId);
                    let result = await getChangeRequestWithFiles({ recordId: this.recordId });
                    console.log('result', JSON.stringify(result));
    
                    if (result.changeRequest) {
                        let data = result.changeRequest;
                        console.log('inside if if block ', data);
                        // Set the component's field values with the fetched data
                        this.accountId = data.Account__c;
                        this.accountName = data.Account__r.Name;
                        this.proposedCreditLimit = parseFloat(data.Proposed_Credit_Limit__c);
                        this.location = data.Locations__r.Name;
                        this.locationId = data.Locations__c;
                        this.doc = data.DOC__c;
                        this.type = data.Credit_Limit_Type__c;
                        this.creditDays = data.Credit_Days__c;
                        console.log('credit days 1233', this.creditDays);
                        this.expirationDate = data.Expiration_Date__c;
                        console.log('expirationDate', this.expirationDate);
                        this.comments = data.Comments__c;
                        this.zsm = data.ZSM__c;
                        this.currentOutStanding = data.Account__r.Outstanding_Amount__c;
                        this.currentSecurityDeposite = data.Account__r.SD_Amount__c;
                        this.currentCreditLimit = data.Account__r.Available_Credit_Limit__c;
                        console.log('currentCreditLimit',this.currentCreditLimit);
                        this.currentAssets = data.Current_Assests__c;
                        console.log('currentAssets',this.currentAssets);
                        this.currentLiabilities = data.Current_Liabilities__c;
                        console.log('currentLiabilties',data.Current_Liabilities__c);
                       // this.currentRatio = data.Current_Ratio__c;
                       this.currentRatio = (this.currentAssets / this.currentLiabilities) ?? 0;
                       console.log('currentRatio',this.currentRatio);
                        //this.workingCapital = data.Working_Capital__c;
                        this.workingCapital = this.currentAssets - this.currentLiabilities;
                        console.log('workingCapital',this.currentLiabilities);
                        this.totalCreditLimit = data.Account__r.Total_Credit_Limit__c;
                        console.log('totalCreditLimit',this.totalCreditLimit);
                        console.log('currentSecurityDeposite',this.currentSecurityDeposite);
                        if ( data.Account__r.SD_Amount__c != null &&  data.Account__r.SD_Amount__c != 0) {
                            this.currentRatio1 = (data.Account__r.Total_Credit_Limit__c / data.Account__r.SD_Amount__c).toFixed(2);
                        } else {
                            this.currentRatio1 = 0;
                        }
                        console.log('currentRatio1',this.currentRatio1);
                        if (this.proposedCreditLimit) {
                            console.log('inside connected  if of limit:');
                            this.proposedRatio = ((this.totalCreditLimit +  parseFloat(this.proposedCreditLimit)) / this.currentSecurityDeposite).toFixed(2);
                        } else {
                            console.log('inside connected else of limit:');
                            this.proposedRatio = this.totalCreditLimit.toFixed(2);
                        }
                        console.log('Updated connected proposedRatio:', this.proposedRatio);
                        

                        // Call the getLedgerData method
                        let ledgerData = await getLedgerData({ accountId: this.accountId });
                        console.log('Result from getLedgerData:', ledgerData);
                        for (let key in ledgerData) {
                            if (key == '0-15 Days' || key == '16-30 Days') {
                                this.zeroToThirtydaysOutstanding = (ledgerData['0-15 Days'] ?? 0) + (ledgerData['16-30 Days'] ?? 0);
                            // } else if (key == '31-45 Days' || key == '46-60 Days') {
                            //     this.thirtyOneToSixtydaysOutstanding = (ledgerData['31-45 Days'] ?? 0) + (ledgerData['46-60 Days'] ?? 0);
                            // }
                            }else if(key == '31-45 Days'){
                            console.log('result 31-45',result[key]);
                            this.thirtyOneToFourtyFivedaysOutstanding = result['31-45 Days'] ?? 0;
                        }else if(key == '46-60 Days'){
                            console.log('result 46-60',result[key]);
                            this.FourtySixToSixtydaysOutstanding = result['46-60 Days'] ?? 0;
                        } else if (key == '61-75 Days' || key == 'More than 75 Days') {
                                this.greaterThanNintydayssOutstanding = (ledgerData['61-75 Days'] ?? 0) + (ledgerData['More than 75 Days'] ?? 0);
                            }
                        }
    
                        // Categorize files and store file IDs
                        if (result.files) {
                            result.files.forEach(file => {
                                let fileData = { fileName: file.fileName, fileContent: file.fileContent, description: file.description };
                                this.existingFileIds.push(file.id);
                                if (file.description.includes('Security File')) {
                                    this.securityChequeFiles.push(fileData);
                                } else if (file.description.includes('Limit Request Letter')) {
                                    this.limitRequestFiles.push(fileData);
                                } else if (file.description.includes('Financial File')) {
                                    this.financialFiles.push(fileData);
                                }
                            });
                        }

                        // Fetch table data from Apex method
                        let tableData = await getSalesAndCollection({ accountId: this.accountId })
                        console.log('Sales and Collection data:', tableData)
                        for (var key in tableData) {
                            let innerMap = [];
                            for (var innerkey in tableData[key]) {
                                innerMap.push({ key: innerkey, value: tableData[key][innerkey] });  
                            }
                            this.salesCollectionData.push({ key: key, value: innerMap });
                        }
                        
                         // Fetch payment Trends  table data from Apex method
                         let paymentTableData = await getPaymentTrendsData({ accountId: this.accountId })
                         console.log('payment Trends Data:', paymentTableData)
                         for (var key in paymentTableData) {
                             let innerMap = [];
                             for (var innerkey in paymentTableData[key]) {
                                 innerMap.push({ key: innerkey, value: paymentTableData[key][innerkey] });  
                             }
                             this.paymentTrendsData.push({ key: key, value: innerMap });
                         }
                         
    
                        // Check the profile and type value to set showExpirationDate and Credit Days
                        if ((['Zonal Head', 'Zone Head', 'Assistant General Manager', 'Finance Team', 'Managing Director', 'Chief Finance Officer'].includes(profileName)) && this.type === 'Additional') {
                            this.showExpirationDate = true;
                            this.isSubmitDisabled = false;
                            this.showCreditDays = false;
                            this.showDiv = false;
                            this.showDiv2 = true;
                        } else if ((['Zonal Head', 'Zone Head', 'Assistant General Manager', 'Finance Team', 'Managing Director', 'Chief Finance Officer'].includes(profileName)) && this.type === 'Credit Days') {
                            this.showCreditDays = true;
                            this.isSubmitDisabled = false;
                            this.showExpirationDate = false;
                            this.showDiv = false;
                            this.showDiv2 = true;
                        } else if ((['Zonal Head', 'Zone Head', 'Assistant General Manager', 'Finance Team', 'Managing Director', 'Chief Finance Officer'].includes(profileName)) && this.type === 'Fixed') {
                            this.showCreditDays = false;
                            this.isSubmitDisabled = false;
                            this.showExpirationDate = false;
                            this.showDiv = true;
                            this.showDiv2 = false;
                        } else {
                            this.showCreditDays = false;
                            this.showExpirationDate = false;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
     this.showLoading = false;
    }

    initMonths() {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth(); // 0 for January, 1 for February, etc.

        // Initialize months array with the last 6 months
        for (let i = 6; i >= 1; i--) {
            const monthIndex = (currentMonth - i + 12) % 12; // Handling wrap around for previous year
            const monthName = this.getMonthName(monthIndex);
            this.months.push({key:monthIndex+1,value:monthName}); // Add month to the beginning of the array
        }
        console.log('months',this.months);
    }

    getMonthName(monthIndex) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames[monthIndex];
    }

    // Getter function to handle conditional rendering
    getMonthData(monthData, month) {
        return monthData[month] || '';
    }
    
    isFileAlreadyAttached(file, existingFiles) {
        return existingFiles.some(existingFile => existingFile.fileName === file.fileName && existingFile.description === file.description);
    }

    handleRemoveAccount() {
        this.accountName = '';
        this.accountId = '';
        this.location = ''; // Clear the location
        this.locationId = '';
        this.currentCreditLimit = '';
        this.totalCreditLimit = '';
        this.currentOutStanding = '';
        this.doc = '';
        this.currentSecurityDeposite = '';
        this.currentRatio1 = '';
        this.proposedRatio = '';
        this.salesCollectionData = '';
        this.paymentTrendsData = '';
        this.zeroToThirtydaysOutstanding = '';
        this.FourtySixToSixtydaysOutstanding = '';
        this.thirtyOneToFourtyFivedaysOutstanding = '';
        this.greaterThanNintydayssOutstanding = '';

    }
    
    async handleDealerChange(e){
   // Reset account-related fields if necessary
    if (!e.detail.recordId) {
        this.handleRemoveAccount();
        return;
    }
        this.salesCollectionData = [];
        this.showLoading = false;
          let value = e.detail.recordId;
          console.log('dealer Is:', value);
          this.accountId = value;
          if(!value){
              this.template.querySelector('.clear').focus();
              this.template.querySelector('.clear').setCustomValidity('Please Select the Dealer Name/Code');
              }else{
                  this.template.querySelector('.clear').blur();
                  this.template.querySelector('.clear').setCustomValidity('');
              }
              this.template.querySelector('.clear').reportValidity();
                if(this.accountId != null){
                  this.showLoading = false;
                }else if(this.accountId === null){
                  this.showLoading = false;
                  console.log('Inside Else:');
                  
            }

            if (this.accountId) {
                console.log('inside if of handleValueSelectedOnAccount ', this.accountId);
                getAccountDetails({ accountId: this.accountId })
                    .then(result => {
                        console.log('Result from getAccountDetails:', result);
                        if (result && result.length > 0) {
                            const account = result[0];
                            if (account.Location__r) {
                                this.erpCustomerCode = account.ERP_Customer_Code__c;
                                this.location = account.Location__r.Name;
                                this.doc = account.On_Boarding_Date__c, 
                                console.log('On Boarding Date:',  this.doc);
                                this.locationId = account.Location__c;
                                this.currentOutStanding = account.Outstanding_Amount__c;
                                this.currentSecurityDeposite = account.SD_Amount__c;
                                this.currentCreditLimit = account.Available_Credit_Limit__c;
                                this.totalCreditLimit = account.Total_Credit_Limit__c;
                                console.log('totalCreditLimit:', this.totalCreditLimit);
                                // Calculate initial proposedRatio
                                this.proposedRatio = account.Total_Credit_Limit__c.toFixed(2);
                                console.log('Initial proposedRatio:', this.proposedRatio);
                                // Set currentRatio1
                                if (account.SD_Amount__c != null && account.SD_Amount__c != 0) {
                                    this.currentRatio1 = (account.Total_Credit_Limit__c / account.SD_Amount__c).toFixed(2);
                                  //  this.currentRatio1 = (account.SD_Amount__c != 0) ? (account.Total_Credit_Limit__c / account.SD_Amount__c).toFixed(2) : '0.00';
                                } else {
                                    this.currentRatio1 = 0;
                                }
                                console.log('Location Name:', this.location);
                                console.log('Location ID:', this.locationId);
                                console.log('currentOutStanding:', this.currentOutStanding);
                                console.log('currentSecurityDeposite:', this.currentSecurityDeposite);
                                console.log('currentCreditLimit:', this.currentCreditLimit);
                                console.log('currentRatio:', this.currentRatio1);
                                console.log('proposedRatio:', this.proposedRatio);
                                

                               // Fetch data from Apex method
                                getSalesAndCollection({ accountId: this.accountId })
                                .then(result => {
                                    console.log('Sales and Collection data:', result);
                                    for (var key in result) {
                                        let innerMap = [];
                                        for (var innerkey in result[key]) { 
                                            innerMap.push({ key: innerkey, value: result[key][innerkey] }); 
                                        }
                    
                                        //this.totalMeets.push({key: key, value:this.recentCount});
                                        this.salesCollectionData.push({ key: key, value: innerMap });
                                    }

                                })
                                .catch(salesError => {
                                    console.error('Error fetching data:', salesError);
                                });

                                 // Fetch payment trends data from Apex method
                            getPaymentTrendsData({ accountId: this.accountId })
                            .then(result => {
                                console.log('Payment Trends Data: ====>', result);

                                // Clear existing data before populating new data
                                this.paymentTrendsData = [];

                                // Iterate over the result object
                                for (let key in result) {
                                    if (result.hasOwnProperty(key)) {
                                        let innerMap = [];
                                        
                                        // Iterate over the inner map
                                        for (let innerKey in result[key]) {
                                            if (result[key].hasOwnProperty(innerKey)) {
                                                innerMap.push({ key: innerKey, value: result[key][innerKey] });
                                            }
                                        }

                                        // Push the structured data into paymentTrendsData
                                        this.paymentTrendsData.push({ key: key, value: innerMap });
                                    }
                                }
                            })
                            .catch(paymentError => {
                                console.error('Error fetching payment trends data:', paymentError);
                            });

                                }
                            
                            
                            else {
                                console.error('Location__r is undefined in account:', account);
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: 'Error',
                                        message: 'Location is not present for the selected account.',
                                        variant: 'error'
                                    })
                                );
                            }
    
                             // Set ZSM, AGM, and DSM fields
                             this.zsm = account.ZSM__c;
                             console.log('zsm Name:', this.zsm);
                            //  this.creditTeam = account.DSM__c;
                            //  console.log('Credit Team Name:', this.creditTeam);
                            //  this.salesDirector = account.AGM__c;
                            //  console.log('Sales Director Name:', this.salesDirector);
    
    
                              // Call the getLedgerData method
                              getLedgerData({ accountId: this.accountId })
                              .then(result => {
                                  console.log('Result from getLedgerData:', result);
                                  for(let key in result){
                                    if(key == '0-15 Days' || key == '16-30 Days'){
                                        console.log('result 123',typeof(result['31-45 Days']));
                                        console.log('result 123',typeof(result['46-60 Days']));
                                        this.zeroToThirtydaysOutstanding = result['0-15 Days'] ?? 0 +result['16-30 Days'] ?? 0;
                                    }else if(key == '31-45 Days'){
                                        console.log('result 31-45',result[key]);
                                        this.thirtyOneToFourtyFivedaysOutstanding = result['31-45 Days'] ?? 0;
                                    }else if(key == '46-60 Days'){
                                        console.log('result 46-60',result[key]);
                                        this.FourtySixToSixtydaysOutstanding = result['46-60 Days'] ?? 0;
                                    }
                                    else if(key == '61-75 Days' || key == 'More than 75 Days'){
                                        console.log('result 456',result[key]);
                                        this.greaterThanNintydayssOutstanding = result['61-75 Days'] ?? 0 +result['More than 75 Days'] ?? 0;
                                    }
                                
                                  }
                                  
                              })
                              .catch(error => {
                                  console.error('Error fetching ledger data:', error);
                                  this.dispatchEvent(
                                      new ShowToastEvent({
                                          title: 'Error',
                                          message: 'Error fetching ledger data. Please try again.',
                                          variant: 'error'
                                      })
                                  );
                              });
     
                        } else {
                            console.error('No account details found for the selected account:', this.accountId);
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: 'Error',
                                    message: 'No account details found for the selected account.',
                                    variant: 'error'
                                })
                            );
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching account details:', error);
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Error',
                                message: 'Error fetching account details. Please try again.',
                                variant: 'error'
                            })
                        );
                    });
            }
    }

    handleProposedCreditLimitInputChange(event) {
        console.log('inside handle Limit:');
        const input = event.target;
        const inputValue = input.value;
    
        // Validate if the input matches the pattern
        if (!inputValue.match(/^\d+(\.\d{1,2})?$/)) {
            // Handle invalid input (e.g., display an error message)
            input.setCustomValidity('Please enter number upto two decimal places.');
        } else {
            // Clear any previous validation errors
            input.setCustomValidity('');
        }
    
        // Update proposedCreditLimit
        this.proposedCreditLimit = inputValue;
        console.log('Updated proposedCreditLimit:', this.proposedCreditLimit);
    
        // Update proposedRatio based on proposedCreditLimit
        if (this.proposedCreditLimit) {
            console.log('inside if of limit:');
           // this.proposedRatio = ((this.totalCreditLimit + this.currentSecurityDeposite) / parseFloat(this.proposedCreditLimit)).toFixed(2);
            this.proposedRatio = ((this.totalCreditLimit +  parseFloat(this.proposedCreditLimit)) / this.currentSecurityDeposite).toFixed(2);

        } else {
            console.log('inside else of limit:');
            this.proposedRatio = this.totalCreditLimit.toFixed(2);
        }
    
        console.log('Updated proposedRatio:', this.proposedRatio);
    }

    handleInputChange(event) {
        console.log('inside Input change');
        const field = event.target.label.toLowerCase().replace(/\s/g, '');
        this[field] = event.target.value;
        // Toggle mandatory field based on selected type
         this.isFinancialFieldRequired = this.type !== 'Additional';

          // Check the profile and type value to set showExpirationDate
          if ((this.profile[0].Name === 'Regional Sales Manager' || this.profile[0].Name === 'System Administrator' || this.profile[0].Name === 'Zonal Head'  || this.profile[0].Name === 'Zone Head' || this.profile[0].Name === 'Assistant General Manager' || this.profile[0].Name === 'Finance Team'  || this.profile[0].Name === 'Managing Director' || this.profile[0].Name === 'Chief Finance Officer') && this.type === 'Additional') {
            this.showExpirationDate = true;
            this.showCreditDays = false;
            this.showDiv =false;
            this.showDiv2 = true;
            this.showDiv3 =false;
            this.showDiv4 = false;
            this.showDoc = true;
            this.showDiv5 = true;
           // this.showProposedLimit =true;

        } else{
            this.showExpirationDate = false;
        }


        if ((this.profile[0].Name === 'Regional Sales Manager'  || this.profile[0].Name === 'System Administrator' || this.profile[0].Name === 'Zonal Head'  || this.profile[0].Name === 'Zone Head' || this.profile[0].Name === 'Assistant General Manager' ||this.profile[0].Name === 'Finance Team'  || this.profile[0].Name === 'Managing Director' || this.profile[0].Name === 'Chief Finance Officer') && this.type === 'Credit Days') {
            this.showCreditDays = true;
            this.showExpirationDate = false;
            this.showDiv =false;
            this.showDiv2 = true;
            this.showDiv3 = true;
            this.showDiv5 = true;
            this.showProposedLimit =false;
            this.showDoc = true;
            this.showDiv4 = true;
         }else{
            this.showCreditDays = false;
            this.showProposedLimit = true;
        }

        if ((this.profile[0].Name === 'Regional Sales Manager'  || this.profile[0].Name === 'System Administrator' || this.profile[0].Name === 'Zonal Head'  ||this.profile[0].Name === 'Zone Head' || this.profile[0].Name === 'Assistant General Manager' || this.profile[0].Name === 'Finance Team'  || this.profile[0].Name === 'Managing Director' || this.profile[0].Name === 'Chief Finance Officer') && this.type === 'Fixed') {
            this.showCreditDays = false;
            this.showExpirationDate = false;
            this.showDiv =true;
            this.showDiv2 = false;
            this.showDiv3 =false;
            this.showDiv4 = false;
            this.showDiv5 = true;
            this.showProposedLimit =true;
            this.showDoc = true;

         }
    }
    handleCreditDaysChange(event){
        this.creditDays = event.detail.value;
        console.log('credit days',this.creditDays);
    }

    handleStatusInputChange(event){
        
        this.status = event.detail.value;
        if(this.status == 'Approved'){
            if(this.profile[0].Name === 'Zone Head'){
                this.creditLimitStatus = 'Approved by ZSM ';
                this.creditLimitSubStatus = 'Pending at Credit Team';
            }
            else  if(this.profile[0].Name === 'Finance Team'){
                this.creditLimitStatus = 'Approved by Credit Team';
                this.creditLimitSubStatus = 'Pending at Credit Admin';
            }else if(this.profile[0].Name === 'Assistant General Manager'){
                this.creditLimitStatus = 'Approved by ZSM ';
                this.creditLimitSubStatus = 'Pending at Credit Team';
            }
            //else  if(this.profile[0].Name === 'System Admin'){
            //     this.creditLimitStatus = 'Approved by Sales Director';
            //     this.creditLimitSubStatus = 'Pending at Chief Finance Officer';
            //}
            else  if(this.profile[0].Name === 'Managing Director'){
                this.creditLimitStatus = 'Approved by Sales Director ';
                this.creditLimitSubStatus = 'Pending at CFO';
            }
            else if(this.profile[0].Name === 'Chief Finance Officer'){
                console.log('Inside Chief Finance Officer Profile');
               this.creditLimitStatus = 'Approved by Credit Admin';
                this.creditLimitSubStatus = 'Pending at Sales Director';
            }
        //    else if(this.profile[0].Name === 'Chief Finance Officer'){
        //         console.log('Inside Chief Finance Officer Profile');
        //        this.creditLimitStatus = 'Submitted';
        //         this.creditLimitSubStatus = 'Approved by CFO';
        //    }
        } else {
            if(this.profile[0].Name === 'Zone Head'){
                this.creditLimitStatus = 'Rejected';
                this.creditLimitSubStatus = 'Rejected by ZSM';
            }else  if(this.profile[0].Name === 'System Administrator'){
                this.creditLimitStatus = 'Rejected';
                this.creditLimitSubStatus = 'Rejected by Credit Team';
            }else  if(this.profile[0].Name === 'Finance Team'){
                this.creditLimitStatus = 'Rejected';
                this.creditLimitSubStatus = 'Rejected by Credit Team';
            }else  if(this.profile[0].Name === 'Managing Director'){
                this.creditLimitStatus = 'Rejected';
                this.creditLimitSubStatus = 'Rejected by Sales Director';
            }
            else  if(this.profile[0].Name === 'Chief Finance Officer'){
                this.creditLimitStatus = 'Rejected';
                this.creditLimitSubStatus = 'Rejected by CFO';
            }
            else  if(this.profile[0].Name === 'Assistant General Manager'){
                this.creditLimitStatus = 'Rejected';
                this.creditLimitSubStatus = 'Rejected by ZSM';
            }
        }
    }

    handleCurrentAssetsInputChange(event) {
        //this.currentAssets = event.target.value;
        const input = event.target;
       const inputValue = input.value;

        // Validate if the input matches the pattern
        if (!inputValue.match(/^\d+(\.\d{1,2})?$/)) {
            // Handle invalid input (e.g., display an error message)
            input.setCustomValidity('Please enter number upto two decimal places.');
        } else {
            // Clear any previous validation errors
            input.setCustomValidity('');
        }

        this.currentAssets = inputValue;
       
         // Recalculate currentRatio and workingCapital
         this.updateCalculations();
    }

    handleCurrentLiabilitiesInputChange(event) {
        //this.currentLiabilities = event.target.value;
        const input = event.target;
        const inputValue = input.value;
 
         // Validate if the input matches the pattern
         if (!inputValue.match(/^\d+(\.\d{1,2})?$/)) {
             // Handle invalid input (e.g., display an error message)
             input.setCustomValidity('Please enter number upto two decimal places.');
         } else {
             // Clear any previous validation errors
             input.setCustomValidity('');
         }
 
         this.currentLiabilities = inputValue;

         // Recalculate currentRatio and workingCapital
          this.updateCalculations();
    }

    handleCurrentRatioInputChange(event) {
        //this.currentRatio = event.target.value;
        const input = event.target;
        const inputValue = input.value;
 
         // Validate if the input matches the pattern
         if (!inputValue.match(/^\d+(\.\d{1,2})?$/)) {
             // Handle invalid input (e.g., display an error message)
             input.setCustomValidity('Please enter number upto two decimal places.');
         } else {
             // Clear any previous validation errors
             input.setCustomValidity('');
         }
 
         this.currentRatio = inputValue;

    }

    handleWorkingCapitalInputChange(event) {
        //this.workingCapital = event.target.value;
        const input = event.target;
        const inputValue = input.value;
 
         // Validate if the input matches the pattern
         if (!inputValue.match(/^\d+(\.\d{1,2})?$/)) {
             // Handle invalid input (e.g., display an error message)
             input.setCustomValidity('Please enter number upto two decimal places.');
         } else {
             // Clear any previous validation errors
             input.setCustomValidity('');
         }
 
         this.workingCapital = inputValue;
         
    }
   
    //update carrent ration and working capital
    updateCalculations() {
        if (this.currentAssets && this.currentLiabilities) {
            // Calculate currentRatio
            this.currentRatio = (this.currentLiabilities !== 0) 
                                ? (this.currentAssets / this.currentLiabilities).toFixed(2) 
                                : 'N/A'; // Avoid division by zero
    
            // Calculate workingCapital
            this.workingCapital = (this.currentAssets - this.currentLiabilities).toFixed(2);
    
            console.log('Updated currentRatio:', this.currentRatio);
            console.log('Updated workingCapital:', this.workingCapital);
        }
    }


    handleExpirationDateInputChange(event) {
        this.expirationDate = event.target.value;
    }

    handleFileSelection(event, fileCategory, description) {
        if (event.target.files.length > 0) {
            for (let i = 0; i < event.target.files.length; i++) {
                if (event.target.files[i].size > MAX_FILE_SIZE) {
                    // Handle file size exceeding limit
                    this.showToast('Error!', 'error', 'File size should not be greater than 1 MB.');
                    return;
                }
                
                let file = event.target.files[i];
                let reader = new FileReader();
    
                reader.onload = e => {
                    var fileContents = reader.result.split(',')[1];
                    
                    // Constructing the file name
                    let currentDate = new Date().toISOString().slice(0, 10); // Example: '2024-07-15'
                    let customerCode = this.erpCustomerCode; // Replace with actual customer code retrieval
                    let fileNameComponents = [
                        customerCode,
                        fileCategory, // FileType assumed to be part of fileCategory
                        currentDate,
                        file.name
                    ];
                    let fileName = fileNameComponents.join('-');
                    
                    // Pushing to the fileCategory array with additional description
                    this[fileCategory].push({ 
                        'fileName': fileName, 
                        'fileContent': fileContents,
                        'description': description
                    });
                    
                    // Show success message
                    this.showToast('Success', 'success', `${file.name} has been attached successfully`);
                };
    
                reader.readAsDataURL(file);
                // Read the file in chunks
             //  this.uploadFileInChunks(file, fileCategory, description);
            }
        }
    }
    
    handleSecurityChequeFileSelection(event) {
        const description = event.target.name; // Get the name attribute of the lightning-input
        this.handleFileSelection(event, 'securityChequeFiles', description);
    }

    handleLimitRequestFileSelection(event) {
        const description = event.target.name; // Get the name attribute of the lightning-input
        this.handleFileSelection(event, 'limitRequestFiles', description);
    }

    handleFinancialFileSelection(event) {
        const description = event.target.name; // Get the name attribute of the lightning-input
        this.handleFileSelection(event, 'financialFiles', description);
    }
    
    handleCheckboxChange(event) {
        this.isChecked = event.target.checked;
        console.log('Is Security Check Already Uploaded:', this.isChecked);    }

    // handleFileSelection(event, fileCategory, description) {
    //     if (event.target.files.length > 0) {
    //         for (let i = 0; i < event.target.files.length; i++) {
    //             let file = event.target.files[i];
    
    //             if (file.size > MAX_FILE_SIZE) {
    //                 this.showToast('Error!', 'error', 'File size should not be greater than 5 MB.');
    //                 return;
    //             }
    
    //             // Read the file in chunks
    //             //this.uploadFileInChunks(file, fileCategory, description);
    //         }
    //     }
    // }
    
    // // handleFileSelection(event, fileCategory, description) {
    // //     if (event.target.files.length > 0) {
    // //         for (let i = 0; i < event.target.files.length; i++) {
    // //             let file = event.target.files[i];
    
    // //             if (file.size > MAX_FILE_SIZE) {
    // //                 this.showToast('Error!', 'error', 'File size should not be greater than 5 MB.');
    // //                 return;
    // //             }
    
    // //             // Read the file in chunks and upload
    // //             this.uploadFileInChunks(file, fileCategory, description);
    // //         }
    // //     }
    // // }
    
    // // uploadFileInChunks(file, fileCategory, description) {
    // //     let reader = new FileReader();
    // //     let start = 0;
    // //     let chunkIndex = 0;
    // //     let totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    // //     let fileName = file.name;
    // //     let customerCode = this.erpCustomerCode || "CUSTOMER"; // Replace with actual customer code
    // //     let currentDate = new Date().toISOString().slice(0, 10);
    // //     console.log('totalchunks',totalChunks);
    // //     // Construct a unique file name
    // //     let fileNameComponents = [
    // //         customerCode,
    // //         fileCategory,
    // //         currentDate,
    // //         fileName,
    // //     ];
    // //     let constructedFileName = fileNameComponents.join('-');
    
    // //     const uploadChunk = () => {
    // //         if (start < file.size) {
    // //             console.log('inside upload chunks');
    // //             let chunk = file.slice(start, start + CHUNK_SIZE);
    
    // //             reader.onload = (e) => {
    // //                 let fileContent = e.target.result.split(',')[1]; // Base64 data
    
    // //                 // Prepare parameters for server
    // //                 let params = {
    // //                     fileName: constructedFileName,
    // //                     fileContent: fileContent,
    // //                     fileCategory: fileCategory,
    // //                     description: description,
    // //                     chunkIndex: chunkIndex,
    // //                     totalChunks: totalChunks,
    // //                 };
    
    // //                 // Call Apex method
    // //                 uploadChunkToServer({
    // //                     recordId: this.recordId, // Pass recordId dynamically
    // //                     fileName: params.fileName,
    // //                     fileContent: params.fileContent,
    // //                     description: params.description,
    // //                     chunkIndex: params.chunkIndex,
    // //                     totalChunks: params.totalChunks,
    // //                 })
    // //                 console.log('uploadchunkToerver',uploadChunkToServer)
    // //                     .then((result) => {
    // //                         this.showToast('Info', 'info', `Chunk ${chunkIndex + 1} of ${totalChunks} uploaded successfully.`);
    // //                         chunkIndex++;
    // //                         start += CHUNK_SIZE;
    // //                         uploadChunk(); // Proceed to the next chunk
    // //                     })
    // //                     .catch((error) => {
    // //                         console.error('Error uploading chunk:', error);
    // //                         this.showToast('Error', 'error', 'Error uploading file chunk.');
    // //                     });
    // //             };
    
    // //             reader.readAsDataURL(chunk); // Read the chunk
    // //         } else {
    // //             // All chunks uploaded
    // //             this.showToast('Success', 'success', `${fileName} has been uploaded successfully.`);
    // //         }
    // //     };
    
    // //     // Start uploading chunks
    // //     uploadChunk();
    // // }
    
    // handleSecurityChequeFileSelection(event) {
    //     const description = event.target.name; // Get the name attribute of the lightning-input
    //     this.handleFileSelection(event, 'securityChequeFiles', description);
    // }
    
    // handleLimitRequestFileSelection(event) {
    //     const description = event.target.name; // Get the name attribute of the lightning-input
    //     this.handleFileSelection(event, 'limitRequestFiles', description);
    // }
    
    // handleFinancialFileSelection(event) {
    //     const description = event.target.name; // Get the name attribute of the lightning-input
    //     this.handleFileSelection(event, 'financialFiles', description);
    // }

    
    removeReceiptImage(event) {
        const index = event.currentTarget.dataset.id;
        const fileType = event.currentTarget.dataset.type;
        const removedFile = this[fileType + 'Files'][index].fileName;
        this[fileType + 'Files'].splice(index, 1);
        this.showToast('Success', 'success', `${removedFile} has been removed succesfully.`);
        // this.showToast('Success', 'success', `${removedFile} has been removed. from ${fileType.replace(/([A-Z])/g, ' $1').trim()}`);
    }
    
    handleResetForm() {
        this.accountName = 0;
        this.accountId = 0;
        this.location = ''; 
        this.locationId = '';
        this.type = '';
        this.currentCreditLimit = '';
        this.totalCreditLimit = '';
        this.currentOutStanding = '';
        this.doc = '';
        this.currentSecurityDeposite = '';
        this.currentRatio1 = '';
        this.proposedRatio = '';
        this.salesCollectionData = '';
        this.paymentTrendsData = '';
        this.zeroToThirtydaysOutstanding = '';
        this.FourtySixToSixtydaysOutstanding = '';
        this.thirtyOneToFourtyFivedaysOutstanding = '';
        this.greaterThanNintydayssOutstanding = '';
        this.expirationDate ='';
        this.creditDays = '';
        this.proposedCreditLimit = '';
        this.comments ='';
        this.description = '';
         // Clear the file arrays
        this.securityChequeFiles = [];
        this.limitRequestFiles = [];
        this.financialFiles = [];
        this.handleRemoveAccount;


    }

    
    handleSubmit() {
        console.log('inside Submit');
        this.showLoading = true; 
        console.log('inside Submit 1');
        this.isSubmitDisabled = true;
        if (this.profile[0].Name === 'Finance Team')  {
            console.log('inside toast if');

            //this.showLoading = true;
            // Validate again before submitting (in case user bypasses the disabled state)
            if (this.currentAssets === null || this.currentAssets === undefined || !/^\d+(\.\d{1,2})?$/.test(this.currentAssets)) {
                // Show toast message for invalid currentAssets
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Please enter a number up to two decimal places.',
                        variant: 'error',
                    })
                );
                this.showLoading = false;
                this.isSubmitDisabled = false;
                return;
            }

            // Validate again before submitting (in case user bypasses the disabled state)
            if (this.currentLiabilities === null || this.currentLiabilities === undefined || !/^\d+(\.\d{1,2})?$/.test(this.currentLiabilities)) {
                console.error('Invalid input. Please enter a number with up to two decimal places.');
                
                // Show toast message for invalid currentLiabilities
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Please enter a number up to two decimal places.',
                        variant: 'error',
                    })
                );
                
                this.showLoading = false;
                this.isSubmitDisabled = false;
                return;
            }

            // // Validate again before submitting (in case user bypasses the disabled state)
            // if (!this.workingCapital.match(/^\d+(\.\d{1,2})?$/)) {
            //    // Show toast message prompting the user to change the status to Approve or Reject
            //    this.dispatchEvent(
            //     new ShowToastEvent({
            //         title: 'Error',
            //         message: 'Please enter number upto two decimal places.',
            //         variant: 'error',
            //     })
            // );
            // this.showLoading = false;
            // this.isSubmitDisabled = false;
            //     return;
            // }

            // // Validate again before submitting (in case user bypasses the disabled state)
            // if (!this.currentRatio.match(/^\d+(\.\d{1,2})?$/)) {
            //     console.error('Invalid input. Please enter number with up to two decimal places.');
            //     // Show toast message prompting the user to change the status to Approve or Reject
            //     this.dispatchEvent(
            //         new ShowToastEvent({
            //             title: 'Error',
            //             message: 'Please enter number upto two decimal places.',
            //             variant: 'error',
            //         })
            //     );
            //     this.showLoading = false;
            //     this.isSubmitDisabled = false;
            //     return;
            // }


            if (this.creditLimitStatus == 'Pending') {
                console.log('inside Pending');
                // Show toast message prompting the user to change the status to Approve or Reject
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Please approve or reject record.',
                        variant: 'error',
                    })
                );
                this.isSubmitDisabled = false;
                this.showLoading = false;
                return;
            }


        }

        if (this.type === 'Additional') {
            console.log('inside toast if');
            if (this.profile[0].Name === 'Regional Sales Manager') {
                let showError = false;
                let errorMessage = '';
        
                // Check if expirationDate is null, undefined, or empty
                if (!this.expirationDate || this.expirationDate.trim() === '') {
                    showError = true;
                    errorMessage += 'Expiration date is required. ';
                }
        
                // Check if proposedCreditLimit is null, undefined, or 0
                if (this.proposedCreditLimit == null || this.proposedCreditLimit == undefined || this.proposedCreditLimit == 0) {
                    showError = true;
                    errorMessage += 'Proposed amount is required.';
                }
        
                if (showError) {
                    console.log('inside Additional');
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: errorMessage,
                            variant: 'error',
                        })
                    );
                    this.showLoading = false;
                    this.isSubmitDisabled = false;
                    return;
                }
            }
        }
        
        if (this.type === 'Credit Days') {
            console.log('inside toast if');
            if (this.profile[0].Name === 'Regional Sales Manager') {
                if (this.creditDays == '' || this.creditDays == null || this.creditDays == undefined){
                console.log('inside Credit Days');
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Credit Days is requied when type is Credit Days.',
                        variant: 'error',
                    })
                );
                this.showLoading = false;
                this.isSubmitDisabled = false;
                return;
            }
        }
        }

        if (this.type === 'Fixed') {
            console.log('inside toast if');
            if (this.profile[0].Name === 'Regional Sales Manager') {
                if (this.proposedCreditLimit == '' || this.proposedCreditLimit == null || this.proposedCreditLimit == undefined || this.proposedCreditLimit == 0){
                console.log('inside Fixed');
                this.showLoading = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Proposed amount is required when type is Fixed.',
                        variant: 'error',
                    })
                );
                this.isSubmitDisabled = false;
                return;
            }
        }
        }

        if (this.accountId == '' || this.accountId == null || this.accountId == undefined) {
            console.log('inside toast if');
            if (this.profile[0].Name === 'Regional Sales Manager') {
                console.log('inside toast if 2');
                this.showLoading = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Please select dealer.',
                        variant: 'error',
                    })
                );
                this.isSubmitDisabled = false;
                return;
            }
        }

        if (this.accountId && (this.location == '' || this.location == null || this.location == undefined)) {
            console.log('inside toast if');
            if (this.profile[0].Name === 'Regional Sales Manager') {
                console.log('inside toast if 2');
                this.showLoading = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Selected Dealer Should have some location.',
                        variant: 'error',
                    })
                );
                this.isSubmitDisabled = false;
                return;
            }
        }

        if(!this.isChecked){
        // Check if Security Cheque files are selected
        if (!this.securityChequeFiles || this.securityChequeFiles.length === 0) {
            if (this.profile[0].Name === 'Regional Sales Manager') {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please select at least one file for Security Cheque.',
                    variant: 'error',
                })
            );
            this.showLoading = false;
            this.isSubmitDisabled = false;
            return;
        }
        }
    }

        
         // Check if Security Cheque files are selected
         if (!this.limitRequestFiles || this.limitRequestFiles.length === 0) {
            if (this.profile[0].Name === 'Regional Sales Manager') {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please select at least one file for Limit Request Letter.',
                    variant: 'error',
                })
            );
            this.showLoading = false;
            this.isSubmitDisabled = false;
            return;
        }
        }
    

        if (this.isFinancialFieldRequired) {
            console.log('isFinancialFieldRequired:', this.isFinancialFieldRequired);
            console.log('financialFiles:', this.financialFiles);
            console.log('Profile Name:', this.profile[0]?.Name);
        
            if (!this.financialFiles || this.financialFiles.length === 0) {
                if (this.profile[0]?.Name === 'Regional Sales Manager') {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: 'Please select at least one file for Financials for Last 2 Year (Audited).',
                            variant: 'error',
                        })
                    );
                    this.showLoading = false;
                    this.isSubmitDisabled = false;
                    return;
                }
            }
        }
        

        if(this.profile[0].Name === 'Regional Sales Team'){
                // Validate again before submitting (in case user bypasses the disabled state)
                if (!this.proposedCreditLimit.match(/^\d+(\.\d{1,2})?$/)) {
                    console.error('Invalid input. Please enter number with up to two decimal places.');
                    return;
                }
        }

       if(this.profile[0].Name === 'Finance Team'){
        console.log('inside finance team')
        
        }
        
        console.log('inside Handle Submit change');
        const changeRequestWrapper = {
            id: this.recordId ? this.recordId.replace('/', '') : null, // Ensure recordId is included for update
            dealerName: this.accountId,
            zsm :this.zsm,
            proposedCreditLimit: parseFloat(this.proposedCreditLimit),
            location: this.locationId,
            doc: this.doc,
            type: this.type,
            creditDays:this.creditDays,
            expirationDate: this.expirationDate,
            comments: this.comments,
            currentAssets: parseFloat(this.currentAssets),
            currentLiabilities: parseFloat(this.currentLiabilities),
            currentRatio: parseFloat(this.currentRatio),
            workingCapital: parseFloat(this.workingCapital),
            recordType: 'Credit Limit Proposal',
            creditLimitStatus: this.creditLimitStatus,
            creditLimitSubStatus : this.creditLimitSubStatus
        };
        console.log('credit days',this.creditDays);
        console.log('currentLiabilties',this.currentLiabilities);

        const allFilesData = [
            ...this.securityChequeFiles,
            ...this.limitRequestFiles,
            ...this.financialFiles
        ];
       // this.showLoading = true; 
         // Check for existing file IDs and exclude those from being re-uploaded
         const newFilesData = allFilesData.filter(file => !this.existingFileIds.includes(file.id));
        saveChangeRequest({ wrap: changeRequestWrapper, filedata: JSON.stringify(newFilesData) })
            .then(result => {
                if (result.includes('Success')) {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Credit Limit Proposal record saved successfully',
                            variant: 'success'
                        })
                    );
                    this.navigateToViewChangeRequestPage(result.replace('Success',''));
                    // Call processRecord method if status is Approved or Rejected
                    if (this.status === 'Approved' || this.status === 'Rejected') {
                        this.processApprovalOrRejection();
                    }
                    this.handleResetForm();
                } else {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: result,
                            variant: 'error'
                        })
                    );
                }
                this.isSubmitDisabled = false;
               // this.showSpinner = false;
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body ? error.body.message : 'Unknown error',
                        variant: 'error'
                    })
                );
            })
          //  this.showLoading = false;
           
            
          
    }

    processApprovalOrRejection() {
        console.log('inside approval method:');
        const approvalStatus = this.status === 'Approved' ? 'Approve' : 'Reject';
        const recordIds = [this.recordId]; // Assuming this.recordId is the record you want to process

        processRecord({ records: JSON.stringify(recordIds), status: approvalStatus, comment: this.status + ' Successfully' })
        .then(result => {
            console.log('Approval process result:',JSON.stringify(result));
            let successMessage = '';
            if (this.status === 'Approved') {
                successMessage = 'Record is approved successfully';
            } else if (this.status === 'Rejected') {
                successMessage = 'Record is rejected successfully';
            }
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: successMessage,
                    variant: 'success'
                })
            );
        })
            .catch(error => {
                console.error('Error in approval process:', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error in approval process',
                        message: error.body ? error.body.message : 'Unknown error',
                        variant: 'error'
                    })
                );
            });
    }

    showToast(title, variant, message) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }

    navigateToViewChangeRequestPage(result) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: result,
                objectApiName: 'YIN_Change_Request__c',
                actionName: 'view'
            },
        });
    }

    handleCancelClick() {
        console.log('inside cancel click')
       // window.close();
        this[NavigationMixin.Navigate]({
         type: 'standard__objectPage',
         attributes: {
             objectApiName: 'YIN_Change_Request__c',
             actionName: 'home',
         },
     });
    }
    
}