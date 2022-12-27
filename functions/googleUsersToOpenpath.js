/**
 * Set to run hourly and trigger all the below update functions in turn.
 * Pings the Healthchecks server to track runs.
 */
function hourlyOpenpathFunctionCalls() {
  getHealthchecksStart('');

  createNewGoogleUsersInOpenpath();
  Utilities.sleep(30000);

  reactivateGoogleUsersInOpenpath();
  Utilities.sleep(30000);

  removeFormerStaffFromOpenpath();
  Utilities.sleep(30000);

  updateMobileCredentialsInOpenpath();
  Utilities.sleep(30000);

  deactivateCredentialsFromSnipeToOpenpath();
  Utilities.sleep(30000);

  getCredentialsFromSnipeToOpenpath();
  Utilities.sleep(30000);

  updateGoogleUsersGroupsInOpenpath();
  Utilities.sleep(30000);

  getHealthchecks('');
}



/**
 * Get any access control credentials from Snipe that are not checked out and remove them from Openpath users.
 * Filters credentials from Openpath by { 'filter': 'credentialType.id:(2)' } that returns "Card: Weigand ID" only.
 * ID: 2: Card: Weigand ID, card.fields: id: , number: , card.cardFormat: id: 5147, code: raw64, numBits: 64
 * ID: 2: Card: Weigand ID, card.fields: facilityCode: 111, cardId: 12345, card.cardFormat: id: 5150, code: prox26std, numBits: 26
 */
function deactivateCredentialsFromSnipeToOpenpath() {
  const snipeAccessControlCategoryId = getSnipeCategoryId('Access Control'); // Get the ID
  const snipeAccessControlAssetRows = getSnipeCategoryAssets(snipeAccessControlCategoryId); // Get the assets
  const snipeAccessControlAssets = snipeAccessControlAssetRows.rows; // Only grab the rows

  // Filter out the assets that are not checked out
  const filteredSnipeAccessControlAssets = snipeAccessControlAssets.filter(item => item.assigned_to === null);

  // Get every card credential in Openpath.  Notably skips mobile credentials.
  const allOpenpathCardCredentialsData = getOpenpathListOrgCredentials({ 'filter': 'credentialType.id:(2)' });
  const allOpenpathCardCredentials = allOpenpathCardCredentialsData.data;

  // If the credential is 64-bit raw move the card.number field to card.cardId to mathc the other cards in the system
  for (let i = 0; i < allOpenpathCardCredentials.length; i++) {
    let openpathCredential = allOpenpathCardCredentials[i];
    if (openpathCredential.card.numBits === 64 && openpathCredential.card.cardId === null) {
      openpathCredential.card.cardId = openpathCredential.card.number;
      // Logger.log(`Added ${openpathCredential.card.number} to the Openpath card.`);
    }
  }

  Logger.log(`There are ${filteredSnipeAccessControlAssets.length} unassigned credentials in Snipe and ${allOpenpathCardCredentials.length} assigned card credentials in Openpath to check.`);


  const snipeCredentialsToRemove = [];
  const snipeCredentialsThatWereRemoved = [];

  for (let i = 0; i < allOpenpathCardCredentials.length; i++) {
    let openpathCredential = allOpenpathCardCredentials[i];
    for (let j = 0; j < filteredSnipeAccessControlAssets.length; j++) {
      let snipeAsset = filteredSnipeAccessControlAssets[j];
      if (openpathCredential.card.cardId === snipeAsset.serial) {
        Logger.log(`Found a credential in Openpath assigned to : ${openpathCredential.user.identity.email} with the serial: ${snipeAsset.serial} named: ${snipeAsset.name}, and with the asset tag: ${snipeAsset.asset_tag} that is not checked out in Snipe.`);
        // Found a match so remove the credential
        Logger.log(`Found a credential in Openpath assigned to : ${openpathCredential.user.id} with the ID: ${openpathCredential.id} and card ID: ${openpathCredential.card.id}`);
        snipeCredentialsToRemove.push(snipeAsset) // Push the credentials to be made to a new array
        let removeCredentialResponse = deleteOpenpathDeleteCredential(openpathCredential.user.id, openpathCredential.id);

        if (removeCredentialResponse === 204) { // API function returns 204 on success
          snipeCredentialsThatWereRemoved.push(snipeAsset) // Push the credentials that were made to a new array
        } else {
          Logger.log(response);
        }
      }
    }
  }

  if (snipeCredentialsToRemove.length > 0) {
    Logger.log(`Had ${snipeCredentialsToRemove.length} credential(s) in Snipe that were not checked out but were assigned in Openpath to remove.`);
    Logger.log(`Removed ${snipeCredentialsThatWereRemoved.length} credential(s) from the users in Openpath.`);
  } else {
    Logger.log(`Did not find any credentials in Snipe that needed to be removed in Openpath.`);
  }

}




