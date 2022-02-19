/**
 * Gets users from Snipe and Google Staff OU
 * Checks each Google account in Snipe and makes a new account as needed
 */
function updateGoogleUsersToSnipe() {
  const googleUsers = listAllGoogleUsers(googleStaffOu);
  const formerGoogleUsers = listAllGoogleUsers(googleFormerStaffOu);
  const snipeUsers = getSnipeUsers();
  let usersToCreate = [];
  let usersCreated = [];
  let usersToRemove = [];
  let usersRemoved = [];

  // Find users in Google that are not in Snipe
  usersToCreate = Object.values(googleUsers).filter(({
    primaryEmail: id1
  }) => !snipeUsers.some(({
    username: id2
  }) => id2 === id1));

  Logger.log('Number of users to create in Snipe is %s', usersToCreate.length);

  // Cycle through the needed users and make them in Snipe
  usersToCreate.forEach(function (user) {
    const password = makeRandomPassword(4, 5, 7);

    Logger.log('Make Snipe user: %s %s %s %s', user.name.givenName, user.name.familyName, password, user.primaryEmail);
    const response = postSnipeUser(user.name.givenName, user.name.familyName, password, password, user.primaryEmail);
    if (response.status == "success") {
      usersCreated.push(response);
    } else {
      Logger.log(response);
    }
  });
  Logger.log('Number of users successfully created in Snipe was %s', usersCreated.length)


  // Find users in Google that should be removed in Snipe
  usersToRemove = Object.values(snipeUsers).filter(({
    username: id1
  }) => formerGoogleUsers.some(({
    primaryEmail: id2
  }) => id2 === id1));

  Logger.log('Number of users to remove in Snipe is %s', usersToRemove.length);

  // Cycle through the needed users and remove them in Snipe
  usersToRemove.forEach(function (user) {

    Logger.log('Remove Snipe user: %s %s %s with %s assets', user.id, user.name, user.username, user.assets_count);
    const response = deleteSnipeUser(user.id);
    if (response.status == "success") {
      usersRemoved.push(response);
    } else {
      Logger.log(response);
    }
  });
  Logger.log('Number of users successfully removed in Snipe was %s', usersRemoved.length)

}


/**
 * Not cryptographically secure but good enough since these users never log in
 * @param {number} letters - The number of letters needed in the new password.
 * @param {number} numbers - The number of numbers needed in the new password.
 * @param {number} either - The number of either numbers or letters needed in the new password.
 * @yields {string} A random password
 */
function makeRandomPassword(letters, numbers, either) {
  var chars = [
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", // letters
    "0123456789", // numbers
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" // either
  ];

  return [letters, numbers, either].map(function (len, i) {
    return Array(len).fill(chars[i]).map(function (x) {
      return x[Math.floor(Math.random() * x.length)];
    }).join('');
  }).concat().join('').split('').sort(function () {
    return 0.5 - Math.random();
  }).join('')
}