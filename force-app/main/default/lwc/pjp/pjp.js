/* eslint-disable radix */
/* eslint-disable no-undef */
/* eslint-disable no-new-object */
/* eslint-disable no-console */
import { LightningElement, api, track, wire } from "lwc";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import WindowDate from '@salesforce/label/c.WindowDate';
import { refreshApex } from '@salesforce/apex';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
// //import FullCalendarJS from '@salesforce/resourceUrl/FullCalendarJS';
import getAccountData from '@salesforce/apex/YINPJPServiceImpl.getAccountList';
import getFilter1 from '@salesforce/apex/YINPJPServiceImpl.getFilterList1';
import saveAsDraft from '@salesforce/apex/YINPJPServiceImpl.saveAsDraft';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import CITY_FIELD from '@salesforce/schema/Account.Type';
//import getArea from '@salesforce/apex/YINPJPServiceImpl.getArea';
import getuser from '@salesforce/apex/YINPJPServiceImpl.getUser';
import getDSMMUser from '@salesforce/apex/YINPJPServiceImpl.getDSMMUser';
import getProfile from '@salesforce/apex/YINPJPServiceImpl.getProfile';
import getUserid from '@salesforce/apex/YINPJPServiceImpl.getUserId';
import getRSMTerritory from "@salesforce/apex/YINPJPServiceImpl.getRSMTerritory";
import getUsername from "@salesforce/apex/YINPJPServiceImpl.getUsername";
import getTerritory from "@salesforce/apex/YINPJPServiceImpl.getTerritory";
//import getcityOnArea from "@salesforce/apex/YINPJPServiceImpl.getcityOnArea";
//import getCityforGM from "@salesforce/apex/YINPJPServiceImpl.getCityforGM";
//import getAreaforGM from "@salesforce/apex/YINPJPServiceImpl.getAreaforGM";
import getMonth from "@salesforce/apex/YINPJPServiceImpl.getMonth";
import getMonthdetails from "@salesforce/apex/YINPJPServiceImpl.getMonthdetails";
import getMonthmap from "@salesforce/apex/YINPJPServiceImpl.getMonthmap";
import getUserforGM from "@salesforce/apex/YINPJPServiceImpl.getUserforGM";
import deleteDetails from "@salesforce/apex/YINPJPServiceImpl.getdeleteDetails";
import getApprovalData from '@salesforce/apex/YINApprovalComponentController.getApprovalData';
//import getBdmuser from "@salesforce/apex/YINPJPServiceImpl.getBdmuser";
//import getrkmuser from "@salesforce/apex/YINPJPServiceImpl.getrkmuser";
//import getZone from "@salesforce/apex/YINPJPServiceImpl.getZone";
//import rkmCity from "@salesforce/apex/YINPJPServiceImpl.rkmCity";
//import rkmArea from "@salesforce/apex/YINPJPServiceImpl.rkmArea";
import getpjp from "@salesforce/apex/YINPJPServiceImpl.getpjp";
import getCurrentUser from "@salesforce/apex/YINPJPServiceImpl.getCurrentUser";
import getUserbyId from "@salesforce/apex/YINPJPServiceImpl.getUserbyId";
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import getMOnthbyId from "@salesforce/apex/YINPJPServiceImpl.getMOnthbyId";
import submitForApproval from "@salesforce/apex/YINPJPServiceImpl.submitForApproval";
import approvePjp from "@salesforce/apex/YINPJPServiceImpl.approvePjp";
import rejectPjp from "@salesforce/apex/YINPJPServiceImpl.rejectPjp";
import getMonthOnUser from "@salesforce/apex/YINPJPServiceImpl.getMonthOnUser";
import getSubclassFromApex from "@salesforce/apex/YINPJPServiceImpl.getSubclassFromApex";
//import getRkamUser from "@salesforce/apex/YINPJPServiceImpl.getRkamUser";
import getpjpUserId from "@salesforce/apex/YINPJPServiceImpl.getpjpUserId";
import getProfileMetadata from "@salesforce/apex/YINPJPServiceImpl.getProfileMetadata";
//import getNkamUser from "@salesforce/apex/YINPJPServiceImpl.getNkamUser";
// import getEvents from "@salesforce/apex/YINPJPServiceImpl.getEvents";
// import addEvent from "@salesforce/apex/YINPJPServiceImpl.addEvent";
// import createEvent from '@salesforce/apex/createAcc.createAccount';



const countmap = new Map();
// const citymap = new Map();
// citymap.set('mumbai', ['kandivali', 'Dadar', 'Goregaon']);
// citymap.set('Delhi', ['Rohini', 'Dwarka', 'mauz khas']);

const monthmaptemp = new Map();
monthmaptemp.set("JAN", 0);
monthmaptemp.set("FEB", 1);
monthmaptemp.set("MAR", 2);
monthmaptemp.set("APR", 3);
monthmaptemp.set("MAY", 4);
monthmaptemp.set("JUN", 5);
monthmaptemp.set("JUL", 6);
monthmaptemp.set("AUG", 7);
monthmaptemp.set("SEP", 8);
monthmaptemp.set("OCT", 9);
monthmaptemp.set("NOV", 10);
monthmaptemp.set("DEC", 11);
export default class pJP extends NavigationMixin(LightningElement) {
  @api dates;
  @track months;
  @api checkdAll;
  @track profileMeta = new Map();
  @track recordId = '';
  @wire(CurrentPageReference)
  currentPageReference;

  @track spinner = false;
  @track city_str = '';
  @track togglecheck = 0;
  @track area = [];
  @track user = [];
  @track month = [];
  @track city = [];
  @track filter1 = "";
  @track filter2 = "";
  @track filter3 = "";
  @track filter4 = "";
  /*filter for searching Account*/
  @track value = "inProgress";
  @track totalDaysM = 0;
  @track MonthValue = ''; //Month value to search 
  @track eventTocreate = [];
  @api eventTocreateHold = [];
  /* profile variables */
  @track objUser = {};
  @track error;
  @track name = '';
  @track profile = '';
  @track currentuser;
  @track actualuser;
  @track actualstatus;
  @track headquater;
  @track pjp_months = [];
  @track sub_class = [];

  /* button matrix flag*/
  @track check_user_visiblity;
  @track btn_approve;
  @track btn_reject;
  @track user_id;
  @track month_accid;
  @track eventTodelete = [];
  @track delid;
  @track disableAllinput = false;
  @track pjp_status = 'Draft';
  @track diablebylink = false;
  @track approveflag = false;
  @track approvebyLink = false;
  @track status;
 @track pjpstatusmap = new Map();
 // @track pjpstatusmap =[];

  @track saveAsDisbleBtn = true;
  @track submitforApproval_btn = true;
  @track reset_btn = true;
  @track saveAshideBtn = true;
  @track submitforApprovalhide_btn = true;
  @track resethide_btn = true;
  @track approve_btn = true;
  @track reject_btn = true;
  // @track month_no=1;
  @track pjp_id = '';
  @track zone = [];

  @track approve_btnhide = true;
  @track reject_btnhide = true;
  @track approval_list = [];
  @track subzone = [];
  @track users = [];
  @track current_user;
  @track pjp_data = false;
  @track subclassflag = 0;
  @track sub_class_data = [];
  @track savetrack = false;
  @track commentapprove = false;
  @track commentreject = false;
  @track commentvalue = '';

  /* modal variables */
  @track value = 'inProgress';
  @track bShowModal = false;
  @track pjp_status_byLink = '';
  @track actual_userid;
  @track calenderEventsobj =[];
  @track activeSections = ['C'];
  @track activeSectionsMessage = '';

  // Variable Declaration for Event popup
  @track event_subject = '';
  @track event_start = '';
  @track event_end = '';
  @track event_agenda = '';
  @track event_complaintType = '';
  @track event_comment = '';
  @track event_type = '';
  @track event_nextStepDate = '';
  @track event_nextStepDescription = '';
  @track event_activityType = '';
  @track event_activityStatus = '';

  @track typeOption = [];
  @track agendaoption = [];
  @track complaintTypeOption = [];
  @track activityTypeOption = [];
  @track activityStatusTypeOption = [];
  @track subjectOption = [];
  @track lookupSingleSelectedRecordUser = '';
  @track lookupMultipleSelectedRecordContact = '';
  @track lookupSingleSelectedRecordAccount = '';
  // end Variable Declaration for Event popup

  // Pagination variable
  @track page = 1;
  @track startingRecord = 1;
  @track endingRecord = 0;
  @track pageSize = 5;
  @track totalRecordCount = 0;
  @track totalPage = 0;
  @track acclst_data = [];
  @track acoountList = [];
  @track tempAccountList = [];
  @track nextbtn_disable = true;
  @track previousbtn_disable = true;
  @track firstbtn_disable = true;
  @track lastbtn_disable = true;
  @track wiredResult;
  
  fullCalendarJsInitialised = false;


  @wire (getProfileMetadata)
  ProfileMetadata({error,data})
  {
     if(data)
     {
       data.forEach(mdt=>{
        this.profileMeta.set(mdt.level__c,mdt.Label);
       })
     }
  }


