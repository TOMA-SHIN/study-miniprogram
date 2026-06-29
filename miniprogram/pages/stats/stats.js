const studyService = require('../../utils/studyService');

function getDateRange(period) {
  const today = new Date();
  const format = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const todayStr = format(today);
  if (period === 'today') return { startDate: todayStr, endDate: todayStr };
  if (period === 'week') {
    const day = today.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diff);
    return { startDate: format(monday), endDate: todayStr };
  }
  if (period === 'month') {
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    return { startDate: format(first), endDate: todayStr };
  }
  return { startDate: '1970-01-01', endDate: todayStr };
}

Page({
  data: {
    period: 'today',
    periods: [
      { key: 'today', label: '今日' },
      { key: 'week', label: '本周' },
      { key: 'month', label: '本月' },
      { key: 'all', label: '全部' },
    ],
    stats: null,
    recentRecords: [],
    loading: false,
    isDarkMode: false,
  },

  onShow() {
    this.loadStats();
    const app = getApp();
    this.setData({ isDarkMode: app.globalData.isDarkMode });
  },

  async loadStats() {
    this.setData({ loading: true });
    try {
      const stats = await studyService.getStats(this.data.period);
      const { startDate, endDate } = getDateRange(this.data.period);
      const records = await studyService.getRecordsByRange(startDate, endDate);
      const recentRecords = (records || []).slice(0, 5);
      this.setData({ stats, recentRecords });
    } catch (error) {
      wx.showToast({ title: '统计加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  switchPeriod(event) {
    const { key } = event.currentTarget.dataset;
    if (key === this.data.period) return;
    this.setData({ period: key });
    this.loadStats();
  },
});
