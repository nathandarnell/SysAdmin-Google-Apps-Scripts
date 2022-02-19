/**
 * Sends an SMS to the number sent from a number in this account.
 * @param {string} smsTo - The number to send the SMS to.
 * @param {string} smsFrom - The number to send the SMS from
 * @param {string} smsBody - The body of the text message.
 * TODO - clean up the responses since this code is from the Umbrella API code.
 */
function postFlowrouteSms(smsTo, smsFrom, smsBody) {
    smsTo = smsTo || '';
    smsFrom = smsFrom || '';
    smsBody = smsBody || 'body';

    var encodedKeyPair = Utilities.base64Encode(flowrouteAccessKey + ':' + flowrouteSecretKey);

    var url = flowrouteUrl + '/messages';

    var headers = {
        'Authorization': 'Basic ' + encodedKeyPair,
        'Content-Type': 'application/vnd.api+json'
    };

    var data = {
        'to': smsTo,
        'from': smsFrom,
        'body': smsBody
    };

    var options = {
        'method': 'POST',
        'muteHttpExceptions': true,
        'headers': headers,
        'payload': JSON.stringify(data)
    };

    /*
    Go through each response to see if the device name matches the current device
    Return the originId
    */
    var response = UrlFetchApp.fetch(url, options);
    var responseJson = JSON.parse(response);

    if (response.getResponseCode() == 202) {
        Logger.log('Success!  Response code is: %s', response.getResponseCode());
        // Iterate and find the device name and return the originId if found
        for (let i = 0; i < responseJson.length; i++) {
            let device = responseJson[i];
            if (device.name === name) {
                Logger.log('Found it!');
                Logger.log(device.originId);
                let cleanedOriginId = device.originId.toFixed(); //.replace(".","");
                Logger.log(cleanedOriginId);
                return cleanedOriginId;
                // Logger.log(policy);
            }
        };
        // Response was 200 but the device wasn't found so return null
        Logger.log('Device not found')
        return null;
    } else {
        Logger.log('Failure!  Response code is: %s', response.getResponseCode());
        Logger.log('Failure!  Response text is: %s', response.getContentText());
        // Return null so the script knows not to run
        return null;
    }
}