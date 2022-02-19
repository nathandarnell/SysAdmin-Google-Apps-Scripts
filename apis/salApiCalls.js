/**
 * GETs the business unit ID based on the business unit name.
 * @param {string} businessUnit - Business Unit's name.
 * @returns {number} The ID number of the Business Unit.
 */
function getBusinessUnitId(businessUnit) {
    const url = salUrl + '/business_units'
    const headers = {
        "publickey": salPublicKey,
        "privatekey": SalPrivateKey
    };

    const options = {
        "method": "GET",
        "contentType": "application/json",
        'muteHttpExceptions': true,
        "headers": headers,
    };

    //run once to get the total to use for the limit
    try {
        var response = JSON.parse(UrlFetchApp.fetch(url, options));
    } catch (err) {
        Logger.log('Sal errored with: %s', err);
    }

    let results = response.results

    results.forEach(result => {
        if (result.name == businessUnit) {
            let id = result.id;
            Logger.log('Found the Business Unit: %s in Sal with the ID of %s', result.name, id);
            return id;
        }
    })
}


/**
 * GETs the machine group ID based on the business unit name and machine group name.
 * @param {number} businessUnit - Business Unit's ID.
 * @param {string} machineGroup = Machine Group's name.
 * @returns {number} - The ID number of the Machine Group.
 */
function getMachineGroupId(businessUnit, machineGroup) {
    const url = salUrl + '/machine_groups'
    const headers = {
        "publickey": salPublicKey,
        "privatekey": SalPrivateKey
    };
    const data = {
        "business_unit__id": businessUnit
    }

    const options = {
        "method": "GET",
        "contentType": "application/json",
        'muteHttpExceptions': true,
        "headers": headers,
        "payload": data,
    };

    //run once to get the total to use for the limit
    try {
        var response = JSON.parse(UrlFetchApp.fetch(url, options));
    } catch (err) {
        Logger.log('Sal errored with: %s', err);
    }

    let results = response.results

    results.forEach(result => {
        if (result.business_unit == businessUnit && result.name == machineGroup) {
            let id = result.id;
            Logger.log('Found the Machine Group: %s in Sal with the ID of %s', result.name, id);
            return id;
        }
    })
}


/**
 * GETs the machines in the machine group based on the ID passed.
 * @param {number} machineGroupId - Machine Group's ID.
 * @returns {Object[]} - Array of machines in the Machine Group.
 */
function getMachines(machineGroupId) {
    machineGroupId = machineGroupId || 5;

    let page = 1;
    let allResults = [];
    let lastResults = [];
    const url = salUrl + '/machines/?page=';
    const headers = {
        "publickey": salPublicKey,
        "privatekey": SalPrivateKey
    };

    const options = {
        "method": "GET",
        "contentType": "application/json",
        'muteHttpExceptions': true,
        "headers": headers
    };

    do {
        try {
            var response = JSON.parse(UrlFetchApp.fetch(url + page, options));
        } catch (err) {
            Logger.log('Sal errored with: %s', err);
        }
        lastResults = response;
        lastResults.results.forEach(result => {
            allResults.push(result);
        })
        page++;
    } while (lastResults.next !== null);

    let results = allResults;
    let machineGroupMachines = [];

    results.forEach(result => {
        if (result.machine_group == machineGroupId) {
            let id = result.id;
            machineGroupMachines.push(result);
            // Logger.log('Found the Machine Group: %s in Sal with the hostname of %s', machineGroupId, result.hostname);
        }
    });
    Logger.log('Found a total of %s machines in Machine Group: %s', machineGroupMachines.length, machineGroupId)
    return machineGroupMachines;
}


/**
 * GETs the database rows for whatever plugin script name is passed.
 * @param {string} pluginScriptName - The plugin script's name.
 * @returns {Object[]} - Array of plugin script rows.
 */
function getPluginScriptRows(pluginScriptName) {
    pluginScriptName = pluginScriptName || "UptimeDays";

    let page = 1;
    let allResults = [];
    let lastResults = [];
    const url = salUrl + '/plugin_script_rows/?pluginscript_name=' + pluginScriptName + '&page=';
    const headers = {
        "publickey": salPublicKey,
        "privatekey": SalPrivateKey
    };

    const options = {
        "method": "GET",
        "contentType": "application/json",
        'muteHttpExceptions': true,
        "headers": headers
    };

    do {
        try {
            var response = JSON.parse(UrlFetchApp.fetch(url + page, options));
        } catch (err) {
            Logger.log('Sal errored with: %s', err);
        }
        lastResults = response;
        lastResults.results.forEach(result => {
            allResults.push(result);
        })
        page++;
    } while (lastResults.next !== null);

    let results = allResults;
    Logger.log('Found a total of %s plugin script rows in plugin script: %s', results.length, pluginScriptName)
    return results;
}