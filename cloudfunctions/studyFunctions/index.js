const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

const STUDY_PLANS = 'studyPlans';
const STUDY_RECORDS = 'studyRecords';
const USER_STATS = 'userStats';
const SUBJECTS = 'subjects';
const USER_PROFILES = 'userProfiles';

function successResponse(data) {
  return { success: true, data };
}

function errorResponse(message) {
  return { success: false, message };
}

function getOpenId() {
  const wxContext = cloud.getWXContext();
  return wxContext.OPENID;
}

function getTodayStr() {
  const now = new Date();
  const beijing = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return beijing.toISOString().slice(0, 10);
}

function formatDateStr(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateStr(dateStr) {
  return new Date(dateStr + 'T00:00:00');
}

function extractUniqueDates(records) {
  const dateSet = new Set();
  records.forEach(r => dateSet.add(r.date));
  return Array.from(dateSet).sort((a, b) => b.localeCompare(a));
}

function calculateStreak(records) {
  if (!records || records.length === 0) return 0;
  const dates = extractUniqueDates(records);
  const today = getTodayStr();
  const yesterday = formatDateStr(new Date(Date.now() - 86400000));
  if (dates[0] !== today && dates[0] !== yesterday) {
    return 0;
  }
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(parseDateStr(dates[i - 1]));
    const curr = new Date(parseDateStr(dates[i]));
    const diff = (prev - curr) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function calculateLongestStreak(records) {
  if (!records || records.length === 0) return 0;
  const dates = extractUniqueDates(records).sort((a, b) => a.localeCompare(b));
  let maxStreak = 1;
  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(parseDateStr(dates[i - 1]));
    const curr = new Date(parseDateStr(dates[i]));
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      maxStreak = Math.max(maxStreak, current);
    } else {
      current = 1;
    }
  }
  return maxStreak;
}

function buildStatsData(records) {
  const streak = calculateStreak(records);
  const longestStreak = calculateLongestStreak(records);
  const totalMinutes = records.reduce((sum, r) => sum + (r.minutes || 0), 0);
  const totalCheckIns = records.length;
  const lastCheckInDate = records.length > 0 ? records[0].date : '';
  return {
    currentStreak: streak,
    longestStreak,
    totalMinutes,
    totalCheckIns,
    lastCheckInDate,
  };
}

async function updateUserStats(openid, records) {
  const stats = buildStatsData(records);
  stats.updateTime = db.serverDate();
  const { data } = await db.collection(USER_STATS).where({ _openid: openid }).get();
  if (data.length === 0) {
    stats._openid = openid;
    await db.collection(USER_STATS).add({ data: stats });
  } else {
    await db.collection(USER_STATS).where({ _openid: openid }).update({ data: stats });
  }
}

async function getRecordsByOpenid(openid) {
  const { data } = await db.collection(STUDY_RECORDS)
    .where({ _openid: openid })
    .orderBy('date', 'desc')
    .get();
  return data;
}

async function getPlansMap(planIds) {
  const map = {};
  if (planIds.length === 0) return map;
  const { data: plans } = await db.collection(STUDY_PLANS)
    .where({ _id: _.in(planIds) })
    .get();
  plans.forEach(p => {
    map[p._id] = p;
  });
  return map;
}

async function addPlan(event, openid) {
  const { plan } = event;
  if (!plan?.name || plan.name.trim() === '') {
    return errorResponse('计划名称不能为空');
  }
  if (plan.name.length > 20) {
    return errorResponse('计划名称不能超过20字');
  }
  const data = {
    _openid: openid,
    name: plan.name.trim(),
    subject: plan.subject || '',
    targetMinutes: plan.targetMinutes || 30,
    color: plan.color || '',
    startDate: plan.startDate || '',
    endDate: plan.endDate || '',
    isActive: true,
    createTime: db.serverDate(),
    updateTime: db.serverDate(),
  };
  await db.collection(STUDY_PLANS).add({ data });
  return successResponse(null);
}

async function getPlans(event, openid) {
  const { activeOnly } = event;
  let query = db.collection(STUDY_PLANS).where({ _openid: openid });
  if (activeOnly === true) {
    query = query.where({ _openid: openid, isActive: true });
  }
  const { data } = await query.orderBy('createTime', 'desc').get();
  return successResponse(data);
}

async function updatePlan(event, openid) {
  const { id, data: updateData } = event;
  if (!id) return errorResponse('计划ID不能为空');
  updateData.updateTime = db.serverDate();
  await db.collection(STUDY_PLANS).where({ _openid: openid, _id: id }).update({
    data: updateData,
  });
  return successResponse(null);
}

