/**
 * GETS all Mosyle devices based on the os passed.  Needs seperate calls from ios, mac, and tvos.
 * @param {string} os - The operating system to get devices for.  Takes ios, mac, or tvos.
 * @returns {Object} Response from Mosyle with the devices.
 */
function getMosyleDevices(os) {
  os = os || "mac";
  var url = mosyleServerURL + '/listdevices'
  var headers = {};
  var data = {
    "accessToken": mosyleAccessToken,
    "options": {
      "os": os,
      "page": 0,
      // "specific_columns": [
      //   "device_name",
      //   "serial_number",
      //   "asset_tag",
      //   "wifi_mac_address"
      // ]
    }
  }

  var options = {
    "method": "POST",
    "contentType": "application/json",
    'muteHttpExceptions': true,
    "headers": headers,
    "payload": JSON.stringify(data)
  };

  var response = JSON.parse(UrlFetchApp.fetch(url, options));

  // Place the current devices in a variable
  var mosyleDevices = response.response.devices

  Logger.log('Found a total of %s %s devices', mosyleDevices.length, os)
  return mosyleDevices;
}


/**
 * POSTs to Mosyle the serial number of the device to update and the new name.
 * @param {string} serialnumber - The serial number of the device to update.
 * @param {string} name - The new name for the device.
 * @param {string} asset_tag - The new asset tag for the device.
 * @returns {Object} Response from Mosyle with the device and its new attributes.
 */
function postMosyleUpdate(serialnumber, name, asset_tag) {

  var url = mosyleServerURL + '/devices'
  var headers = {};
  var data = {
    "accessToken": mosyleAccessToken,
    "elements": [{
      "serialnumber": serialnumber,
      "name": name,
      "asset_tag": asset_tag
    }]
  }

  var options = {
    "method": "POST",
    "contentType": "application/json",
    'muteHttpExceptions': true,
    "headers": headers,
    "payload": JSON.stringify(data)
  };
  var response = JSON.parse(UrlFetchApp.fetch(url, options));
  Logger.log(response);

  return response;
}