  // @wire(getAccountData, { subclass: '$headquater' }) 
  // acoountListwiredContacts(result) {
  //  console.log('wire for Acc lst called',result);
  //  //console.log('wire for Acc subclass lst called',subclass);
  //   this.spinner = true;
  //   this.wiredResult = result;
  //   if (result.data) {
  //     console.log('Account List:', JSON.stringify(result.data))
  //     for (let i = 0; i < result.data.length; i++) {
  //       //this.city = [...this.city, { label: result.data[i].City__r.Name, value: result.data[i].City__r.Name}];
  //       const cityExists = this.city.some(cityObj => cityObj.label === result.data[i].City__r.Name);
  //       // If city name doesn't exist, add it to this.city array
  //       if (!cityExists) {
  //           this.city = [...this.city, { label: result.data[i].City__r.Name, value: result.data[i].City__r.Name}];
  //       }
  //     }
  //     //console.log('result.data account',result.data);
  //     let objclass;
  //     this.acoountList = result.data;
  //     this.tempAccountList = result.data;
  //     if (this.acoountList !== undefined) {
  //       this.sub_class = [];
  //       this.acclst_data = this.acoountList;
  //       console.log('acc result.data list',this.acclst_data);
  //       this.totalRecordCount = this.acoountList.length;
  //       this.totalPage = Math.ceil(this.acoountList.length/this.pageSize);
  //       console.log('total Pages ',this.totalPage);
  //       this.acoountList = this.acclst_data.slice(0,this.pageSize);
  //       getSubclassFromApex().then(subclass => {
  //         if (subclass !== undefined) {
  //           for (let i = 0; i < subclass.length; i++) {
  //             if (subclass[i] !== '4S Dealer') {  // Extra check just in case
  //                 this.sub_class = [...this.sub_class, { label: subclass[i], value: subclass[i] }];
  //             }
  //         }
  //           objclass = { label: 'None', value: '' }
  //           this.sub_class.unshift(objclass);
  //           console.log('this.sub_class account',this.sub_class);
  //         }
  //       });

  //     }
  //     this.error = undefined;
  //     this.spinner = false;
  //   } else if (result.error) {
  //     this.error = result.error;
  //     this.acoountList = undefined;
  //     this.pjp_data = false;
  //     this.spinner = false;
  //   }
  // }

  @wire(getAccountData, { subclass: '$headquater' }) 
 acoountListwiredContacts(result) {
  // console.log('wire for Acc lst called',this.headquater);
  this.spinner = true;
  this.wiredResult = result;
  if (result.data) {
    for (let i = 0; i < result.data.length; i++) {
      // Check if City__r is not undefined before accessing its Name property
      if (result.data[i].City__r && result.data[i].City__r.Name) {
        const cityExists = this.city.some(cityObj => cityObj.label === result.data[i].City__r.Name);
        // If city name doesn't exist, add it to this.city array
        if (!cityExists) {
          this.city = [...this.city, { label: result.data[i].City__r.Name, value: result.data[i].City__r.Name }];
        }
      }
    }
    console.log('result.data account', result.data);
    let objclass;
    this.acoountList = result.data;
    this.tempAccountList = result.data;
    if (this.acoountList !== undefined) {
      this.sub_class = [];
      this.acclst_data = this.acoountList;
      console.log('acc result.data list', this.acclst_data);
      this.totalRecordCount = this.acoountList.length;
      this.totalPage = Math.ceil(this.acoountList.length / this.pageSize);
      console.log('total Pages ', this.totalPage);
      this.acoountList = this.acclst_data.slice(0, this.pageSize);
      getSubclassFromApex().then(subclass => {
        if (subclass !== undefined) {
          for (let i = 0; i < subclass.length; i++) {
            this.sub_class = [...this.sub_class, { label: subclass[i], value: subclass[i] }];
          }
          objclass = { label: 'None', value: '' }
          this.sub_class.unshift(objclass);
        }
      });
    }
    this.error = undefined;
    this.spinner = false;
  } else if (result.error) {
    this.error = result.error;
    this.acoountList = undefined;
    this.pjp_data = false;
    this.spinner = false;
  }
}


  @wire(getuser) userlist({ error, data }) {
    console.log('wire for user',data,'Err ',error);
    if (data) {
      for (let i = 0; i < data.length; i++) {

        this.user = [...this.user, { label: data[i].Name, value: data[i].Id }];

      }
      let objuser = { label: 'None', value: this.actual_userid }
      this.user.unshift(objuser);
    } else if (error) {
      this.user = [];
    }
  }
 
 

  //get areaoptions() { return this.area; }
  get useroptions() { return this.user; }
  get cityoptions() { return this.city; }
  get subclassoption() { return this.sub_class; }
  get recordIdFromState() {
    return this.currentPageReference &&
      this.currentPageReference.state.c__recordId;
  }


  get pagesizeOption(){
    return [{label:'5',value:5},{label:'10',value:10},{label:'15',value:15},{label:'20',value:20}];
  }
  get typeOptions() {
      return this.typeOption = [
        {label:'--None--',value:'none'},{label:'Email',value:'Email'},{label:'Meeting',value:'Meeting'},{label:'Other',value:'Other'},{label:'Call',value:'Call'}
      ];
  }

  get agendaOptions(){
    return this.agendaoption = [
      {label:'--None--',value:'none'},{label:'Review',value:'Review'},{label:'Running Promotion',value:'Running Promotion'},{label:'New Product',value:'New Product'},{label:'Courtesy Call',value:'Courtesy Call'},{label:'Customer Complaint',value:'Customer Complaint'}
    ];
  }

  get complaintTypeOptions(){
    return this.complaintTypeOption = [
      {label:'--None--',value:'none'},{label:'Product',value:'Product'},{label:'Service',value:'Service'},{label:'Query',value:'Query'},{label:'Feedback',value:'Feedback'}
    ];
  }

  get activityTypeOptions(){
    return this.activityTypeOption = [
      {label:'--None--',value:'none'},{label:'Planned',value:'Planned'},{label:'Unplanned',value:'Unplanned'}
    ];
  }

  get activityStatusTypeOptions(){
    return this.activityStatusTypeOption = [
      {label:'--None--',value:'none'},{label:'Open',value:'Open'},{label:'Completed',value:'Completed'}
    ];
  }

  get subjectOptions(){
 return this.subjectOption = [
  {label:'--None--',value:'none'},{label:'Call',value:'Call'},{label:'Email',value:'Email'},{label:'Meeting',value:'Meeting'},{label:'Send Letter/Quote',value:'Send Letter/Quote'},{label:'Other',value:'Other'}
  ];
}

  constructor() {
    
    super();
    console.log('constructor call');
    this.refreshFromApex();
    console.log('Draft 1233',this.pjp_status);
    
  }

  rec_event = {
    Subject:'ABC',
    OwnerId:'005p0000003VwIrAAK',
    StartDateTime:new Date().toString(),
    Type:'Email',
    EndDateTime:new Date().toString(),
    Agenda__c:'Review',
    Complaint_Type__c:'Product',
    Comments__c:'Test comment',
    WhoId:'003p000000dBeTdAAK',
    WhatId:'001p000000rYk3BAAS',
    Next_Step_Date__c:new Date().toString(),
    Next_Step_Description__c:'Test Comment',
    Activity_Type__c:'Planned',
    Activity_Status__c :'Open'
  }
  

  connectedCallback() {
    //this.refreshFromApex();
    //this.pjp_status ='Draft';
    console.log('In Connectedcallback Draft',this.pjp_status);
    console.log('Connected callback called',this.pjp_status);
    
    if (this.recordId !== undefined || this.recordId !== '') {
    console.log('record Id with data connected callback', JSON.stringify(this.recordId));
      this.diablebylink = true;
      this.getRecordDataByLink();
    } else {
      this.diablebylink = false;
    }
  }

  async getRecordDataByLink() {
    console.log(' getRecordDataByLink() called...',JSON.stringify(this.currentPageReference));
    this.recordId = this.recordIdFromState;
     console.log('PJP Id by link ', this.recordId);
     console.log('In getRecordDataByLink Draft',this.pjp_status);
     const month_data = await getMOnthbyId({ mon_id: this.recordId });
         console.log('getMOnthbyId() called',this.recordId);
         console.log('getMOnthbyId() called',month_data);
        if (month_data.length > 0) {
           console.log('user by link ', month_data);
          this.pjp_months = [{ label: month_data[0].Name, value: month_data[0].Name }];
          if (this.pjp_status !== month_data[0].Plan_Status__c) {
            this.pjp_status_byLink = month_data[0].Plan_Status__c;
          }
          console.log('status by link ', this.pjp_status_byLink);
          this.currentuser = month_data[0].PJP_Prepared_By__c;
          console.log('user by link ', this.currentuser);
          this.MonthValue = month_data[0].Name;
          
          if (this.MonthValue !== undefined) {
            console.log('inside declaration');
            let temp_monthname = this.MonthValue.split('-');
            let temp_month = temp_monthname[0].toUpperCase();
            console.log('month number',monthmaptemp.get(temp_month));
            let temp_year = temp_monthname[1];
            this.declarationMonth(monthmaptemp.get(temp_month), temp_year);
           console.log('temp ',temp_month+' '+temp_year);
          }
          if (this.pjp_status_byLink === 'Pending') {
            this.setButton_state(true, true, false, false, false, true, true, false, false, false);
          }
        }
    
  }


