/**
 * GETs the user for Openpath to create.
 * @param {number} userId - The User ID to get the credentials of.
 * @param {Object} queryParams - JSON query params.
 * @see {@link https://openpath.readme.io/reference/listorgcredentials}
 */
function getOpenpathListOrgCredentials(queryParams) {
  queryParams = queryParams || { 'order': 'asc' } // {'filter': 'credentialType.id:(2)'}

  //Basic <base64-encoding-of "email:password">
  var encodedKeyPair = Utilities.base64Encode(openpathApiUser + ':' + openpathApiPassword);

  var url = `${openpathUrl}/${openpathOrgId}/credentials`;
  if (queryParams) {
    url = buildUrl_(url, queryParams);
  }

  var headers = {
    'Authorization': 'Basic ' + encodedKeyPair,
    'Accept': 'application/json',
    // 'Content-Type': 'application/json'
  };

  // var data =
  //   JSON.stringify(bodyParams)
  //   ;

  var options = {
    'method': 'GET',
    'muteHttpExceptions': true,
    'headers': headers,
    // 'payload': data
  };

  var response = UrlFetchApp.fetch(url, options);
  var responseJson = JSON.parse(response);

  if (response.getResponseCode() === 200) {
    Logger.log(`Success!  Response code is: ${response.getResponseCode()}`);
    return JSON.parse(response);
  } else {
    Logger.log('Failure!  Response code is: %s', response.getResponseCode());
    Logger.log('Failure!  Response text is: %s', response.getContentText());
    // Return null so the script knows not to run
    return null;
  }
}





/**
 * DELETEs the passed credential for the passed user.
 * @param {number} userId - The User ID to remove a credential from.
 * @param {number} credentialId - The Credential ID to delete.
 * @see {@link https://openpath.readme.io/reference/updateusergroupids}
 */
