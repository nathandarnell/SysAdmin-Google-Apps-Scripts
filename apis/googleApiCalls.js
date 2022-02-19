/**
 * Updates the user with new attributes.
 * @param {string} email - The email of the user to update.
 * @param {Object} user - The updated attributes of the user.
 * @returns {Object} The new User object.
 * @see https://developers.google.com/admin-sdk/directory/reference/rest/v1/users#User
 */
function updateGoogleUser(email, user) {
  try {
    var response = AdminDirectory.Users.update(user, email);
    Logger.log('User %s updated with ID %s.', response.primaryEmail, response.id);
    return response;
  } catch (err) {
    Logger.log('Error updating %s with error: %s', email, err);
    return err;
  }
}


/**
 * Lists all the users in a domain sorted by first name.
 * @param {string} searchOu - The Google OU to retrieve users from.
 * @returns {Object} The users from the Google OU.
 * @see https://developers.google.com/admin-sdk/directory/reference/rest/v1/users#User
 */
function listAllGoogleUsers(searchOu) {
  const returnUsers = [];
  var pageToken;
  var page;
  do {
    page = AdminDirectory.Users.list({
      domain: googleDomain,
      orderBy: 'givenName',
      query: 'orgUnitPath=' + searchOu,
      maxResults: 100,
      pageToken: pageToken
    });
    var users = page.users;
    if (users) {
      for (var i = 0; i < users.length; i++) {
        var user = users[i];
        returnUsers.push(user);
        // Logger.log('%s (%s)', user.name.fullName, user.primaryEmail);
      }
    } else {
      Logger.log('No users found.');
    }
    pageToken = page.nextPageToken;
  } while (pageToken);
  Logger.log('Number of users in the %s OU is %s', searchOu, returnUsers.length);
  // Logger.log(returnUsers);
  return returnUsers;

}


/**
 * Gets the list of ChromeOS devices from Google and returns it.
 * @returns {Object} The list of ChromeOS devices.
 */
function getGoogleDevices() {

  var pageToken;
  var page;
  const returnDevices = [];

  do {
    page = AdminDirectory.Chromeosdevices.list(googleCustomerId, {
      orderBy: 'lastSync',
      maxResults: 100,
      pageToken: pageToken
    });
    var devices = page.chromeosdevices;
    if (devices) {
      for (var i = 0; i < devices.length; i++) {
        var device = devices[i];
        returnDevices.push(device);
      }
    } else {
      Logger.log('No devices found.');
    }
    pageToken = page.nextPageToken;
  } while (pageToken);
  Logger.log('Number of Google devices found is %s', returnDevices.length);
  // Logger.log(returnDevices);
  return returnDevices;
}


/**
 * Adds a user to an existing group in the domain.
 * @param {string} userEmail - The email of the user to add to the group.
 * @param {string} groupEmail - The group email to add the passed user to.
 * @param {string} userRole - Can be OWNER, MANAGER, or MEMBER.
 * @see {@link https://developers.google.com/admin-sdk/directory/reference/rest/v1/members}
 */
function addGoogleGroupMember(userEmail, groupEmail, userRole) {
  userRole = userRole || 'MEMBER';
  var member = {
    email: userEmail,
    role: userRole
  };
  try {
    let result = AdminDirectory.Members.insert(member, groupEmail);
    Logger.log('User %s added as a member of group %s.', userEmail, groupEmail);
    return result;
  } catch (err) {
    Logger.log('User %s could not be added as a member of group %s.', userEmail, groupEmail);
    return err;
  }
}


/**
 * Removes a user from an existing group in the domain.
 * @param {string} userEmail - The email of the user to remove from the group.
 * @param {string} groupEmail - The group email to remove the passed user from.
 */
function removeGoogleGroupMember(userEmail, groupEmail) {
  try {
    AdminDirectory.Members.remove(groupEmail, userEmail);
    Logger.log('User %s removed as a member of group %s.', userEmail, groupEmail);
  } catch (err) {
    Logger.log('Had an error with removing %s and the error was %s', userEmail, err);
  }
}


/**
 * Adds a new user to the domain, including only the required information. For
 * the full list of user fields, see the API's reference documentation:
 * @see https://developers.google.com/admin-sdk/directory/v1/reference/users/insert
 * @param {string} newEmail - Email for the new user.
 * @param {string} firstName - First name of the new user.
 * @param {string} lastName - Last name of the new user.
 * @param {string} newPassword - Password for the new user.
 * @param {string} org - Organizational Unit of the new user.
 * @param {boolean} changePassword - True or False if the user should make a new password on first login.
 * @returns {Object} The response from Google.
 */
function addUser(newEmail, firstName, lastName, newPassword, org, changePassword) {
  var user = {
    primaryEmail: newEmail,
    name: {
      givenName: firstName,
      familyName: lastName
    },
    password: newPassword,
    orgUnitPath: org,
    changePasswordAtNextLogin: changePassword
  };
  try {
    user = AdminDirectory.Users.insert(user);
    Logger.log('User %s created with ID %s.', user.primaryEmail, user.id);
    return user;
  } catch (err) {
    Logger.log('Error creating %s with error: %s', user.primaryEmail, err);
    return err;
  }
}