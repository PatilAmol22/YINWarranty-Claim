/**
 * @description       : Reusable Bar Chart Component.
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : SKI
 * @last modified on  : 10-06-2024
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
**/

import { LightningElement, api } from 'lwc';
import chartjs from '@salesforce/resourceUrl/ChartJS';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'; 
export default class YinReusableBarChartCmp extends LightningElement {
    @api chartConfig; 
    isChartJsInitialized;
    renderedCallback() {
        if (this.isChartJsInitialized) {
            return;
        }
        Promise.all([loadScript(this, chartjs)])
        .then(() => {
            this.isChartJsInitialized = true;
            const ctx = this.template.querySelector('canvas.barChart').getContext('2d');
            this.chart = new window.Chart(ctx, JSON.parse(JSON.stringify(this.chartConfig)));
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading Chart',
                    message: error.message,
                    variant: 'error',
                })
            );
        });
    }
}