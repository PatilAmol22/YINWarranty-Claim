/**
 * @description       : YIN Ledger Invoice Data-Table Component
 * @author            : Satish Tiware/satish.tiware@skinternational.com
 * @group             : SKI
 * @created date      : 11-09-2024
 * @last modified on  : 11-09-2024
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
 * Modifications Log
 * Ver   Date         Author                                            Modification
 * 1.0   10-09-2024   Satish Tiware/satish.tiware@skinternational.com   Initial Version
**/
import { LightningElement,track,api} from 'lwc';
import getLedger from '@salesforce/apex/YINLedgerDataTableController.getLedger';
import getLedgerRec from '@salesforce/apex/YINLedgerDataTableController.getLedgerRec';
import getExperienceUserProfiles from '@salesforce/apex/YINLedgerDataTableController.getExperienceUserProfiles';
import getCurrentUser from '@salesforce/apex/YINLedgerDataTableController.getCurrentUser';
import getExperienceUserAccount from '@salesforce/apex/YINLedgerDataTableController.getExperienceUserAccount';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import generatePdf from '@salesforce/apex/YINLedgerDataTableController.generatePdf';
import generateCSV from '@salesforce/apex/YINLedgerDataTableController.generateCSV';
import { NavigationMixin } from 'lightning/navigation';

export default class YinLedgerDataTableCmp  extends NavigationMixin(LightningElement) {

    @track isModalOpen = false; 
    @track selectedDocNo = ''; 

    @track columns =[
        {label : 'Posting Date', fieldName : 'PostingDate',sortable: "true"},
        //{label : 'Document Number', fieldName : 'DocNo',sortable: "true"},
        //Added By Amol Patil(Start)
        {
            label: 'Document Number', 
            fieldName: 'DocNo', 
            type: 'button', 
            sortable: "true", 
            typeAttributes: { 
                label: { fieldName: 'DocNo' }, 
                variant: 'base', 
                name: 'viewDoc',
                disabled: { fieldName: 'isDisabled' },
            }
           
        },
        //Added By Amol Patil (END)
        {label : 'External Document Number', fieldName : 'ExDocNumber',sortable: "true"},
        {label : 'Description', fieldName : 'Descrp',sortable: "true"},
        {label : 'Cheque No.', fieldName : 'ChequeNo',sortable: "true"},
        {label : 'Credit Amount', fieldName : 'CredAmt',sortable: "true"},
        {label : 'Debit Amount', fieldName : 'DebAmt',sortable: "true"},
        
    ];
    @track startDate ='';
    @track endDate ='';
    @api recordId;
    @track recordList;
    @track paginatedData;
    @track isLoading = false;
    @track showError;
    experienceUserProfiles = [];
    user = {};
    IsCommunityUser = false;
    @track ContentDocumentId;
    sortedBy;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
   
    
    async connectedCallback() {

        this.isLoading = true;
  
        this.experienceUserProfiles = await getExperienceUserProfiles();
        this.user = await getCurrentUser();
        console.log(' USer ',JSON.stringify(this.user));
  
        this.IsCommunityUser = this.experienceUserProfiles?.includes(this.user?.Profile?.Name);
        console.log('Is Community',this.IsCommunityUser);
        if(this.IsCommunityUser){
            this.recordId = await getExperienceUserAccount();
            console.log('Account Id:', this.recordId);
        }
        getLedgerRec({dealerId:this.recordId})
            .then(data => {
                
        console.log('Data  ',data);
  
        if (data) {
            console.log('Data  ',data);
            let tempData =[];
            // Assuming your date field is named 'createdDate'
            data.forEach((ele) => {
            let obj = {
                DocNo : ele.Document_Number__c,
                CredAmt : ele.Credit_Amount__c,
                DebAmt : ele.Debit_Amount__c,
                DealerName : ele.Dealer_Code__r.Name,
                Amt: ele.Amount__c,
                ChequeNo : ele.Cheque_Number__c,
                ChequeDate : ele.Cheque_Date__c,
                ExDocNumber : ele.External_Document_Number__c,
                PostingDate : ele.Posting_Date__c,
                DocType : ele.Document_Type__c,  //Added By Amol Patil
                isDisabled: ele.Document_Type__c != 'Invoice' //Added By Amol Patil
            };
           tempData.push(obj);
            });
           
            this.recordList = tempData;
           
            this.isLoading = false;
        }
        else if (error) {
            this.error = error;
            this.isLoading = false;
        }
      })
            .catch(error => {
                this.error = error;
                this.isLoading = false;
            });

            this.data = this.data.map(row => {
                return {
                    ...row,
                    isDisabled: row.DocType !== 'Invoice', 
                    DocNoLink: row.DocType === 'Invoice' ? row.DocNo : '' 
                };
            });
        
    }

    handleChangeAction(event){
 
        console.log('In handleChange');
        if(event.target.name == 'StartDate'){
            this.startDate= event.target.value;
            window.console.log('StartDate ##' + this.startDate);
        }
 
        if(event.target.name == 'EndDate'){
            this.endDate = event.target.value;  
            this.validateEndDate();
            window.console.log('EndDate ##' + this.endDate);
        }
    }

