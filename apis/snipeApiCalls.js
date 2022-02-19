/**
 * GETs a single Snipe device by it's serial number.
 * @param {string} serial - Serial number search by.
 * @returns {Object} The device information searched for.
 */
function getSnipeDeviceBySerial(serial) {
  var url = snipeServerURL + 'api/v1/hardware/byserial/' + serial;
  var headers = {
    "Authorization": "Bearer " + snipeApiKey
  };

  var options = {
    "method": "GET",
    "contentType": "application/json",
    'muteHttpExceptions': true,
    "headers": headers,
  };

  //run once to get the total to use for the limit
  var response = JSON.parse(UrlFetchApp.fetch(url, options));
  var rows = response.rows[0];

  return rows;
}


/**
 * GETs the location ID by the location name.
 * @param {string} location - Location's name.
 * @returns {number} The ID number of the location.
 */
function getSnipeLocationId(location) {
  location = location || "Room 501";
  var url = snipeServerURL + 'api/v1/locations';
  var headers = {
    "Authorization": "Bearer " + snipeApiKey
  };

  var options = {
    "method": "GET",
    "contentType": "application/json",
    'muteHttpExceptions': true,
    "headers": headers,
  };

  //run once to get the total to use for the limit
  var response = JSON.parse(UrlFetchApp.fetch(url, options));
  var limit = response.total;

  //run again with the limit so Snipe actually returns all the results.
  var url = snipeServerURL + 'api/v1/locations?limit=' + limit;
  var response = JSON.parse(UrlFetchApp.fetch(url, options));
  var rows = response.rows;

  for (var i = 0; i < response.total; i++) {
    var row = rows[i];
    if (row.name == location) {
      var id = row.id;
      Logger.log('Found the location: %s in Snipe with the ID of %s', row.name, id);
      return id;
    }
  }
}


/**
 * GETs all the assets assigned to a location identified by its ID.
 * @param {number} snipeLocationId - Location's ID.
 * @returns {Object[]} All the location's assets.
 */
function getSnipeLocationAssets(snipeLocationId) {
  snipeLocationId = snipeLocationId || 10;
  var url = snipeServerURL + 'api/v1/hardware?location_id=' + snipeLocationId
  var headers = {
    "Authorization": "Bearer " + snipeApiKey
  };

  var options = {
    "method": "GET",
    "contentType": "application/json",
    'muteHttpExceptions': true,
    "headers": headers,
  };

  //run once to get the total to use for the limit
  var response = JSON.parse(UrlFetchApp.fetch(url, options));
  var limit = response.total

  //run again with the limit so Snipe actually returns all the results.
  var url = snipeServerURL + 'api/v1/hardware?limit=' + limit + '&location_id=' + snipeLocationId
  var response = JSON.parse(UrlFetchApp.fetch(url, options));
  Logger.log('Found the location: %s in Snipe with %s assets', snipeLocationId, response.total);
  return response
}


/**
 * GETs the manufacturer's ID based on its name.
 * @param {string} manufacturer - Manufacturer's name.
 * @returns {number} The ID number of the manufacturer.
 */
function getSnipeManufacturerId(manufacturer) {
  var url = snipeServerURL + 'api/v1/manufacturers'
  var headers = {
    "Authorization": "Bearer " + snipeApiKey
  };

  var options = {
    "method": "GET",
    "contentType": "application/json",
    'muteHttpExceptions': true,
    "headers": headers,
  };

  //run once to get the total to use for the limit
  try {
    var response = JSON.parse(UrlFetchApp.fetch(url, options));
  } catch (err) {
    Logger.log('Snipe errored with: %s', err);
  }
  var limit = response.total

  //run again with the limit so Snipe actually returns all the results.
  var url = snipeServerURL + 'api/v1/manufacturers?limit=' + limit
  try {
    var response = JSON.parse(UrlFetchApp.fetch(url, options));
  } catch (err) {
    Logger.log('Snipe errored with: %s', err);
  }
  var rows = response.rows

  for (var i = 0; i < response.total; i++) {
    var row = rows[i]
    if (row.name == manufacturer) {
      var id = row.id
      Logger.log('Found the manufacturer: %s in Snipe with the ID of %s', row.name, id)
      return id
    }
  }
}