/**
 * Get any access control credentials from Snipe and add them to Openpath users.
 * This will create a credential regardless of their Google Openpath group status.
 * Checks if any credentials assigned in Snipe are assigned to the incorrect user in Openpath and removes them.
 * After that will continue with making new credentials.
 * Filters credentials from Openpath by { 'filter': 'credentialType.id:(2)' } that returns "Card: Weigand ID" only.
 * ID: 2: Card: Weigand ID, card.fields: id: , number: , card.cardFormat: id: 5147, code: raw64, numBits: 64
 * ID: 2: Card: Weigand ID, card.fields: facilityCode: 111, cardId: 12345, card.cardFormat: id: 5150, code: prox26std, numBits: 26
 */
function getCredentialsFromSnipeToOpenpath() {
  const snipeAccessControlCategoryId = getSnipeCategoryId('Access Control'); // Get the ID
  const snipeAccessControlAssetRows = getSnipeCategoryAssets(snipeAccessControlCategoryId); // Get the assets
  const snipeAccessControlAssets = snipeAccessControlAssetRows.rows; // Only grab the rows
  // Filter out the assets that are not checked out
  const filteredSnipeAccessControlAssets = snipeAccessControlAssets.filter(item => item.assigned_to !== null);

  let allOpenpathUsersWithData = getOpenpathListUsers(); // Get all the Openpath users
  let allOpenpathUsers = allOpenpathUsersWithData.data;

  let allOpenpathCardCredentialsData = getOpenpathListOrgCredentials({ 'filter': 'credentialType.id:(2)' }); // Get every card credential in Openpath.  Notably skips mobile credentials.
  let allOpenpathCardCredentials = allOpenpathCardCredentialsData.data;

  // If the credential is 64-bit raw move the card.number field to card.cardId to mathc the other cards in the system
  for (let i = 0; i < allOpenpathCardCredentials.length; i++) {
    let openpathCredential = allOpenpathCardCredentials[i];
    if (openpathCredential.card.numBits === 64 && openpathCredential.card.cardId === null) {
      openpathCredential.card.cardId = openpathCredential.card.number;
      // Logger.log(`Added ${openpathCredential.card.number} to the Openpath card.`);
    }
  }

  Logger.log(`There are ${filteredSnipeAccessControlAssets.length} credentials in Snipe.`);



  /**
   * Looks at current credentials that are checked out to make sure they are assigned to the correct person in Openpath.
   * Removes them from the person in this step and assigns them again in the next.
   */
  const snipeCredentialsToRemove = [];
  const snipeCredentialsThatWereRemoved = [];

  for (let i = 0; i < allOpenpathCardCredentials.length; i++) {
    let openpathCredential = allOpenpathCardCredentials[i];
    for (let j = 0; j < filteredSnipeAccessControlAssets.length; j++) {
      let snipeAsset = filteredSnipeAccessControlAssets[j];
      if (openpathCredential.card.cardId === snipeAsset.serial) {
        if (openpathCredential.user.identity.email !== snipeAsset.assigned_to.username) {
          Logger.log(`Found a credential in Openpath assigned to: ${openpathCredential.user.identity.email} with the serial: ${openpathCredential.card.cardId} but it is assigned in Snipe to ${snipeAsset.assigned_to.username} so it will be unassigned in Openpath.`);
          // Found a match so remove the credential
          snipeCredentialsToRemove.push(snipeAsset) // Push the credentials to be made to a new array
          let removeCredentialResponse = deleteOpenpathDeleteCredential(openpathCredential.user.id, openpathCredential.id);

          if (removeCredentialResponse === 204) { // API function returns 204 on success
            snipeCredentialsThatWereRemoved.push(snipeAsset) // Push the credentials that were made to a new array
          } else {
            Logger.log(response);
          }
        }
      }
    }
  }

  if (snipeCredentialsToRemove.length > 0) {
    Logger.log(`Had ${snipeCredentialsToRemove.length} credential(s) in Snipe that were assigned in Openpath to the wrong user to remove.`);
    Logger.log(`Removed ${snipeCredentialsThatWereRemoved.length} credential(s) from the users in Openpath`);
  } else {
    Logger.log(`Did not find any mismatched credentials in Snipe that needed to be removed in Openpath`);
  }



  /**
   * Looks at Snipe credentials that are checked out and assigns them to the correct person in Openpath.
   * Filters out the current Openpath credentials at this step
   */
  if (snipeCredentialsToRemove.length > 0) {
    Logger.log(`Had to remove credentials in the last step so get the new list of credentials from Openpath.`)
    // Gets the current list of credentials now that we've removed some in the last step
    // Using the same calls and renewing the data after the last section
    allOpenpathUsersWithData = getOpenpathListUsers(); // Get all the Openpath users
    allOpenpathUsers = allOpenpathUsersWithData.data;
  } else {
    Logger.log(`Did not make any changes to credentials so no need to get the new list of credentials from Openpath again.`)
  }

  const snipeCredentialsToMake = [];
  const snipeCredentialsThatWereMade = [];

  for (let i = 0; i < allOpenpathUsers.length; i++) {
    let openpathUser = allOpenpathUsers[i];

    for (let j = 0; j < filteredSnipeAccessControlAssets.length; j++) {
      let snipeAsset = filteredSnipeAccessControlAssets[j];
      if (openpathUser.identity.email === snipeAsset.assigned_to.username) {
        // Logger.log(`Found a credential in Snipe assigned to: ${openpathUser.identity.email} with the serial: ${snipeAsset.serial}`);
        // Add the Openpath User ID for the later call to create this credential
        snipeAsset.openpathUserId = openpathUser.id;
        snipeCredentialsToMake.push(snipeAsset) // Push the credentials to be made to a new array
      }
    }
  }



  allOpenpathCardCredentialsData = getOpenpathListOrgCredentials({ 'filter': 'credentialType.id:(2)' }); // Get every card credential in Openpath.  Notably skips mobile credentials.
  allOpenpathCardCredentials = allOpenpathCardCredentialsData.data;

  // If the credential is 64-bit raw move the card.number field to card.cardId to mathc the other cards in the system
  for (let i = 0; i < allOpenpathCardCredentials.length; i++) {
    let openpathCredential = allOpenpathCardCredentials[i];
    if (openpathCredential.card.numBits === 64 && openpathCredential.card.cardId === null) {
      openpathCredential.card.cardId = openpathCredential.card.number;
      // Logger.log(`Added ${openpathCredential.card.number} to the Openpath card.`);
    }
  }

  for (let i = 0; i < snipeCredentialsToMake.length; i++) {
    let snipeAsset = snipeCredentialsToMake[i];
    let createCredential = true;
    // Logger.log(`Snipe: Cred: ${snipeAsset.serial} User: ${snipeAsset.assigned_to.username}`);
    for (let j = 0; j < allOpenpathCardCredentials.length; j++) {
      let openpathCredential = allOpenpathCardCredentials[j];
      // Logger.log(`Openpath: Cred: ${openpathCredential.card.cardId} User: ${openpathCredential.user.identity.email}`);

      // Logger.log(`Cred: ${snipeAsset.serial} - ${openpathCredential.card.cardId} User: ${snipeAsset.assigned_to.username} - ${openpathCredential.user.identity.email}`);
      // Check if the credential in Openpath is already assigned to this user
      if (snipeAsset.assigned_to.username === openpathCredential.user.identity.email &&
        snipeAsset.serial === openpathCredential.card.cardId) {
        // Logger.log(`Credential: ${snipeAsset.serial} in Snipe is already assigned to: ${openpathCredential.user.identity.email} in Openpath.`);
        createCredential = false;
      }

    }
    if (createCredential) {
      if (['Card Format ID'] in snipeAsset.custom_fields &&
        typeof snipeAsset.custom_fields['Card Format ID'] === 'object') {
        // Logger.log(`Has Card Format ID`);

        if (['64-bit Raw'] in snipeAsset.custom_fields &&
          typeof snipeAsset.custom_fields['64-bit Raw'] === 'object') {
          // Logger.log(`Has 64-bit Raw`);
          let bodyParams = {
            credentialTypeId: 2,
            card: {
              number: snipeAsset.custom_fields['64-bit Raw'].value,
              cardFormatId: parseInt(snipeAsset.custom_fields['Card Format ID'].value),
            }
          }

          // snipeCredentialsToMake.push(snipeAsset) // Push the credentials to be made to a new array
          let newCredentialResponse = postOpenpathCreateCredential(snipeAsset.openpathUserId, bodyParams);
          if (newCredentialResponse !== null) { // API function returns null if there is an issue
            snipeCredentialsThatWereMade.push(snipeAsset) // Push the credentials that were made to a new array
          }
        } else if (['Facility Code'] in snipeAsset.custom_fields &&
          typeof snipeAsset.custom_fields['Facility Code'] === 'object') {
          // Logger.log(`Has Facility Code`);
          let bodyParams = {
            credentialTypeId: 2,
            card: {
              fields: {
                facilityCode: snipeAsset.custom_fields['Facility Code'].value,
                cardId: snipeAsset.serial,
              },
              cardFormatId: parseInt(snipeAsset.custom_fields['Card Format ID'].value),
            }
          }

          // snipeCredentialsToMake.push(snipeAsset) // Push the credentials to be made to a new array
          let newCredentialResponse = postOpenpathCreateCredential(snipeAsset.openpathUserId, bodyParams);
          if (newCredentialResponse !== null) { // API function returns null if there is an issue
            snipeCredentialsThatWereMade.push(snipeAsset) // Push the credentials that were made to a new array
          }
        } else {
          Logger.log(`Not 64-bit Raw and has no Facility Code.  Can't create this credential in Openpath!`);
        }
      } else {
        Logger.log(snipeAsset.custom_fields);
      }


    }
  }


  if (snipeCredentialsToMake.length > 0) {
    Logger.log(`Found ${snipeCredentialsToMake.length} credential(s) in Snipe assigned to Openpath users.`);
    Logger.log(`Added ${snipeCredentialsThatWereMade.length} credential(s) to the users in Openpath.`);
  } else {
    Logger.log(`Did not find any credentials in Snipe assigned to Openpath users.`);
  }

}



