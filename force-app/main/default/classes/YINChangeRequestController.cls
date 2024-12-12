/**
 * @description       : Email,Phone And Address Change Request With Aadhar Verification.
 * @author            : Amol Patil/amol.patil@skinternational.com
 * @group             : SKI
 * @last modified on  : 12-02-2024
 * @last modified by  : Amol Patil/amol.patil@skinternational.com
**/

public without sharing class YINChangeRequestController {

	/**
 * AuraEnabled method to fetch Pincode details based on the provided pincode.
 * @param pincode The pincode for which details are to be fetched.
 * @return List of YIN_Pincode__C records containing details related to the provided pincode.
 */
	@AuraEnabled(cacheable=true)
	public static List<YIN_Pincode__C> getPinCodeDetail(String pincode){
		YINChangeRequestImpl impl = (YINChangeRequestImpl)YINApplication.service.newInstance(YINIChangeRequest.class); 
		return impl.getPincodeDetails(pincode);
	}

	/**
 * AuraEnabled method to fetch Ship-To addresses based on the provided shipToId.
 * @param shipToId The identifier for Ship-To addresses.
 * @return List of Account records representing Ship-To addresses for the provided shipToId.
 */
	@AuraEnabled
	public static List<Account> getShipToAddress(String shipToId){
		YINChangeRequestImpl impl = (YINChangeRequestImpl)YINApplication.service.newInstance(YINIChangeRequest.class); 
		return impl.getshipToDetails(shipToId);
	}

	/**
 * AuraEnabled method to fetch Dealer Accounts based on the provided dealerAccount.
 * @param dealerAccount The identifier for Dealer Accounts.
 * @return List of Account records representing Dealer Accounts for the provided dealerAccount.
 */
	@AuraEnabled
	public static List<Account> getDealerAcc(String dealerAccount){
		YINChangeRequestImpl impl = (YINChangeRequestImpl)YINApplication.service.newInstance(YINIChangeRequest.class); 
		return impl.getDealerAccount(dealerAccount);
	}

     @AuraEnabled 
	/*public static List<YIN_Change_Request__c> getYCNDetail(String accId){
		System.debug('varcbsdh: ' + accId);
		YINChangeRequestImpl impl = (YINChangeRequestImpl)YINApplication.service.newInstance(YINIChangeRequest.class); 
		return impl.getYCNDetails(accId);
	}*/

	/*public static void sendYCNNotification(string crID,String crName){
		YINChangeRequestImpl impl = (YINChangeRequestImpl)YINApplication.service.newInstance(YINIChangeRequest.class);
			CustomNotificationType notificationType = impl.getCustomNotification('YCN_Request_Update');
			List<Messaging.CustomNotification> customNotifications = new List<Messaging.CustomNotification>(); 
			Messaging.CustomNotification notification = new Messaging.CustomNotification();
			notification.setTitle('YCN Request Update');
			notification.setBody('The YCN Change Request has been sent for:' + crName); 
			notification.setNotificationTypeId(notificationType.Id);
			notification.setTargetId(crID);
			notification.send(new Set<String>{userInfo.getUserID()});
	}*/

	/*public static void sendYCNEmail(string accountId) {
		YINChangeRequestImpl impl = (YINChangeRequestImpl)YINApplication.service.newInstance(YINIChangeRequest.class);
			List<EmailTemplate> emailtemp = impl.getEmailTemplate('YIN_YCN_Request_EmailTemplate');
			List<Account> acclist = getDealerAcc(accountId);
			List<Messaging.SingleEmailMessage> mails = new List<Messaging.SingleEmailMessage>();
			Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
			email.setSenderDisplayName('Yokohama Smart services');                            
			email.setTemplateID(emailtemp[0].Id);
			email.setTargetObjectId(accList[0].ownerId);
			email.setSaveAsActivity(false);
			mails.add(email);     
			//Sending emails
			Messaging.sendEmail(mails,true);
				
	}*/

	/* public static String createContentDoc(String blobValue,String fileName, String extentionType) {
		String cDocId = '';
		YINContentVersionCreatorImp impl = (YINContentVersionCreatorImp)YINApplication.service.newInstance(YINIContentVersionCreator.class); 
		List<contentversion> cList = new List<contentversion>();
			//Blob blob1 = Blob.valueof(blobValue);
			ContentVersion contentVersion = new ContentVersion();
			contentVersion.Title = fileName;
			contentVersion.PathOnClient = fileName + extentionType;
			contentVersion.VersionData = EncodingUtil.base64Decode(blobValue);
			cList.add(contentVersion);
			clist = impl.createContentVersion(clist);
            list<Id> cdID = new List<Id>();
			cdId.add(clist[0].Id);
			clist = impl.getContentDocID(cdId);
			if(clist.size() > 0){
				cDocId = clist[0].ContentDocumentId;
			}
		return cDocId;
	} */

/**
 * Returns the RecordTypeId for the specified object and RecordType name.
 * @param objectName The API name of the object for which to retrieve the RecordTypeId.
 * @param strRecordTypeName The developer name of the RecordType for which to retrieve the RecordTypeId.
 * @return The RecordTypeId corresponding to the specified object and RecordType name.
 */
	public static Id getRecordTypeIdbyName(String objectName, String strRecordTypeName)
    {
        system.debug('objectName>>>>'+objectName+strRecordTypeName);
        return  Schema.getGlobalDescribe().get(objectName).getDescribe().getRecordTypeInfosByDeveloperName().get(strRecordTypeName).getRecordTypeId();
    }

/**
 * Creates a YIN Change Request record based on the provided JSON string.
 * @param jsonString The JSON string representing the data for creating the Change Request.
 * @return A string indicating the result of the record creation.
 */
	@AuraEnabled 
	public static String createRecord(String jsonString){
		System.debug('@@@@jsonString: ' + JSON.serializePretty(jsonString));
		ChangeRequestWrapper wrapdata = (ChangeRequestWrapper)JSON.deserialize(jsonString,ChangeRequestWrapper.class);
		YINChangeRequestImpl impl = (YINChangeRequestImpl)YINApplication.service.newInstance(YINIChangeRequest.class);
		YIN_Change_Request__c cr= new YIN_Change_Request__c();
        YINMonitorService x=new  YINMonitorService();
		boolean isCRInserted = false;
		String contentDocumentId = '';
		String accId = '';
 
		if(String.isNotBlank(wrapdata.erpCustomerCode)){
			List<String> erpCodes = new List<String>();
			erpCodes.add(wrapdata.erpCustomerCode);
			List<Account> accList = impl.getAccountsByERPCode(erpCodes);
			if(accList.size() > 0){
				accId = accList[0].Id;
			}
		}
		else{
			accId = wrapdata.dealerId;
		}
		/*if(wrapdata.type == 'YCN'){
			cr.Name = 'YCN Request';
			cr.Type__c = 'YCN Request';
			cr.Status__c = 'Pending';
			cr.Account__c = accId;
		}*/
		 if(wrapdata.type == 'Email') {
			cr.Name = 'CR-Email';
			cr.recordTypeId = getRecordTypeIdbyName('YIN_Change_Request__c',label.Email);
			cr.Account__c = accId;
			cr.Email__c = wrapdata.emailId;
			cr.Type__c = wrapdata.type;
			cr.Status__c = 'Aadhar Verification In Process';
		}
		else if(wrapdata.type == 'Phone') {
			cr.Name = 'CR-Phone';
			cr.recordTypeId = getRecordTypeIdbyName('YIN_Change_Request__c',label.Phone);
			cr.Account__c = accId;
			cr.Phone__c = wrapdata.phoneNo;
			cr.Type__c = wrapdata.type;
			cr.Status__c = 'Aadhar Verification In Process';
		}
		else if(wrapdata.type == 'Change Billing Address'){
			cr.Name = 'CR-Billing Address';
			cr.recordTypeId = getRecordTypeIdbyName('YIN_Change_Request__c',label.Change_Billing_Address);
			cr.Name__c = wrapdata.name;
			cr.Account__c = accId;
			cr.Billing_Address_1__c = wrapdata.address1;
			cr.Billing_Address_2__c = wrapdata.address2;
			if(wrapdata.pincodeId!=''){cr.Pincode__c = wrapdata.pincodeId;}
			if(wrapdata.stateId!=''){cr.State__c = wrapdata.stateId;}
			if(wrapdata.cityId!=''){cr.City__c = wrapdata.cityId;}
			if(wrapdata.districtId!=''){cr.District__c = wrapdata.districtId;}
			if(wrapdata.subDistrictId!=''){cr.Sub_District__c = wrapdata.subDistrictId;}
			cr.Type__c = wrapdata.type;
			cr.Status__c = 'Pending';
		}
		else if(wrapdata.type == 'Change Shipping Address'){

			if(String.isNotBlank(wrapdata.sfdcCustomerCode)){
				List<Account> accList = impl.getShiptoPartyByAccount(new List<String>{accId});
				if(accList.size()>0 && accList[0].SFDC_Customer_Code__c == wrapdata.sfdcCustomerCode){
					cr.Ship_To_Address__c = accList[0].id;
				}
			}
			else{
				cr.Ship_To_Address__c = wrapdata.shiptoPartyId;
			}

			cr.Name = 'CR-Change Shipping Address';
			cr.recordTypeId = getRecordTypeIdbyName('YIN_Change_Request__c',label.Change_Shipping_Address);
			cr.Name__c = wrapdata.name;
			cr.Name2__c = wrapdata.name2;
			cr.Account__c = accId;
			cr.Ship_To_Address__c = wrapdata.shipToAddressId;
			cr.Billing_Address_1__c = wrapdata.address1;
			cr.Billing_Address_2__c = wrapdata.address2;
			cr.Contact_Name__c = wrapdata.contactName;
			cr.Phone__c = wrapdata.phoneNo;
			cr.Email__c = wrapdata.emailId;
			if(wrapdata.pincodeId!=''){cr.Pincode__c = wrapdata.pincodeId;}
			if(wrapdata.countryId!=''){cr.Country__c = wrapdata.countryId;}
			if(wrapdata.stateId!=''){cr.State__c = wrapdata.stateId;}
			if(wrapdata.cityId!=''){cr.City__c = wrapdata.cityId;}
			if(wrapdata.districtId!=''){cr.District__c = wrapdata.districtId;}
			if(wrapdata.subDistrictId!=''){cr.Sub_District__c = wrapdata.subDistrictId;}
			cr.GST_Registration_Number__c = wrapdata.gstRegistration;
			cr.Website__c = wrapdata.website;
			cr.Type__c = wrapdata.type;
			cr.Status__c = 'Pending';
		}
		else if(wrapdata.type == 'New Shipping Address'){
			cr.Name = 'CR-New Shipping Address';
			cr.recordTypeId = getRecordTypeIdbyName('YIN_Change_Request__c',label.New_Shipping_Address);
			cr.Name__c = wrapdata.name;
			cr.Name2__c = wrapdata.name2;
			cr.Account__c = accId;
			cr.Billing_Address_1__c = wrapdata.address1;
			cr.Billing_Address_2__c = wrapdata.address2;
			cr.Contact_Name__c = wrapdata.contactName;
			cr.Phone__c = wrapdata.phoneNo;
			cr.Email__c = wrapdata.emailId;
			if(wrapdata.pincodeId!=''){cr.Pincode__c = wrapdata.pincodeId;}
			if(wrapdata.countryId!=''){cr.Country__c = wrapdata.countryId;}
			if(wrapdata.stateId!=''){cr.State__c = wrapdata.stateId;}
			if(wrapdata.cityId!=''){cr.City__c = wrapdata.cityId;}
			if(wrapdata.districtId!=''){cr.District__c = wrapdata.districtId;}
			if(wrapdata.subDistrictId!=''){cr.Sub_District__c = wrapdata.subDistrictId;}
			cr.GST_Registration_Number__c = wrapdata.gstRegistration;
			cr.Website__c = wrapdata.website;
			cr.Type__c = wrapdata.type;
			cr.Status__c = 'Pending';
		}

		isCRInserted = Impl.createRecord(cr);

		/*if(isCRInserted == true && wrapdata.type == 'YCN'){
			YINChangeRequestController.sendYCNNotification(cr.Id,wrapdata.dealerName);
			YINChangeRequestController.sendYCNEmail(accId);			
		}*/

		if((wrapdata.type == 'Change Billing Address' || wrapdata.type == 'Change Shipping Address' || wrapdata.type == 'New Shipping Address') && String.isNotBlank(wrapdata.attachmentId)){
			contentDocumentId = wrapdata.attachmentId;
		}
		boolean isconDocLinkCreated = false;
		if(isCRInserted == true && String.isNotBlank(contentDocumentId)){
			List<ContentDocumentLink> cdList = new List<ContentDocumentLink>();
			ContentDocumentLink cdLink = new ContentDocumentLink();
			cdLink.LinkedEntityId = cr.id;
			cdLink.ShareType = 'V'; 
			cdLink.Visibility = 'AllUsers'; 
			cdLink.ContentDocumentId = contentDocumentId;
			cdList.add(cdLink);

			//INSERT cdList;
			isconDocLinkCreated = Impl.createContentDocLink(cdList);
		}
		ResponseWrapper resWrap = new ResponseWrapper();
		if(isCRInserted){
			resWrap.status = 'success';
			resWrap.message = '';
			resWrap.changeRequestId = cr.id;
		}
		else{
			resWrap.status = 'failed';
			resWrap.message = 'Fail to create record.';
			resWrap.changeRequestId = '';
		}

		if(String.isNotBlank(wrapdata.erpCustomerCode)){
			resWrap.erpCustomerCode = wrapdata.erpCustomerCode;
		}
		else{
			resWrap.erpCustomerCode = '';
		}
		if(String.isNotBlank(wrapdata.sfdcCustomerCode)){
			resWrap.sfdcCustomerCode = wrapdata.sfdcCustomerCode;
		}
		else{
			resWrap.sfdcCustomerCode = '';
		}
        
		return JSON.serialize(resWrap);
     
	}

	public class ResponseWrapper{
		@AuraEnabled public String status;
		@AuraEnabled public String message;
		@AuraEnabled public String changeRequestId;
		@AuraEnabled public String erpCustomerCode;
		@AuraEnabled public String sfdcCustomerCode;

		public ResponseWrapper(){
			status = '';
			message = '';
			changeRequestId = '';
			erpCustomerCode = '';
			sfdcCustomerCode = '';
		}
	}
	
	public class ChangeRequestWrapper{
		
		@AuraEnabled public String id;
		@AuraEnabled public String name;
		@AuraEnabled public String name2;
		@AuraEnabled public String dealerId;
		@AuraEnabled public String dealerName;
		@AuraEnabled public String dealerCode;
		@AuraEnabled public String accountName1;
		@AuraEnabled public String accountName2;
		@AuraEnabled public String address1;
		@AuraEnabled public String address2;
		@AuraEnabled public String contactName;
		@AuraEnabled public string phoneNo;
		@AuraEnabled public String emailId;
		@AuraEnabled public String pincode;
		@AuraEnabled public String pincodeId;
		@AuraEnabled public String location;
		@AuraEnabled public String locationId;
		@AuraEnabled public String country;
		@AuraEnabled public String countryId;
		@AuraEnabled public String state;
		@AuraEnabled public String stateId;
		@AuraEnabled public String city;
		@AuraEnabled public String cityId;
		@AuraEnabled public String district;
		@AuraEnabled public String districtId;
		@AuraEnabled public String subDistrict;
		@AuraEnabled public String subDistrictId;
		@AuraEnabled public String gstRegistration;
		@AuraEnabled public String website;
		@AuraEnabled public String attachmentName;
		@AuraEnabled public String attachmentId;
		@AuraEnabled public String type;
		@AuraEnabled public String status;
		@AuraEnabled public String requesterId; // login user...
		@AuraEnabled public String erpCustomerCode;
		@AuraEnabled public String sfdcCustomerCode;
		@AuraEnabled public String shiptoPartyId;
		@AuraEnabled public String shipToAddressId;
		
		public ChangeRequestWrapper(){
			id = '';
			name = '';
			name2 = '';
			dealerId = '';
			dealerName = '';
			dealerCode = '';
			accountName1 = '';
			accountName2 = '';
			address1 = '';
			address2 = '';
			contactName = '';
			phoneNo = '';
			emailId = '';
			pincode = '';
			pincodeId = '';
			location = '';
			locationId = '';
			country = '';
			countryId = '';
			state = '';
			stateId = '';
			city = '';
			cityId = '';
			district = '';
			districtId = '';
			subDistrict = '';
			subDistrictId = '';
			gstRegistration = '';
			website = '';
			attachmentName = '';
			attachmentId = '';
			type = '';
			status = '';
			requesterId = ''; // login user...
			erpCustomerCode = '';
			sfdcCustomerCode = '';
			shiptoPartyId = '';
			shipToAddressId = '';
		}
		
	}
}