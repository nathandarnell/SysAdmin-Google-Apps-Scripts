/**
 * GETs a ping to the Healthchecks server to show a function is running.
 * @param {string} uuid - The UUID of the Healthcheck to ping.
 * @returns {number} The response code from the Healthchecks server.
 */
function getHealthchecksStart(uuid) {
    uuid = uuid || '';
    const url = healthchecksUrl + '/' + uuid + '/start';

    const options = {
        "method": "GET",
        "contentType": "application/json",
        'muteHttpExceptions': true,
        'validateHttpsCertificates': false,
    };

    try {
        var response = UrlFetchApp.fetch(url, options);
    } catch (err) {
        Logger.log('Healthchecks errored with: %s', err);
    }

    let results = response.results

    Logger.log(response.getResponseCode());

}

/**
 * GETs a ping to the Healthchecks server to show a function has run.
 * @param {string} uuid - The UUID of the Healthcheck to ping.
 * @returns {number} The response code from the Healthchecks server.
 */
function getHealthchecks(uuid) {
    uuid = uuid || '';
    const url = healthchecksUrl + '/' + uuid;

    const options = {
        "method": "GET",
        "contentType": "application/json",
        'muteHttpExceptions': true,
        'validateHttpsCertificates': false,
    };

    try {
        var response = UrlFetchApp.fetch(url, options);
    } catch (err) {
        Logger.log('Healthchecks errored with: %s', err);
    }

    let results = response.results

    Logger.log(response.getResponseCode());

}