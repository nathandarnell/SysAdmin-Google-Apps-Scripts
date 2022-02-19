/**
 * First finds all the machines in the "businessUnitId" from Sal.
 * Then for each machine pulls the information on it from Snipe.
 * Filters the machines for any "Assigned to Person"
 * and sends an email to the person it is assigned to in Snipe
 */
function sendEmailToMacBookOwners() {
    const businessUnit = "St. Isidore School";
    const machineGroup = "Staff MacBooks/iMacs";
    const statusLabel = "Assigned to Person";
    const emailTemplate = 'Hi ${"name"},<BR><BR>Your computer has an update for macOS Monterey and several people have reached out to me about doing this upgrade.  Because this is a major update I will need to push it to your machine.  As there are some bugs still being worked out, I will not be pushing this upgrade out until they have been fixed and that could take several weeks.  I will send you the upgrade instructions when they are ready!<BR><BR>Sincerely,<BR>Nathan Darnell';
    let emailSubject = 'macOS Monterey Upgrade';
    const businessUnitId = getBusinessUnitId(businessUnit);
    const machineGroupId = getMachineGroupId(businessUnitId, machineGroup);
    const machines = getMachines(machineGroupId);
    let matchingDevices = [];

    let personalDevicesCount = 0;
    machines.forEach(machine => {
        try {
            let response = getSnipeDeviceBySerial(machine.serial);
            Logger.log("Serial number is: %s", machine.serial);
            if (response !== undefined) {
                if (response.status_label !== undefined) {
                    if (response.status_label.name !== undefined) {
                        Logger.log("Status Label is: %s", response.status_label.name);
                        if (response.status_label.name === statusLabel) {
                            personalDevicesCount++;
                            Logger.log(personalDevicesCount);
                            matchingDevices.push(response);
                            Logger.log('Send email to user: %s with email: %s', response.assigned_to.name, response.assigned_to.username);
                        }
                    } else {
                        Logger.log("Undefined response.status_label.name for %s", machine.serial);
                    }
                } else {
                    Logger.log("Undefined response.status_label for %s", machine.serial);
                }
            } else {
                Logger.log("Undefined response for %s", machine.serial);
            }
        } catch (e) {
            Logger.log("Error %s with %s", e, machine.serial);
        }
    });

    Logger.log("Found %s devices with users to send emails to", personalDevicesCount);

    matchingDevices.forEach(device => {
        let data = {
            "name": device.assigned_to.name,
        }

        let emailText = fillInTemplateFromObject(emailTemplate, data);

        try {
            MailApp.sendEmail(device.assigned_to.username, emailSubject, "", {
                htmlBody: emailText,
                name: 'Nathan Darnell'
            });

        } catch (err) {
            Logger.log("Couldn't send the email");
        }
    });

}