/**
 * Get Openpath users and Google users in the Former Staff OU.
 * Get Google Openpath group and check for status === 'SUSPENDED'.
 * Remove any credentials and users from Openpath if found in either.
 * Only cares about our Google users so anyone with an email outside the domain is ignored.
 */
function removeFormerStaffFromOpenpath() {
  const formerGoogleUsers = listAllGoogleUsers(googleFormerStaffOu);
  const allOpenpathGoogleUsers = listAllGoogleUsersInGroup(openpathGoogleGroup);
  const allOpenpathUsers = getOpenpathListUsers();
  let usersRemoved = [];


  // Find users in both Openpath and the Former Staff Google OU
  var ids2 = formerGoogleUsers.map(function (item) {
    return item.primaryEmail;
  });

  // Find the items in formerGoogleUsers that are not in allOpenpathUsers
  var usersToRemove = allOpenpathUsers.data.filter(function (item) {
    return ids2.includes(item.identity.email);
  });


  // Find all the Google users in the Openpath group that are suspended as well
  const suspendedGoogleUsers = allOpenpathGoogleUsers.filter(obj => {
    return obj.status === 'SUSPENDED';
  });

  // Find users in both Openpath and the Former Staff Google OU
  var ids3 = suspendedGoogleUsers.map(function (item) {
    return item.email;
  });

  // Find the items in formerGoogleUsers that are not in allOpenpathUsers
  var suspendedUsersToRemove = allOpenpathUsers.data.filter(function (item) {
    return ids3.includes(item.identity.email);
  });


  // Combine the two arrays
  if (suspendedUsersToRemove.length > 0) {
    for (let i = 0; i < suspendedUsersToRemove.length; i++) {
      usersToRemove.push(suspendedUsersToRemove[i]);
    }
  }
  Logger.log(`There are ${usersToRemove.length} Openpath users that need to be removed.`);


  // Cycle through the needed users and remove them in Snipe
  usersToRemove.forEach(function (user) {
    let removedCredentials = [];
    let userCredentials = getOpenpathListCredentials(user.id);
    if (userCredentials) {
      for (let i = 0; i < userCredentials.data.length; i++) {
        let response = deleteOpenpathDeleteCredential(user.id, userCredentials.data[i].id);
        if (response === 204) {
          removedCredentials.push(userCredentials.data[i]);
        } else {
          Logger.log(response);
        }
      }
    }

    let response = putOpenpathSetUserStatus(user.id, 'I');
    if (response === 204) {
      usersRemoved.push(response);
      Logger.log(`Removed Openpath user: ${user.identity.email} with ID: ${user.id} and removed a total of ${removedCredentials.length} credentials`);
    } else {
      Logger.log(response);
    }
  });
  Logger.log('Number of users successfully removed in Openpath was %s', usersRemoved.length)

}