        validateEndDate() {
            const today = new Date().toISOString().split('T')[0];
      
            if (this.endDate > today) {
                this.showError = true;
            } else {
                this.showError = false;
            }
        }

        

    searchAction(){

        let date1cmp = this.template.querySelector(".stDate");
        let date2cmp = this.template.querySelector(".edDate");
        let date1value = date1cmp.value;
         let date2value = date2cmp.value;

         if (!date1value) {
            date1cmp.setCustomValidity("Start Date required");
          } else {
            date1cmp.setCustomValidity("");
          }
          date1cmp.reportValidity();
    
    
          if (!date2value) {
            date2cmp.setCustomValidity("End Date required");
          } else {
            date2cmp.setCustomValidity("");
          }
          date2cmp.reportValidity();

          if(date1value && date2value){;
            this.getRecord();
          }

    }

    getRecord(){

        if(this.startDate > this.endDate){

            console.log('In error');
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'End date cannot be earlier than the start date.',
                    variant: 'error',
                })
            );

            

        }
        else{
            this.isLoading = true;

            

            getLedger({dealerId:this.recordId,dateStr1:this.startDate,dateStr2:this.endDate})
  
            .then(result=>{

              let tempData =[];
        
          result.forEach((ele) => {
          let obj = {
              DocNo : ele.Document_Number__c,
              CredAmt : ele.Credit_Amount__c,
              DebAmt : ele.Debit_Amount__c,
              DealerName : ele.Dealer_Code__r.Name,
              Amt: ele.Amount__c,
              ChequeNo : ele.Cheque_Number__c,
              ChequeDate : ele.Cheque_Date__c,
              ExDocNumber : ele.External_Document_Number__c,
              PostingDate : ele.Posting_Date__c,
              DocType : ele.Document_Type__c,
              isDisabled: ele.Document_Type__c !== 'Invoice',
              
           
         };
         tempData.push(obj);
          });
         
          this.recordList = tempData;
          console.log('Data Size:',this.recordList);
          this.isLoading = false;
         

              setTimeout(() => {

                
                this.paginatedData = this.recordList;
                        
              }, 200);

              
        }) 
        }
    }

    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }
    
    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.recordList));
        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };
        // cheking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;
        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        this.recordList = parseData;
    }    


    handlePaginationAction(event){
        setTimeout(() => {
         console.log('curret Page ',event.detail.currentPage);
         this.paginatedData = event.detail.values;
      }, 200);
      }

    // this method validates the data and creates the csv file to download
    downloadCSVFile() {

        

        if(this.startDate && this.endDate){  
            console.log('In Download:');
            console.log('StartDate-->:', this.startDate);
            console.log('endDate-->:', this.endDate);
           let strStartDate = this.startDate;
           let strEndDate = this.endDate;
           generateCSV({dealerId:this.recordId,datestr1:String(strStartDate),datestr2:String(strEndDate),typestr:'Ledger'})
                .then(data => {
                    let file = data;
    
                    file = JSON.parse(JSON.stringify(file));
        console.log('File==>',file);
        this.ContentDocumentId = file;
        console.log('ContentId==>',this.ContentDocumentId);
    
        console.log('In Download');
           
            console.log('File==>',file);
          let baseUrl = this.getBaseUrl();
          let downloadURL = baseUrl+'sfc/servlet.shepherd/version/download/'+file;
         
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: downloadURL
                }
            }, false 
        );
    
                }).catch(error=>
                    {
            
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Error',
                                message: error.body.message,
                                variant: 'error',
                            })
                        );
            
                    
            
                })
               
        }
        
        else{
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please Select Start Date & End Date.',
                    variant: 'error',
                })
            );
        }
       

        
    }


    getBaseUrl(){
        let baseUrl = 'https://'+location.host+'/';
        return baseUrl;
    }

    downloadData(){
        if(this.startDate && this.endDate){  
        console.log('In Download:');
        console.log('StartDate-->:', this.startDate);
        console.log('endDate-->:', this.endDate);
       let strStartDate = this.startDate;
       let strEndDate = this.endDate;
        generatePdf({dealerId:this.recordId,datestr1:String(strStartDate),datestr2:String(strEndDate),typestr:'Ledger'})
            .then(data => {
                let file = data;

                file = JSON.parse(JSON.stringify(file));
    console.log('File==>',file);
    this.ContentDocumentId = file;
    console.log('ContentId==>',this.ContentDocumentId);

    console.log('In Download');
       
        console.log('File==>',file);
      let baseUrl = this.getBaseUrl();
      let downloadURL = baseUrl+'sfc/servlet.shepherd/version/download/'+file;
     
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: downloadURL
            }
        }, false 
    );

            }).catch(error=>
                {
        
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: error.body.message,
                            variant: 'error',
                        })
                    );
        
                
        
            })
          
    }
    
    else{
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: 'Please Select Start Date & End Date.',
                variant: 'error',
            })
        );
    }
}

//Added by Amol on 10 Sept 24
handleRowAction(event) {
    const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName == 'viewDoc' && row.DocType == 'Invoice') {
            this.selectedDocNo = row.DocNo;
            this.isModalOpen = true;
        }
    
}

closeModal() {
    this.isModalOpen = false;
}
    
}