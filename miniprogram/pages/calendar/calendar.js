const studyService = require('../../utils/studyService');
const { getMonthDays, getFirstDayOfMonth } = require('../../utils/util');

Page({
  data: {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    days: [],
    calendarData: {},
  },

  onLoad() {
    this.buildCalendar();
    this.loadCalendarData();
  },

  buildCalendar() {
    const { year, month } = this.data;
    const daysInMonth = getMonthDays(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: '', date: '' });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, date: dateStr });
    }
    this.setData({ days });
  },

  async loadCalendarData() {
    try {
      const { year, month } = this.data;
      const data = await studyService.getCalendarData(year, month);
      this.setData({ calendarData: data });
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  prevMonth() {
    let { year, month } = this.data;
    month--;
    if (month < 1) {
      month = 12;
      year--;
    }
    this.setData({ year, month }, () => {
      this.buildCalendar();
      this.loadCalendarData();
    });
  },

  nextMonth() {
    let { year, month } = this.data;
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
    this.setData({ year, month }, () => {
      this.buildCalendar();
      this.loadCalendarData();
    });
  },
});