async function deletePlan(event, openid) {
  const { id } = event;
  if (!id) return errorResponse('计划ID不能为空');
  await db.collection(STUDY_PLANS).where({ _openid: openid, _id: id }).remove();
  return successResponse(null);
}

async function checkIn(event, openid) {
  const { planId, date, minutes, note } = event;
  const mins = Number(minutes);
  if (!planId) return errorResponse('计划ID不能为空');
  if (!date) return errorResponse('日期不能为空');
  if (!mins || mins <= 0 || mins > 1440) {
    return errorResponse('时长必须在1-1440分钟之间');
  }
  await db.collection(STUDY_RECORDS).add({
    data: {
      _openid: openid,
      planId,
      date,
      minutes: mins,
      note: note || '',
      imageFileID: event.imageFileID || '',
      checkInTime: db.serverDate(),
      createTime: db.serverDate(),
    },
  });
  const records = await getRecordsByOpenid(openid);
  await updateUserStats(openid, records);
  const streak = calculateStreak(records);
  const totalMinutes = records.reduce((sum, r) => sum + (r.minutes || 0), 0);
  const totalCheckIns = records.length;
  return successResponse({ streak, totalMinutes, totalCheckIns });
}

async function getTodayRecords(event, openid) {
  const today = getTodayStr();
  const { data: records } = await db.collection(STUDY_RECORDS)
    .where({ _openid: openid, date: today })
    .get();
  const planIds = [...new Set(records.map(r => r.planId).filter(Boolean))];
  const plansMap = await getPlansMap(planIds);
  const enriched = records.map(r => ({
    ...r,
    planName: plansMap[r.planId]?.name || '',
    planColor: plansMap[r.planId]?.color || '',
  }));
  const totalMinutes = records.reduce((sum, r) => sum + (r.minutes || 0), 0);
  const allRecords = await getRecordsByOpenid(openid);
  const streak = calculateStreak(allRecords);
  return successResponse({ records: enriched, totalMinutes, streak });
}

async function getRecordsByRange(event, openid) {
  const { startDate, endDate } = event;
  if (!startDate || !endDate) {
    return errorResponse('开始日期和结束日期不能为空');
  }
  const { data } = await db.collection(STUDY_RECORDS)
    .where({
      _openid: openid,
      date: _.gte(startDate).and(_.lte(endDate)),
    })
    .orderBy('date', 'desc')
    .get();
  return successResponse(data);
}

async function getAllRecords(event, openid) {
  const { page = 1, pageSize = 20 } = event;
  const pageNum = Number(page);
  const size = Number(pageSize);
  const skip = (pageNum - 1) * size;
  const { data: records } = await db.collection(STUDY_RECORDS)
    .where({ _openid: openid })
    .orderBy('checkInTime', 'desc')
    .skip(skip)
    .limit(size)
    .get();
  const planIds = [...new Set(records.map(r => r.planId).filter(Boolean))];
  const plansMap = await getPlansMap(planIds);
  const planAccumulated = {};
  const remainingMap = {};
  const sortedAsc = [...records].sort((a, b) => {
    const tA = a.checkInTime ? new Date(a.checkInTime).getTime() : 0;
    const tB = b.checkInTime ? new Date(b.checkInTime).getTime() : 0;
    return tA - tB;
  });
  sortedAsc.forEach((r) => {
    const target = plansMap[r.planId]?.targetMinutes || 0;
    const prev = planAccumulated[r.planId] || 0;
    const accumulated = prev + (r.minutes || 0);
    planAccumulated[r.planId] = accumulated;
    remainingMap[r._id] = Math.max(0, target - accumulated);
  });
  const enrichedRecords = records.map((r) => ({
    ...r,
    planName: plansMap[r.planId]?.name || '',
    subject: plansMap[r.planId]?.subject || '',
    planColor: plansMap[r.planId]?.color || '',
    targetMinutes: plansMap[r.planId]?.targetMinutes || 0,
    remainingMinutes: remainingMap[r._id] || 0,
  }));
  const { total } = await db.collection(STUDY_RECORDS).where({ _openid: openid }).count();
  const hasMore = (pageNum * size) < total;
  return successResponse({ list: enrichedRecords, total, hasMore });
}

