/**
 * First finds out the Snipe Apple manufacturer ID then passes that
 * to find all the Apple devices in Snipe
 * After matching the two it updates all the Snipe Macs to the Mosyle wifi_mac_address
 */
function updateSnipeDeviceMacs() {
  var snipeAppleId = getSnipeManufacturerId("Apple")
  var snipeAppleDevices = getSnipeManufacturerAssets(snipeAppleId)
  Logger.log('Total Snipe Apple Devices: %s', snipeAppleDevices.total)

  // Get all Mosyle devices
  var mosyleIosDevices = getMosyleDevices("ios")
  var mosyleMacDevices = getMosyleDevices("mac")
  var mosyleTvosDevices = getMosyleDevices("tvos")
  var mosyleDevices = mosyleIosDevices.concat(mosyleMacDevices, mosyleTvosDevices);

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

        // Check for MAC address differences
        if (!row.custom_fields["MAC Address"].value || row.custom_fields["MAC Address"].value.toUpperCase() != mosyleDevice.wifi_mac_address.toUpperCase()) {
          Logger.log('MAC address (%s %s) is different', row.custom_fields["MAC Address"].value, mosyleDevice.wifi_mac_address)
          needToUpdateDevices += 1;
          Logger.log("Trying to update in Snipe")
          let snipeResponse = updateSnipeMac(row.id, mosyleDevice.wifi_mac_address)
          Logger.log('Snipe responded with', snipeResponse)
          updatedDevices.push(row.name);
        } else {
          // Logger.log('MAC address (%s %s) is the same', row.custom_fields["MAC Address"].value, mosyleDevice.wifi_mac_address)
          noNeedToUpdateDevices += 1;
        }
      }
    }
  }


  Logger.log('Updated devices are: %s', devicesUpdated)
  Logger.log('Updapted: %s', updatedDevices)
  Logger.log('Devices that need updating: %s', needToUpdateDevices)
  Logger.log('Devices that do not need updating: %s', noNeedToUpdateDevices)
  Logger.log('Total matching devices found were: %s', matchingDevices)

}