  async refreshFromApex() {
    this.spinner = true;
    this.user_id = await getUserid();
    this.actual_userid = this.user_id;

    this.currentuser = await getUsername();
    this.actualuser = this.currentuser;
    console.log('Actual User',this.actualuser);

    this.current_user = await getCurrentUser();
    this.MonthValue = new Date().toLocaleDateString('en', { month: 'short' })+'-'+new Date().getFullYear();

   let abc = await this.declarationMonth(new Date().getMonth(), '');
    //this.pjp_status = "Draft";
    console.log('In refreshFromApex Draft',this.pjp_status);


        const data = await getMonth(); 
        console.log('Data 123',JSON.stringify(data));
        for (let i = 0; i < data.length; i++) {
          this.pjp_months = [...this.pjp_months, { label: data[i].Name, value: data[i].Name }];
          this.MonthValue = new Date().toLocaleDateString('en', { month: 'short' })+'-'+new Date().getFullYear();
          console.log('pjp this.MonthValue ',this.MonthValue);
         this.pjpstatusmap.set(data[i].Name, data[i].Plan_Status__c);
          //this.pjpstatusmap.set('Nov-2023', 'Draft');
        // this.pjpstatusmap = [...this.pjpstatusmap,{'Nov-2023': 'Draft'}];
          console.log('pjp data ',this.pjp_months);
          if (this.pjp_months.length === 0) {
            this.pjp_data = false;
          } else {
            this.pjp_data = true;
          }
        }
        console.log('pjp_status_byLink ',JSON.stringify(this.pjp_status_byLink));
        if (this.pjp_status_byLink === undefined || this.pjp_status_byLink === '') {
          console.log('pjpstatus map ',this.pjpstatusmap);
          this.pjp_status = this.pjpstatusmap.get(this.MonthValue);
          console.log('Monthvalue ',this.MonthValue);
          console.log('pjp_status ',this.pjp_status);  
       } else {

         this.pjp_status = this.pjp_status_byLink;
        }
    
    
        const name = await getProfile();
        this.profile = name;
        console.log("get profile"+this.profile);
          if (this.pjp_status_byLink === undefined || this.pjp_status_byLink === '') {
            this.pjp_status = this.pjpstatusmap.get(this.MonthValue);
          }
          this.actualstatus = this.pjpstatusmap.get(this.MonthValue);
        
          // DSM Headquarter
          if (this.profile.includes(this.profileMeta.get('1'))) {
            console.log("get BDM profile",this.profileMeta.get('1'));
             console.log('my profile',this.pjpstatusmap);
             this.status = this.pjpstatusmap.get(this.MonthValue);
             console.log('status in profile ',this.pjp_status);
            this.bdmProfile(this.pjp_status);   
            console.log('Dsm Profile',this.profileMeta.get('1'));
            console.log("get DSM headquater");
            const subzone = await getTerritory();    
            console.log("get DSM headquater");
            this.headquater = subzone;
            console.log('Dsm headquater ',subzone);
          }

          // System admin Headquater
          if (this.profile.includes('System Administrator')) {
            // // console.log('Sys Admin');
            this.adminProfile(this.pjp_status);
            const subzone = await getTerritory(); 
             
            console.log("get DSM zone ");
            this.headquater = subzone;
            console.log('sub zone ',subzone);
          }

          // RSM Headquater
          if (this.profile.includes(this.profileMeta.get('2'))) {
            console.log(this.profile,'RSM user')
            this.check_user_visiblity = true;
            this.rkmProfile(this.pjp_status);
            const zone = await getRSMTerritory();
            console.log('Zone ' ,zone);
            this.headquater = zone;
            console.log('RSM headquater ',zone);
              // if (zone.length !== 0) {
              //   this.zone = zone[0].Id;
              //   this.headquater = zone[0].Name;
              //   console.log('zone '+JSON.stringify(zone));
              // }
            //     const lstcity = await rkmCity({ zone: this.zone }); 
            //       // // console.log('RKAM City ',lstcity);
            //       this.city = [];
            //       if (lstcity) {
            //         for (let i = 0; i < lstcity.length; i++) {
            //           this.city = [...this.city, { label: lstcity[i].Name, value: lstcity[i].Id }];
            //         }
            //         let objcity = { label: 'None', value: '001' }
            //         this.city.unshift(objcity);
  
            //       } else if (error) {
            //         this.city = [];
  
            //       }
              
            //     const lstArea = await rkmArea({ zone: this.zone });
  
            //        // console.log('RKAM Area ',lstArea);
            //       this.area = [];
  
            //       if (lstArea.length > 0) {
            //         for (let i = 0; i < lstArea.length; i++) {
            //           this.area = [...this.area, { label: lstArea[i].Name, value: lstArea[i].Id }];
            //         }
            //         let objarea = { label: 'None', value: '001' }
            //         this.area.unshift(objarea);
            //       }    
            //   }
              if (this.pjp_status_byLink === undefined || this.pjp_status_byLink === '') {
                this.pjp_status = this.pjpstatusmap.get(this.MonthValue);
              } else {
                this.pjp_status = this.pjp_status_byLink;
              }
  
              // console.log('status ', this.pjp_status);
              this.disableAllinput = false;
              this.rkmOnstatus_pjp(this.pjp_status);
            
          }
  
          // if (this.profile.includes(this.profileMeta.get('3'))) {
          //   console.log('NKAM user')
          //   this.check_user_visiblity = true;
          //   this.nkamProfile(this.pjp_status); // for BUtton Matrix RKAM and NKAM
  
          //  let zone = await getZone()
          //     // console.log('Zone ' ,zone);
          //     if (zone.length !== 0) {
          //       this.zone = zone[0].Id;
          //       this.headquater = zone[0].Name;
          //       // // // console.log('zone '+JSON.stringify(zone));
          //       const lstcity = await rkmCity({ zone: this.zone }); 
                
          //         // // console.log('RKAM City ',lstcity);
          //         this.city = [];
          //         if (lstcity) {
          //           for (let i = 0; i < lstcity.length; i++) {
          //             this.city = [...this.city, { label: lstcity[i].Name, value: lstcity[i].Id }];
          //           }
          //           let objcity = { label: 'None', value: '001' }
          //           this.city.unshift(objcity);
  
          //         } else if (error) {
          //           this.city = [];
  
          //         }
               
          //      const lstArea = await rkmArea({ zone: this.zone });
               
  
          //          // console.log('RKAM Area ',lstArea);
          //         this.area = [];
  
          //         if (lstArea.length > 0) {
          //           for (let i = 0; i < lstArea.length; i++) {
          //             this.area = [...this.area, { label: lstArea[i].Name, value: lstArea[i].Id }];
          //           }
          //           let objarea = { label: 'None', value: '001' }
          //           this.area.unshift(objarea);
          //         }
              
          //     }
          //     if (this.pjp_status_byLink === undefined || this.pjp_status_byLink === '') {
          //       this.pjp_status = this.pjpstatusmap.get(this.MonthValue);
          //     } else {
          //       this.pjp_status = this.pjp_status_byLink;
          //     }
  
          //     // console.log('status ', this.pjp_status);
          //     this.disableAllinput = false;
          //     this.rkmOnstatus_pjp(this.pjp_status);
            
          // }
  
          //code for GM
          if (this.profile.includes(this.profileMeta.get('4'))) {
            console.log('GM user')
            this.check_user_visiblity = true;
            this.gmProfile(this.pjp_status); // To fetch user 
            // start commented on 31-10-2020
            //   getZone().then(zone => {
            //     console.log('Zone ' ,zone);
            //     if (zone.length !== 0) {
            //       this.zone = zone[0].Id;
            //       this.headquater = zone[0].Name;
            //       console.log('zone '+JSON.stringify(zone));
            //       rkmCity({ zone: this.zone }).then(lstcity => {
            // console.log('RKAM City ',lstcity);
            // this.city = [];
            // if (lstcity) {
            //   for (let i = 0; i < lstcity.length; i++) {
            //     this.city = [...this.city, { label: lstcity[i].Name, value: lstcity[i].Id }];
            //   }
            //   let objcity = { label: 'None', value: '001' }
            //   this.city.unshift(objcity);

            // } else if (error) {
            //   this.city = [];

            // }
            //       });

            //       rkmArea({ zone: this.zone }).then(lstArea => {

            //          // console.log('RKAM Area ',lstArea);
            // this.area = [];

            // if (lstArea.length > 0) {
            //   for (let i = 0; i < lstArea.length; i++) {
            //     this.area = [...this.area, { label: lstArea[i].Name, value: lstArea[i].Id }];
            //   }
            //   let objarea = { label: 'None', value: '001' }
            //   this.area.unshift(objarea);
            // }
            //       })
            //     }
            // if (this.pjp_status_byLink === undefined || this.pjp_status_byLink === '') {
            //   this.pjp_status = this.pjpstatusmap.get(this.MonthValue);
            // } else {
            //   this.pjp_status = this.pjp_status_byLink;
            // }

            // // console.log('status ', this.pjp_status);
            // this.disableAllinput = false;
            // this.rkmOnstatus_pjp(this.pjp_status);
            //   });
            // End commented on 31-10-2020   
            getCityforGM().then(lstcity => {
              console.log('GM City ', lstcity);
              this.city = [];
              if (lstcity) {
                for (let i = 0; i < lstcity.length; i++) {
                  this.city = [...this.city, { label: lstcity[i].Name, value: lstcity[i].Id }];
                }
                let objcity = { label: 'None', value: '001' }
                this.city.unshift(objcity);

              } else if (error) {
                this.city = [];
              }
              getAreaforGM().then(lstArea => {
                console.log('Area GM ', lstArea);
                this.area = [];
                if (lstArea.length > 0) {
                  for (let i = 0; i < lstArea.length; i++) {
                    this.area = [...this.area, { label: lstArea[i].Name, value: lstArea[i].Id }];
                  }
                  let objarea = { label: 'None', value: '001' }
                  this.area.unshift(objarea);
                }
              }).catch(err => {
                console.log('Area Err ', err);
              });

            }).catch(err => {
              console.log('City for GM ', err);
            });
            if (this.pjp_status_byLink === undefined || this.pjp_status_byLink === '') {
              this.pjp_status = this.pjpstatusmap.get(this.MonthValue);
            } else {
              this.pjp_status = this.pjp_status_byLink;
            }
            // console.log('status ', this.pjp_status);
            this.disableAllinput = false;
            this.rkmOnstatus_pjp(this.pjp_status);
          }

       //.catch({});

     


    // this.declarationMonth(new Date().getMonth(), '');
    this.spinner = false;
  }

