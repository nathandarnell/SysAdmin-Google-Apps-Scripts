// https://wiki.freepbx.org/display/FPG/Firewall+Module+GraphQL+APIs#FirewallModuleGraphQLAPIs-FetchAllWhiteListedIPs
// https://wiki.freepbx.org/display/FDT/FreePBX+GraphQL+Provisioning+Tutorial


function test(query) {
    var url = "https://gql.waveapps.com/graphql/public";
    var options = {
        "headers": {
            "Authorization": "Bearer " + getAccessToken(),
            "Content-Type": "application/json"
        },
        "payload": JSON.stringify({
            query
        }),
        "method": "POST"
    }
    var response = UrlFetchApp.fetch(url, options);
    Logger.log(response);
    return;
}
//   where the query that was passed into the function was formatted as follows:

var query = "query { user { id defaultEmail } }";