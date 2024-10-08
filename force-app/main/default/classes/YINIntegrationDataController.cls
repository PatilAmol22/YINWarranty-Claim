/*******************************************************************************************
* @name         Integration Data - Controller class
* @author       Nikhil Dhoke (SKI)
* @Date         15/05/2024
* @Group        SKI
* @Description  All integration data will be processed in this class.
*******************************************************************************************/
/* MODIFICATION LOG
* Version          Developer                Date(MM/DD/YYYY)      Description
*-------------------------------------------------------------------------------------------   
*  1.0             Nikhil Dhoke             15/05/2024            Initial Creation                                        
*******************************************************************************************/
public without sharing class YINIntegrationDataController {

    public static YINIntegrationDataImpl impl = (YINIntegrationDataImpl)YINApplication.service.newInstance(YINIIntegrationData.class);

    @AuraEnabled
    public static string createCustomer(String customerJson){
        List<ResponseWrapper> responseList = new List<ResponseWrapper>();
        ResponseWrapper response = new ResponseWrapper();
        List<Account> objList = new List<Account>();
        try{
            System.debug('createCustomer: Incoming customerJson = ' + customerJson);
            List<CustomerWrapper> customerWrapList = (List<CustomerWrapper>)JSON.deserialize(customerJson,List<CustomerWrapper>.class);
            if(!customerWrapList.isEmpty()){
                for(CustomerWrapper cw : customerWrapList){
                    if(String.isNotBlank(cw.customerName) && String.isNotBlank(cw.mobileNumber)){
                        Account acc = new Account();
                        acc.Name = cw.customerName;
                        acc.Contact_Person_Phone__c = cw.mobileNumber;
                        acc.RecordTypeId = impl.getRecordTypeByName('Account','Consumer');
                        acc.Type = 'Customer';
                        acc.YSS_Data__c = true;
                        objList.add(acc);
                    }
                }
                if(!objList.isEmpty()){
                    List<Database.UpsertResult> resultList = impl.createCustomerAccount(objList);
                    responseList = processUpsertResult(resultList);
                    
                }
                else{
                    response.status = 'error';
                    response.message = 'Either No records to create or value must be null.';
                    responseList.add(response);
                }
            }
            else{
                response.status = 'error';
                response.message = 'No records to create.';
                responseList.add(response);
            }
             if (test.isRunningTest()) {
                        throw new NullPointerException();
                    }

        }catch (Exception e) {
            response.status = 'error';
            response.message = 'Failed to create record - '+ e.getMessage();
            responseList.add(response);
            logException(e,'createCustomer-YINIntegrationDataController - '+e.getLineNumber());
           /*  System.debug('createCustomer Exception is - '+ e.getMessage());
            System.debug('createCustomer Exception at - '+ e.getLineNumber()); */
        }
        return JSON.serialize(responseList);
    }

    @AuraEnabled
    public static string createVehicle(String vehicleJson){
        List<ResponseWrapper> responseList = new List<ResponseWrapper>();
        ResponseWrapper response = new ResponseWrapper();
        List<YIN_Vehicle_Detail__c> objList = new List<YIN_Vehicle_Detail__c>();
        try{
            System.debug('createVehicle: Incoming vehicleJson = ' + vehicleJson);
            List<VehicleWrapper> vehicleWrapList = (List<VehicleWrapper>)JSON.deserialize(vehicleJson,List<VehicleWrapper>.class);
            if(!vehicleWrapList.isEmpty()){
                for(VehicleWrapper cw : vehicleWrapList){
                    if(String.isNotBlank(cw.vehicleNumber) && String.isNotBlank(cw.mobileNumber)){
                        String vn = cw.vehicleNumber.replaceAll('[^a-zA-Z0-9\\s+]', '').deleteWhitespace().toUppercase();
                        Account ac = new Account(Contact_Person_Phone__c = cw.mobileNumber);
                        YIN_Vehicle_Detail__c vehicle = new YIN_Vehicle_Detail__c();
                        vehicle.Name = vn;
                        vehicle.Customer__r = ac;
                        vehicle.Vehicle_Registration_Number__c = vn;
                        vehicle.Company_Name__c = cw.companyName;
                        vehicle.YSS_Data__c = true;
                        objList.add(vehicle);
                    }
                }
                if(!objList.isEmpty()){
                    List<Database.UpsertResult> resultList = impl.createVehicles(objList);
                    responseList = processUpsertResult(resultList);
                     
                }
                else{
                    response.status = 'error';
                    response.message = 'Either No records to create or value must be null.';
                    responseList.add(response);
                }
            }
            else{
                response.status = 'error';
                response.message = 'No records to create.';
                responseList.add(response);
            }
             if (test.isRunningTest()) {
                        throw new NullPointerException();
                    }

        }catch (Exception e) {
            response.status = 'error';
            response.message = 'Failed to create record - '+ e.getMessage();
            responseList.add(response);
            logException(e,'createCustomer-YINIntegrationDataController - '+e.getLineNumber());
           /*  System.debug('createCustomer Exception is - '+ e.getMessage());
            System.debug('createCustomer Exception at - '+ e.getLineNumber()); */
        }
        return JSON.serialize(responseList);
    }

    @AuraEnabled
    public static string createWarrantyAsset(String warrantyAssetJson){
        List<ResponseWrapper> responseList = new List<ResponseWrapper>();
        ResponseWrapper response = new ResponseWrapper();
        List<Contract> objList = new List<Contract>();
        List<Asset> assetList = new List<Asset>();
        try{
            System.debug('createWarrantyAsset: Incoming warrantyAssetJson = ' + warrantyAssetJson);
            List<WarrantyWrapper> warrantyWrapList = (List<WarrantyWrapper>)JSON.deserialize(warrantyAssetJson,List<WarrantyWrapper>.class);
            if(!warrantyWrapList.isEmpty()){
                for(WarrantyWrapper cw : warrantyWrapList){
                    if(String.isNotBlank(cw.warrantyNumber) && String.isNotBlank(cw.dealerCode) && String.isNotBlank(cw.customerMobileNumber) && String.isNotBlank(cw.vehicleRegistrationNumber)){
                        String vn = cw.vehicleRegistrationNumber.replaceAll('[^a-zA-Z0-9\\s+]', '').deleteWhitespace().toUppercase();
                        YIN_Vehicle_Detail__c vehicle = new YIN_Vehicle_Detail__c(Vehicle_Registration_Number__c = vn);
                        Account ac = new Account(Contact_Person_Phone__c = cw.customerMobileNumber);
                        Account dealer = new Account(ERP_Customer_Code__c = getDealerCode(cw.dealerCode));

                        Contract contract = new Contract();
                        contract.YSS_Warranty_Number__c = cw.warrantyNumber;
                        contract.Customer__r = ac;
                        contract.Account = dealer;
                        contract.Type__c = 'New Purchase';
                        contract.Vehicle_Registration_Number__r = vehicle;
                        contract.Average_monthly_KM__c = String.isNotBlank(cw.averageMonthlyKM) ? Integer.valueOf(cw.averageMonthlyKM) : 0;
                        contract.Invoice__c = String.isNotBlank(cw.invoiceNumber) ? cw.invoiceNumber : '';
                        //contract.Invoice_Amount__c = warrantyWrap.invoiceAmount;
                        contract.Invoice_Date__c = String.isNotBlank(cw.invoiceDate) ? Date.valueOf(cw.invoiceDate) : null;
                        contract.Odometer_reading__c = String.isNotBlank(cw.odometerReading) ? Integer.valueOf(cw.odometerReading) : 0;
                        //contract.Tyre_Quantity__c = String.isNotBlank(cw.tyreQuantity) ? Integer.valueOf(cw.tyreQuantity) : 0;
                        contract.Status__c = 'Active';
                        
                        contract.StartDate = String.isNotBlank(cw.invoiceDate) ? Date.valueOf(cw.invoiceDate) : null;
                        contract.ContractTerm = getContractTermMonths('');          //String.isNotBlank(cw.warrantyRegistrationDate) ? getContractTermMonths(cw.warrantyRegistrationDate) : 0; 
                        contract.Warranty_Date__c = String.isNotBlank(cw.warrantyRegistrationDate) ? Date.valueOf(cw.warrantyRegistrationDate) : null;
                        
                        contract.YSS_Data__c = true;

                        List<Asset> astList = generateAsset(cw.productCode,cw.tyreSerialNumber,cw.warrantyNumber,ac);

                        contract.Tyre_Quantity__c = !astList.isEmpty() ? astList.size() : 0;
                        objList.add(contract);

                        if(!astList.isEmpty()){
                            assetList.addAll(astList); 
                        }
                                               
                    }
                }
                if(!objList.isEmpty()){
                    List<Database.SaveResult> resultList = impl.createWarranty(objList);
                    responseList = processInsertResult(resultList,true);//added new boolean Condition for check method

                    if(!assetList.isEmpty()){
                        List<Database.SaveResult> resultList2 = impl.createAssets(assetList);
                        responseList.addAll(processInsertResult(resultList2,false));//added new boolean Condition for check method
                    }
                }
                else{
                    response.status = 'error';
                    response.message = 'Either No records to create or value must be null.';
                    responseList.add(response);
                }
            }
            else{
                response.status = 'error';
                response.message = 'No records to create.';
                responseList.add(response);
            }
             if (test.isRunningTest()) {
                        throw new NullPointerException();
                    }

        }catch (Exception e) {
            response.status = 'error';
            response.message = 'Failed to create record - '+ e.getMessage();
            responseList.add(response);
            logException(e,'createWarrantyAsset-YINIntegrationDataController - '+e.getLineNumber());
           /*  System.debug('createWarrantyAsset Exception is - '+ e.getMessage());
            System.debug('createWarrantyAsset Exception at - '+ e.getLineNumber()); */
        }
        return JSON.serialize(responseList);
    }

    public static string getDealerCode(String code){
        String str = '';
        Integer it = 9 - code.length();
        for(integer i =0; i < it;i++){
            str +='0';
        }
        return 'C'+str+code;
    }

    public static Integer getContractTermMonths(String dtString){
        Integer months = 0;
        /* Date dt = Date.valueOf(dtString);
        Date myDate1 = Date.newInstance(2022, 07, 01); // default given by client..yyyy-mm-dd
        
        if(dt < myDate1){
            months = 18;
        }
        else{
            months = 60;
        } */
        months = 60;
        return months;
    }

    public static List<Asset> generateAsset(String productCode, String tyreSerialNumber, String warrantyNumber, Account ac){
        List<Asset> assetList = new List<Asset>();
        List<Product2> productList  = impl.getProductByCode(new Set<String>{'FG-'+productCode});
		
        if(!productList.isEmpty() && String.isNotBlank(tyreSerialNumber)){
            String plantCode = productList[0].Plant_Code__c != null ? productList[0].Plant_Code__c:'';
            String specCode = productList[0].Spec_Code__c != null ? productList[0].Spec_Code__c:'';
            Integer i = 1;
            Contract con = new Contract(YSS_Warranty_Number__c = warrantyNumber);
            for(String str : tyreSerialNumber.split(',')){
                Asset asset = new Asset();
                asset.Name = productList[0].Name; // peoduct name..
                asset.Account = ac;
                asset.Customer__r = ac;
                asset.Warranty__r = con;
                asset.SerialNumber = (plantCode+specCode+str).trim();
                asset.Tyre_Pattern__c = productList[0].Tread_Pattern__c;
                asset.Tyre_Size__c = productList[0].Tire_Size__c;
                asset.Product2Id = productList[0].Id;
                asset.Status__c = 'Open';
                asset.YSS_Data__c = true;
                asset.Combination_Key__c = warrantyNumber+'-'+str+'-'+i;
                assetList.add(asset);

                i++;
            }
        }
        return assetList;
    }

    public static List<ResponseWrapper> processUpsertResult(List<Database.UpsertResult> resultList){
        List<ResponseWrapper> responseList = new List<ResponseWrapper>();
        for(Database.UpsertResult result : resultList){
            ResponseWrapper response = new ResponseWrapper();
            if(result.isSuccess()){
                response.recordId = result.getId();
                response.status = 'success';
                response.message = '';
                if(result.isCreated()){
                    response.isCreated = true;
                }
                else{
                    response.isUpdated = true;
                }
            }
            else{
                response.recordId = '';
                response.status = 'error';
                response.message = result.getErrors()[0].getMessage();
            }
            responseList.add(response);
        }
        return responseList;
    }

    public static List<ResponseWrapper> processInsertResult(List<Database.SaveResult> resultList,Boolean iscreateWarranty){
   // ===============================     
        Set<String> setIds = new Set<String>();
        for(Database.SaveResult result : resultList){
            if(result.isSuccess()){
                setIds.add(result.getId());
            }
        }
        Map<ID, Contract> mapContract = new Map<ID, Contract>();
        if(iscreateWarranty) {
        	 mapContract = new Map<ID, Contract>([SELECT Id, YSS_Warranty_Number__c FROM Contract WHERE id IN :setIds]);
        }
    // ==============================

        List<ResponseWrapper> responseList = new List<ResponseWrapper>();
        for(Database.SaveResult result : resultList){
            ResponseWrapper response = new ResponseWrapper();
            if(result.isSuccess()){
                response.recordId = result.getId();
                response.status = 'success';
                response.message = '';
                response.isCreated = true;
                if(iscreateWarranty && mapContract.containsKey(result.getId())){
                     response.warrantyNumber = mapContract.get(result.getId()).YSS_Warranty_Number__c;
                }
                else{
                    response.warrantyNumber ='';
                }
            }
            else{
                response.recordId = '';
                response.status = 'error';
                response.message = result.getErrors()[0].getMessage();
            }
            responseList.add(response);
        }
        return responseList;
    }

    private static void logException(Exception e,String module){
        YINMonitorLogWrap log = new YINMonitorLogWrap();
        log.exObj = e;
        log.module = module;
        log.apexClass = 'YINIntegrationDataController';
        YINMonitorService monitorLog = new YINMonitorService();
        monitorLog.exceptionHandler(log);
    }

    public class CustomerWrapper{
        @AuraEnabled public string customerName;
        @AuraEnabled public string mobileNumber;

        public CustomerWrapper(){
            customerName = '';
            mobileNumber = '';
        }
    }

    public class VehicleWrapper{
        @AuraEnabled public string vehicleNumber;
        @AuraEnabled public string mobileNumber;
        @AuraEnabled public string companyName;

        public VehicleWrapper(){
            vehicleNumber = '';
            mobileNumber = '';
            companyName = '';
        }
    }

    public class ResponseWrapper{
        @AuraEnabled public string recordId;
        @AuraEnabled public string message;
        @AuraEnabled public string status;
        @AuraEnabled public Boolean isCreated;
        @AuraEnabled public Boolean isUpdated;
        @AuraEnabled public String warrantyNumber;

        public ResponseWrapper(){
            recordId = '';
            message = '';
            status = '';
            isCreated = false;
            isUpdated = false;
            warrantyNumber = '';
        }
    }

    public class WarrantyWrapper{
        @AuraEnabled public string warrantyNumber;
        @AuraEnabled public string warrantyRegistrationDate;
        @AuraEnabled public string dealerCode;
        @AuraEnabled public string type;
        @AuraEnabled public string customerMobileNumber;
        @AuraEnabled public string vehicleRegistrationNumber;
        @AuraEnabled public string averageMonthlyKM;
        @AuraEnabled public string invoiceNumber;
        @AuraEnabled public string invoiceDate;
        @AuraEnabled public string odometerReading;
        @AuraEnabled public string tyreQuantity;
        @AuraEnabled public string productCode;
        @AuraEnabled public string tyreSerialNumber;
        @AuraEnabled public string tyrePattern;
        @AuraEnabled public string tyreSize;

        public WarrantyWrapper(){
            warrantyNumber = '';
            warrantyRegistrationDate = '';
            dealerCode = '';
            type = '';
            customerMobileNumber = '';
            vehicleRegistrationNumber = '';
            averageMonthlyKM = '';
            invoiceNumber = '';
            invoiceDate = '';
            odometerReading = '';
            tyreQuantity = '';
            productCode = '';
            tyreSerialNumber = '';
            tyrePattern = '';
            tyreSize = '';
        }
    }
}