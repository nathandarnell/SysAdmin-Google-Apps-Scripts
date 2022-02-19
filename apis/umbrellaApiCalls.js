/**
 * GETs an origin ID from Umbrella based on the roaming client's device name.
 * @param {string} name - Device name to search Umbrella for the origin ID.
 * @returns {number} Umbrella Origin ID of the device if found.
 */
function getUmbrellaDeviceOriginId(name) {
  name = name || "";

  var encodedKeyPair = Utilities.base64Encode(umbrellaApiKey + ':' + umbrellaApiSecret);
  var url = umbrellaServerUrl + '/organizations/' + umbrellaOrgId + '/roamingcomputers';
  var headers = {
    'Authorization': 'Basic ' + encodedKeyPair
  };

  var options = {
    "method": "GET",
    'Content-Type ': 'application/json',
    'muteHttpExceptions': true,
    "headers": headers,
  };

  /*
  Go through each response to see if the device name matches the current device
  Return the originId
  */
  var response = UrlFetchApp.fetch(url, options);
  var responseJson = JSON.parse(UrlFetchApp.fetch(url, options));

  if (response.getResponseCode() == 200) {
    Logger.log('Success!  Response code is: %s', response.getResponseCode());
    // Iterate and find the device name and return the originId if found
    for (let i = 0; i < responseJson.length; i++) {
      let device = responseJson[i];
      if (device.name === name) {
        Logger.log('Found it!');
        Logger.log(device.originId);
        let cleanedOriginId = device.originId.toFixed(); //.replace(".","");
        Logger.log(cleanedOriginId);
        return cleanedOriginId;
        // Logger.log(policy);
      }
    };
    // Response was 200 but the device wasn't found so return null
    Logger.log('Device not found')
    return null;
  } else {
    Logger.log('Failure!  Response code is: %s', response.getResponseCode());
    Logger.log('Failure!  Response text is: %s', response.getContentText());
    // Return null so the script knows not to run
    return null;
  }
}


/**
 * GETs an Umbrella Policy ID by its name.
 * @param {string} policyToFind - Name of the policy to search for.
 * @returns {number} Umbrella policy ID if found.
 */
function getUmbrellaPolicies(policyToFind) {
  policyToFind = policyToFind || 'Security Only';

  var encodedKeyPair = Utilities.base64Encode(umbrellaNetDevicesApiKey + ':' + umbrellaNetDevicesApiSecret);
  var url = umbrellaServerUrl + '/organizations/' + umbrellaOrgId + '/policies';
  var headers = {
    'Authorization': 'Basic ' + encodedKeyPair
  };

  var options = {
    "method": "GET",
    'Content-Type ': 'application/json',
    'muteHttpExceptions': true,
    "headers": headers,
  };

  /*
  Go through each response to see if the policy name matches the current policy
  Return the policy ID
  */
  var response = UrlFetchApp.fetch(url, options);
  var responseJson = JSON.parse(response);

  if (response.getResponseCode() == 200) {
    Logger.log('Success!  Response code is: %s', response.getResponseCode());
    // Iterate and find the policy name and return the policyID if found
    for (let i = 0; i < responseJson.length; i++) {
      let policy = responseJson[i];
      if (policy.name === policyToFind) {
        Logger.log('Found it!');
        Logger.log(policy.policyId);
        return policy.policyId;
        // Logger.log(policy);
      }
    };
    // Response was 200 but the policy wasn't found so return null
    Logger.log('Policy not found')
    return null;
  } else {
    Logger.log('Failure!  Response code is: %s', response.getResponseCode());
    Logger.log('Failure!  Response text is: %s', response.getContentText());
    // Return null so the script knows not to run
    return null;
  }
}


/**
 * PUTs an Umbrella policy on a device.  Needs the policyId and originId of the device.
 * @param {number} policyId - ID of the user to delete.
 * @param {number} originId - ID of the user to delete.
 * @returns {number} Response from Umbrella
 */
function putUmbrellaDevicePolicy(policyId, originId) {
  policyId = policyId || '124347'; //ID for 'Security Only''2789042'//ID for iPads 
  originId = originId || '428533514'; //4.28533514E8

  var encodedKeyPair = Utilities.base64Encode(umbrellaNetDevicesApiKey + ':' + umbrellaNetDevicesApiSecret);
  var url = umbrellaServerUrl + '/organizations/' + umbrellaOrgId + '/policies/' + policyId + '/identities/' + originId;
  var headers = {
    'Authorization': 'Basic ' + encodedKeyPair
  };

  var options = {
    "method": "PUT",
    'Content-Type ': 'application/json',
    'muteHttpExceptions': true,
    "headers": headers,
  };

  var response = UrlFetchApp.fetch(url, options);

  // Only responds with 200 status code on success
  // All other response are failures and should be logged
  if (response.getResponseCode() == 200) {
    Logger.log('Success!  Response code is: %s', response.getResponseCode());
    // Return the 200 for success
    return response.getResponseCode();
  } else {
    Logger.log('Failure!  Response code is: %s', response.getResponseCode());
    Logger.log('Failure!  Response text is: %s', response.getContentText());
    // Return the response code for error handling
    return response.getResponseCode();
  }
}