/**
 * GETs all the assets from a particular manufacturer based on its ID.
 * @param {number} snipeManufacturerId - Manufacturer's ID.
 * @returns {Object} All the manufacturer's assets.
 */
function getSnipeManufacturerAssets(snipeManufacturerId) {
  snipeManufacturerId = snipeManufacturerId || 1;
  var url = snipeServerURL + 'api/v1/hardware?manufacturer_id=' + snipeManufacturerId
  var headers = {
    "Authorization": "Bearer " + snipeApiKey
  };

  var options = {
    "method": "GET",
    "contentType": "application/json",
    'muteHttpExceptions': true,
    "headers": headers,
  };

  //run once to get the total to use for the limit
  try {
    var response = JSON.parse(UrlFetchApp.fetch(url, options));
  } catch (err) {
    Logger.log('Snipe errored with: %s', err);
  }

  var limit = response.total

  //run again with the limit so Snipe actually returns all the results.
  var url = snipeServerURL + 'api/v1/hardware?limit=' + limit + '&manufacturer_id=' + snipeManufacturerId
  try {
    var response = JSON.parse(UrlFetchApp.fetch(url, options));
  } catch (err) {
    Logger.log('Snipe errored with: %s', err);
  }

  return response
}


/**
 * GETs all the categories from Snipe and searches for the passed category
 * name then returns the ID for finding all that category's devices in Snipe
 * @param {string} category - The Snipe category name to find the ID of.
 * @returns {number} The ID number of the category.
 */
function getSnipeCategoryId(category) {

  var url = snipeServerURL + 'api/v1/categories'
  var headers = {
    "Authorization": "Bearer " + snipeApiKey
  };

  var options = {
    "method": "GET",
    "contentType": "application/json",
    'muteHttpExceptions': true,
    "headers": headers,
  };

  //run once to get the total to use for the limit
  var response = JSON.parse(UrlFetchApp.fetch(url, options));
  var limit = response.total

  //run again with the limit so Snipe actually returns all the results.
  var url = snipeServerURL + 'api/v1/categories?limit=' + limit
  var response = JSON.parse(UrlFetchApp.fetch(url, options));
  var rows = response.rows

  for (var i = 0; i < response.total; i++) {
    var row = rows[i]
    if (row.name == category) {
      var id = row.id
      Logger.log('The category: %s has the Snipe ID of: %s', row.name, id)
      return id
    }
  }
}


/**
 * GETs all the assets in the category whose ID is passed.
 * @param {number} snipeCategoryId - Snipe category ID.
 * @returns {Object} All the category's assets.
 */
function getSnipeCategoryAssets(snipeCategoryId) {
  var url = snipeServerURL + 'api/v1/hardware?category_id=' + snipeCategoryId
  var headers = {
    "Authorization": "Bearer " + snipeApiKey
  };

  var options = {
    "method": "GET",
    "contentType": "application/json",
    'muteHttpExceptions': true,
    "headers": headers,
  };

  //run once to get the total to use for the limit
  var response = JSON.parse(UrlFetchApp.fetch(url, options));
  var limit = response.total

  //run again with the limit so Snipe actually returns all the results.
  var url = snipeServerURL + 'api/v1/hardware?limit=' + limit + '&category_id=' + snipeCategoryId
  var response = JSON.parse(UrlFetchApp.fetch(url, options));
  var rows = response.rows

  /*   Unneeded.  Only for testing the Snipe response  
    
    for (var i=0; i<response.total; i++){
      var row = rows[i]
      var asset_tag = row.asset_tag
      var model = row.model.name
      var serial = row.serial
      var name = row.name
      console.log(asset_tag)
      console.log(model)
      console.log(serial)
      console.log(name)
    } */

  return response
}