  renderedCallback() {
   // this.pjp_status ='Draft';
  //  if(this.data.length == 0){
  //   this.refreshFromApex();
  //   this.isRender = true;
  //  }
   var test; 
   console.log('renderedCallback() called');

   
    // code  for Next and Previous btn
    this.checkNextPreviousbtn(this.page,this.totalPage);
    // End code  for Next and Previous btn

    // console.log("--------after Render-----");
    // this.user = [];
    if (this.approveflag === true) {
      if (this.pjp_status === 'Approved' || this.pjp_status === 'Rejected') {
        this.setButton_state(true, true, false, true, true, true, true, false, false, false);
      }
      if (this.pjp_status === 'Pending') {
        this.setButton_state(true, true, false, true, true, false, false, true, true, true);
      }
    }

    if (this.approvebyLink === true) {
      if (this.pjp_status === 'Approved') {
        this.setButton_state(true, true, true, true, true, true, true, false, false, false);
        this.pjp_status_byLink = 'Approved'
      }
      if (this.pjp_status === 'Rejected') {
        this.setButton_state(true, true, true, true, true, true, true, false, false, false);
        this.pjp_status_byLink = 'Rejected'
      }
      if (this.pjp_status === 'Pending') {
        this.setButton_state(true, true, true, true, true, false, false, true, true, true);
      }
    }

    if (this.recordId !== undefined) {
     console.log('record Id with data', this.recordId);
      this.diablebylink = true;
    } else {
      this.diablebylink = false;
    }
    console.log('this.eventTocreateHold-',this.eventTocreateHold);
     
    Array.from(this.template.querySelectorAll("lightning-input")).forEach(
      element => {

        if (this.eventTocreateHold.indexOf(element.id + "_" + element.value + '_' + this.MonthValue) >= 0) {
         if(element.name!==''){
         element.checked = true;
         }
          console.log('checked elements 1'+JSON.stringify(this.eventTocreateHold));
        }
      });

    Array.from(this.template.querySelectorAll("lightning-badge")).forEach(
      ele => {
        //ele.label =0;
        if (countmap.has(ele.id)) {
          ele.label = countmap.get(ele.id);
        }
      });
      console.log('In renderedCallback Draft',this.pjp_status);
    if (this.pjp_status_byLink === undefined || this.pjp_status_byLink === '') {
      if (this.approveflag === false) {
        this.pjp_status = this.pjpstatusmap.get(this.MonthValue);
      }
    } else {
      this.pjp_status = this.pjp_status_byLink;
    }

    //   let d = new Date();
    //   let monVal = this.MonthValue;
    // let month_no = monthmaptemp.get(monVal.split('-')[0].toUpperCase());
    // let current_mont  = d.getMonth() + 1;

    // this.renderButtonvisibility(current_mont,month_no);


    /*Code abhishek */
    //  // console.log('Month value',this.MonthValue);

    if(this.recordId!==undefined){
      //code here
      getpjpUserId({pjp_id:this.recordId}).then(usrid=>{
      getMonthdetails({ month_value: this.MonthValue, usr_id: usrid })
      .then(data => {
        console.log('rerender getMonthdetails called ',this.current_user);
        test = JSON.stringify(data);
        console.log("month details--> ",test);
        let count = 0;
        let tempCounter = 0;

        Array.from(this.template.querySelectorAll("lightning-input")).forEach(
          element => {

            if (tempCounter === this.totalDaysM) {
              count = 0;
              tempCounter = 0;
            }
            tempCounter++;
            let ids = element.id.split('_')[0].split('-')[0];
            let ids2 = element.value;

            if (ids2) {
              if (this.findAndReplace(JSON.parse(test),ids + "_" + ids2)===true) {
                //  // console.log('element id',ids);
                console.log('Test2 ',test);
                console.log('ids and ids2 ',ids + "_" + ids2);
                console.log('element ------> ',test.indexOf(ids + "_" + ids2));
                if(element.name!==''){
                element.checked = true;
                // console.log('checked elements 2');
                count++;
                }

                let badgesCount = this.template.querySelector('[data-id="' + ids2 + '"]');
                if (badgesCount) {
                  badgesCount.label = count;

                }
              } 
              //else {
              //   if (this.area === [] || this.city === []) {
              //     element.checked = false;

              //   }
              // }
            }

            let obj = JSON.parse(test);  
            if(element.checked===true){
            if (obj[ids + "_" + ids2] !== undefined) {
            
              // console.log('Element ',element); 
              element.name = obj[ids + "_" + ids2].Id;

            }
          }
          });
      });
    });

    //
  }

 

    if(this.current_user!==undefined && this.recordId===undefined){
      if(this.savetrack===false){
        console.log('Current user ',this.currentuser);
        if(this.current_user!==''){
        getMonthdetails({ month_value: this.MonthValue, usr_id: this.current_user })
      .then(data => {
        console.log('rerender getMonthdetails called ',this.current_user);
        test = JSON.stringify(data);
        console.log("month details----> ",test);
        let count = 0;
        let tempCounter = 0;

        Array.from(this.template.querySelectorAll("lightning-input")).forEach(
          element => {
            //console.log('element',element);
            if (tempCounter === this.totalDaysM) {
              count = 0;
              tempCounter = 0;
            }
            tempCounter++;
            let ids = element.id.split('_')[0].split('-')[0];
            //console.log('elements ids ',ids);
            let ids2 = element.value;

            if (ids2) {
              
              //if (test.indexOf(ids + "_" + ids2) >= 0) {

             // console.log("find and replace result ",this.findAndReplace(JSON.parse(test),ids + "_" + ids2));
                if (this.findAndReplace(JSON.parse(test),ids + "_" + ids2)===true) {
                // console.log('Test3 ',test);
                //  console.log('ids and ids2 ',ids + "_" + ids2);
                // console.log('element ------> ',test[ids + "_" + ids2]);
                 // console.log('element ids2',ids + "_" + ids2);
                 if(element.name!==''){
                element.checked = true;
                // console.log('checked elements 3');
                count++;
                 }
                let badgesCount = this.template.querySelector('[data-id="' + ids2 + '"]');
                if (badgesCount) {
                  badgesCount.label = count;

                }
               else {
                // if (this.area === [] || this.city === []) {
                //   element.checked = false;

                // }
              }
            }
  
            let obj = JSON.parse(test);
            
            if (obj[ids + "_" + ids2] !== undefined) {
              element.name = obj[ids + "_" + ids2].Id;
              // console.log('element.name renderCallback ',obj[ids + "_" + ids2].Id);
            }
            }
          });
      });
    }
  }

    if (this.acoountList !== undefined) {
      if (this.acoountList.length > 0) {
        this.pjp_data = true;
      } else {
        this.pjp_data = false;
      }
    }
  }
   //this.pjp_status = "Draft";
}



  getSelectedCheckBox(evt) {
    // // console.log(evt.target.id);
  }
  createEvents() { }

