/**
 * Finds all staff users in Google and finds all their devices in Snipe
 * Puts their assigned devices in the Meraki Staff GP and puts the rest in the Student GP
 * except for the Apple TVs
 * Students: Update the names in Meraki with: Name, Mac, groupPolicy, policyId
 * Staff: Update the names in Meraki with: Name, Mac, "Allowed" (no policy for this level)
 */
function updateAppleDevicesInMeraki() {
  const snipeStaffStatusLabel = "Assigned to Person";
  const googleStaffUsers = listAllGoogleUsers(googleStaffOu);
  const snipeUsers = getSnipeUsers();
  var snipeAppleId = getSnipeManufacturerId("Apple")
  var snipeAppleDevices = getSnipeManufacturerAssets(snipeAppleId)
  Logger.log('Total Snipe Apple Devices: %s', snipeAppleDevices.total)

  let snipeStaffUsers = [];
  let snipePersonalDevices = [];
  let snipeNonPersonalDevices = [];
  let snipeStaffDevices = [];
  let studentDevices = [];

  // Find users in Snipe that are in Google Staff OU
  snipeStaffUsers = Object.values(snipeUsers).filter(({
    username: id1 // Key to find in larger set
  }) => googleStaffUsers.some(({
    primaryEmail: id2 // Key to find in smaller filter set
  }) => id2 === id1));

  Logger.log('Number of Snipe Staff Accounts: %s', snipeStaffUsers.length);
  // snipeStaffUsers.forEach(user => {
  //   Logger.log(user.username);
  // });

  // Filter to only look at assets that have MACs assigned
  snipeAppleDevices = snipeAppleDevices.rows.filter(device => {
    return device.custom_fields["MAC Address"] && device.custom_fields["MAC Address"].value;
  });

  Logger.log('Total Snipe Apple Devices with MACs: %s', snipeAppleDevices.length);

  // Only look at assets that are checked out to users
  // Move them to their own array and move the rest to another array
  for (let i = 0; i < snipeAppleDevices.length; i++) {
    var device = snipeAppleDevices[i];
    if (device.status_label.name == snipeStaffStatusLabel) {
      // Logger.log('Device: %s is Assigned to Staff: %s', device.name, user.username);
      snipePersonalDevices.push(device);
    } else {
      snipeNonPersonalDevices.push(device);
    }
  }

  Logger.log('Number of Snipe Devices Assigned to People: %s', snipePersonalDevices.length);
  Logger.log('Number of Snipe Devices NOT Assigned to People: %s', snipeNonPersonalDevices.length);

  for (let i = 0; i < snipeStaffUsers.length; i++) {
    let user = snipeStaffUsers[i];
    for (let i = 0; i < snipePersonalDevices.length; i++) {
      let device = snipePersonalDevices[i];
      if (device.assigned_to !== null) {
        if (device.assigned_to.username !== null) {
          if (user.username == device.assigned_to.username) {
            // Logger.log('Device: %s is Assigned to Staff: %s', device.name, user.username);
            snipeStaffDevices.push({
              "name": device.name,
              "mac": device.custom_fields["MAC Address"].value
            })
            // Removes the matching device from the array in case we have missing devices in Snipe
            // snipePersonalDevices.splice(snipePersonalDevices.indexOf(device), 1);
          }
        }
      }
    }
  }
  Logger.log('Number of Snipe Devices Assigned to Staff: %s', snipeStaffDevices.length);
  snipeStaffDevices.forEach(device => {
    Logger.log(device);
  });

  let staffResponse = postProvisionMerakiDevices(snipeStaffDevices, "Normal");
  if (staffResponse.getResponseCode() == 201) {
    Logger.log('Updated staff devices in Meraki');
  } else {
    Logger.log('Could not update staff devices in Meraki!');
  }

  /*  Logger.log('Number of Snipe Devices not found Assigned to People: %s', snipePersonalDevices.length);
   snipePersonalDevices.forEach(device => {
     Logger.log(device.name);
   }); */


  // Remove Apple TVs and update student devices in Meraki
  snipeNonPersonalDevices.forEach(device => {
    if (device.model_number === "A2169" || device.model_number === "A1625") {
      // Logger.log('device.model_number: %s device.name: %s', device.model_number, device.name);
    } else {
      studentDevices.push({
        "name": device.name,
        "mac": device.custom_fields["MAC Address"].value
      })
    }
  })

  Logger.log('Number of Snipe Student Devices to send to Meraki: %s', studentDevices.length);

  // studentDevices.forEach(device => {
  //   Logger.log('Name: %s', device.name);
  // })

  let response = postProvisionMerakiDevices(studentDevices, "Group policy", merakiStudentGp);
  if (response.getResponseCode() == 201) {
    Logger.log('Updated student devices in Meraki');
  } else {
    Logger.log('Could not update student devices in Meraki!');
  }

}