/**
 * GETs all the users in Snipe.
 * @returns {Array} Array of all the users.
 */
function getSnipeUsers() {
  var url = snipeServerURL + 'api/v1/users'
  var headers = {
    "Authorization": "Bearer " + snipeApiKey
  };

  var options = {
    "method": "GET",
    "contentType": "application/json",
    'muteHttpExceptions': true,
    "headers": headers,
  };

  //run once to get the total to use for the limit
  var response = JSON.parse(UrlFetchApp.fetch(url, options));
  var limit = response.total

  //run again with the limit so Snipe actually returns all the results.
  var url = snipeServerURL + 'api/v1/users?limit=' + limit
  var response = JSON.parse(UrlFetchApp.fetch(url, options));
  var rows = response.rows
  Logger.log('Number of users in Snipe is %s', rows.length);

  return rows
}


/**
 * POSTs a new user to Snipe.
 * @param {string} first_name - New user's first name.
 * @param {string} last_name - New user's last name.
 * @param {string} password - New user's password.
 * @param {string} password_confirmation - New user's password again.
 * @param {string} email - New user's email.
 * @returns {Object} Response from SnipeIT with an error or success.
 */
function postSnipeUser(first_name, last_name, password, password_confirmation, email) {
  var url = snipeServerURL + 'api/v1/users'
  var headers = {
    "Authorization": "Bearer " + snipeApiKey
  };
  var data = {
    "first_name": first_name,
    "last_name": last_name,
    "username": email,
    "password": password,
    "password_confirmation": password_confirmation,
    "email": email
  }

  var options = {
    "method": "POST",
    "contentType": "application/json",
    'muteHttpExceptions': true,
    "headers": headers,
    "payload": JSON.stringify(data)
  };

  //run once to get the total to use for the limit
  var response = JSON.parse(UrlFetchApp.fetch(url, options));

  return response;

}


/**
 * DELETEs a user based on its ID.
 * @param {number} id - ID of the user to delete.
 * @returns {Object} Response from SnipeIT with an error or success.
 */
function deleteSnipeUser(id) {
  var url = snipeServerURL + 'api/v1/users/' + id
  var headers = {
    "Authorization": "Bearer " + snipeApiKey
  };
  var data = {}

  var options = {
    "method": "DELETE",
    "contentType": "application/json",
    'muteHttpExceptions': true,
    "headers": headers,
    "payload": JSON.stringify(data)
  };

  //run once to get the total to use for the limit
  var response = JSON.parse(UrlFetchApp.fetch(url, options));

  return response;

}


/**
 * Updates the Snipe mac address the the asset whose ID is passed.
 * This is based on the assets have a custom field called "mac_address" that is accessed by the
 * field name of "_snipeit_mac_address_1".  The response for assets looks like:
 * Logger.log(response.custom_fields["MAC Address"].value);
 * custom_fields={MAC Address={field_format=MAC, field=_snipeit_mac_address_1, value=E0:B5:5F:F3:EE:EA}}
 * @param {number} id - ID of the asset to update.
 * @param {string} mac - MAC address to assign to the device.
 * @returns {Object} Response from SnipeIT with an error or success.
 * TODO: make this generic so you pass the field to update instead of hardcoding it
 */
function updateSnipeMac(id, mac) {
  var url = snipeServerURL + 'api/v1/hardware/' + id;
  var headers = {
    "Authorization": "Bearer " + snipeApiKey
  };
  var data = {
    "_snipeit_mac_address_1": mac
  }

  var options = {
    "method": "PATCH",
    "contentType": "application/json",
    'muteHttpExceptions': true,
    "headers": headers,
    "payload": JSON.stringify(data)
  };

  var response = JSON.parse(UrlFetchApp.fetch(url, options));
  Logger.log(response);
  return response;
}