function deleteOpenpathDeleteCredential(userId, credentialId) {
  userId = userId || 12345678;
  credentialId = credentialId || 1234567;

  //Basic <base64-encoding-of "email:password">
  var encodedKeyPair = Utilities.base64Encode(openpathApiUser + ':' + openpathApiPassword);

  var url = `${openpathUrl}/${openpathOrgId}/users/${userId}/credentials/${credentialId}`;
  // if (queryParams) {
  //   url = buildUrl_(url, queryParams);
  // }

  var headers = {
    'Authorization': 'Basic ' + encodedKeyPair,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  // var data =
  //   JSON.stringify(credentialId)
  //   ;

  var options = {
    'method': 'DELETE',
    'muteHttpExceptions': true,
    'headers': headers,
    // 'payload': data
  };

  var response = UrlFetchApp.fetch(url, options);
  // var responseJson = JSON.parse(response);

  if (response.getResponseCode() === 204) {
    Logger.log(`Successfully deleted credential: ${credentialId} for user: ${userId}.  Response code is: ${response.getResponseCode()}`);
    return response.getResponseCode();
  } else {
    Logger.log('Failure!  Response code is: %s', response.getResponseCode());
    Logger.log('Failure!  Response text is: %s', response.getContentText());
    // Return null so the script knows not to run
    return null;
  }
}



/**
 * GETs the user's Openpath custom fields.
 * @param {number} userId - The User ID to get the custom fields of.
 * @param {Object} queryParams - JSON query params.
 * @see {@link https://openpath.readme.io/reference/listusercustomfields}
 */
function getOpenpathListUserCustomFields(userId, queryParams) {
  userId = userId || 12345678;
  queryParams = queryParams || { 'order': 'asc' }

  //Basic <base64-encoding-of "email:password">
  var encodedKeyPair = Utilities.base64Encode(openpathApiUser + ':' + openpathApiPassword);

  var url = `${openpathUrl}/${openpathOrgId}/users/${userId}/customFields`;
  if (queryParams) {
    url = buildUrl_(url, queryParams);
  }

  var headers = {
    'Authorization': 'Basic ' + encodedKeyPair,
    'Accept': 'application/json',
    // 'Content-Type': 'application/json'
  };

  // var data =
  //   JSON.stringify(bodyParams)
  //   ;

  var options = {
    'method': 'GET',
    'muteHttpExceptions': true,
    'headers': headers,
    // 'payload': data
  };

  var response = UrlFetchApp.fetch(url, options);
  var responseJson = JSON.parse(response);

  if (response.getResponseCode() === 200) {
    Logger.log(`Success!  Response code is: ${response.getResponseCode()}`);
    return JSON.parse(response);
  } else {
    Logger.log('Failure!  Response code is: %s', response.getResponseCode());
    Logger.log('Failure!  Response text is: %s', response.getContentText());
    // Return null so the script knows not to run
    return null;
  }
}


/**
 * PATCHs the groups to add or remove for a user.
 * @param {number} userId - The User ID to add a credential for.
 * @param {Object} groupChanges - add or remove with an array of group IDs.
 * @see {@link https://openpath.readme.io/reference/updateusergroupids}
 */
function patchOpenpathUpdateUserGroupIds(userId, groupChanges) {
  userId = userId || 12345678;
  groupChanges = groupChanges || { add: [openpathDefaultStaffGroupId] };

  //Basic <base64-encoding-of "email:password">
  var encodedKeyPair = Utilities.base64Encode(openpathApiUser + ':' + openpathApiPassword);

  var url = `${openpathUrl}/${openpathOrgId}/users/${userId}/groupIds`;
  // if (queryParams) {
  //   url = buildUrl_(url, queryParams);
  // }

  var headers = {
    'Authorization': 'Basic ' + encodedKeyPair,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  var data =
    JSON.stringify(groupChanges)
    ;

  var options = {
    'method': 'PATCH',
    'muteHttpExceptions': true,
    'headers': headers,
    'payload': data
  };

  var response = UrlFetchApp.fetch(url, options);
  // var responseJson = JSON.parse(response);

  if (response.getResponseCode() === 204) {
    if (groupChanges.add) {
      Logger.log(`Successfully updated ${userId} to add ${groupChanges.add} to their groups.  Response code is: ${response.getResponseCode()}`);
    } else {
      Logger.log(`Successfully updated ${userId} to remove ${groupChanges.remove} from their groups.  Response code is: ${response.getResponseCode()}`);
    }
    return response.getResponseCode();
  } else {
    Logger.log('Failure!  Response code is: %s', response.getResponseCode());
    Logger.log('Failure!  Response text is: %s', response.getContentText());
    // Return null so the script knows not to run
    return null;
  }
}


/**
 * POSTs the mobile credential for Openpath to send an email to set it up.
 * @param {number} userId - The User ID to add a credential for.
 * @param {number} credentialId - The mobile ID to get setup.
 * @see {@link https://openpath.readme.io/reference/setupmobilecredential}
 */
function postOpenpathSetupMobileCredential(userId, credentialId) {
  userId = userId || 12345678;
  credentialId = credentialId || 1234567;

  //Basic <base64-encoding-of "email:password">
  var encodedKeyPair = Utilities.base64Encode(openpathApiUser + ':' + openpathApiPassword);

  var url = `${openpathUrl}/${openpathOrgId}/users/${userId}/credentials/${credentialId}/setupMobile`;
  // if (queryParams) {
  //   url = buildUrl_(url, queryParams);
  // }

  var headers = {
    'Authorization': 'Basic ' + encodedKeyPair,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  // var data =
  //   JSON.stringify(bodyParams)
  //   ;

  var options = {
    'method': 'POST',
    'muteHttpExceptions': true,
    'headers': headers,
    // 'payload': data
  };

  var response = UrlFetchApp.fetch(url, options);
  // var responseJson = JSON.parse(response);

  if (response.getResponseCode() === 204) {
    Logger.log(`Successfully emailed ${userId} to setup their mobile credential: ${credentialId}.  Response code is: ${response.getResponseCode()}`);
    return response.getResponseCode();
  } else {
    Logger.log('Failure!  Response code is: %s', response.getResponseCode());
    Logger.log('Failure!  Response text is: %s', response.getContentText());
    // Return null so the script knows not to run
    return null;
  }
}


/**
 * PUTs the credential for Openpath to create for a user.
 * @param {number} userId - The User ID to add a credential for.
 * @param {string} status - Either 'A', 'I', or 'S' (Active, Inactive [deleted in the dashboard], or Suspended).
 * @see {@link https://openpath.readme.io/reference/setuserstatus}
 */
function putOpenpathSetUserStatus(userId, status) {
  userId = userId || 12345678;
  status = status || 'A';

  //Basic <base64-encoding-of "email:password">
  var encodedKeyPair = Utilities.base64Encode(openpathApiUser + ':' + openpathApiPassword);

  var url = `${openpathUrl}/${openpathOrgId}/users/${userId}/status`;
  // if (queryParams) {
  //   url = buildUrl_(url, queryParams);
  // }

  var headers = {
    'Authorization': 'Basic ' + encodedKeyPair,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  var data =
    JSON.stringify({ status: status })
    ;

  var options = {
    'method': 'PUT',
    'muteHttpExceptions': true,
    'headers': headers,
    'payload': data
  };

  var response = UrlFetchApp.fetch(url, options);
  // var responseJson = JSON.parse(response);

  if (response.getResponseCode() === 204) {
    Logger.log(`Successfully updated the users ${userId} status to: ${status}.  Response code is: ${response.getResponseCode()}`);
    return response.getResponseCode();
  } else {
    Logger.log('Failure!  Response code is: %s', response.getResponseCode());
    Logger.log('Failure!  Response text is: %s', response.getContentText());
    // Return null so the script knows not to run
    return null;
  }
}


/**
 * GETs the user for Openpath to create.
 * @param {number} userId - The User ID to get the credentials of.
 * @param {Object} queryParams - JSON query params.
 * @see {@link https://openpath.readme.io/reference/listcredentials}
 */
function getOpenpathListCredentials(userId, queryParams) {
  userId = userId || 12345678;
  queryParams = queryParams || { 'order': 'asc' }

  //Basic <base64-encoding-of "email:password">
  var encodedKeyPair = Utilities.base64Encode(openpathApiUser + ':' + openpathApiPassword);

  var url = `${openpathUrl}/${openpathOrgId}/users/${userId}/credentials`;
  if (queryParams) {
    url = buildUrl_(url, queryParams);
  }

  var headers = {
    'Authorization': 'Basic ' + encodedKeyPair,
    'Accept': 'application/json',
    // 'Content-Type': 'application/json'
  };

  // var data =
  //   JSON.stringify(bodyParams)
  //   ;

  var options = {
    'method': 'GET',
    'muteHttpExceptions': true,
    'headers': headers,
    // 'payload': data
  };

  var response = UrlFetchApp.fetch(url, options);
  var responseJson = JSON.parse(response);

  if (response.getResponseCode() === 200) {
    Logger.log(`Success!  Response code is: ${response.getResponseCode()}`);
    return JSON.parse(response);
  } else {
    Logger.log('Failure!  Response code is: %s', response.getResponseCode());
    Logger.log('Failure!  Response text is: %s', response.getContentText());
    // Return null so the script knows not to run
    return null;
  }
}


/**
 * POSTs the credential for Openpath to create for a user.
 * @param {number} userId - The User ID to add a credential for.
 * @param {Object} bodyParams - JSON query params.
 * ID: 2: Card: Weigand ID, card.fields: facilityCode: 123, cardId: 12345, card.cardFormat: id:, code, numBits
 * ID: 2: Card: Weigand ID, card.fields: id: , number: , card.cardFormat: id: 5147, code: raw64, numBits: 64
 * ID: 2: Card: Weigand ID, card.fields: facilityCode: 123, cardId: 12345, card.cardFormat: id: 5150, code: prox26std, numBits: 26
 * ID: 1, name: Mobile, card.fields: facilityCode: 123, cardId: 12345, card.cardFormat: id: 5150, code: prox26std, numBits: 26
 * @see {@link https://openpath.readme.io/reference/createcredential}
 */
function postOpenpathCreateCredential(userId, bodyParams) {
  // userId = userId || 12345678;
  bodyParams = bodyParams || {
    credentialTypeId: 1,
    mobile: { name: 'Default Mobile' },
    // credentialTypeId: 2,
    // card: {
    //   fields: { facilityCode: '123', cardId: '12345' },
    // //   // number: '12345',
    //   cardFormatId: 5150
    // }
  };

  //Basic <base64-encoding-of "email:password">
  var encodedKeyPair = Utilities.base64Encode(openpathApiUser + ':' + openpathApiPassword);

  var url = `${openpathUrl}/${openpathOrgId}/users/${userId}/credentials`;
  // if (queryParams) {
  //   url = buildUrl_(url, queryParams);
  // }

  var headers = {
    'Authorization': 'Basic ' + encodedKeyPair,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  var data =
    JSON.stringify(bodyParams)
    ;

  var options = {
    'method': 'POST',
    'muteHttpExceptions': true,
    'headers': headers,
    'payload': data
  };

  var response = UrlFetchApp.fetch(url, options);
  var responseJson = JSON.parse(response);

  if (response.getResponseCode() === 201) {
    Logger.log(`Successfully created a new credential for ${userId} with type: ${bodyParams.credentialTypeId}.  Response code is: ${response.getResponseCode()}`);
    return JSON.parse(response);
  } else {
    Logger.log('Failure!  Response code is: %s', response.getResponseCode());
    Logger.log('Failure!  Response text is: %s', response.getContentText());
    // Return null so the script knows not to run
    return null;
  }
}


/**
 * POSTs the user for Openpath to create.
 * @param {Object} newUserIdentity - Optional JSON query params that must include at least the email.
 * @see {@link https://openpath.readme.io/reference/createuser}
 */
function postOpenpathCreateUser(newUserIdentity) {
  newUserIdentity = newUserIdentity || { email: 'user@yourorg.com', firstName: 'Test', lastName: 'User' }

  //Basic <base64-encoding-of "email:password">
  var encodedKeyPair = Utilities.base64Encode(openpathApiUser + ':' + openpathApiPassword);

  var url = `${openpathUrl}/${openpathOrgId}/users`;
  // if (queryParams) {
  //   url = buildUrl_(url, queryParams);
  // }

  var headers = {
    'Authorization': 'Basic ' + encodedKeyPair,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  var data =
    JSON.stringify({ identity: newUserIdentity })
    ;

  var options = {
    'method': 'POST',
    'muteHttpExceptions': true,
    'headers': headers,
    'payload': data
  };

  var response = UrlFetchApp.fetch(url, options);
  var responseJson = JSON.parse(response);

  if (response.getResponseCode() === 201) {
    Logger.log(`Successfully created a new user: ${newUserIdentity.email} with ID: ${responseJson.data.id}.  Response code is: ${response.getResponseCode()}`);
    return JSON.parse(response);
  } else {
    Logger.log('Failure!  Response code is: %s', response.getResponseCode());
    Logger.log('Failure!  Response text is: %s', response.getContentText());
    // Return null so the script knows not to run
    return null;
  }
}

/**
 * GETs the users from Openpath with optional queryParams.
 * @param {Object} [queryParams] - Optional JSON query params.
 * @see {@link https://openpath.readme.io/reference/listusers}
 */
function getOpenpathListUsers(queryParams) {
  queryParams = queryParams || { 'order': 'asc' };

  //Basic <base64-encoding-of "email:password">
  var encodedKeyPair = Utilities.base64Encode(openpathApiUser + ':' + openpathApiPassword);

  var url = `${openpathUrl}/${openpathOrgId}/users`;
  if (queryParams) {
    url = buildUrl_(url, queryParams);
  }

  var headers = {
    'Authorization': 'Basic ' + encodedKeyPair,
    'Accept': 'application/json',
    // 'Content-Type': 'application/json'
  };

  // var data = {
  //     queryParams
  // };

  var options = {
    'method': 'GET',
    'muteHttpExceptions': true,
    'headers': headers,
    // 'payload': data
  };

  var response = UrlFetchApp.fetch(url, options);
  var responseJson = JSON.parse(response);

  if (response.getResponseCode() === 200) {
    Logger.log(`Successfully fetched all ${responseJson.data.length} Openpath users. Response code is: ${response.getResponseCode()}`);
    return JSON.parse(response);
  } else {
    Logger.log('Failure!  Response code is: %s', response.getResponseCode());
    Logger.log('Failure!  Response text is: %s', response.getContentText());
    // Return null so the script knows not to run
    return null;
  }
}

/**
 * Builds a complete URL from a base URL and a map of URL parameters.
 * @param {string} url The base URL.
 * @param {Object.<string, string>} params The URL parameters and values.
 * @return {string} The complete URL.
 * @private
 * @see {@link https://stackoverflow.com/questions/63668793/sending-parameters-with-urlfetchapp}
 */
function buildUrl_(url, params) {
  var paramString = Object.keys(params).map(function (key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
  return url + (url.indexOf('?') >= 0 ? '&' : '?') + paramString;
}