/**
 * Get Openpath users and Google users in the Openpath group.
 * Check Openpath for a mobile credential.
 * Filters credentials from Openpath by { 'filter': 'credentialType.id:(1)' } that returns "Mobile" only.
 * If none, create a new mobile credential and send them their activation information.
 * Only cares about Google users on the Openpath Google group.
 */
function updateMobileCredentialsInOpenpath() {
  const openpathGoogleGroupUsers = listAllGoogleUsersInGroup(openpathGoogleGroup);
  const allOpenpathUsers = getOpenpathListUsers();

  // Find users in both Openpath and the Openpath Google group
  var ids2 = openpathGoogleGroupUsers.map(function (item) {
    return item.email;
  });

  // Find the user in allOpenpathUsers that are found in openpathGoogleGroupUsers
  var allFilteredOpenpathAndGoogleUsers = allOpenpathUsers.data.filter(function (item) {
    return ids2.includes(item.identity.email);
  });

  Logger.log(`There are ${allFilteredOpenpathAndGoogleUsers.length} Openpath users from the Google Group that might need a mobile credential.`);


  // Get every mobile in Openpath.  Notably skips card credentials.
  const allOpenpathMobileCredentialsData = getOpenpathListOrgCredentials({ 'filter': 'credentialType.id:(1)' });
  const allOpenpathMobileCredentials = allOpenpathMobileCredentialsData.data;

  // Filter out the users who already have a mobile credential
  const usersWhoNeedMobileCredential = allFilteredOpenpathAndGoogleUsers.filter(item2 => !allOpenpathMobileCredentials.find(item1 => item2.identity.email === item1.user.identity.email));


  Logger.log(`There are ${usersWhoNeedMobileCredential.length} Openpath users from the Google Group that need a mobile credential.`);


  const usersWhoReceivedMobileCredential = [];
  // Check if they have a mobile credential
  for (let i = 0; i < usersWhoNeedMobileCredential.length; i++) {
    let user = usersWhoNeedMobileCredential[i];

    Logger.log(`${user.identity.email} needs a mobile credential`);

    let bodyParams = {
      credentialTypeId: 1,
      mobile: { name: 'Default Mobile' },
    }
    let newCredentialResponse = postOpenpathCreateCredential(user.id, bodyParams);
    if (newCredentialResponse.data.id) { // Check the response for the credential ID
      // Send them their activation email
      let newMobileSetupEmailResponse = postOpenpathSetupMobileCredential(user.id, newCredentialResponse.data.id);
      if (newMobileSetupEmailResponse === 204) {
        usersWhoReceivedMobileCredential.push(user) // Push the users who successfully have a new mobile credential to a new array
      }
    }

  }

  if (usersWhoNeedMobileCredential.length > 0) {
    Logger.log(`Found ${usersWhoNeedMobileCredential.length} users who need mobile credentials in Openpath`);
    Logger.log(`Added ${usersWhoReceivedMobileCredential.length} mobile credentials to users in Openpath`);
  } else {
    Logger.log(`No users needed mobile credentials in Openpath`);
  }

}



