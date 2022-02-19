/**
 * First finds out the Snipe Chromebook manufacturer ID then passes that
 * to find all the Chromebook devices in Snipe.  Then it grabs all the Chromebooks
 * in Google and searches for matches.  For each match, it takes the mac from Google,
 * formats it, and updates it in Snipe
 */
function updateSnipeChromebookDeviceMacs() {
    const snipeChromebookId = getSnipeCategoryId("Chromebook");
    const snipeChromebooks = getSnipeCategoryAssets(snipeChromebookId);
    const googleDevices = getGoogleDevices();

    Logger.log('Snipe total devices: %s', snipeChromebooks.total);

    const updatedDevices = [];

    let matchingDevices = 0;
    let needToUpdateDevices = 0;
    let noNeedToUpdateDevices = 0;
    let devicesUpdated = 0;
    const rows = snipeChromebooks.rows;

    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];

        for (let i = 0; i < googleDevices.length; i++) {
            let googleDevice = googleDevices[i];
            if (row.serial == googleDevice.serialNumber) {
                matchingDevices += 1;
                Logger.log('Found: %s %s %s in Google', row.serial, row.name, row.asset_tag);
                // if (row.serial == "C02CT1GEML86") {
                //     Logger.log(row);
                //     Logger.log(googleDevice);
                // }

                // Check for MAC address differences
                let googleMac = formatMac(googleDevice.macAddress);
                if (row.custom_fields["MAC Address"].value != googleMac) {
                    Logger.log('MAC address (%s %s) is different', row.custom_fields["MAC Address"].value, googleMac);
                    needToUpdateDevices += 1;
                    Logger.log("Trying to update in Snipe");
                    let snipeResponse = updateSnipeMac(row.id, googleMac);
                    Logger.log('Snipe responded with %s', snipeResponse);
                    updatedDevices.push(row.name);
                } else {
                    Logger.log('MAC address (%s %s) is the same', row.custom_fields["MAC Address"].value, googleMac);
                    noNeedToUpdateDevices += 1;
                }
            }
        }
    }


    Logger.log('Updated devices are: %s', devicesUpdated);
    Logger.log('Updapted: %s', updatedDevices);
    Logger.log('Devices that need updating: %s', needToUpdateDevices);
    Logger.log('Devices that do not need updating: %s', noNeedToUpdateDevices);
    Logger.log('Total matching devices found were: %s', matchingDevices);

}


/**
 * Take the lowercase MAC that Google sends and make it uppercase with colons
 * From: https://stackoverflow.com/questions/48424006/change-input-field-on-keyup-to-match-mac-address-format
 * @param {string} mac
 * @returns {string} Formatted mac address that is uppercase and colon-seperated
 */
function formatMac(mac) {
    // mac = mac || "988d4690d139";
    let formattedMac = (mac.toUpperCase()
            .replace(/[^\d|A-Z]/g, '')
            .match(/.{1,2}/g) || [])
        .join(":");

    // Logger.log(formattedMac);
    return formattedMac;
}