  get monthsList() {

    return this.pjp_months;
  }
  handleChangeFilter1(event) {
    
    console.log('handleChangeFilter1() called');
    //this.area = [];
    //this.filter2 = ''; 
    let objclass;
    this.filter1 = event.detail.value;
    //this.filterAccountList();
    this.acoountList = this.tempAccountList.filter(record=>record.City__r.Name === this.filter1);
    console.log('handleChangeFilter1 ',this.filter1);
    if (this.filter1 == '001') {
      console.log('inside if of city ',this.filter1);
      this.filter1 = '';
    }
  
  this.spinner = false; 
}
  

handleChangeFilter3(event) { //user filter
  //console.log('handleChangeFilter3() called', this.disableAllinput);
  this.totalDaysM =new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  console.log('total days 1234 ',this.totalDaysM);
  this.filter3 = event.target.value;
  console.log('User123:', this.filter3);
  this.pjp_months = [];
  console.log('User Id ', this.filter3);
  this.current_user = this.filter3;
  getUserbyId({ usr_id: this.filter3 })
      .then(usr => {
          this.currentuser = usr;
          console.log('User8888' + this.currentuser);
          Array.from(this.template.querySelectorAll("lightning-input")).forEach(
              element => {
                  element.checked = false;
              });
          Array.from(this.template.querySelectorAll("lightning-badge")).forEach(
              ele => {
                  ele.label = 0;
                  countmap.set(ele.id, ele.label);
              }
          );
          getpjp({ usr_id: this.filter3 }).then(month => {
              this.pjp_data = true;
              for (let i = 0; i < month.length; i++) {
                  this.pjp_months = [...this.pjp_months, { label: month[i].Name, value: month[i].Name }];
                  this.pjpstatusmap.set(month[i].Name, month[i].Plan_Status__c);
              }
              // Update status for the new user
              if (this.pjpstatusmap.has(this.MonthValue)) {
                  this.pjp_status = this.pjpstatusmap.get(this.MonthValue);
              } else {
                  this.pjp_status = 'Draft'; // Default status if not predefined for the user
              }
              // Update button states based on the new status
              if (this.current_user !== this.actualuser) {
                  this.disableAllinput = true;
                  if (this.pjp_status === 'Pending') {
                      this.setButton_state(true, true, false, false, false, true, true, false, false, false);
                  } else {
                      this.rkmOnstatus_pjp(this.pjp_status);
                  }
              }
              if (this.pjp_months.length === 0) {
                  this.pjp_data = false;
              }
              console.log('Profile ', this.profile);
              let month_no = monthmaptemp.get(this.MonthValue.split('-')[0].toUpperCase());
              let current_mont = new Date().getMonth() + 1;
              if (current_mont == 12) {
                  current_mont = 0;
              }
              if (current_mont == 13) {
                  current_mont = 1;
              }
              // Other code for month change here
              this.renderButtonvisibility(current_mont, month_no);
              //console.log('This actual user',  this.actualuser);
             // console.log('handleChangeFilter3() called 1', this.disableAllinput);
              if (this.currentuser !== this.actualuser) {
                  this.disableAllinput = true;
                 // console.log('handleChangeFilter3() called 2', this.disableAllinput);
                  if (this.pjp_status === 'Pending') {
                      this.setButton_state(true, true, false, false, false, true, true, false, false, false);
                  } else {
                      this.setButton_state(true, true, false, true, true, true, true, false, false, false);
                  }
              }
              this.spinner = false;
          });
      });
      console.log('total days 123456 ',this.totalDaysM);
}


  handleChangeSubclass(event) {
    this.filter4 = event.detail.value;
   this.acoountList = this.tempAccountList.filter(record=>record.Channel_Code__r.Name === this.filter4);
   //this.filterAccountList();
    // if (this.filter4.includes('001')) {
    //   this.filter1 = '';
    // }
  }

  filterAccountList(){
    if(this.filter1 && this.filter4 == 'None'){
     this.acoountList = this.tempAccountList.filter(record=>record.City__r.Name === this.filter1);
    }else if(!this.filter1 && this.filter4){
     this.acoountList = this.tempAccountList.filter(record=>record.Channel_Code__r.Name === this.filter4);
    }else{
      this.acoountList = this.tempAccountList.filter(record=>record.Channel_Code__r.Name === this.filter4 && record.City__r.Name === this.filter1);

    }

  }

  handleChangeMonth(event) {
    console.log('handleChangeMonth() called');
    this.MonthValue = event.target.value;
    console.log('Month Name', this.MonthValue);
    let temp_monthname;
    let temp_month, temp_year;
    let monVal = this.MonthValue;
    if (this.MonthValue !== undefined) {
      temp_monthname = this.MonthValue.split('-');
      temp_month = temp_monthname[0].toUpperCase();
      //  // console.log('month number',monthmaptemp.get(temp_month));
      temp_year = temp_monthname[1];
      this.declarationMonth(monthmaptemp.get(temp_month), temp_year);
      // console.log('temp ', temp_month + ' ' + temp_year);

    }
    let month_no = monthmaptemp.get(monVal.split('-')[0].toUpperCase());
    let current_mont = new Date().getMonth()+1; //d.getMonth() + 1 // month_no;
    if(current_mont==12){
        current_mont = 0;
    }
    if(current_mont==13){
      current_mont = 1;
    }
    // this.status = this.pjpstatusmap.get(this.MonthValue);
    if (this.pjp_status_byLink === undefined || this.pjp_status_byLink === '') {
      if (this.approveflag === false) {
        this.pjp_status = this.pjpstatusmap.get(this.MonthValue);
      }
    } else {
      this.pjp_status = this.pjp_status_byLink;
    }
    // console.log('status on month change ', this.pjp_status);
    // console.log('current month ', current_mont, 'Month number ', month_no);

    // code_monthChange
    // Draft,Pending,Approved,Rejected
    console.log('Current month',current_mont,' and ','selected month ',month_no);
    this.renderButtonvisibility(current_mont, month_no);
    console.log('current user ', this.currentuser + 'Actual user ', this.actualuser);
    if (this.currentuser !== this.actualuser) {
      this.disableAllinput = true;
      if (this.pjp_status === 'Pending') {
        this.setButton_state(true, true, false, false, false, true, true, false, false, false);
      } else {
        // console.log('------>this')
        this.setButton_state(true, true, false, true, true, true, true, false, false, false);
      }
    }else {
      //this.disableAllinput = false;   Edited on 17-11-2020 by sandeep vishwakarma
      //this.rkmOnstatus_pjp(this.pjp_status); Edited on 17-11-2020 by sandeep vishwakarma
    }

    Array.from(this.template.querySelectorAll("lightning-badge")).forEach(
      ele => {
        ele.label = 0;
      });

    // if(this.MonthValue.includes('001'))
    // {
    //   this.MonthValue = '';
    // } 
    
    getMonthdetails({ month_value: this.MonthValue, usr_id: this.current_user })
      .then(data => {
        // console.log('handleMonthChange getMonthdetails() called');
        console.log('pjp details ',data);
        let test = JSON.stringify(data);

        Array.from(this.template.querySelectorAll("lightning-input")).forEach(
          element => {
            //console.log('elements id ',element.id);
            let ids = element.id.split('_')[0].split('-')[0];
            let ids2 = element.value;
            if (ids2) {
              if (this.findAndReplace(JSON.parse(test),ids + "_" + ids2)===true) {
                // console.log('Test1 ',test);
                // console.log('ids and ids2 ',ids + "_" + ids2);
                // console.log('element ------> ',test.indexOf(ids + "_" + ids2));
                if(element.name!==''){
                element.checked = true;
                }
                // console.log('checked elements 5');
              } else {
                element.checked = false;
              }
            }
            let obj = JSON.parse(test);
            if (obj[ids + "_" + ids2] !== undefined) { 
              element.name = obj[ids + "_" + ids2].Id;
            }
            if (this.eventTocreateHold.indexOf(element.id + "_" + element.value + "_" + this.MonthValue) >= 0) {
             element.checked = true;
              // console.log('checked elements 6');
            }
          });
      });
    this.MonthValue = event.target.value;
  }
  handleChange(event) {   
    getMonthdetails({ month_value: this.MonthValue, usr_id: this.current_user })
      .then(data => {

        let test = JSON.stringify(data);
       console.log('handle change Data',JSON.stringify(test));
        Array.from(this.template.querySelectorAll("lightning-input")).forEach(
          element => {
            let ids = element.id.split('_')[0].split('-')[0];
            let ids2 = element.value;
            let obj = JSON.parse(test);
            if (obj[ids + "_" + ids2] !== undefined) { 
              element.name = obj[ids + "_" + ids2].Id;
           //  console.log('element.name handleChange ',obj[ids + "_" + ids2].Id);
            }
          });
      });

    if (event.target.checked===true) {
     // console.log('in side event checked',JSON.stringify(this.eventTocreate));
      this.eventTocreateHold.push(event.target.id + '_' + event.target.value + '_' + this.MonthValue);
      this.eventTocreate.push(event.target.id.split('-')[0] + '_' + event.target.value + '_' + this.MonthValue);
       //console.log('Event to create ',JSON.stringify(this.eventTocreate));
      Array.from(this.template.querySelectorAll("lightning-badge")).forEach(
        ele => {

          if (ele.id.includes(event.target.value)) {
            // eslint-disable-next-line radix
            ele.label = parseInt(ele.label) + 1;
            countmap.set(ele.id, ele.label);
          }
        }
      );
    } else {
      Array.from(this.template.querySelectorAll("lightning-badge")).forEach(
        ele => {
          // // console.log('ele id',ele.id);
          if (ele.id.includes(event.target.value)) {
            // eslint-disable-next-line radix
            ele.label = parseInt(ele.label) - 1;
           
            const index = this.eventTocreateHold.indexOf(event.target.id + '_' + event.target.value + '_' + this.MonthValue);
            if (index > -1) {
              this.eventTocreateHold.splice(index, 1);
            }
          }
        }
      );

    }

    if (event.target.checked===false) {
      console.log('Name ',event.target.name);
      if(event.target.name!==undefined){
      this.eventTodelete.push(event.target.name);
      }
      this.eventTocreateHold.splice( this.eventTocreateHold.indexOf(event.target.id + '_' + event.target.value + '_' + this.MonthValue), 1 );

      // console.log('event created1 ',this.eventTocreate);
      // console.log('events ',event.target.id + '_' + event.target.value + '_' + this.MonthValue)
      const index1 = this.eventTocreate.indexOf(event.target.id.split('-')[0] + '_' + event.target.value + '_' + this.MonthValue);
     console.log('index ',index1);
      if(index1 > -1){
        console.log('name');
      this.eventTocreate.splice( index1, 1);
      }
    // console.log('event created2 ',this.eventTocreate);
  }
  }

