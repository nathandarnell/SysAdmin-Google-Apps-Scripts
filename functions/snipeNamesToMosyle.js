/**
 * First finds the Snipe Apple manufacturer ID then passes that to find all the
 * Apple devices in Snipe.  Then grabs all the iOS, Mac, and tvOS from Mosyle
 * and updates their Name and Asset Tags based off the Snipe data
 */
function updateMosyleDevices() {
  const snipeAppleId = getSnipeManufacturerId("Apple")
  const snipeAppleDevices = getSnipeManufacturerAssets(snipeAppleId)
  Logger.log('Total Snipe Apple Devices: %s', snipeAppleDevices.total)

  // Get all Mosyle devices
  const mosyleIosDevices = getMosyleDevices("ios")
  const mosyleMacDevices = getMosyleDevices("mac")
  const mosyleTVosDevices = getMosyleDevices("tvos")
  const mosyleDevices = mosyleIosDevices.concat(mosyleMacDevices, mosyleTVosDevices);

  Logger.log('Total Mosyle Apple Devices: %s', mosyleDevices.length)

  const updatedDevices = [];
  let matchingDevices = 0;
  let needToUpdateDevices = 0;
  let noNeedToUpdateDevices = 0;
  let devicesUpdated = 0;
  let rows = snipeAppleDevices.rows
  for (let i = 0; i < snipeAppleDevices.total; i++) {
    let row = rows[i]

    for (let i = 0; i < mosyleDevices.length; i++) {
      let mosyleDevice = mosyleDevices[i]
      if (row.serial == mosyleDevice.serial_number) {
        matchingDevices += 1;
        // Logger.log('Found: %s %s %s in Mosyle', row.serial, row.name, row.asset_tag)

        // Check for name or asset tag differences
        if (row.name != mosyleDevice.device_name || row.asset_tag != mosyleDevice.asset_tag) {
          Logger.log('Name (%s %s) or asset tag (%s %s) are different', row.name, mosyleDevice.device_name, row.asset_tag, mosyleDevice.asset_tag)
          needToUpdateDevices += 1;
          Logger.log("Trying to update in Mosyle")
          let mosyleResponse = postMosyleUpdate(row.serial, row.name, row.asset_tag)
          Logger.log('Mosyle responded with', mosyleResponse)
          updatedDevices.push(row.name);
        } else {
          // Logger.log('Name (%s %s) and asset tag (%s %s) are the same', row.name, mosyleDevice.device_name, row.asset_tag, mosyleDevice.asset_tag)
          noNeedToUpdateDevices += 1;
        }
      }
    }
  }

  Logger.log('Updated devices are: %s', devicesUpdated)
  Logger.log('Updapted: %s', updatedDevices)
  Logger.log('Devices that needed updating: %s', needToUpdateDevices)
  Logger.log('Devices that do not need updating: %s', noNeedToUpdateDevices)
  Logger.log('Total matching devices found were: %s', matchingDevices)

}