/**
 * Get Openpath users and Google users in the Openpath group.
 * Check if the need to be added to the All Staff Openpath group and add as needed.
 * Only cares about the users in the Openpath Google group.
 */
function updateGoogleUsersGroupsInOpenpath() {
  const allOpenpathGoogleUsers = listAllGoogleUsersInGroup(openpathGoogleGroup);
  const allOpenpathUsers = getOpenpathListUsers();


  // Find users in both Openpath and the Openpath Google group
  var ids2 = allOpenpathGoogleUsers.map(function (item) {
    return item.email;
  });

  // Find the items in allOpenpathGoogleUsers that are not in allOpenpathUsers
  var allOpenpathAndGoogleUsers = allOpenpathUsers.data.filter(function (item) {
    return ids2.includes(item.identity.email);
  });

  Logger.log(`There are ${allOpenpathAndGoogleUsers.length} Openpath users that should be in the default all staff group.`);


  // Add them to the default staff group
  const openpathUsersToAddToGroup = [];
  //Find users to add to the default All Staff Openpath group
  for (let i = 0; i < allOpenpathAndGoogleUsers.length; i++) {
    let needsToAddToGroup = true; // Use this boolean to track if the user needs to be added to the default staff group
    let openpathUser = allOpenpathAndGoogleUsers[i];

    if (openpathUser.groups.length > 0) {
      for (let i = 0; i < openpathUser.groups.length; i++) {
        let openpathUserGroup = openpathUser.groups[i];

        if (openpathUserGroup.id === openpathDefaultStaffGroupId) {
          needsToAddToGroup = false; // If the user is in the default staff group already, no need to add them
        }
      }
    }

    if (needsToAddToGroup) { // Check if the user needs to be added still
      Logger.log(`${openpathUser.identity.email} will be added to the group: ${openpathDefaultStaffGroupId}`);
      let groupChanges = {
        add: [openpathDefaultStaffGroupId],
      }
      let newGroupResponse = patchOpenpathUpdateUserGroupIds(openpathUser.id, groupChanges);
      if (newGroupResponse === 204) {
        openpathUsersToAddToGroup.push(openpathUser) // Push the users who are successfully in their default group to a new array
      }
    }
  }

  if (openpathUsersToAddToGroup.length > 0) {
    Logger.log(`Have added ${openpathUsersToAddToGroup.length} user(s) to the default group in Openpath`);
  } else {
    Logger.log(`No users were added to the default group in Openpath`);
  }

}



