/*******************************************************************************************
* @name         Integration Data-Interface Implementation
* @author       Nikhil Dhoke (SKI)
* @Date         15/05/2024
* @Group        SKI
* @Description  
*******************************************************************************************/
/* MODIFICATION LOG
* Version          Developer                Date(MM/DD/YYYY)      Description
*-------------------------------------------------------------------------------------------   
*  1.0             Nikhil Dhoke             15/05/2024            Initial Creation                                        
*******************************************************************************************/
public virtual without sharing class YINIntegrationDataImpl implements YINIIntegrationData{
    
    public virtual Id getRecordTypeByName(String objectName, String developerName){
        return Schema.getGlobalDescribe().get(objectName).getDescribe().getRecordTypeInfosByDeveloperName().get(developerName).getRecordTypeId();
    }

    public virtual List<Database.UpsertResult> createCustomerAccount(List<Account> accList){
        return Database.upsert(accList,Account.Contact_Person_Phone__c,false);
    }

    public virtual List<Database.UpsertResult> createVehicles(List<YIN_Vehicle_Detail__c> vehicleList){
        return Database.upsert(vehicleList,YIN_Vehicle_Detail__c.Vehicle_Registration_Number__c,false);
    }

    public virtual List<Database.SaveResult> createWarranty(List<Contract> contractList){
        return Database.insert(contractList,false);
    }

    public virtual List<Database.SaveResult> createAssets(List<Asset> assetList){
        return Database.insert(assetList,false);
    }

    public virtual List<Product2> getProductByCode(Set<String> codes){
        LIBISObjectSelector selector =  YINApplication.selector.newInstance(Product2.SObjectType);
        YINProductSelector selectorObj = (YINProductSelector)selector;
        return selectorObj.getProductForSKU(codes);
    }
}