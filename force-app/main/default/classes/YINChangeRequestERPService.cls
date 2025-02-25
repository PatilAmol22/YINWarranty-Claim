/**
* @description       : Calling External ERP Service when Record is Approved.
* @author            : Amol Patil/amol.patil@skinternational.com
* @group             : SKI
* @last modified on  : 03-02-2025
* @last modified by  : Amol Patil/amol.patil@skinternational.com
**/
public with sharing class YINChangeRequestERPService {
    /**
* AuraEnabled method to invoke the YIN ERP Service.
* @param recordId The Id of the YIN Change Request record.
* @return A string indicating the result of the ERP service invocation.
*/
    public static YINChangeRequestImpl impl = null;
    public static Requestwrapper reqwrap = null;
    public static List<Responswrapper> resWrapList = null;
    public static YIN_Change_Request__c changeReq = null;
    public static List<Account> accList = null;
    
    @InvocableMethod(label='Get Change Request Status' description='On the basis of Type and Status Calling ERP Service.')
    public static List<Responswrapper> yinERPService(List<Id> recordId){
        
        YINMonitorService x=new  YINMonitorService();
        LIBISObjectUnitOfWork uow=YINApplication.unitOfWork.newInstance();     
        uow=YINApplication.unitOfWork.newInstance();
        impl = (YINChangeRequestImpl)YINApplication.service.newInstance(YINIChangeRequest.class); 
        changeReq = impl.getRecord(recordId[0]);
        accList = impl.getAccountRecord(changeReq.Account__r.Id);
        
        reqwrap = new Requestwrapper();
        
        resWrapList = new List<Responswrapper>();
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        HTTPResponse res = new HTTPResponse();
        
        try {
            req.setEndpoint('callout:YINErpServiceEx');
            req.setMethod('POST');
            string jsonInput = '';
            string jsonstart =  '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Body>';
            string jsonend = '</Body></Envelope>';
            if (changeReq.Type__c == 'Email') {
                System.debug('Inside  Email ');
                reqwrap.eRPCustomerCode = changeReq.Account__r.ERP_Customer_Code__c;
                reqwrap.emailId = changeReq.Email__c;
                
                reqwrap.accountName = accList[0].Name;
                reqWrap.groupAccount = accList[0].Parent.Name;
                reqWrap.sfdcCustomerCode = accList[0].SFDC_Customer_Code__c;
                reqWrap.phone1 = accList[0].Contact_Person_Phone__c;
                reqWrap.primaryContactNumber = accList[0].Contact_Person_Phone__c;
                reqWrap.contactPersonEmail = accList[0].Contact_Person_Email__c;
                reqWrap.PANNumber = accList[0].PAN_Number__c;
                reqWrap.bankAccountNumber = accList[0].Bank_Account_Number__c;
                reqWrap.territoryCode = accList[0].Territory__r.Territory_Code__c;
                reqWrap.customerGroupCode = '';
                reqWrap.customerDiscountPriceGroupCode = '';
                reqWrap.orginalCreditLimit = accList[0].Orginal_Credit_Limit__c;
                reqWrap.creditLimitLCY = accList[0].Credit_Limit_LCY__c;
                reqWrap.additionalCreditLimit = accList[0].Additional_Credit_Limit__c;
                reqWrap.additionalCreditExpiryDate = '';
                reqWrap.fixedAdditionalCreditAmount = accList[0].Fixed_Additional_Credit_Amount__c;
                reqWrap.balanceLCY = accList[0].BalanceLCY__c;
                reqWrap.paymentTerm = accList[0].Payment_Term__c;
                reqWrap.creditDays = accList[0].Credit_Days_Group_Dealer__c;
                reqWrap.applicationMethod = accList[0].Application_Method__c;
                reqWrap.territoryChannelCode = accList[0].Territory_Channel_Code_Mapping__r.Territory_Channel_Code__c;
                reqWrap.eRPCustomerCode = accList[0].ERP_Customer_Code__c;
                reqWrap.address1 = accList[0].Address__c;
                reqWrap.address2 = accList[0].Address2__c;
                reqWrap.contactName = accList[0].Contact_Name__c;
                reqWrap.PANStatus = accList[0].PAN_Status__c;
                reqWrap.GSTRegistrationNumber = accList[0].GST_Registration_Number__c;
                reqWrap.GSTCustomerType = accList[0].GST_Customer_Type__c;
                reqWrap.bussinessType = accList[0].Dealer_Type__c;
                reqWrap.website = accList[0].Website;
                reqWrap.anotherBankAccountNumber = accList[0].Another_Bank_Account_Number__c;
                reqWrap.ratio = 1.0;
                reqWrap.status = accList[0].Dealer_Status__c;
                reqWrap.block = accList[0].Block__c;
                reqWrap.districtCode = accList[0].District__r.District_Code__c;
                reqWrap.zoneCode = accList[0].Zone__r.Zone_Code__c;
                reqWrap.stateCode = accList[0].State__r.StateCode__c;
                reqWrap.countryCode = accList[0].Country__r.CountryCode__c;
                reqWrap.subDistrictCode = accList[0].Sub_District__r.Sub_District_Code__c;
                reqWrap.cityCode = accList[0].City__r.City_Code__c;
                reqWrap.pincode = accList[0].PinCode__r.Name;
                reqWrap.channelCode = accList[0].Channel_Code__r.Channel_Code__c;
                reqWrap.locationCode = accList[0].Location__r.Location_Code__c;
                reqWrap.aadharNumber = accList[0].Aadhar_Number__c;
                reqWrap.priceGroupCode ='';
                
                /*reqWrap.YCNCustomer = accList[0].YCN_Customer__c;
                reqWrap.OEMCustomer = accList[0].OEM_Customer__c;
                reqWrap.X1HTCS = accList[0].X1H_TCS__c;
                reqWrap.revivalDate = accList[0].revival_Date__c;
                reqWrap.onBoardingDate = accList[0].On_Boarding_Date__c; */
                
                jsonInput ='<GetCustomerDetails xmlns="urn:microsoft-dynamics-schemas/codeunit/SFDCIntegration"><requestMsg>'+JSON.serialize(reqwrap)+'</requestMsg></GetCustomerDetails>';
                system.debug('email input:'+jsonInput);
                
            } else if (changeReq.Type__c == 'Phone') {
                System.debug('Inside  Phone ');
                reqwrap.eRPCustomerCode = changeReq.Account__r.ERP_Customer_Code__c;
                reqwrap.phoneNo = changeReq.Phone__c;
                
                reqwrap.accountName = accList[0].Name;
                reqWrap.groupAccount = accList[0].Parent.Name;
                reqWrap.sfdcCustomerCode = accList[0].SFDC_Customer_Code__c;
                reqWrap.phone1 = accList[0].Contact_Person_Phone__c;
                reqWrap.primaryContactNumber = accList[0].Contact_Person_Phone__c;
                reqWrap.contactPersonEmail = accList[0].Contact_Person_Email__c;
                reqWrap.PANNumber = accList[0].PAN_Number__c;
                reqWrap.bankAccountNumber = accList[0].Bank_Account_Number__c;
                reqWrap.territoryCode = accList[0].Territory__r.Territory_Code__c;
                reqWrap.customerGroupCode = '';
                reqWrap.customerDiscountPriceGroupCode = '';
                reqWrap.orginalCreditLimit = accList[0].Orginal_Credit_Limit__c;
                reqWrap.creditLimitLCY = accList[0].Credit_Limit_LCY__c;
                reqWrap.additionalCreditLimit = accList[0].Additional_Credit_Limit__c;
                reqWrap.additionalCreditExpiryDate = '';
                reqWrap.fixedAdditionalCreditAmount = accList[0].Fixed_Additional_Credit_Amount__c;
                reqWrap.balanceLCY = accList[0].BalanceLCY__c;
                reqWrap.paymentTerm = accList[0].Payment_Term__c;
                reqWrap.creditDays = accList[0].Credit_Days_Group_Dealer__c;
                reqWrap.applicationMethod = accList[0].Application_Method__c;
                reqWrap.territoryChannelCode = accList[0].Territory_Channel_Code_Mapping__r.Territory_Channel_Code__c;
                reqWrap.eRPCustomerCode = accList[0].ERP_Customer_Code__c;
                reqWrap.address1 = accList[0].Address__c;
                reqWrap.address2 = accList[0].Address2__c;
                reqWrap.contactName = accList[0].Contact_Name__c;
                reqWrap.PANStatus = accList[0].PAN_Status__c;
                reqWrap.GSTRegistrationNumber = accList[0].GST_Registration_Number__c;
                reqWrap.GSTCustomerType = accList[0].GST_Customer_Type__c;
                reqWrap.bussinessType = accList[0].Dealer_Type__c;
                reqWrap.website = accList[0].Website;
                reqWrap.anotherBankAccountNumber = accList[0].Another_Bank_Account_Number__c;
                reqWrap.ratio = 1.0;
                reqWrap.status = accList[0].Dealer_Status__c;
                reqWrap.block = accList[0].Block__c;
                reqWrap.districtCode = accList[0].District__r.District_Code__c;
                reqWrap.zoneCode = accList[0].Zone__r.Zone_Code__c;
                reqWrap.stateCode = accList[0].State__r.StateCode__c;
                reqWrap.countryCode = accList[0].Country__r.CountryCode__c;
                reqWrap.subDistrictCode = accList[0].Sub_District__r.Sub_District_Code__c;
                reqWrap.cityCode = accList[0].City__r.City_Code__c;
                reqWrap.pincode = accList[0].PinCode__r.Name;
                reqWrap.channelCode = accList[0].Channel_Code__r.Channel_Code__c;
                reqWrap.locationCode = accList[0].Location__r.Location_Code__c;
                reqWrap.aadharNumber = accList[0].Aadhar_Number__c;
                reqWrap.priceGroupCode ='';
                
                /*reqWrap.YCNCustomer = accList[0].YCN_Customer__c;
                reqWrap.OEMCustomer = accList[0].OEM_Customer__c;
                reqWrap.X1HTCS = accList[0].X1H_TCS__c;
                reqWrap.revivalDate = accList[0].revival_Date__c;
                reqWrap.onBoardingDate = accList[0].On_Boarding_Date__c; */
                jsonInput ='<GetCustomerDetails xmlns="urn:microsoft-dynamics-schemas/codeunit/SFDCIntegration"><requestMsg>'+JSON.serialize(reqwrap)+'</requestMsg></GetCustomerDetails>';
                system.debug('phone input:'+jsonInput);
                
                } else if (changeReq.Type__c == 'Secondary Phone') {
                System.debug('Secondary Phone');
                reqwrap.eRPCustomerCode = changeReq.Account__r.ERP_Customer_Code__c;
                reqwrap.phoneNo1 = changeReq.Secondary_Phone__c;
                
                reqwrap.accountName = accList[0].Name;
                reqWrap.groupAccount = accList[0].Parent.Name;
                reqWrap.sfdcCustomerCode = accList[0].SFDC_Customer_Code__c;
                reqWrap.phone1 = accList[0].Contact_Person_Phone__c;
                reqWrap.primaryContactNumber = accList[0].Contact_Person_Phone__c;
                reqWrap.contactPersonEmail = accList[0].Contact_Person_Email__c;
                reqWrap.PANNumber = accList[0].PAN_Number__c;
                reqWrap.bankAccountNumber = accList[0].Bank_Account_Number__c;
                reqWrap.territoryCode = accList[0].Territory__r.Territory_Code__c;
                reqWrap.customerGroupCode = '';
                reqWrap.customerDiscountPriceGroupCode = '';
                reqWrap.orginalCreditLimit = accList[0].Orginal_Credit_Limit__c;
                reqWrap.creditLimitLCY = accList[0].Credit_Limit_LCY__c;
                reqWrap.additionalCreditLimit = accList[0].Additional_Credit_Limit__c;
                reqWrap.additionalCreditExpiryDate = '';
                reqWrap.fixedAdditionalCreditAmount = accList[0].Fixed_Additional_Credit_Amount__c;
                reqWrap.balanceLCY = accList[0].BalanceLCY__c;
                reqWrap.paymentTerm = accList[0].Payment_Term__c;
                reqWrap.creditDays = accList[0].Credit_Days_Group_Dealer__c;
                reqWrap.applicationMethod = accList[0].Application_Method__c;
                reqWrap.territoryChannelCode = accList[0].Territory_Channel_Code_Mapping__r.Territory_Channel_Code__c;
                reqWrap.eRPCustomerCode = accList[0].ERP_Customer_Code__c;
                reqWrap.address1 = accList[0].Address__c;
                reqWrap.address2 = accList[0].Address2__c;
                reqWrap.contactName = accList[0].Contact_Name__c;
                reqWrap.PANStatus = accList[0].PAN_Status__c;
                reqWrap.GSTRegistrationNumber = accList[0].GST_Registration_Number__c;
                reqWrap.GSTCustomerType = accList[0].GST_Customer_Type__c;
                reqWrap.bussinessType = accList[0].Dealer_Type__c;
                reqWrap.website = accList[0].Website;
                reqWrap.anotherBankAccountNumber = accList[0].Another_Bank_Account_Number__c;
                reqWrap.ratio = 1.0;
                reqWrap.status = accList[0].Dealer_Status__c;
                reqWrap.block = accList[0].Block__c;
                reqWrap.districtCode = accList[0].District__r.District_Code__c;
                reqWrap.zoneCode = accList[0].Zone__r.Zone_Code__c;
                reqWrap.stateCode = accList[0].State__r.StateCode__c;
                reqWrap.countryCode = accList[0].Country__r.CountryCode__c;
                reqWrap.subDistrictCode = accList[0].Sub_District__r.Sub_District_Code__c;
                reqWrap.cityCode = accList[0].City__r.City_Code__c;
                reqWrap.pincode = accList[0].PinCode__r.Name;
                reqWrap.channelCode = accList[0].Channel_Code__r.Channel_Code__c;
                reqWrap.locationCode = accList[0].Location__r.Location_Code__c;
                reqWrap.aadharNumber = accList[0].Aadhar_Number__c;
                reqWrap.priceGroupCode ='';
                
                /*reqWrap.YCNCustomer = accList[0].YCN_Customer__c;
                reqWrap.OEMCustomer = accList[0].OEM_Customer__c;
                reqWrap.X1HTCS = accList[0].X1H_TCS__c;
                reqWrap.revivalDate = accList[0].revival_Date__c;
                reqWrap.onBoardingDate = accList[0].On_Boarding_Date__c; */
                jsonInput ='<GetCustomerDetails xmlns="urn:microsoft-dynamics-schemas/codeunit/SFDCIntegration"><requestMsg>'+JSON.serialize(reqwrap)+'</requestMsg></GetCustomerDetails>';
                system.debug('phone input:'+jsonInput);
                    
            } else if (changeReq.Type__c == 'Change Billing Address') {
                System.debug('Inside  Change Billing Address:');
                reqwrap.eRPCustomerCode = changeReq.Account__r.ERP_Customer_Code__c;
                reqwrap.name = changeReq.Name__c; 
                reqwrap.address1 = changeReq.Billing_Address_1__c;
                reqwrap.address2 = changeReq.Billing_Address_2__c;
                reqwrap.pincode = changeReq.Pincode__r.Name; 
                reqwrap.stateCode = changeReq.State__r.StateCode__c; 
                reqwrap.districtCode = changeReq.District__r.District_Code__c; 
                reqwrap.subDistrictCode = changeReq.Sub_District__r.Sub_District_Code__c; 
                reqwrap.cityCode = changeReq.City__r.City_Code__c; 
                
                reqwrap.accountName = accList[0].Name;
                reqWrap.groupAccount = accList[0].Parent.Name;
                reqWrap.sfdcCustomerCode = accList[0].SFDC_Customer_Code__c;
                reqWrap.phone1 = accList[0].Contact_Person_Phone__c;
                reqWrap.primaryContactNumber = accList[0].Contact_Person_Phone__c;
                reqWrap.contactPersonEmail = accList[0].Contact_Person_Email__c;
                reqWrap.PANNumber = accList[0].PAN_Number__c;
                reqWrap.bankAccountNumber = accList[0].Bank_Account_Number__c;
                reqWrap.territoryCode = accList[0].Territory__r.Territory_Code__c;
                reqWrap.customerGroupCode = '';
                reqWrap.customerDiscountPriceGroupCode = '';
                reqWrap.orginalCreditLimit = accList[0].Orginal_Credit_Limit__c;
                reqWrap.creditLimitLCY = accList[0].Credit_Limit_LCY__c;
                reqWrap.additionalCreditLimit = accList[0].Additional_Credit_Limit__c;
                reqWrap.additionalCreditExpiryDate = '';
                reqWrap.fixedAdditionalCreditAmount = accList[0].Fixed_Additional_Credit_Amount__c;
                reqWrap.balanceLCY = accList[0].BalanceLCY__c;
                reqWrap.paymentTerm = accList[0].Payment_Term__c;
                reqWrap.creditDays = accList[0].Credit_Days_Group_Dealer__c;
                reqWrap.applicationMethod = accList[0].Application_Method__c;
                reqWrap.territoryChannelCode = accList[0].Territory_Channel_Code_Mapping__r.Territory_Channel_Code__c;
                reqWrap.eRPCustomerCode = accList[0].ERP_Customer_Code__c;
                reqWrap.address1 = accList[0].Address__c;
                reqWrap.address2 = accList[0].Address2__c;
                reqWrap.contactName = accList[0].Contact_Name__c;
                reqWrap.PANStatus = accList[0].PAN_Status__c;
                reqWrap.GSTRegistrationNumber = accList[0].GST_Registration_Number__c;
                reqWrap.GSTCustomerType = accList[0].GST_Customer_Type__c;
                reqWrap.bussinessType = accList[0].Dealer_Type__c;
                reqWrap.website = accList[0].Website;
                reqWrap.anotherBankAccountNumber = accList[0].Another_Bank_Account_Number__c;
                reqWrap.ratio =1.0;
                reqWrap.status = accList[0].Dealer_Status__c;
                reqWrap.block = accList[0].Block__c;
                reqWrap.districtCode = accList[0].District__r.District_Code__c;
                reqWrap.zoneCode = accList[0].Zone__r.Zone_Code__c;
                reqWrap.stateCode = accList[0].State__r.StateCode__c;
                reqWrap.countryCode = accList[0].Country__r.CountryCode__c;
                reqWrap.subDistrictCode = accList[0].Sub_District__r.Sub_District_Code__c;
                reqWrap.cityCode = accList[0].City__r.City_Code__c;
                reqWrap.pincode = accList[0].PinCode__r.Name;
                reqWrap.channelCode = accList[0].Channel_Code__r.Channel_Code__c;
                reqWrap.locationCode = accList[0].Location__r.Location_Code__c;
                reqWrap.aadharNumber = accList[0].Aadhar_Number__c;
                reqWrap.priceGroupCode ='';
                
              /*reqWrap.YCNCustomer = accList[0].YCN_Customer__c;
                reqWrap.OEMCustomer = accList[0].OEM_Customer__c;
                reqWrap.X1HTCS = accList[0].X1H_TCS__c;
                reqWrap.revivalDate = accList[0].revival_Date__c;
                reqWrap.onBoardingDate = accList[0].On_Boarding_Date__c; */
                jsonInput ='<GetCustomerDetails xmlns="urn:microsoft-dynamics-schemas/codeunit/SFDCIntegration"><requestMsg>'+JSON.serialize(reqwrap)+'</requestMsg></GetCustomerDetails>';
           
            } else if (changeReq.Type__c == 'Change Shipping Address') {
                System.debug('Inside  Change Shipping Address:');
                reqwrap.eRPCustomerCode = changeReq.Account__r.ERP_Customer_Code__c;
                reqwrap.shipToAddress = changeReq.Ship_To_Address__c; 
                reqwrap.name = changeReq.Name__c;
                reqwrap.ERPShipToCode = changeReq.Ship_To_Address__r.ERP_Ship_To_Code__c;
                reqwrap.address1 = changeReq.Billing_Address_1__c;
                reqwrap.address2 = changeReq.Billing_Address_2__c;
                reqwrap.pincode = changeReq.Pincode__r.Name; 
                reqwrap.countryCode = changeReq.Country__r.CountryCode__c;
                reqwrap.stateCode = changeReq.State__r.StateCode__c; 
                reqwrap.districtCode = changeReq.District__r.District_Code__c; 
                reqwrap.subDistrictCode = changeReq.Sub_District__r.Sub_District_Code__c; 
                reqwrap.cityCode = changeReq.City__r.City_Code__c; 
                
                reqwrap.accountName = accList[0].Name;
                reqWrap.groupAccount = accList[0].Parent.Name;
                reqWrap.sfdcCustomerCode = accList[0].SFDC_Customer_Code__c;
                reqWrap.phone1 = accList[0].Contact_Person_Phone__c;
                reqWrap.primaryContactNumber = accList[0].Contact_Person_Phone__c;
                reqWrap.contactPersonEmail = accList[0].Contact_Person_Email__c;
                reqWrap.PANNumber = accList[0].PAN_Number__c;
                reqWrap.bankAccountNumber = accList[0].Bank_Account_Number__c;
                reqWrap.territoryCode = accList[0].Territory__r.Territory_Code__c;
                reqWrap.customerGroupCode = '';
                reqWrap.customerDiscountPriceGroupCode = '';
                reqWrap.orginalCreditLimit = accList[0].Orginal_Credit_Limit__c;
                reqWrap.creditLimitLCY = accList[0].Credit_Limit_LCY__c;
                reqWrap.additionalCreditLimit = accList[0].Additional_Credit_Limit__c;
                reqWrap.additionalCreditExpiryDate = '';
                reqWrap.fixedAdditionalCreditAmount = accList[0].Fixed_Additional_Credit_Amount__c;
                reqWrap.balanceLCY = accList[0].BalanceLCY__c;
                reqWrap.paymentTerm = accList[0].Payment_Term__c;
                reqWrap.creditDays = accList[0].Credit_Days_Group_Dealer__c;
                reqWrap.applicationMethod = accList[0].Application_Method__c;
                reqWrap.territoryChannelCode = accList[0].Territory_Channel_Code_Mapping__r.Territory_Channel_Code__c;
                reqWrap.eRPCustomerCode = accList[0].ERP_Customer_Code__c;
                reqWrap.address1 = accList[0].Address__c;
                reqWrap.address2 = accList[0].Address2__c;
                reqWrap.contactName = accList[0].Contact_Name__c;
                reqWrap.PANStatus = accList[0].PAN_Status__c;
                reqWrap.GSTRegistrationNumber = accList[0].GST_Registration_Number__c;
                reqWrap.GSTCustomerType = accList[0].GST_Customer_Type__c;
                reqWrap.bussinessType = accList[0].Dealer_Type__c;
                reqWrap.website = accList[0].Website;
                reqWrap.anotherBankAccountNumber = accList[0].Another_Bank_Account_Number__c;
                reqWrap.ratio = 1.0;
                reqWrap.status = accList[0].Dealer_Status__c;
                reqWrap.block = accList[0].Block__c;
                reqWrap.districtCode = accList[0].District__r.District_Code__c;
                reqWrap.zoneCode = accList[0].Zone__r.Zone_Code__c;
                reqWrap.stateCode = accList[0].State__r.StateCode__c;
                reqWrap.countryCode = accList[0].Country__r.CountryCode__c;
                reqWrap.subDistrictCode = accList[0].Sub_District__r.Sub_District_Code__c;
                reqWrap.cityCode = accList[0].City__r.City_Code__c;
                reqWrap.pincode = accList[0].PinCode__r.Name;
                reqWrap.channelCode = accList[0].Channel_Code__r.Channel_Code__c;
                reqWrap.locationCode = accList[0].Location__r.Location_Code__c;
                reqWrap.aadharNumber = accList[0].Aadhar_Number__c;
                reqWrap.priceGroupCode ='';
                
                /*reqWrap.YCNCustomer = accList[0].YCN_Customer__c;
                reqWrap.OEMCustomer = accList[0].OEM_Customer__c;
                reqWrap.X1HTCS = accList[0].X1H_TCS__c;
                reqWrap.revivalDate = accList[0].revival_Date__c;
                reqWrap.onBoardingDate = accList[0].On_Boarding_Date__c; */
                jsonInput ='<GetShipToAddress xmlns="urn:microsoft-dynamics-schemas/codeunit/SFDCIntegration"><requestMsg>'+JSON.serialize(reqwrap)+'</requestMsg></GetShipToAddress>';
           
            } else if (changeReq.Type__c == 'New Shipping Address') {
                System.debug('Inside  New Shipping Address:');
                reqwrap.eRPCustomerCode = changeReq.Account__r.ERP_Customer_Code__c;
                reqwrap.SFDCShipToCode = changeReq.Account__r.SFDC_Customer_Code__c;
                reqwrap.name = changeReq.Name__c;
                reqwrap.address1 = changeReq.Billing_Address_1__c;
                reqwrap.address2 = changeReq.Billing_Address_2__c;
                reqwrap.contactName = changeReq.Contact_Name__c;
                reqwrap.phoneNo = changeReq.Phone__c;
                reqwrap.emailId = changeReq.Email__c;
                reqwrap.pincode = changeReq.Pincode__r.Name; 
                reqwrap.GSTRegistrationNo = changeReq.GST_Registration_Number__c;
                reqwrap.countryCode = changeReq.Country__r.CountryCode__c;
                reqwrap.stateCode = changeReq.State__r.StateCode__c; 
                reqwrap.districtCode = changeReq.District__r.District_Code__c; 
                reqwrap.subDistrictCode = changeReq.Sub_District__r.Sub_District_Code__c; 
                reqwrap.cityCode = changeReq.City__r.City_Code__c; 
                reqwrap.website = changeReq.Website__c; 
                reqwrap.locationCode = changeReq.Account__r.Location__r.Location_Code__c;
                
                reqwrap.accountName = accList[0].Name;
                reqWrap.groupAccount = accList[0].Parent.Name;
                reqWrap.sfdcCustomerCode = accList[0].SFDC_Customer_Code__c;
                reqWrap.phone1 = accList[0].Contact_Person_Phone__c;
                reqWrap.primaryContactNumber = accList[0].Contact_Person_Phone__c;
                reqWrap.contactPersonEmail = accList[0].Contact_Person_Email__c;
                reqWrap.PANNumber = accList[0].PAN_Number__c;
                reqWrap.bankAccountNumber = accList[0].Bank_Account_Number__c;
                reqWrap.territoryCode = accList[0].Territory__r.Territory_Code__c;
                reqWrap.customerGroupCode = '';
                reqWrap.customerDiscountPriceGroupCode = '';
                reqWrap.orginalCreditLimit = accList[0].Orginal_Credit_Limit__c;
                reqWrap.creditLimitLCY = accList[0].Credit_Limit_LCY__c;
                reqWrap.additionalCreditLimit = accList[0].Additional_Credit_Limit__c;
                reqWrap.additionalCreditExpiryDate = '';
                reqWrap.fixedAdditionalCreditAmount = accList[0].Fixed_Additional_Credit_Amount__c;
                reqWrap.balanceLCY = accList[0].BalanceLCY__c;
                reqWrap.paymentTerm = accList[0].Payment_Term__c;
                reqWrap.creditDays = accList[0].Credit_Days_Group_Dealer__c;
                reqWrap.applicationMethod = accList[0].Application_Method__c;
                reqWrap.territoryChannelCode = accList[0].Territory_Channel_Code_Mapping__r.Territory_Channel_Code__c;
                reqWrap.eRPCustomerCode = accList[0].ERP_Customer_Code__c;
                reqWrap.address1 = accList[0].Address__c;
                reqWrap.address2 = accList[0].Address2__c;
                reqWrap.contactName = accList[0].Contact_Name__c;
                reqWrap.PANStatus = accList[0].PAN_Status__c;
                reqWrap.GSTRegistrationNumber = accList[0].GST_Registration_Number__c;
                reqWrap.GSTCustomerType = accList[0].GST_Customer_Type__c;
                reqWrap.bussinessType = accList[0].Dealer_Type__c;
                reqWrap.website = accList[0].Website;
                reqWrap.anotherBankAccountNumber = accList[0].Another_Bank_Account_Number__c;
                reqWrap.ratio = 1.0;
                reqWrap.status = accList[0].Dealer_Status__c;
                reqWrap.block = accList[0].Block__c;
                reqWrap.districtCode = accList[0].District__r.District_Code__c;
                reqWrap.zoneCode = accList[0].Zone__r.Zone_Code__c;
                reqWrap.stateCode = accList[0].State__r.StateCode__c;
                reqWrap.countryCode = accList[0].Country__r.CountryCode__c;
                reqWrap.subDistrictCode = accList[0].Sub_District__r.Sub_District_Code__c;
                reqWrap.cityCode = accList[0].City__r.City_Code__c;
                reqWrap.pincode = accList[0].PinCode__r.Name;
                reqWrap.channelCode = accList[0].Channel_Code__r.Channel_Code__c;
                reqWrap.locationCode = accList[0].Location__r.Location_Code__c;
                reqWrap.aadharNumber = accList[0].Aadhar_Number__c;
                reqWrap.priceGroupCode ='';
                
                /*reqWrap.YCNCustomer = accList[0].YCN_Customer__c;
                reqWrap.OEMCustomer = accList[0].OEM_Customer__c;
                reqWrap.X1HTCS = accList[0].X1H_TCS__c;
                reqWrap.revivalDate = accList[0].revival_Date__c;
                reqWrap.onBoardingDate = accList[0].On_Boarding_Date__c; */
                
                jsonInput ='<GetShipToAddress xmlns="urn:microsoft-dynamics-schemas/codeunit/SFDCIntegration"><requestMsg>'+JSON.serialize(reqwrap)+'</requestMsg></GetShipToAddress>';
            }
            string requestBody =  jsonstart+jsonInput+jsonend;
            System.debug('req body:' +requestBody);
            req.setBody(requestBody);
            res = http.send(req);
            System.debug('res:'+res);
            system.debug('cr request:'+changeReq);
            if (res != null || res.getStatusCode() == 200) {
                yinERPServiceResponce(res.getbody(),changeReq.Id);
                System.debug('@@@@@@');
                YINMonitorLogWrap exceptionLog = new YINMonitorLogWrap();
                exceptionLog.apexClass = 'YINChangeRequestERPService';
                exceptionLog.recordId = changeReq.id;
                exceptionLog.module = 'ChangeRequestERPService';
                exceptionLog.userId = UserInfo.getUserId();
                exceptionLog.request = requestBody;
                exceptionLog.response = res.getbody();
                exceptionLog.statusCode = String.valueof(res.getStatusCode());
                exceptionLog.typeOfIntegration = 'Outbound';
                exceptionLog.externalSystemName = 'YINErpServiceEx';
                exceptionLog.method = 'POST';
                exceptionLog.requestURL=requestBody;
                exceptionLog.typeOfIntegration='SFDC';
                x.requestResponseLog(exceptionLog);
            }else {
                System.debug('Failed:');
                YINMonitorLogWrap exceptionLog = new YINMonitorLogWrap();
                exceptionLog.apexClass = 'YINChangeRequestERPService';
                exceptionLog.recordId = changeReq.Id;
                exceptionLog.module = 'ChangeRequestERPService';
                exceptionLog.userId = UserInfo.getUserId();
                exceptionLog.request = requestBody;
                exceptionLog.response = res.getbody();
                exceptionLog.statusCode = String.valueof(res.getStatusCode());
                exceptionLog.typeOfIntegration = 'Outbound';
                exceptionLog.externalSystemName = 'YINErpServiceEx';
                exceptionLog.method = 'POST';
                exceptionLog.requestURL=requestBody;
                exceptionLog.typeOfIntegration='SFDC';
                x.requestResponseLog(exceptionLog);
            }
            Responswrapper reswrap = new Responswrapper();
            reswrap.success = true;
            reswrap.massage = 'In Future';
            resWrapList.add(reswrap);
            YINMonitorLogWrap exceptionLog = new YINMonitorLogWrap();
            exceptionLog.apexClass = 'YINChangeRequestERPService';
            exceptionLog.recordId = changeReq.Id;
            exceptionLog.module = 'ChangeRequestERPService';
            exceptionLog.userId = UserInfo.getUserId();
            exceptionLog.request = requestBody;
            exceptionLog.response = res.getbody();
            exceptionLog.statusCode = String.valueof(res.getStatusCode());
            exceptionLog.typeOfIntegration = 'Outbound';
            exceptionLog.externalSystemName = 'YINErpServiceEx';
            exceptionLog.method = 'POST';
            exceptionLog.requestURL=requestBody;
            exceptionLog.typeOfIntegration='SFDC';
            x.requestResponseLog(exceptionLog);
            return resWrapList;
        } catch (Exception e) {
            system.debug('get line no:'+e.getlinenumber());
            system.debug('inside Eception:'+e.getMessage());
            Responswrapper reswrap = new Responswrapper();
            reswrap.success = false;
            reswrap.massage = e.getmessage();
            resWrapList.add(reswrap);
            YINMonitorLogWrap exceptionLog = new YINMonitorLogWrap();
            exceptionLog.exObj = e;
            exceptionLog.recordId = changeReq.Id;
            exceptionLog.apexClass = 'YINChangeRequestERPService';
            exceptionLog.module = 'ChangeRequestERPService';
            exceptionLog.userId = UserInfo.getUserId();
            x.exceptionHandler(exceptionLog);
            return resWrapList;
        }
    }
    
    /**
* Asynchronous method to handle ERP service response.
* Invoked by future method after ERP service callout.
* @param resBody Response body from ERP service.
* @param crId    Change Request Id associated with the response.
*/
    @future(callout=true)
    private static void yinERPServiceResponce(string resBody,string crId) {
        impl = (YINChangeRequestImpl)YINApplication.service.newInstance(YINIChangeRequest.class); 
        changeReq=  impl.getRecord(crId);
        boolean crIsUpdated = false;
        System.debug('Inside Future changeReq:'+changeReq);
        //HTTPResponse res = (HTTPResponse)JSON.deserialize(resStr,HTTPResponse.class);
        System.debug('Inside Future:'+resBody);
        Map<String, Object> jsonMap = new  Map<String, Object>();
        string soapResponse = resBody;
        Dom.Document doc = new Dom.Document();
        doc.load(soapResponse);
        Dom.XmlNode root = doc.getRootElement();
        String nms1 = root.getNameSpace();
        string nms2 =''; 
        DOM.XmlNode body = root.getChildElement('Body', nms1);
        List<DOM.XMLNode> bodyChildrenList = body.getChildElements();
        for (DOM.XMLNode passRes : bodyChildrenList) {
            nms2 = passRes.getnamespace();
        }
        if(changeReq.Type__c == 'Email' || changeReq.Type__c == 'Phone' || changeReq.Type__c == 'Change Billing Address'){
            DOM.XmlNode getCustomerDetailsResult = body.getChildElement('GetCustomerDetails_Result', nms2);
            DOM.XmlNode requestMsgNode = getCustomerDetailsResult.getChildElement('requestMsg', nms2);
            String requestMsg = requestMsgNode.getText();
            system.debug('req msg:'+requestMsg);
            //String processedJsonString = requestMsg.replaceAll('"error" : ', '"error" : "').replaceAll('}', '"}');
            jsonMap = (Map<String, Object>)JSON.deserializeUntyped(requestMsg);
            system.debug('req msg@@:'+jsonMap);
        }else if(changeReq.Type__c == 'Change Shipping Address' || changeReq.Type__c == 'New Shipping Address'){
            DOM.XmlNode getCustomerDetailsResult = body.getChildElement('GetShipToAddress_Result', nms2);
            DOM.XmlNode requestMsgNode = getCustomerDetailsResult.getChildElement('requestMsg', nms2);
            String requestMsg = requestMsgNode.getText();
            jsonMap = (Map<String, Object>)JSON.deserializeUntyped(requestMsg);
        }
        if((boolean)jsonMap.get('success') == true){
            string shiptocode = (string)jsonMap.get('ERPShipToCode'); 
            System.debug('Inside Future 1');
            changeReq.Status__c = 'ERP In Success';
            crIsUpdated = impl.updateRecord(changeReq);
            boolean isProcessed = false;
            isProcessed =  yinProcessERPResponse(changeReq,shiptocode); 
        } else {
            changeReq.Status__c = 'ERP In Failed';
            crIsUpdated = impl.updateRecord(changeReq);
        }
    } 
    
    /**
* AuraEnabled method to process the ERP response for a YIN Change Request record.
* @param recordId The Id of the YIN Change Request record.
* @return A string indicating the result of the ERP response processing.
*/
    @AuraEnabled
    public static boolean yinProcessERPResponse(YIN_Change_Request__c changeReq, string shiptocode){
        YINChangeRequestImpl impl = (YINChangeRequestImpl)YINApplication.service.newInstance(YINIChangeRequest.class); 
        boolean isUpdated = false;
        boolean isCreated = false;
        try {
            
            if(changeReq.Type__c == 'Email'){
                System.debug('inside Save : ' + changeReq.Type__c );
                List<Account> accList =  impl.getDealerAccount(changeReq.Account__c);
                accList[0].Contact_Person_Email__c= changeReq.Email__c;
                isUpdated = impl.updateDealerRecord(accList[0]);
            }else if(changeReq.Type__c == 'Phone'){
                System.debug('inside Save : ' + changeReq.Type__c );
                List<Account> accList =  impl.getDealerAccount(changeReq.Account__c);
                accList[0].Contact_Person_Phone__c= changeReq.Phone__c;
                isUpdated = impl.updateDealerRecord(accList[0]);
            }else if(changeReq.Type__c == 'Change Billing Address'){
                System.debug('inside Save : ' + changeReq.Type__c );
                List<Account> accList =  impl.getDealerAccount(changeReq.Account__c);
                accList[0].Address__c = changeReq.Billing_Address_1__c;
                accList[0].Address2__c = changeReq.Billing_Address_2__c;
                accList[0].Pincode__c = changeReq.Pincode__c; 
                accList[0].State__c = changeReq.State__c; 
                accList[0].District__c = changeReq.District__c; 
                accList[0].Sub_District__c = changeReq.Sub_District__c; 
                accList[0].City__c = changeReq.City__c; 
                isUpdated = impl.updateDealerRecord(accList[0]);
            }else if(changeReq.Type__c == 'Change Shipping Address'){
                System.debug('inside Save : ' + changeReq.Type__c );
                List<Account> accList =  impl.getDealerAccount(changeReq.Ship_To_Address__c);
                accList[0].Address__c = changeReq.Billing_Address_1__c;
                accList[0].Address2__c = changeReq.Billing_Address_2__c;
                accList[0].Pincode__c = changeReq.Pincode__c; 
                accList[0].Country__c = changeReq.Country__c;
                accList[0].State__c = changeReq.State__c; 
                accList[0].District__c = changeReq.District__c; 
                accList[0].Sub_District__c = changeReq.Sub_District__c; 
                accList[0].City__c = changeReq.City__c;
                isUpdated = impl.updateDealerRecord(accList[0]); 
            }else if(changeReq.Type__c == 'New Shipping Address'){
                System.debug('inside Save : ' + changeReq.Type__c );
                Id shipToPartyRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('Ship_To_Party').getRecordTypeId();
                Account acc = new Account();
                System.debug('inside Save1 : ' + changeReq.Account__r.OwnerId);
                System.debug('inside Save1 : ' + changeReq.Account__c);
                acc.ERP_Ship_To_Code__c = shiptocode;
                acc.ERP_Customer_Code__c = shiptocode+'-'+changeReq.Account__r.ERP_Customer_Code__c ;
                acc.Account_Type__c = 'Ship To Party';
                acc.RecordTypeId = shipToPartyRecordTypeId;
                acc.ParentId = changeReq.Account__c;
                acc.OwnerId = changeReq.Account__r.OwnerId;
                acc.Name = changeReq.Name__c;
                acc.Address__c = changeReq.Billing_Address_1__c;
                acc.Address2__c = changeReq.Billing_Address_2__c;
                acc.Contact_Name__c = changeReq.Contact_Name__c;
                acc.Contact_Person_Phone__c = changeReq.Phone__c;
                acc.Contact_Person_Email__c = changeReq.Email__c;
                acc.Pincode__c = changeReq.Pincode__c;
                acc.GST_Registration_Number__c = changeReq.GST_Registration_Number__c;
                acc.Country__c = changeReq.Country__c;
                acc.State__c = changeReq.State__c; 
                acc.District__c = changeReq.District__c; 
                acc.Sub_District__c = changeReq.Sub_District__c; 
                acc.City__c = changeReq.City__c; 
                acc.Website = changeReq.Website__c;
                acc.Location__c = changeReq.Account__r.Location__c; 
                isCreated = impl.createDealerRecord(acc);
                
            }
            boolean crCompleted = false;
            if(isCreated == true || isUpdated == true ){
                changeReq.Status__c = 'Completed';
                crCompleted = impl.updateRecord(changeReq);
            }
            return crCompleted;
        } catch(Exception e) {
            System.debug('Inside Save Catch:'+e.getMessage());
            System.debug('Inside Save Catch:'+e.getlinenumber());
            changeReq.Status__c = 'ERP In Failed';
            return impl.updateRecord(changeReq);
        }
    }
    
    /**
* Wrapper class for the request to ERP service.
*/
    public class Requestwrapper{
        @AuraEnabled public String accountName;
        @AuraEnabled public String groupAccount;
        @AuraEnabled public String eRPCustomerCode;
        @AuraEnabled public String sfdcCustomerCode;
        @AuraEnabled public String address1;
        @AuraEnabled public String address2;
        @AuraEnabled public String contactName;
        @AuraEnabled public String phone1;
        @AuraEnabled public String primaryContactNumber;
        @AuraEnabled public String contactPersonEmail;
        @AuraEnabled public String PANNumber;
        @AuraEnabled public String PANStatus;
        @AuraEnabled public Boolean X1HTCS;
        @AuraEnabled public String GSTRegistrationNumber;
        @AuraEnabled public String GSTCustomerType;
        @AuraEnabled public Boolean YCNCustomer;
        @AuraEnabled public Boolean OEMCustomer;
        @AuraEnabled public String bussinessType;
        @AuraEnabled public String website;
        @AuraEnabled public String bankAccountNumber;
        @AuraEnabled public String anotherBankAccountNumber;
        @AuraEnabled public Decimal ratio;
        @AuraEnabled public Date revivalDate;
        @AuraEnabled public String status;
        @AuraEnabled public String block;
        @AuraEnabled public String districtCode;
        @AuraEnabled public String zoneCode;
        @AuraEnabled public String stateCode;
        @AuraEnabled public String countryCode;
        @AuraEnabled public String subDistrictCode;
        @AuraEnabled public String cityCode;
        @AuraEnabled public String pincode;
        @AuraEnabled public String territoryCode;
        @AuraEnabled public String channelCode;
        @AuraEnabled public String customerGroupCode;
        @AuraEnabled public String customerDiscountPriceGroupCode;
        @AuraEnabled public Decimal orginalCreditLimit;
        @AuraEnabled public Decimal creditLimitLCY;
        @AuraEnabled public Decimal additionalCreditLimit;
        @AuraEnabled public String additionalCreditExpiryDate;
        @AuraEnabled public Decimal fixedAdditionalCreditAmount;
        @AuraEnabled public Decimal balanceLCY;
        @AuraEnabled public String paymentTerm;
        @AuraEnabled public String creditDays;
        @AuraEnabled public String locationCode;
        @AuraEnabled public Date onBoardingDate;
        @AuraEnabled public String applicationMethod;
        @AuraEnabled public String aadharNumber;
        @AuraEnabled public String priceGroupCode;
        @AuraEnabled public String territoryChannelCode;
        
        /**
    * Wrapper class Constructor for the request to ERP service.
    */
        public Requestwrapper(){
            accountName= '';
            groupAccount= '';
            eRPCustomerCode= '';
            sfdcCustomerCode= '';
            address1= '';
            address2= '';
            contactName= '';
            phone1= '';
            primaryContactNumber= '';
            contactPersonEmail= '';
            PANNumber= '';
            PANStatus= '';
            GSTRegistrationNumber= '';
            GSTCustomerType= '';
            bussinessType= '';
            website= '';
            bankAccountNumber= '';
            anotherBankAccountNumber= '';
            ratio= 1.0;
            status= '';
            block= '';
            districtCode= '';
            zoneCode= '';
            stateCode= '';
            countryCode= '';
            subDistrictCode= '';
            cityCode= '';
            pincode= '';
            territoryCode= '';
            channelCode= '';
            customerGroupCode= '';
            customerDiscountPriceGroupCode= '';
            orginalCreditLimit= 0;
            creditLimitLCY= 0;
            additionalCreditLimit= 0;
            additionalCreditExpiryDate= '';
            fixedAdditionalCreditAmount= 0;
            balanceLCY= 0;
            paymentTerm= '';
            creditDays= '';
            locationCode= '';
            applicationMethod= '';
            aadharNumber= '';
            priceGroupCode= '';
            territoryChannelCode= '';
           

            // groupAccount = ''; //Additinal Feild Added on 22-Oct-24 for request test 
        }
    }
    
    public class Responswrapper{
        @InvocableVariable
        @AuraEnabled public string massage;
        @InvocableVariable
        @AuraEnabled public boolean success;

        public  Responswrapper(){
            massage = '';
            success = false;
        } 
    }  
}