/**
 * First finds Finds all the machines in the "businessUnitId" from Sal
 * Then pulls all the plugin script rows for "UptimeDays"
 * Filters the machines for any with "UptimeDays" data over 30
 * and sends an email to the person it is assigned to in Snipe
 */
function sendEmailIfOver30DaysUptime() {
    getHealthchecksStart('929046bb-0b46-4fad-b1cd-5baa8aab7a83');
    const emailTemplate = 'Hi ${"name"},<BR><BR>My apologies for the intrusion.  I know that you are busy, but your computer ${"devicename"} has been on for ${"days"} days and it needs to be rebooted.<BR><BR>Rebooting can help prevent performance issues, correct software glitches, and help you tame your browser tabs!  Please reboot at the earliest opportunity!<BR><BR>Sincerely,<BR>Nathan Darnell';
    let emailSubject = 'Reboot Your Mac Please!';
    const businessUnitId = getBusinessUnitId("St. Isidore School");
    const machineGroupId = getMachineGroupId(businessUnitId);
    const machines = getMachines(machineGroupId);
    let pluginscriptRows = getPluginScriptRows("UptimeDays");
    let matchingDevices = [];

    machines.forEach(machine => {
        pluginscriptRows.forEach(row => {
            if (machine.id == row.submission.machine) {
                machine.pluginscript_data = row.pluginscript_data;
                matchingDevices.push(machine);
                // Logger.log('Found a match: machine %s', machine.hostname);

                // Removes the matching device from the array in case we have missing devices in Snipe
                // pluginscriptRows.splice(pluginscriptRows.indexOf(row), 1);
            }
        });
    });
    Logger.log('Total matching machines found was: %s', matchingDevices.length);

    let devicesOverLimit = matchingDevices.filter(device => device.pluginscript_data > 30);

    devicesOverLimit.forEach(device => {
        Logger.log('This device: %s has been on for %s days', device.hostname, Math.trunc(device.pluginscript_data));

        let response = getSnipeDeviceBySerial(device.serial);

        // Check for an assigned user and username
        if (response.assigned_to) {
            if (response.assigned_to.username) {

                Logger.log('Send email to user: %s with email: %s', response.assigned_to.name, response.assigned_to.username);

                let data = {
                    "name": response.assigned_to.name,
                    "days": Math.trunc(device.pluginscript_data),
                    "devicename": response.name
                }

                let emailText = fillInTemplateFromObject(emailTemplate, data);

                try {
                    MailApp.sendEmail(response.assigned_to.username, emailSubject, "", {
                        htmlBody: emailText,
                        name: 'Nathan Darnell'
                    });

                } catch (err) {
                    Logger.log("Couldn't send the email");
                }
            }
        }
    });
    getHealthchecks('929046bb-0b46-4fad-b1cd-5baa8aab7a83');
}


/**
 * Replaces markers in a template string with values define in a JavaScript data object.
 * @param {string} template - Contains markers, for instance ${"Column name"}
 * @param {Object} data - values to that will replace markers.
 *   For instance data.columnName will replace marker ${"Column name"}
 * @return {string} - A string without markers. If no data is found to replace a marker,
 *   it is simply removed.
 */
function fillInTemplateFromObject(template, data) {
    var email = template;
    // Search for all the variables to be replaced, for instance ${"Column name"}
    var templateVars = template.match(/\$\{\"[^\"]+\"\}/g);

    // Replace variables from the template with the actual values from the data object.
    // If no value is available, replace with the empty string.
    for (var i = 0; templateVars && i < templateVars.length; ++i) {
        // normalizeHeader ignores ${"} so we can call it directly here.
        var variableData = data[normalizeHeader(templateVars[i])];
        email = email.replace(templateVars[i], variableData || '');
    }

    return email;
}


/**
 * Normalizes a string, by removing all alphanumeric characters and using mixed case
 * to separate words. The output will always start with a lower case letter.
 * This function is designed to produce JavaScript object property names.
 * @param {string} header - The header to normalize.
 * @return {string} - The normalized header.
 * @example "First Name" -> "firstName"
 * @example "Market Cap (millions) -> "marketCapMillions
 * @example "1 number at the beginning is ignored" -> "numberAtTheBeginningIsIgnored"
 */
function normalizeHeader(header) {
    var key = '';
    var upperCase = false;
    for (var i = 0; i < header.length; ++i) {
        var letter = header[i];
        if (letter == ' ' && key.length > 0) {
            upperCase = true;
            continue;
        }
        if (!isAlnum(letter)) {
            continue;
        }
        if (key.length == 0 && isDigit(letter)) {
            continue; // first character must be a letter
        }
        if (upperCase) {
            upperCase = false;
            key += letter.toUpperCase();
        } else {
            key += letter.toLowerCase();
        }
    }
    return key;
}


/**
 * Returns true if the character char is alphabetical, false otherwise.
 * @param {string} char - The character.
 * @return {boolean} - True if the char is a number.
 */
function isAlnum(char) {
    return char >= 'A' && char <= 'Z' ||
        char >= 'a' && char <= 'z' ||
        isDigit(char);
}


/**
 * Returns true if the character char is a digit, false otherwise.
 * @param {string} char - The character.
 * @return {boolean} - True if the char is a digit.
 */
function isDigit(char) {
    return char >= '0' && char <= '9';
}