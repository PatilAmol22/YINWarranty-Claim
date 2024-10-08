/**
 * @description       : Dealer DashBoard.
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : SKI.
 * @last modified on  : 05-09-2024
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
**/
import { LightningElement,api,track,wire } from 'lwc';

import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import customcss from '@salesforce/resourceUrl/resourceOrderMangmt';
import yinBanner from '@salesforce/resourceUrl/yinBanner';
//import ProfitabilityIMG from '@salesforce/resourceUrl/ProfitablityIMG';
import dashboardBarChartData from '@salesforce/apex/YinDashBoardBarChartController.dashboardBarChartData';
import yinDashborad from '@salesforce/resourceUrl/yinDashborad';

export default class YinDB extends LightningElement {

yinBanner=yinBanner;
yinDashborad=yinDashborad;

// @track ProfitabilityIMG;

// connectedCallback(){
//     this.ProfitabilityIMG = `${ProfitabilityIMG}#logo`;
// }


renderedCallback(){
    // Ensure CSS loads only one time
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

chartConfiguration;
@wire(dashboardBarChartData)
dashboardBarChart({ error, data }) {
if (error) {
    this.error = error;
    this.chartConfiguration = undefined;
} else if (data) {
    console.log('Data barchcharct:', JSON.stringify(data));
    let chartcreditNotesData = data.creditNotes.map(amount => (amount / 100000).toFixed(2));
    let chartsalesTyresData = data.salesTyres.map(amount => (amount / 100).toFixed(2));
    let quartersAndYear = data.quartersAndYear; // X Axis Values
    
    this.chartConfiguration = {
        type: 'bar',
        data: {
            datasets: [{
                label: 'Credit Note',
                backgroundColor: "#e41e26",
                data: chartcreditNotesData,
                yAxisID: 'y-axis-1', 
            },{
                label: 'Per Tyre Earning',
                backgroundColor: "#333333",
                data: chartsalesTyresData,
                yAxisID: 'y-axis-2', 
            }],
            labels: quartersAndYear,
        },
        options: {
            responsive: true,
                legend: {
                  position: 'bottom',
                },
                
            scales: {
                yAxes: [
                    {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        id: 'y-axis-1',
                        gridLines: {
                            display: false
                        },
                        labels:  {
                            show: true
                        },
                        scaleLabel: {  
                            display: true,
                            labelString: 'Credit Note (In Lakh)' 
                          }
                          
                    },
                    {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        id: 'y-axis-2',
                        gridLines: {
                            display: false
                        },
                        labels: {
                            show: true
                        },
                        scaleLabel: {  
                            display: true,
                            labelString: 'Per Tyre Earning (In ₹)'

                        }
                    }
                ]
            },
        }
    };
    console.log('data => ', data);
    this.error = undefined;
}
}

// formatToLac(value) {
//     return (value / 100000).toFixed(2); 
// }

formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

}