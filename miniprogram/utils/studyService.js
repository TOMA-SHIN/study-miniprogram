async function callFunction(action, data) {
  try {
    const result = await wx.cloud.callFunction({
      name: 'studyFunctions',
      data: { action, ...data },
    });
    if (!result.result.success) {
      throw new Error(result.result.message);
    }
    return result.result.data;
  } catch (error) {
    console.error(`studyFunctions ${action} failed:`, error);
    throw error;
  }
}

function addPlan(plan) {
  return callFunction('addPlan', { plan });
}

function getPlans(activeOnly) {
  return callFunction('getPlans', { activeOnly });
}

function updatePlan(id, data) {
  return callFunction('updatePlan', { id, data });
}

function deletePlan(id) {
  return callFunction('deletePlan', { id });
}

function checkIn(planId, date, minutes, note, imageFileID) {
  return callFunction('checkIn', { planId, date, minutes, note, imageFileID });
}

function getTodayRecords() {
  return callFunction('getTodayRecords');
}

function getRecordsByRange(startDate, endDate) {
  return callFunction('getRecordsByRange', { startDate, endDate });
}

function getStats(period) {
  return callFunction('getStats', { period });
}

function getCalendarData(year, month) {
  return callFunction('getCalendarData', { year, month });
}

function deleteRecord(id) {
  return callFunction('deleteRecord', { id });
}

function getSubjects() {
  return callFunction('getSubjects');
}

function getAllRecords(page = 1, pageSize = 20) {
  return callFunction('getAllRecords', { page, pageSize });
}

function updateRecord(id, data) {
  return callFunction('updateRecord', { id, ...data });
}

function searchRecords(filters) {
  return callFunction('searchRecords', filters);
}

function getUserProfile() {
  return callFunction('getUserProfile');
}

function updateUserProfile(data) {
  return callFunction('updateUserProfile', data);
}

async function getImageUrl(fileIDs) {
  try {
    const result = await wx.cloud.callFunction({
      name: 'getImageUrl',
      data: { fileIDs },
    });
    if (!result.result.success) {
      throw new Error(result.result.message);
    }
    return result.result.data;
  } catch (error) {
    console.error('getImageUrl failed:', error);
    throw error;
  }
}

module.exports = {
  addPlan,
  getPlans,
  updatePlan,
  deletePlan,
  checkIn,
  getTodayRecords,
  getRecordsByRange,
  getStats,
  getCalendarData,
  deleteRecord,
  getSubjects,
  getAllRecords,
  updateRecord,
  searchRecords,
  getUserProfile,
  updateUserProfile,
  getImageUrl,
};
