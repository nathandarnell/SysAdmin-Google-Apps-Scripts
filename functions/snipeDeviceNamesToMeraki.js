/**
 * First finds out the Snipe Meraki manufacturer ID then passes that
 * to find all the Meraki devices in Snipe.
 * Then updates the name in Meraki accordingly
 */
function updateMerakiDevices() {
  const snipeManufacturerId = getSnipeManufacturerId("Meraki")
  const snipeDevices = getSnipeManufacturerAssets(snipeManufacturerId)
  const merakiDevices = getMerakiDevices();
  Logger.log('Total Snipe Meraki Devices: %s', snipeDevices.total)
  Logger.log('Total Meraki Devices: %s', merakiDevices.length)

  const updatedDevices = [];
  const unmatchedDevices = [];
  let matchingDevices = 0;
  let needToUpdateDevices = 0;
  let noNeedToUpdateDevices = 0;

  let rows = snipeDevices.rows
  for (let i = 0; i < snipeDevices.total; i++) {
    let row = rows[i];
    for (let i = 0; i < merakiDevices.length; i++) {
      let merakiDevice = merakiDevices[i];
      if (row.serial == merakiDevice.serial) {
        matchingDevices += 1;
        // Removes the matching device from the array in case we have missing devices in Snipe
        merakiDevices.splice(merakiDevices.indexOf(merakiDevice), 1);
        // snipeDevices.rows.splice(snipeDevices.rows.indexOf(row), 1);
        // Logger.log('Found matching device %s %s', row.serial, merakiDevice.serial);
        if (row.name == merakiDevice.name) {
          // Logger.log('Name (%s %s) and serial (%s %s) are the same', row.name, merakiDevice.name, row.serial, merakiDevice.serial);
          noNeedToUpdateDevices += 1;
        } else {
          Logger.log('Name (%s %s) is different for device with serial (%s %s)', row.name, merakiDevice.name, row.serial, merakiDevice.serial);
          needToUpdateDevices += 1;
          Logger.log("Trying to update in Meraki...");
          let response = postMerakiDeviceUpdate(row.serial, {
            "name": row.name
          });
          if (response.getResponseCode() == 200) {
            Logger.log('Meraki responded with: %s', response);
            updatedDevices.push(row.name);
          } else {
            Logger.log('Meraki had an error and responded with: %s', response);
          }
        }
      }
    }
  }

  Logger.log('Meraki devices not found in Snipe %s', merakiDevices);
  Logger.log('Total matching devices found were: %s', matchingDevices);
  Logger.log('Devices that did not need updating: %s', noNeedToUpdateDevices);
  Logger.log('Devices that needed updating: %s', needToUpdateDevices);
  Logger.log('Updated devices are: %s', updatedDevices.length);
  Logger.log('Updapted: %s', updatedDevices);
}