  handleComment(event)
  {
    this.commentvalue = event.target.value;
  }

  // Save as Draft Method Start
  saveAsDraft() {
    this.eventTocreateHold = [];
    this.savetrack = true;
    let count = 0;
    this.spinner = true;

    Array.from(this.template.querySelectorAll("lightning-input")).forEach(
      element => {
        if(element.checked===true){
        //  console.log('inside save as draft element checked');
         // this.eventTocreate.push(element.id.split('-')[0] + '_' + element.value + '_' + this.MonthValue);
          count ++;
        }
      }
    );
    if (count === 0) {
      const evt1 = new ShowToastEvent({
        title: '',
        message: 'Please select at least one customer event ',
        variant: 'error',
        mode: 'dismissable'
      });
      this.dispatchEvent(evt1);
    }else{
      console.log('Event to create data ',JSON.stringify(this.eventTocreate));
      console.log('Event to create ',this.eventTocreate.length);
      saveAsDraft({ eventToCreate: this.eventTocreate, usr_id: this.current_user }).then(result => {
      console.log('result ----------> ',result);
      console.log('save as Draft event ',JSON.stringify(this.eventTocreate));
      if(result==='updated'){
       this.eventTocreate = [];
      }
       this.spinner = false;
      });
      const evt = new ShowToastEvent({
        title: '',
        message: 'Saved as Draft',
        variant: 'success',
        mode: 'dismissable'
      });
        
      this.dispatchEvent(evt);
  
      console.log('event to delete ', this.eventTodelete.length);
      if(this.eventTodelete.length!==0){
        console.log('event to delete ',JSON.stringify(this.eventTodelete));
          deleteDetails({lst:this.eventTodelete}).then(()=>{
            console.log('deleted details');
            this.eventTodelete = [];
            this.eventTocreateHold = [];
            this.spinner = false;
        }).catch(()=>{
          console.log('deleted details failed');
        })
    }
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  setTimeout(() => {
    location.reload();
  }, 1500);    
  
} 
    this.spinner = false;
  }


// save as draft method stop 

//reset buttom method start
  resetAllCheck(event) {
    Array.from(this.template.querySelectorAll("lightning-input")).forEach(
      element => {
        element.checked = false;
      }
    );

    Array.from(this.template.querySelectorAll(".reset")).forEach(
      ele => {
        ele.label = '0';
      }
    );

    this.eventTocreateHold = [];
    this.filter1 = "";
   // this.filter2 = "";
    this.filter3 = "";
    this.filter4 = "";
  }
  //reset buttom method stop

  openModal() {
    // to open modal window set 'bShowModal' tarck value as true
    getMonthOnUser({ usr_id: this.current_user, mon_name: this.MonthValue }).then(pjpid => {
      
      if (this.pjp_status_byLink === undefined || this.pjp_status_byLink === '') {
        // console.log('PJP ID on save ', pjpid);
      }else{
        pjpid = this.recordId;
      }
      this.bShowModal = true;
      // console.log('month ID ', pjpid);
      getApprovalData({ recId: pjpid })
        .then(approval_lst => {
          this.approval_list = approval_lst;
          console.log('Approval List ',JSON.stringify(this.approval_list));
        }).catch(err => {
          console.log('Error while fetching Approval data',err);
        })
    });
  }

  closeModal() {
    // to close modal window set 'bShowModal' tarck value as false
    console.log('Close reject popup window');
    this.bShowModal = false;
    this.commentapprove = false;
    this.commentreject = false;
  }
  /* javaScipt functions end */
  get options() {
    return [
      { label: 'New', value: 'new' },
      { label: 'In Progress', value: 'inProgress' },
      { label: 'Finished', value: 'finished' },
    ];
  }
  handleChangemodal(event) {
    this.value = event.detail.value;
  }

  bdmProfile(status) {
    this.pjp_status = status;
    // // console.log('BDM profile logged in');
    this.check_user_visiblity = false;
    this.user = [];
    console.log('status in bdm', this.pjp_status);
    if (this.pjp_status !== undefined) {
      this.bdmOnstatus_pjp();
    }
  }

  adminProfile(status) {
    // console.log('adminProfile() called');
    this.pjp_status = status;
    this.check_user_visiblity = true;
    // // console.log('Sys Admin logged in');
  }

//   // Call Apex method to fetch DSM users
//   fetchDSMUsers(managerName) {
//     getDSMMUser({ managerName: managerName })
//         .then(result => {
//             this.users = result;
//             console.log('DSM Users: ', this.users);
//             // Process user data as needed
//         })
//         .catch(error => {
//             console.error('Error fetching DSM Users: ', error);
//             // Handle error if needed
//         });
// }
  rkmProfile(status) {
    console.log('rkmProfile() called');
    this.pjp_status = status;
    getDSMMUser().then(dsmUser =>{
      console.log('DSM user 111',dsmUser)
        this.user = [];
        for (let i = 0; i < dsmUser.length; i++) {
          if (dsmUser[i].Name !== undefined) {
            this.user = [...this.user, { label: dsmUser[i].Name, value: dsmUser[i].Id }];
          }
        }
        let objuser = { label: 'None', value: this.actual_userid }
        this.user.unshift(objuser);
    });
    console.log('status in RSM', this.pjp_status);
    if (this.pjp_status !== undefined) {
      this.rkmOnstatus_pjp(this.pjp_status);
    }
  }
    // getDSMMUser()
    //   .then(dsmUser => {
    //     console.log('DSM users === ',dsmUser, 'len ',dsmUser.length);
    //     this.user = [];
    //     for (let i = 0; i < dsmUser.length; i++) {
    //       if(dsmUser[i].User__c){
    //         console.log('DSM user 1122'+dsmUser[i].User__r.Name)
    //        this.user = [...this.user, { label: dsmUser[i].User__r.Name, value: dsmUser[i].User__r.Id }];
    //        console.log(JSON.stringify(this.user)+'getDSMMuser')
    //       }
    //       if(dsmUser[i].ManagerId){
    //         console.log('DSM users.. ManagerId')
    //         this.user = [...this.user, { label: dsmUser[i].Manager.Name, value: dsmUser[i].ManagerId}];
    //       }
    //       console.log('DSM undefined')
    //     }
    //     let objuser = { label: 'None', value: this.actual_userid }
    //     this.user.unshift(objuser);
    //   });


    //   console.log('status in RKAM', this.pjp_status);
    // if (this.pjp_status !== undefined) {
    //   this.rkmOnstatus_pjp(this.pjp_status);
    // }
 // }

  // nkamProfile(status){
  //   this.pjp_status = status;

  //   getRkamUser().then(rkamuser =>{
  //     console.log('Rkam user 111',rkamuser)
  //       this.user = [];
  //       for (let i = 0; i < rkamuser.length; i++) {
  //         if (rkamuser[i].Name !== undefined) {
  //           this.user = [...this.user, { label: rkamuser[i].Name, value: rkamuser[i].Id }];
  //         }
  //       }
  //       let objuser = { label: 'None', value: this.actual_userid }
  //       this.user.unshift(objuser);
  //   });
  //   console.log('status in NKAM', this.pjp_status);
  //   if (this.pjp_status !== undefined) {
  //     this.rkmOnstatus_pjp(this.pjp_status);
  //   }
  // }

  gmProfile(status)
  {
    this.pjp_status = status;

    // getNkamUser().then(nkamuser =>{
    //   this.user = [];
    //   for (let i = 0; i < nkamuser.length; i++) {
    //     if (nkamuser[i].Name !== undefined) {
    //       this.user = [...this.user, { label: nkamuser[i].Name, value: nkamuser[i].Id }];
    //     }
    //   }
    //   let objuser = { label: 'None', value: this.actual_userid }
    //     this.user.unshift(objuser);
    // });

    getUserforGM().then(data=>{
      this.user = [];
      if (data) {
        for (let i = 0; i < data.length; i++) {
          this.user = [...this.user, { label: data[i].Name, value: data[i].Id }];
        }
        let objuser = { label: 'None', value: this.actual_userid }
        this.user.unshift(objuser);
      } else if (error) {
        this.user = [];
      }
    }).catch(err=>{
      console.log('GM user Err',err);
    });
    
    if (this.pjp_status !== undefined) {
      this.rkmOnstatus_pjp(this.pjp_status);
    }
  }

