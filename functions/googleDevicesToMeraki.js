/**
 * Finds all the Chromebooks in Google then passes only the ones in the /Staff OU
 * to Meraki with the Staff GP
 */
function updateMerakiChromebookStaffDevices() {
    const googleDevices = getGoogleDevices();

    Logger.log('Google total devices: %s', googleDevices.length);

    let staffDevices = [];
    let matchingDevices = 0;

    // for (let i = 0; i < googleDevices.length; i++) {
    //     let googleDevice = googleDevices[i];
    googleDevices.forEach(googleDevice => {
        if (googleDevice.orgUnitPath.includes(googleStaffOu)) {
            staffDevices.push({
                "name": googleDevice.annotatedAssetId,
                "mac": googleDevice.macAddress
            });
            Logger.log('Found: %s %s %s in Google', googleDevice.serialNumber, googleDevice.annotatedAssetId, googleDevice.lastSync);
            matchingDevices += 1;
        }
    });
    // }

    let response = postProvisionMerakiDevices(staffDevices, "Group policy", merakiStaffGp);
    if (response.getResponseCode() == 201) {
        Logger.log('Updated Staff Google devices in Meraki');
    } else {
        Logger.log('Could not update Staff Google devices in Meraki!');
    }

    Logger.log('Total devices in %s OU is: %s', googleStaffOu, staffDevices.length);
    Logger.log('Total matching devices found were: %s', matchingDevices);
}


/**
 * Finds all the Chromebooks in Google then passes only the ones in the /Student OU
 * and in the Snipe location passed to Meraki with the Student GP
 * Only updates the devices assigned to the location passed in Snipe
 * @param {string} location
 */
function updateMerakiChromebookStudentDevicesBySnipeLocation(location) {
    location = location || "Room 801";
    const googleDevices = getGoogleDevices();
    const snipeLocationId = getSnipeLocationId(location);
    const snipeAssets = getSnipeLocationAssets(snipeLocationId);

    Logger.log('Google total devices: %s', googleDevices.length);

    let updatedDevices = [];
    let studentDevices = [];

    let matchingDevices = 0;
    let needToUpdateDevices = 0;
    let noNeedToUpdateDevices = 0;
    let devicesUpdated = 0;
    let rows = snipeAssets.rows;
    for (let i = 0; i < snipeAssets.total; i++) {
        let row = rows[i];

        for (let i = 0; i < googleDevices.length; i++) {
            let googleDevice = googleDevices[i];
            // if (googleDevice.orgUnitPath == googleStudentOu) {
            if (googleDevice.orgUnitPath == googleStudentOu && row.serial == googleDevice.serialNumber) {
                // matchingDevices += 1;

                studentDevices.push({
                    "name": googleDevice.annotatedAssetId,
                    "mac": googleDevice.macAddress
                });
                Logger.log('Found: %s %s %s in Google', googleDevice.serialNumber, googleDevice.annotatedAssetId, googleDevice.lastSync);
            }
        }
    }

    let response = postProvisionMerakiDevices(studentDevices, "Group policy", merakiStudentGp);
    if (response.getResponseCode() == 201) {
        Logger.log('Updated device in Meraki');
        devicesUpdated += 1;
    } else {
        Logger.log('Could not update device in Meraki!');
    }

    Logger.log('Total devices in %s OU is: %s', googleStudentOu, studentDevices.length);
    Logger.log('Updated devices are: %s', devicesUpdated);
    Logger.log('Updapted: %s', updatedDevices);
    Logger.log('Devices that need updating: %s', needToUpdateDevices);
    Logger.log('Devices that do not need updating: %s', noNeedToUpdateDevices);
    Logger.log('Total matching devices found were: %s', matchingDevices);

}


/**
 * Finds all the Chromebooks in Google then passes only the ones in the /Student OU
 * to Meraki with the Student GP
 */
function updateMerakiChromebookStudentDevices() {
    const googleDevices = getGoogleDevices();

    Logger.log('Google total devices: %s', googleDevices.length);

    let studentDevices = [];
    let matchingDevices = 0;

    // for (let i = 0; i < googleDevices.length; i++) {
    //     let googleDevice = googleDevices[i];
    googleDevices.forEach(googleDevice => {
        if (googleDevice.orgUnitPath == googleStudentOu) {
            studentDevices.push({
                "name": googleDevice.annotatedAssetId,
                "mac": googleDevice.macAddress
            });
            Logger.log('Found: %s %s %s in Google', googleDevice.serialNumber, googleDevice.annotatedAssetId, googleDevice.lastSync);
            matchingDevices += 1;
        }
    });
    // }

    let response = postProvisionMerakiDevices(studentDevices, "Group policy", merakiStudentGp);
    if (response.getResponseCode() == 201) {
        Logger.log('Updated device in Meraki');
    } else {
        Logger.log('Could not update device in Meraki!');
    }

    Logger.log('Total devices in %s OU is: %s', googleStudentOu, studentDevices.length);
    Logger.log('Total matching devices found were: %s', matchingDevices);
}