/**
 * @description       : To display Multiple Badges on the page that can be shown based on ERPCustomerCode.
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : SKI
 * @last modified on  : 12-12-2024
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
**/
import { LightningElement,api,wire,track } from 'lwc';

import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import customcss from '@salesforce/resourceUrl/resourceOrderMangmt';

import warranty from '@salesforce/resourceUrl/warranty';
import trophy from '@salesforce/resourceUrl/trophy';
import shield from '@salesforce/resourceUrl/shield';
import money from '@salesforce/resourceUrl/money';
import deadline from '@salesforce/resourceUrl/deadline';
import wallet from '@salesforce/resourceUrl/wallet';
import bootstrapmin3 from '@salesforce/resourceUrl/bootstrapmin3';
/* import bootstrap5 from '@salesforce/resourceUrl/bootstrap5';
import bootstrap4 from '@salesforce/resourceUrl/bootstrap4'; */
import line from '@salesforce/resourceUrl/line';

import dashboardData from '@salesforce/apex/YinDealerDashboardController.dashboardData';

export default class YinBadges extends LightningElement {

warranty=warranty; 
trophy=trophy;
shield=shield;
money=money;
deadline=deadline;
wallet=wallet;

@track warranty1 = 0;
@track tyres = 0;
@track securityDeposit = 0;
@track outstanding = 0;
@track overdue = 0;
@track availableCreditLimit = 0;

async connectedCallback(){
    await this.fetchDashboardData();
    console.log('111:',  this.fetchDashboardData);
}

renderedCallback() {
    // Promise.all([
    //     loadStyle(this, customcss),
    //     loadStyle(this, bootstrapmin3),
    //     /* loadStyle(this, bootstrap5),
    //     loadStyle(this, bootstrap4), */
    //     loadStyle(this, line)
    //     ]);
    if (this.stylesLoaded) return;
        this.stylesLoaded = true;

        Promise.all([
            loadStyle(this, customcss), 
            loadStyle(this, bootstrapmin3), 
            loadStyle(this, line) 
        ])
        .then(() => {
            console.log('Styles Loaded Successfully');
        })
        .catch(error => {
            console.error('Error loading styles: ', error);
        });
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
        loadStyle(this, customcss + '/resource/Fontawesome/css/regular.css'),
        
    ]).then(() => {});
}

fetchDashboardData() {
    const values = ['Number Of Tyres', 'Number of Warranty', 'Security Deposit', 'Outstanding', 'Available Credit Limit', 'Overdue'];
    values.forEach(value => {
        dashboardData({ Value: value })
            .then(result => {
                if (value == 'Number of Warranty') {
                  
                    if(result){
                        this.warranty1 = result;
                        console.log('variable01:', this.warranty1);
                    }else{
                        this.warranty1 = 0;
                    }
                    console.log('variable1:', this.warranty1);
                } else if (value == 'Number Of Tyres') {
                    if(result){
                        this.tyres = result;
                    }else{
                        this.tyres = 0;
                    }
                    console.log('variable2:', this.tyres);
                } else if (value == 'Security Deposit') {
                    if(result){
                        this.securityDeposit = Math.round(result).toLocaleString();
                    }else{
                        this.securityDeposit = 0;
                    }
                    console.log('variable3:', this.securityDeposit);
                } else if (value == 'Outstanding') {
                    if(result){
                        this.outstanding = result;
                    }else{
                        this.outstanding = 0;
                    }
                    console.log('variable4:', this.outstanding);
                } else if (value == 'Available Credit Limit') {
                    if(result){
                        this.availableCreditLimit = Math.round(result).toLocaleString();
                    }else{
                        this.availableCreditLimit = 0;
                    }
                    console.log('variable5:', this.availableCreditLimit);
                } else if (value == 'Overdue') {
                    if(result){
                        this.overdue = result;
                    }else{
                        this.overdue = 0;
                    }
                    console.log('variable6:', this.overdue);
                }
            })
            .catch(error => {
                console.error(`Error fetching ${value} data: `, error);
            });
    });
}

/*async fetchDashboardData() {
    console.log('fetchDashboardData:',  this.fetchDashboardData);
    const values = ['Booster Tyres', 'Achieved', 'Security Deposit', 'Outstanding', 'Available Credit Limit', 'Overdue'];
       let data =  await dashboardData({ Value: values });
       let result = JSON.parse(data);
       console.log('result:', result);

            if (values == 'Booster Tyres') {
                this.boosterTyres = result;
                console.log('variable1:', this.boosterTyres);
            } else if (values == 'Achieved') {
                this.achieved = result;
                console.log('variable2:', this.achieved);
            } else if (values == 'Security Deposit') {
                this.securityDeposit = result;
                console.log('variable3:', this.securityDeposit);
            } else if (values == 'Outstanding') {
                this.outstanding = result;
                console.log('variable4:', this.outstanding);
            } else if (values == 'Available Credit Limit') {
                this.availableCreditLimit = result;
                console.log('variable5:', this.availableCreditLimit);
            } else if (values == 'Overdue') {
                this.overdue = result;
                console.log('variable6:', this.overdue);
            }
}*/

}