  async declarationMonth(mon, year) { 
    var date = new Date();
    var lastDayWithSlashes, month, dayNames, start, end, WeekDateList, firstDay, lastDay, WeekDate;
    console.log('declarationMonth() called');
    console.log('Date year ',date.getFullYear()+'month '+date.getMonth());
    if (year === '') {
      firstDay = new Date(date.getFullYear(), date.getMonth() , 1);
      lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
       console.log('when NULL firstDay ',firstDay+'lastDay ',lastDay);
    } else {
      console.log('yr ',year+'mnt ',date.getMonth()+' day ',1+' mon ',mon);
      firstDay = new Date(year, mon, 1);
      lastDay = new Date(year, mon + 1, 0);
      console.log('when data firstDay ',firstDay+'lastDay ',lastDay);
    }

    lastDayWithSlashes =
      lastDay.getFullYear() +
      "-" +
      (lastDay.getMonth() + 1) +
      "-" +
      lastDay.getDate();

    start = new Date(
      firstDay.getFullYear() +
      "-" +
      (firstDay.getMonth() + 1) +
      "-" +
      firstDay.getDate()
    );
    end = new Date(lastDayWithSlashes);
    this.totalDaysM = end.getDate();
    console.log('total days', this.totalDaysM);
    WeekDateList = [];

    month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    this.btn_approve = true;
    this.btn_reject = false;
    // console.log('year ',year);
    // console.log('Last day',lastDay);
    // // console.log('last day slashes',lastDayWithSlashes);
    this.months = month[start.getMonth()] + "-" + start.getFullYear();
    this.MonthValue = this.months;
    
   
    console.log('month Name',this.MonthValue);
    while (start <= end) {
      WeekDate = {};
      WeekDate.dayName = dayNames[start.getDay()];

      if (WeekDate.dayName === "Sun") {
        WeekDate.isWeekEnd = true;

      } else {
        WeekDate.isWeekEnd = false;
      }


      WeekDate.date = start.getDate();
      WeekDateList.push(WeekDate);


      start.setDate(start.getDate() + 1);
    }
    this.dates = WeekDateList;
   
    // new current date logic
    const currentDate = new Date();
    const today = currentDate.getDay();
    const todayDate = currentDate.getDate();
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(); // Get the last day of the current month
    console.log('last day of month',lastDayOfMonth);
    
    // Function to check if a given date is a weekend (Saturday or Sunday)
    // function isWeekend(date) {
    //     const day = date.getDay();
    //     return day === 0 || day === 6;
    // }
    
    // If today is not Saturday and not Sunday
    // if ((today !== 0 && today !== 6) && (todayDate === 1 || todayDate === 2)) {
    //     console.log('inside main if');
    //     this.disableAllinput = false;
    // }

    const firstWorkingDateOfMonth = this.getFirstWorkingDayOfMonth(currentDate.getFullYear(), currentDate.getMonth() + 1);
    console.log('firstWorkingDateOfMonth ', firstWorkingDateOfMonth);
    const lastOpenDate = this.getLastOpenDate(WindowDate, firstWorkingDateOfMonth);
    console.log('lastOpenDate ', lastOpenDate);
    console.log('inside if firstWorkingDateOfMonth ', firstWorkingDateOfMonth);
    if (currentDate >= firstWorkingDateOfMonth && currentDate <= lastOpenDate) {
      console.log('Enabled....');
      this.disableAllinput = false;
  } else {
      console.log('Disabled....');
      this.disableAllinput = true;
  }
    // If today is Saturday or Sunday
    
    // If today is a weekday (Monday to Friday)
    
  
this.profile = await getProfile()
     
console.log('month ',this.MonthValue+'start date ',firstDay+'enddate ',lastDay+'usr_id'+this.current_user+' Profile name',this.profile.split(' ')[0]);
let result = await getFilter1({ currentMonth: this.MonthValue, startDate: firstDay + '', endDate: lastDay + '', usr_id: this.current_user, profilename: this.profile.split(' ')[0] })
  console.log('current pjp', result);
  if(result!==''){
  this.MonthValue = result;
  }

  }


  getFirstWorkingDayOfMonth(year, month) {
    // JavaScript months are zero-based, so we need to subtract 1 from the month
    const firstDayOfMonth = new Date(year, month - 1, 1);
    let currentDay = firstDayOfMonth.getDay(); // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)

    // If it's Saturday (6) or Sunday (0), move to the next weekday
    while (currentDay === 0 || currentDay === 6) {
        firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1);
        currentDay = firstDayOfMonth.getDay();
    }

    return firstDayOfMonth;
}

getLastOpenDate(windowPeriod, firstWorkingDateOfMonth) {
  let lastOpenDate = new Date(firstWorkingDateOfMonth); // Copy the date to avoid mutating the original date
  const numToAdd = windowPeriod - 1;

  for (let i = 1; i <= numToAdd; i++) {
      lastOpenDate.setDate(lastOpenDate.getDate() + 1);

      if (lastOpenDate.getDay() === 6) {
          lastOpenDate.setDate(lastOpenDate.getDate() + 2); // Skip Saturday
      } else if (lastOpenDate.getDay() === 0) {
          lastOpenDate.setDate(lastOpenDate.getDate() + 1); // Skip Sunday
      }
  }

  return lastOpenDate;
}

isWeekend(date) {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday (0) or Saturday (6)
}