/**
 * Get Openpath users and Google users in the Openpath group.
 * Create the new accounts in Openpath and log their new userId.
 */
function createNewGoogleUsersInOpenpath() {
  const allOpenpathGoogleUsers = listAllGoogleUsersInGroup(openpathGoogleGroup);
  const allOpenpathUsers = getOpenpathListUsers();

  // Find missing users to create for the first time
  var ids2 = allOpenpathUsers.data.map(function (item) { // Get the emails from allOpenpathUsers
    return item.identity.email;
  });

  var missingOpenpathUsers = allOpenpathGoogleUsers.filter(function (item) { // Find the items in allOpenpathGoogleUsers that are not in allOpenpathUsers
    return !ids2.includes(item.email);
  });

  Logger.log(`Missing ${missingOpenpathUsers.length} Openpath users that need to be made.`);


  const allGoogleStaffUsers = listAllGoogleUsers("/Staff"); // Get all the Google users in the /Staff OU

  var ids2 = missingOpenpathUsers.map(function (item) { // Get the emails from the missing Openpath users
    return item.email;
  });

  // Find the items in allGoogleStaffUsers that are in missingOpenpathUsers
  // This is to get all the missing ID card attributes so create new credentials in Openpath
  var filteredGoogleStaffUsers = allGoogleStaffUsers.filter(function (item) {
    return ids2.includes(item.primaryEmail);
  });

  for (var i = 0; i < filteredGoogleStaffUsers.length; i++) { // List users to make for the first time
    Logger.log(`Will attempt to create: ${filteredGoogleStaffUsers[i].primaryEmail} in Openpath`);
  }


  // Create the new users in Openpath
  const newlyCreatedOpenpathUsers = [];
  for (var i = 0; i < filteredGoogleStaffUsers.length; i++) {
    let newUserIdentity = {
      email: filteredGoogleStaffUsers[i].primaryEmail,
      firstName: filteredGoogleStaffUsers[i].name.givenName,
      lastName: filteredGoogleStaffUsers[i].name.familyName
    };
    let response = postOpenpathCreateUser(newUserIdentity)
    // Check if it was succesful and we have an Openpath ID for the new user
    if (response.data.id) {
      filteredGoogleStaffUsers[i].userId = response.data.id; // Add the userId from Openpath for subsequent calls
      newlyCreatedOpenpathUsers.push(filteredGoogleStaffUsers[i]); // Push the succesfully created users to a new array
    }
  }

  if (newlyCreatedOpenpathUsers.length > 0) {
    Logger.log(`Created ${newlyCreatedOpenpathUsers.length} users in Openpath`);
  } else {
    Logger.log(`Did not create any new users in Openpath`);
  }

}



