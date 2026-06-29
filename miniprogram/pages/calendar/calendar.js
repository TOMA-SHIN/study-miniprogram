const studyService = require('../../utils/studyService');
const { getMonthDays, getFirstDayOfMonth, getTodayStr } = require('../../utils/util');

function getColorByMinutes(minutes) {
  if (!minutes || minutes <= 0) return '';
  if (minutes <= 30) return '#C8E6C9';
  if (minutes <= 60) return '#81C784';
  if (minutes <= 120) return '#4CAF50';
  return '#2E7D32';
}

function formatDateStr(year, month, day) {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function computeTotalMinutes(records) {
  return records.reduce((sum, r) => sum + (r.minutes || 0), 0);
}

Page({
  data: {
    year: 0,
    month: 0,
    calendarDays: [],
    selectedDate: null,
    dayRecords: [],
    dayMap: {},
    hasAnyRecord: false,
    selectedTotal: 0,
  },

  onLoad() {
    const now = new Date();
    this.setData({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    });
    this.loadCalendarData();
  },

  loadCalendarData() {
    const { year, month } = this.data;
    studyService.getCalendarData(year, month)
      .then(dayMap => {
        const hasAnyRecord = Object.keys(dayMap).some(k => dayMap[k] > 0);
        this.setData({ dayMap, hasAnyRecord });
        this.generateCalendar();
      })
      .catch(() => {
        wx.showToast({ title: '加载日历数据失败', icon: 'none' });
      });
  },

  generateCalendar() {
    const { year, month, dayMap } = this.data;
    const daysInMonth = getMonthDays(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const todayStr = getTodayStr();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ dateStr: '', day: 0, minutes: 0, color: '' });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateStr(year, month, day);
      const minutes = dayMap[dateStr] || 0;
      days.push({
        dateStr,
        day,
        minutes,
        color: getColorByMinutes(minutes),
        isToday: dateStr === todayStr,
      });
    }

    const totalCells = 42;
    const remaining = totalCells - days.length;
    for (let i = 0; i < remaining; i++) {
      days.push({ dateStr: '', day: 0, minutes: 0, color: '' });
    }

    this.setData({ calendarDays: days });
  },

  prevMonth() {
    let { year, month } = this.data;
    month -= 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    this.setData({ year, month, selectedDate: null, dayRecords: [], selectedTotal: 0 });
    this.loadCalendarData();
  },

  nextMonth() {
    let { year, month } = this.data;
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    this.setData({ year, month, selectedDate: null, dayRecords: [], selectedTotal: 0 });
    this.loadCalendarData();
  },

  selectDate(e) {
    const { datestr } = e.currentTarget.dataset;
    if (!datestr) return;
    this.setData({ selectedDate: datestr });
    studyService.getRecordsByRange(datestr, datestr)
      .then(records => {
        const list = records || [];
        this.setData({
          dayRecords: list,
          selectedTotal: computeTotalMinutes(list),
        });
      })
      .catch(() => {
        wx.showToast({ title: '获取记录失败', icon: 'none' });
      });
  },

  getTodayStr() {
    return getTodayStr();
  },
});
