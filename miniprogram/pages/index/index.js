const studyService = require('../../utils/studyService');

Page({
  data: {
    todayMinutes: 0,
    streak: 0,
    records: [],
    loading: false,
    userInfo: { nickName: '', avatarUrl: '' },
    isDarkMode: false,
  },

  onShow() {
    this.loadTodayData();
    const app = getApp();
    this.setData({ userInfo: app.globalData.userInfo, isDarkMode: app.globalData.isDarkMode });
    wx.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage'] });
  },

  onShareAppMessage() {
    const { todayMinutes, streak, userInfo } = this.data;
    const nickName = userInfo.nickName || '我';
    let title = `${nickName} 在学习打卡中已坚持 ${streak} 天`;
    if (todayMinutes > 0) {
      title += `，今日学习 ${todayMinutes} 分钟`;
    }
    title += '，一起来学习吧！';
    return {
      title,
      path: '/pages/index/index',
    };
  },

  async loadTodayData() {
    this.setData({ loading: true });
    try {
      const result = await studyService.getTodayRecords();
      const { records, totalMinutes, streak } = result;
      this.setData({ records, todayMinutes: totalMinutes, streak });
    } catch (error) {
      wx.showToast({ title: '数据加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  goCheckIn() {
    wx.switchTab({ url: '/pages/checkin/checkin' });
  },

  goPlans() {
    wx.switchTab({ url: '/pages/plans/index' });
  },

  goStats() {
    wx.navigateTo({ url: '/pages/stats/stats' });
  },

  goRecords() {
    wx.switchTab({ url: '/pages/records/index' });
  },

  async onPullDownRefresh() {
    await this.loadTodayData();
    wx.stopPullDownRefresh();
  },
});