async function updateRecord(event, openid) {
  const { id, minutes, note, date } = event;
  if (!id) return errorResponse('记录ID不能为空');
  const updateData = {};
  if (minutes !== undefined) updateData.minutes = Number(minutes);
  if (note !== undefined) updateData.note = note;
  if (event.imageFileID !== undefined) {
    updateData.imageFileID = event.imageFileID;
  }
  if (date !== undefined) updateData.date = date;
  updateData.updateTime = db.serverDate();
  await db.collection(STUDY_RECORDS).where({ _openid: openid, _id: id }).update({
    data: updateData,
  });
  const records = await getRecordsByOpenid(openid);
  await updateUserStats(openid, records);
  return successResponse(null);
}

async function searchRecords(event, openid) {
  const { date, subject, planId, keyword, page = 1, pageSize = 20 } = event;
  const pageNum = Number(page);
  const size = Number(pageSize);
  const skip = (pageNum - 1) * size;
  const whereClause = { _openid: openid };
  if (date) {
    whereClause.date = date;
  }
  if (planId) {
    whereClause.planId = planId;
  }
  if (keyword) {
    whereClause.note = db.RegExp({ regexp: keyword, options: 'i' });
  }
  if (subject && !planId) {
    const { data: plans } = await db.collection(STUDY_PLANS)
      .where({ _openid: openid, subject })
      .get();
    const subjectPlanIds = plans.map(p => p._id);
    if (subjectPlanIds.length === 0) {
      return successResponse({ list: [], total: 0, hasMore: false });
    }
    whereClause.planId = _.in(subjectPlanIds);
  }
  const { data: records } = await db.collection(STUDY_RECORDS)
    .where(whereClause)
    .orderBy('checkInTime', 'desc')
    .skip(skip)
    .limit(size)
    .get();
  const recordPlanIds = [...new Set(records.map(r => r.planId).filter(Boolean))];
  const plansMap = await getPlansMap(recordPlanIds);
  const planAccumulated = {};
  const remainingMap = {};
  const sortedAsc = [...records].sort((a, b) => {
    const tA = a.checkInTime ? new Date(a.checkInTime).getTime() : 0;
    const tB = b.checkInTime ? new Date(b.checkInTime).getTime() : 0;
    return tA - tB;
  });
  sortedAsc.forEach((r) => {
    const target = plansMap[r.planId]?.targetMinutes || 0;
    const prev = planAccumulated[r.planId] || 0;
    const accumulated = prev + (r.minutes || 0);
    planAccumulated[r.planId] = accumulated;
    remainingMap[r._id] = Math.max(0, target - accumulated);
  });
  const list = records.map((r) => ({
    ...r,
    planName: plansMap[r.planId]?.name || '',
    subject: plansMap[r.planId]?.subject || '',
    planColor: plansMap[r.planId]?.color || '',
    targetMinutes: plansMap[r.planId]?.targetMinutes || 0,
    remainingMinutes: remainingMap[r._id] || 0,
  }));
  const { total } = await db.collection(STUDY_RECORDS).where(whereClause).count();
  const hasMore = (pageNum * size) < total;
  return successResponse({ list, total, hasMore });
}

function getDateRange(period) {
  const today = new Date();
  const todayStr = formatDateStr(today);
  switch (period) {
    case 'today':
      return { startDate: todayStr, endDate: todayStr };
    case 'week': {
      const day = today.getDay();
      const diff = day === 0 ? 6 : day - 1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - diff);
      return { startDate: formatDateStr(monday), endDate: todayStr };
    }
    case 'month': {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: formatDateStr(firstDay), endDate: todayStr };
    }
    case 'all':
      return { startDate: '', endDate: '' };
    default:
      return { startDate: todayStr, endDate: todayStr };
  }
}

async function fetchRecordsForStats(openid, period) {
  const { startDate, endDate } = getDateRange(period);
  if (period === 'all') {
    return db.collection(STUDY_RECORDS).where({ _openid: openid }).get();
  }
  return db.collection(STUDY_RECORDS).where({
    _openid: openid,
    date: _.gte(startDate).and(_.lte(endDate)),
  }).get();
}

async function computeSubjectDistribution(records) {
  const planIds = [...new Set(records.map(r => r.planId).filter(Boolean))];
  const plansMap = await getPlansMap(planIds);
  const totalMinutes = records.reduce((sum, r) => sum + (r.minutes || 0), 0);
  const subjectMinutes = {};
  records.forEach(r => {
    const subject = plansMap[r.planId]?.subject || '未分类';
    subjectMinutes[subject] = (subjectMinutes[subject] || 0) + (r.minutes || 0);
  });
  const distribution = Object.entries(subjectMinutes).map(([subject, minutes]) => ({
    subject,
    minutes,
    percentage: totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0,
  }));
  return { totalMinutes, checkInCount: records.length, distribution };
}