//TODO:
function snipeAppleNamesToMeraki() {
  var snipeAppleId = getSnipeManufacturerId("Apple")
  var snipeAppleDevices = getSnipeManufacturerAssets(snipeAppleId)
  Logger.log('Total Snipe Apple Devices: %s', snipeAppleDevices.total)

  // Get all Mosyle devices
  var mosyleIosDevices = getMosyleDevices("ios")
  var mosyleMacDevices = getMosyleDevices("mac")
  var mosyleDevices = mosyleIosDevices.concat(mosyleMacDevices);

  Logger.log('Total Mosyle Apple Devices: %s', mosyleDevices.length)

  let matchingDevices = 0;
  let needToUpdateDevices = 0;
  let noNeedToUpdateDevices = 0;
  let devicesUpdated = 0;
  let rows = snipeAppleDevices.rows;

  for (let i = 0; i < snipeAppleDevices.total; i++) {
    let row = rows[i]
    for (let i = 0; i < mosyleDevices.length; i++) {
      let mosyleDevice = mosyleDevices[i]
      if (row.serial == mosyleDevice.serial_number) {
        matchingDevices += 1;
        Logger.log('Found: %s %s %s in Mosyle', row.serial, row.name, row.asset_tag)

        // Check for name or asset tag differences
        if (row.name != mosyleDevice.device_name || row.asset_tag != mosyleDevice.asset_tag) {
          Logger.log('Name (%s %s) or asset tag (%s %s) are different', row.name, mosyleDevice.device_name, row.asset_tag, mosyleDevice.asset_tag)
          needToUpdateDevices += 1;
          Logger.log("Trying to update in Mosyle")
          let mosyleResponse = postMosyleUpdate(row.serial, row.name, row.asset_tag)
          // let merakiResponse = postProvisionMerakiDevices(mac, name, policy, policyId)
          Logger.log('Mosyle responded with', mosyleResponse)
        } else {
          Logger.log('Name (%s %s) and asset tag (%s %s) are the same', row.name, mosyleDevice.device_name, row.asset_tag, mosyleDevice.asset_tag)
          noNeedToUpdateDevices += 1;
        }
      }
    }
  }

  Logger.log('Updated devices are: %s', devicesUpdated)
  Logger.log('Devices that need updating: %s', needToUpdateDevices)
  Logger.log('Devices that do not need updating: %s', noNeedToUpdateDevices)
  Logger.log('Total matching devices found were: %s', matchingDevices)

}


/**
 * Checks Snipe for any Polycom devices and filters to find the ones with no mac address
 * Updates them to add the serial number to the mac address
 */
function updatePolycomDeviceMacsInSnipe() {
  var snipePolycomId = getSnipeManufacturerId("Polycom")
  var snipePolycomDevices = getSnipeManufacturerAssets(snipePolycomId)
  Logger.log('Total Snipe Polycom Devices: %s', snipePolycomDevices.total)

  let updatedDevices = [];

  // Filter to only look at assets that have no MACs assigned
  snipePolycomDevices = snipePolycomDevices.rows.filter(device => {
    return device.custom_fields["MAC Address"] && !device.custom_fields["MAC Address"].value;
  });

  Logger.log('Total Snipe Polycom Devices with no MACs: %s', snipePolycomDevices.length);

  snipePolycomDevices.forEach(device => {
    Logger.log("Trying to update in Snipe for: %s %s ", device.name, device.serial);
    let snipeResponse = updateSnipeMac(device.id, device.serial);
    // Logger.log('Snipe responded with %s', snipeResponse);
    updatedDevices.push(device.name);
  })

  Logger.log('Updapted: %s', updatedDevices);
}


/**
 * Find Polycom devices in Snipe with a MAC address and
 * Update their names in Meraki and assign them to the VOIP Group Policy
 */
function updatePolycomDevicesInMeraki() {
  var snipePolycomId = getSnipeManufacturerId("Polycom")
  var snipePolycomDevices = getSnipeManufacturerAssets(snipePolycomId)
  Logger.log('Total Snipe Polycom Devices: %s', snipePolycomDevices.total)

  let devicesToUpdate = [];

  // Filter to only look at assets that have MACs assigned
  snipePolycomDevices = snipePolycomDevices.rows.filter(device => {
    return device.custom_fields["MAC Address"] && device.custom_fields["MAC Address"].value;
  });

  Logger.log('Total Snipe Polycom Devices with MACs: %s', snipePolycomDevices.length);

  snipePolycomDevices.forEach(device => {
    devicesToUpdate.push({
      "name": device.name,
      "mac": device.custom_fields["MAC Address"].value
    })
  })

  Logger.log('Number of Snipe Devices to send to Meraki: %s', devicesToUpdate.length);

  devicesToUpdate.forEach(device => {
    Logger.log('Name: %s', device.name);
  })

  let response = postProvisionMerakiDevices(devicesToUpdate, "Group policy", merakiVoipGp);
  if (response.getResponseCode() == 201) {
    Logger.log('Updated devices in Meraki');
  } else {
    Logger.log('Could not update devices in Meraki!');
  }
}