/**
 * Get Openpath users and Google users in the Openpath group.
 * Look for any that are inactive in Openpath and reactivate them.
 * Only cares about the users in the Openpath Google group.
 */
function reactivateGoogleUsersInOpenpath() {
  const allOpenpathGoogleUsers = listAllGoogleUsersInGroup(openpathGoogleGroup);
  const allOpenpathUsers = getOpenpathListUsers();


  // Find inactive users to reactivate
  var ids2 = allOpenpathGoogleUsers.map(function (item) {
    return item.email;
  });

  // Find the items in allOpenpathGoogleUsers that are not in allOpenpathUsers
  var deactivatedOpenpathUsers = allOpenpathUsers.data.filter(function (item) {
    if (item.status === "I") {
      return ids2.includes(item.identity.email);
    }

  });

  Logger.log(`There are ${deactivatedOpenpathUsers.length} deactivated Openpath users to reactivate.`); // Returns all the missing users in Google


  // Reactivate the needed users
  const newlyActivatedOpenpathUsers = [];
  for (var i = 0; i < deactivatedOpenpathUsers.length; i++) {
    let response = putOpenpathSetUserStatus(deactivatedOpenpathUsers[i].id, 'A');
    // Check if it was succesful and the user was reactivated in Openpath
    if (response === 204) {
      newlyActivatedOpenpathUsers.push(deactivatedOpenpathUsers[i]);
    }
  }

  if (newlyActivatedOpenpathUsers.length > 0) {
    Logger.log(`Reactivated ${newlyActivatedOpenpathUsers.length} users in Openpath.`);
  }

}
