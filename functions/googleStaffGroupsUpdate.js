/**
 * Gets users from the Google Staff OU and checks each Google account
 * to see if they need to be added to a staff Google Group
 */
function updateGoogleStaffGroupsByOu() {
  const googleStaffUsers = listAllGoogleUsers(googleStaffOu);
  //Do a second call specifically for the IAs since filtering seems to struggle with the space
  const googleIaUsers = listAllGoogleUsers(googleIaOu);
  const formerGoogleUsers = listAllGoogleUsers(googleFormerStaffOu);

  // Add all the staff to the allstaff email group
  addUsersToGroup(googleStaffUsers, googleStaffGroup);

  // Add all the teachers to the teacher email group
  // Filtering the object values for the original response finds these users
  let teacherUsers = Object.values(googleStaffUsers).filter(user => user.orgUnitPath === googleTeacherOu);
  addUsersToGroup(teacherUsers, googleTeacherGroup);

  // Add all the IAs to the ia email group
  addUsersToGroup(googleIaUsers, googleIaGroup);

  // Remove users from all groups if they are in the Former Staff OU
  removeUsersFromGroup(formerGoogleUsers, googleStaffGroup);
  removeUsersFromGroup(formerGoogleUsers, googleTeacherGroup);
  removeUsersFromGroup(formerGoogleUsers, googleIaGroup);
}


/**
 * Adds users to a group if they are found in the OU that was passed
 * @param {Object[]} usersToAdd - All the users to add.
 * @param {string} usersToAdd[].primaryEmail - The user's email to pass 
 * @param {string} group - The group name to remove users from.
 */
function addUsersToGroup(usersToAdd, group) {
  let foundMembers = [];
  let missingMembers = [];
  usersToAdd.forEach(function (user) {
    let response = AdminDirectory.Members.hasMember(group, user.primaryEmail);
    if (!response.isMember) {
      missingMembers.push(user);
      Logger.log('Group %s is missing %s', group, user.primaryEmail);
      addGoogleGroupMember(user.primaryEmail, group, 'MEMBER');
    } else {
      foundMembers.push(user);
      // Logger.log('Found %s', user.primaryEmail);
    }
  })
  Logger.log('Found %s members in %s group', foundMembers.length, group)
  Logger.log('Missing %s members in %s group', missingMembers.length, group)
}


/**
 * Does the opposite of the add function and removes users from a group
 * if they are found in the OU that was passed
 * @param {Object[]} usersToRemove - All the users to remove.
 * @param {string} usersToRemove[].primaryEmail - The user's email to pass 
 * @param {string} group - The group name to remove users from.
 */
function removeUsersFromGroup(usersToRemove, group) {
  let foundMembers = [];
  let missingMembers = [];
  usersToRemove.forEach(function (user) {
    let response = AdminDirectory.Members.hasMember(group, user.primaryEmail);
    if (response.isMember) {
      foundMembers.push(user);
      Logger.log('User %s is in %s group.  Need to remove', user.primaryEmail, group);
      removeGoogleGroupMember(user.primaryEmail, group);
    } else {
      missingMembers.push(user);
      // Logger.log('Did not find %s in %s', user.primaryEmail, group);
    }
  })
  Logger.log('Found %s members in %s group to remove', foundMembers.length, group)
  Logger.log('Did not find %s members in %s group to remove', missingMembers.length, group)
}