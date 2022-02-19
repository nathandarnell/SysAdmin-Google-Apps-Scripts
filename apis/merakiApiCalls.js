/**
 * POST Provision Meraki devices by MAC with a Group Policy and name.
 * @param {Object[]} clients - Array of MAC addresses to assign to the device.
 * @param {string} policy - Can be 'Group policy', 'Allowed', 'Blocked', 'Per connection' or 'Normal'.
 * @param {number} policyId - Optional integer from GP page, only needed if policy is set to 'Group policy' or else ignored.
 * @returns {Object} Response from Meraki with the clients, policy, and policy ID.
 * @see https://developer.cisco.com/meraki/api-v1/#!provision-network-clients
 */
function postProvisionMerakiDevices(clients, policy, policyId) {
  // mac = mac || 'E0:D4:E8:C9:FE:19';
  // name = name || 'CB-256';
  // policy = policy || "Group policy";
  // policyId = policyId || "108";
  var url = merakiServerURL + '/networks/' + merakiNetworkId + '/clients/provision';

  headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Cisco-Meraki-API-Key": merakiApiKey
  }

  var data = {
    "clients": clients,
    "devicePolicy": policy,
    "groupPolicyId": policyId
  }

  var options = {
    "method": "POST",
    "headers": headers,
    "muteHttpExceptions": true,
    "payload": JSON.stringify(data)
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
  } catch (err) {
    Logger.log('Meraki errored with: %s', err);
  }

  Logger.log(response.getResponseCode());
  Logger.log(JSON.parse(response));
  return (response);
}


/**
 * GET all the Meraki devices in the organization.
 * @returns {Object[]} Array of the Meraki devices.
 * @see https://developer.cisco.com/meraki/api-v1/#!get-organization-devices
 */
function getMerakiDevices() {
  var url = merakiServerURL + '/organizations/' + merakiOrgId + '/devices';

  headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Cisco-Meraki-API-Key": merakiApiKey
  }

  var options = {
    "method": "GET",
    "headers": headers,
    "muteHttpExceptions": true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
  } catch (err) {
    Logger.log('Meraki errored with: %s', err);
  }
  // Logger.log(response.getResponseCode());
  // Logger.log(JSON.parse(response));
  var jsonResponse = JSON.parse(response);
  return (jsonResponse);
}


/**
 * GET the Meraki device by it's serial number and return the response
 * @param {string} serial - The serial number of the Meraki device to retrieve.
 * @returns {Object} The requested Meraki device information.
 * @see https://developer.cisco.com/meraki/api-v1/#!get-device
 */
function getMerakiDevice(serial) {
  var url = merakiServerURL + '/devices/' + serial;

  headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Cisco-Meraki-API-Key": merakiApiKey
  }

  var options = {
    "method": "GET",
    "headers": headers,
    "muteHttpExceptions": true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
  } catch (err) {
    Logger.log('Meraki errored with: %s', err);
  }
  Logger.log(JSON.parse(response));
  Logger.log(response.getResponseCode());
  return (response);
}


/**
 * PUT an update to a Meraki device by its serial number and returns the response.
 * @param {string} serial - The serial number of the device to update.
 * @param {Object} data - The object with the attributes to update.
 * @returns {Object} Response from Meraki with the updated device's attributes.
 */
function postMerakiDeviceUpdate(serial, data) {
  data = data || {
    "name": ""
  }
  var url = merakiServerURL + '/devices/' + serial;

  headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Cisco-Meraki-API-Key": merakiApiKey
  }

  var options = {
    "method": "PUT",
    "headers": headers,
    "muteHttpExceptions": true,
    "payload": JSON.stringify(data)
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
  } catch (err) {
    Logger.log('Meraki errored with: %s', err);
    return;
  }
  Logger.log(response.getResponseCode());
  Logger.log(JSON.parse(response));
  return (response);
}