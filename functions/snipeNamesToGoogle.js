/**
 * Gets the list of ChromeOS devices from Google.
 * Compares it to the list of ChromeOS devices in
 * Snipe and updates the name (in notes), and 
 * Asset ID if needed
 */
function updateGoogleDevices() {

  const snipeChromebookId = getSnipeCategoryId("Chromebook");
  const snipeChromebooks = getSnipeCategoryAssets(snipeChromebookId);
  const googleDevices = getGoogleDevices();

  Logger.log('Snipe total devices: %s', snipeChromebooks.total)

  var totalDevices = 0;
  var matchingDevices = 0;
  var devicesUpdated = 0;
  var updatedDevices = [];

  var rows = snipeChromebooks.rows
  for (let j = 0; j < snipeChromebooks.total; j++) {
    var row = rows[j]

    // Adapted the editing of the googleDevice Object from: https://stackoverflow.com/questions/44340900/admin-sdk-chromeosdevices-method
    for (let i = 0; i < googleDevices.length; i++) {
      var googleDevice = googleDevices[i];
      let updatedDeviceAttributes = false;

      // Check if the device is in Snipe by serial number
      if (row.serial == googleDevice.serialNumber) {
        // console.log('Found: %s %s %s', row.serial, row.name, row.asset_tag);
        matchingDevices += 1;
        // Removes the matching device from the array in case we have missing devices in Snipe
        googleDevices.splice(googleDevices.indexOf(googleDevice), 1);

        // Check if the Asset ID is the same
        if (row.asset_tag != googleDevice.notes) {
          updatedDeviceAttributes = true;
          googleDevice.notes = row.asset_tag;
          Logger.log('Asset Tag is %s but was expecting %s so updating', googleDevice.notes, row.asset_tag);
          devicesUpdated += 1;
          updatedDevices.push(row.name);
        }

        // Check if the name is the same
        if (row.name != googleDevice.annotatedAssetId) {
          updatedDeviceAttributes = true;
          googleDevice.annotatedAssetId = row.name;
          Logger.log('Name is %s and was expecting %s so updating', googleDevice.annotatedAssetId, row.name);
          devicesUpdated += 1;
          updatedDevices.push(row.name);
        }

        // Check if the location is the same
        // Check for NULL values first
        if (!row.location) {
          if (!row.location && !googleDevice.annotatedLocation) {
            // Logger.log('Locations are both NULL');
          } else {
            updatedDeviceAttributes = true;
            googleDevice.annotatedLocation = "";
            Logger.log('Snipe location is NULL and Google is %s so updating', googleDevice.annotatedLocation);
            devicesUpdated += 1;
            updatedDevices.push(row.name);
          }
        } else {
          if (row.location.name != googleDevice.annotatedLocation) {
            updatedDeviceAttributes = true;
            googleDevice.annotatedLocation = row.location.name;
            Logger.log('Location is %s and was expecting %s so updating', googleDevice.annotatedLocation, row.location.name);
            devicesUpdated += 1;
            updatedDevices.push(row.name);
          }
        }




        // Check if the asset is assigned to a user
        if (row.assigned_to && row.assigned_to.type) {
          Logger.log('83: Has row.assigned_to.type of %s', row.assigned_to.type);
          if (row.assigned_to.type == "user") {
            Logger.log('85: row.assigned_to.type == "user" is %s', row.assigned_to.username);
            if (googleDevice.annotatedUser) {
              Logger.log('87: Has googleDevice.annotatedUser of %s', googleDevice.annotatedUser);
              // Check if the username (email) is the same
              if (row.assigned_to.username != googleDevice.annotatedUser) {
                updatedDeviceAttributes = true;
                googleDevice.annotatedUser = row.assigned_to.username;
                Logger.log('Assigned username is %s and was expecting %s so updating', googleDevice.annotatedUser, row.assigned_to.username);
                devicesUpdated += 1;
                updatedDevices.push(row.name);
              }
            } else {
              Logger.log('82: Does not have googleDevice.annotatedUser but should');
              updatedDeviceAttributes = true;
              googleDevice.annotatedUser = row.assigned_to.username;
              Logger.log('Assigned username is blank and was expecting %s so updating', row.assigned_to.username);
              devicesUpdated += 1;
              updatedDevices.push(row.name);
            }
          } else if (googleDevice.annotatedUser) {
            updatedDeviceAttributes = true;
            googleDevice.annotatedUser = "";
            Logger.log('99: Is not row.assigned_to.type == "user" so removing %s', googleDevice.annotatedUser);
            devicesUpdated += 1;
            updatedDevices.push(row.name);
          }
        } else if (googleDevice.annotatedUser) {
          updatedDeviceAttributes = true;
          googleDevice.annotatedUser = "";
          Logger.log('107: Is not row.assigned_to.type so removing %s', googleDevice.annotatedUser);
          devicesUpdated += 1;
          updatedDevices.push(row.name);
        }
        if (updatedDeviceAttributes) {
          Logger.log('Updating in Google with: %s', googleDevice);
          var update = AdminDirectory.Chromeosdevices.update(googleDevice, googleCustomerId, googleDevice.deviceId);
        }
      }
    }

    // Logger.log('The last device was: %s %s (%s) %s', googleDevice.serialNumber, googleDevice.notes, googleDevice.annotatedAssetId, googleDevice.deviceId);

    // Updated the list of total devices in Google
    totalDevices += 1;
  }

  // Print out the devices numbers to the logs
  Logger.log('Number of Google devices not in Snipe are: %s', googleDevices.length);
  googleDevices.forEach(googleDevice => {
    Logger.log('Google device not found in Snipe: %s Status: %s %s %s %s', googleDevice.serialNumber, googleDevice.status, googleDevice.annotatedAssetId, googleDevice.annotatedLocation, googleDevice.notes);
  });
  Logger.log('Updated total attributess in Google are: %s', devicesUpdated);
  Logger.log('Total Google devices checked were: %s', totalDevices);
  Logger.log('Total matching devices found were: %s', matchingDevices);
  Logger.log('Updated devices are: %s', updatedDevices.length);
  Logger.log('Updapted: %s', updatedDevices);
}