async function getStats(event, openid) {
  const { period = 'today' } = event;
  const { data: records } = await fetchRecordsForStats(openid, period);
  const {
    totalMinutes,
    checkInCount,
    distribution,
  } = await computeSubjectDistribution(records);
  const avgMinutes = checkInCount > 0 ? Math.round(totalMinutes / checkInCount) : 0;
  const allRecords = await getRecordsByOpenid(openid);
  const streak = calculateStreak(allRecords);
  const longestStreak = calculateLongestStreak(allRecords);
  return successResponse({
    totalMinutes,
    checkInCount,
    avgMinutes,
    subjectDistribution: distribution,
    streak,
    longestStreak,
  });
}

async function getCalendarData(event, openid) {
  const { year, month } = event;
  if (!year || !month) {
    return errorResponse('年份和月份不能为空');
  }
  const monthStr = String(month).padStart(2, '0');
  const startDate = `${year}-${monthStr}-01`;
  const endDate = `${year}-${monthStr}-31`;
  const { data: records } = await db.collection(STUDY_RECORDS)
    .where({
      _openid: openid,
      date: _.gte(startDate).and(_.lte(endDate)),
    })
    .get();
  const dayMap = {};
  records.forEach(r => {
    dayMap[r.date] = (dayMap[r.date] || 0) + (r.minutes || 0);
  });
  return successResponse(dayMap);
}

async function deleteRecord(event, openid) {
  const { id } = event;
  if (!id) return errorResponse('记录ID不能为空');
  await db.collection(STUDY_RECORDS).where({ _openid: openid, _id: id }).remove();
  const records = await getRecordsByOpenid(openid);
  await updateUserStats(openid, records);
  return successResponse(null);
}

async function getSubjects(event, openid) {
  const { data } = await db.collection(SUBJECTS).orderBy('sortOrder', 'asc').get();
  return successResponse(data);
}

async function getUserProfile(event, openid) {
  const { data } = await db.collection(USER_PROFILES).where({ _openid: openid }).get();
  if (data.length > 0) {
    return successResponse({ ...data[0], openid });
  }
  const profile = {
    _openid: openid,
    nickName: '',
    avatarUrl: '',
    totalMinutes: 0,
    totalRecords: 0,
    streak: 0,
    createTime: db.serverDate(),
    updateTime: db.serverDate(),
  };
  const result = await db.collection(USER_PROFILES).add({ data: profile });
  return successResponse({ ...profile, _id: result._id, openid });
}

async function updateUserProfile(event, openid) {
  const { nickName, avatarUrl } = event;
  const updateData = { updateTime: db.serverDate() };
  if (nickName !== undefined) updateData.nickName = nickName;
  if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
  await db.collection(USER_PROFILES).where({ _openid: openid }).update({ data: updateData });
  return successResponse(null);
}

exports.main = async (event, context) => {
  const { action } = event;
  const openid = getOpenId();
  if (!openid) {
    return errorResponse('获取用户身份失败');
  }
  try {
    switch (action) {
      case 'addPlan': return await addPlan(event, openid);
      case 'getPlans': return await getPlans(event, openid);
      case 'updatePlan': return await updatePlan(event, openid);
      case 'deletePlan': return await deletePlan(event, openid);
      case 'checkIn': return await checkIn(event, openid);
      case 'getTodayRecords': return await getTodayRecords(event, openid);
      case 'getRecordsByRange': return await getRecordsByRange(event, openid);
      case 'getStats': return await getStats(event, openid);
      case 'getCalendarData': return await getCalendarData(event, openid);
      case 'deleteRecord': return await deleteRecord(event, openid);
      case 'getAllRecords': return await getAllRecords(event, openid);
      case 'updateRecord': return await updateRecord(event, openid);
      case 'searchRecords': return await searchRecords(event, openid);
      case 'getSubjects': return await getSubjects(event, openid);
      case 'getUserProfile': return await getUserProfile(event, openid);
      case 'updateUserProfile': return await updateUserProfile(event, openid);
      default: return errorResponse('未知操作: ' + action);
    }
  } catch (err) {
    console.error('云函数错误:', err);
    return errorResponse(err.message || '服务器内部错误');
  }
};