isValidDateToEnableCheckbox(date) {
  // Enable checkbox only if the date is not a weekend (Saturday or Sunday)
  return !this.isWeekend(date);
}



  bdmOnstatus_pjp() {
    // console.log('bdmOnstatus_pjp() called');
    // console.log('current status ', this.pjp_status);
    if (this.pjp_status === 'Draft') {
      this.setButton_state(false, false, false, true, true, false, false, true, true, true);
    }

    if (this.pjp_status === 'Pending') {
      this.setButton_state(true, true, false, true, true, false, false, true, true, true);
      this.disableAllinput = true;
    }

    if (this.pjp_status === 'Approved') {
      this.setButton_state(true, true, false, true, true, false, false, true, true, true);
      this.disableAllinput = true;

    }


    if (this.pjp_status === 'Rejected') {
      // console.log('condition for reject');
      this.setButton_state(false, false, false, true, true, false, false, true, true, true);
    }
  }

  rkmOnstatus_pjp(status) {
    // console.log('rkmOnstatus_pjp() called');
    // console.log('current status in RKAM ', this.pjp_status);
    if (status === 'Draft') {
      this.setButton_state(false, false, false, true, true, false, false, true, true, true);
    }
    if (status === 'Pending') {
      this.setButton_state(true, true, false, true, true, false, false, true, true, true);
      this.disableAllinput = true;
    }

    if (status === 'Pending' && this.recordId !== undefined) {
      this.diablebylink = true;
      this.setButton_state(true, true, true, false, false, true, true, false, false, false);
      // console.log('Approve and reject');
    }

    if (status === 'Approved') {
      this.setButton_state(true, true, false, true, true, false, false, true, true, true);
      this.disableAllinput = true;
    }
    if (status === 'Rejected') {
      // console.log('condition for reject');
      this.setButton_state(false, false, false, true, true, false, false, true, true, true);
    }
  }



  setButton_state(saveAsDisbleBtn, submitforApproval_btn, reset_btn, approve_btn, reject_btn, approve_btnhide, reject_btnhide, saveAshideBtn, submitforApprovalhide_btn, resethide_btn) {
    this.saveAsDisbleBtn = saveAsDisbleBtn;
    this.submitforApproval_btn = submitforApproval_btn;
    this.reset_btn = reset_btn;
    this.approve_btn = approve_btn;
    this.reject_btn = reject_btn;
    // hide btn 
    this.approve_btnhide = approve_btnhide;
    this.reject_btnhide = reject_btnhide;

    this.saveAshideBtn = saveAshideBtn;
    this.submitforApprovalhide_btn = submitforApprovalhide_btn;
    this.resethide_btn = resethide_btn;
  }

  renderButtonvisibility(current_mont, month_no) {
    // console.log('renderButtonvisibility() called');
    if (current_mont !== month_no) {
      if (this.pjp_status === 'Draft') {
        console.log('Approved 123',this.disableAllinput);
        this.setButton_state(true, true, false, true, true, false, false, true, true, true);
        this.disableAllinput = true;
       // console.log('check disable this.disableAllinput',this.disableAllinput);
      }
      if (this.pjp_status === 'Pending') {
        this.setButton_state(true, true, false, true, true, false, false, true, true, true);
        this.disableAllinput = true;
      }
      if (this.pjp_status === 'Approved') {
        console.log('Approved 123',this,disableAllinput);
        this.setButton_state(true, true, false, true, true, false, false, true, true, true);
        this.disableAllinput = true;
      }
      if (this.pjp_status === 'Rejected') {
        this.setButton_state(true, true, false, true, true, false, false, true, true, true);
        this.disableAllinput = true;
      }
      // this.setButton_state(true,true,true,true,true,false,false);
      // this.disableAllinput = true;
    } else {

      if (this.pjp_status === 'Draft') {
        this.setButton_state(false, false, false, true, true, false, false, true, true, true);
        this.disableAllinput = false;
       // console.log('check disable this.disableAllinput',this.disableAllinput);
      }
      if (this.pjp_status === 'Pending') {
        this.setButton_state(true, true, true, true, true, false, false, true, true, true);
        this.disableAllinput = true;
      }
      if (this.pjp_status === 'Approved') {
        this.setButton_state(true, true, false, true, true, false, false, true, true, true);
        this.disableAllinput = true;
      }
      if (this.pjp_status === 'Rejected') {
        this.setButton_state(false, false, false, true, true, false, false, true, true, true);
        this.disableAllinput = false;
      }
    }
  }

  submitforApprovalaction() {
    this.eventTocreateHold = [];
    this.savetrack = true;
    let count = 0;
    this.Plan_Status__c = 'Pending';
    Array.from(this.template.querySelectorAll("lightning-input")).forEach(
      element => {
        if (element.checked===true) {
          count++;
          if (element.name !== undefined) {
            console.log('event Created --->', this.eventTocreate,'length ',this.eventTocreate.length);
           
          }
        }
      });
    if (count === 0) {

      const evt = new ShowToastEvent({
        title: '',
        message: 'Please select at least one customer event ',
        variant: 'error',
        mode: 'dismissable'
      });
      this.dispatchEvent(evt);

    }
    else{

      saveAsDraft({ eventToCreate: this.eventTocreate, usr_id: this.current_user }).then(result => {
        console.log(' save as draft result ----------> ',result);
        if(result==='updated'){
          this.eventTocreate = [];
        }
        console.log('this.pjp_status_byLink1234',this.pjp_status_byLink);
    if (this.pjp_status_byLink === undefined || this.pjp_status_byLink === '') {
      getMonthmap()
        .then(data => {
          console.log('data on submit ',data);
          if(data){
          this.pjp_id = data[this.MonthValue];
          console.log('PJP ID on submit for approval', this.pjp_id);
          
          submitForApproval({ pjp_id: this.pjp_id }).then(value => {
            console.log(' inside approval Status ', value);
            this.pjp_status = value;
            this.approveflag = true;
            this.showMessage('', 'Submitted for Approval', 'success');
            setTimeout(()=>{
              location.reload();
            },1500);
          }).catch(()=>{
            this.showMessage('Error', 'Record is locked', 'error');
          });
          
        }else{
          // console.log('Something went wrong');
          this.showMessage('', 'Something went wrong', 'error');
        }
        });
    } else {
      this.pjp_status = this.pjp_status_byLink;
      this.showMessage('', 'Submitted for Approval', 'success');
    }
  });
  
  } 
  }

  approveAction() {
    this.commentapprove = true;
  }

  // saveApproveAction()
  // {
  //   this.commentapprove = false;
  //   console.log('comment value ',this.commentvalue);
  //   if (this.recordId===undefined) {
  //     getMonthOnUser({ usr_id: this.current_user, mon_name: this.MonthValue }).then(pjpid => {
  //       // console.log('pjpid ---> ',pjpid);
  //       approvePjp({ pjp_id: pjpid,comment:this.commentvalue }).then(result => {
  //       console.log('status 1111 ', result);
  //         if (result === true) {

  //           console.log('Approved==== ')
  //           this.pjp_status = 'Approved';
  //           this.approveflag = true;
  //           // console.log('when link not avaliable Record data ', this.pjp_status);
  //           this.showMessage('', 'Records Approved', 'success')
  //         } else {
  //           this.showMessage('', 'Error while Approving Records', 'error');
            
  //         }
  //       }).catch(()=>{
  //         this.showMessage('', 'Error while Approving Records', 'error')
  //       });
  //     });
  //   } else {
  //     // console.log('Record data approval', this.recordId);
  //     // console.log('when link avaliable Record data ', this.pjp_status);
  //     approvePjp({ pjp_id: this.recordId }).then(result => {
  //       // console.log('status by link', result);
  //       if (result === true) {
  //         this.pjp_status = 'Approved';
  //         this.approvebyLink = true;
  //         this.showMessage('', 'Records Approved', 'success')
  //       } else {
  //         this.showMessage('', 'Error while Approving Records', 'error')
  //       }
  //     }).catch(()=>{
  //       this.showMessage('', 'Error while Approving Records', 'error');
  //     });
  //   }
  // }

  async saveApproveAction() {
    this.commentapprove = false;
    console.log('comment value ',this.commentvalue);
    try {
      if (this.recordId===undefined) {
        const pjpid = await getMonthOnUser({ usr_id: this.current_user, mon_name: this.MonthValue });
        const result = await approvePjp({ pjp_id: pjpid, comment: this.commentvalue });
        if (result === true) {
          console.log('Approved==== ');
          this.pjp_status = 'Approved';
          this.approveflag = true;
          this.showMessage('', 'Records Approved', 'success');
        } else {
          this.showMessage('', 'Error while Approving Records', 'error');
        }
      } else {
        const result = await approvePjp({ pjp_id: this.recordId });
        if (result === true) {
          this.pjp_status = 'Approved';
          this.approvebyLink = true;
          this.showMessage('', 'Records Approved', 'success');
        } else {
          this.showMessage('', 'Error while Approving Records', 'error');
        }
      }
    } catch (error) {
      this.showMessage('', 'Error while Approving Records', 'error');
    }
  }
  

  showMessage(title, msg, varient) {
    const evt = new ShowToastEvent({
      title: title,
      message: msg,
      variant: varient,
      mode: 'dismissable'
    });
    this.dispatchEvent(evt);

  }

  rejectAction() {
    this.commentreject = true;
  }

  saveRejectAction()
  {
    this.commentreject = false;
    if (this.recordId===undefined) {
      getMonthOnUser({ usr_id: this.current_user, mon_name: this.MonthValue }).then(pjpid => {
        rejectPjp({ pjp_id: pjpid,comment:this.commentvalue }).then(result => {
          // console.log('status ', result);
          if (result === true) {
            this.pjp_status = 'Rejected';
            this.approveflag = true;
            this.showMessage('', 'Records Rejected', 'success')
          } else {
            this.showMessage('', 'Error while Approving Records', 'error')
          }

        });
      });
    } else {
      // console.log('Record data rejection', this.recordId);
      // console.log('PJP ID for rejection ', this.pjp_id);
      rejectPjp({ pjp_id: this.recordId }).then(result => {
        // console.log('status by link', result);
        if (result === true) {
          this.pjp_status = 'Rejected';
          this.approvebyLink = true;
          this.showMessage('', 'Records Rejected', 'success')
        } else {
          this.showMessage('', 'Error while Approving Records', 'error')
        }
      });
    }
  }

  closeComment()
  {
    this.commentapprove = false;
    this.commentreject = false;
  }

  navigateToHomePage() {
    // console.log('HOme tab1');
    this[NavigationMixin.Navigate]({
      type: 'standard__webPage',
      attributes: {
        url: '/lightning/page/home'
      }
    },
      true // Replaces the current page in your browser history with the URL
    );
  }
  
  resetFilter() {
   // refreshApex(this.wiredResult);
    console.log('inside reset filter');
    this.filter1 = '';
    this.filter3 = '';
    this.filter4 = '';
    location.reload();
    this.declarationMonth(new Date().getMonth(), '');
    // setTimeout(() => {
    //   location.reload();
    // }, 1500);
  }


 findAndReplace(object, value){
   var found =false;
  for(let x in object){
   if(x===value){
      //  console.log ('datafound-->',object[x]);
       found = true;
    break;
  
   }
  
  }
  return found

} 

openStandardCalender(){
  console.log('Calender tab1');
  this[NavigationMixin.Navigate]({
    type: 'standard__webPage',
    attributes: {
      url: '/lightning/o/Event/home'
    }
  },
    false // Replaces the current page in your browser history with the URL
  );
}


previousPage(){
  console.log('Previous Page');
  if (this.page > 1) {
    this.page = this.page - 1; //decrease page by 1
    this.displayRecordPerPage(this.page,this.pageSize);
    this.checkNextPreviousbtn(this.page,this.totalPage);
}
}
nextPage(){
  if((this.page<this.totalPage) && this.page !== this.totalPage){
    console.log('Next Page');
    this.page = this.page + 1; //increase page by 1
    this.displayRecordPerPage(this.page,this.pageSize);
    this.checkNextPreviousbtn(this.page,this.totalPage);
  }
  console.log('total Page',this.totalPage+' Page '+this.page);
}

firstPage(){
    this.page = 1;
    this.displayRecordPerPage(this.page,this.pageSize);
}

lastPage(){
   this.page = this.totalPage;
   this.displayRecordPerPage(this.page,this.pageSize);
}



displayRecordPerPage(page,pageSize){
  console.log('hello page');
  this.startingRecord = ((page -1) * pageSize) ;
  this.endingRecord = (pageSize * page);
  this.totalPage = Math.ceil(this.acclst_data.length/pageSize);

  this.endingRecord = (this.endingRecord > this.totalRecordCount) 
                      ? this.totalRecountCount : this.endingRecord; 
  console.log('start record ',this.startingRecord+'End record ',this.endingRecord+'total record ',this.totalRecordCount+'Page ',page+'Page size ',pageSize);
  this.acoountList = this.acclst_data.slice(this.startingRecord, this.endingRecord);
  this.startingRecord = this.startingRecord + 1;
  console.log('page list ',this.acoountList);
}

handleChangePageSize(event){
    console.log(event.detail.value);
    this.pageSize = parseInt(event.detail.value);
    this.page = 1;
    this.displayRecordPerPage(this.page,this.pageSize);
    console.log('total Page',this.totalPage+' Page '+this.page);
}

checkNextPreviousbtn(page,totalpage){
  if(totalpage>=page+1){
    this.nextbtn_disable = false;
  }else{
    this.nextbtn_disable = true;
  }
  if(page>1){
    this.previousbtn_disable = false;
  }else{
    this.previousbtn_disable = true;
  }

  if(page==1){
      this.firstbtn_disable = true;
  }else{
    this.firstbtn_disable = false;
  }

  if(page==totalpage){
    this.lastbtn_disable = true;
  }else{
    this.lastbtn_disable = false;
  }
}

}