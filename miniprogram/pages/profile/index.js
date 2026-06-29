const studyService = require('../../utils/studyService');

Page({
  data: {
    userInfo: { nickName: '', avatarUrl: '' },
    stats: {
      totalMinutes: 0,
      totalRecords: 0,
      streak: 0,
      longestStreak: 0,
    },
    loading: false,
    isDarkMode: false,
    isLoggedIn: false,
  },

  onShow() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    const isLoggedIn = !!userInfo.nickName;
    this.setData({
      userInfo,
      isLoggedIn,
      isDarkMode: app.globalData.isDarkMode,
    });
    if (isLoggedIn) {
      this.loadStats();
    }
  },

  async loadStats() {
    this.setData({ loading: true });
    try {
      const data = await studyService.getStats('all');
      this.setData({
        stats: {
          totalMinutes: data.totalMinutes || 0,
          totalRecords: data.checkInCount || 0,
          streak: data.streak || 0,
          longestStreak: data.longestStreak || 0,
        },
      });
    } catch (error) {
      console.error('加载统计失败:', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  async handleLogin() {
    try {
      await new Promise((resolve, reject) => {
        wx.login({ success: resolve, fail: reject });
      });
      wx.getUserProfile({
        desc: '用于展示用户头像和昵称',
        success: (res) => {
          const { nickName, avatarUrl } = res.userInfo;
          const app = getApp();
          app.globalData.userInfo = { ...app.globalData.userInfo, nickName, avatarUrl };
          this.setData({ userInfo: app.globalData.userInfo, isLoggedIn: true });
          studyService.updateUserProfile({ nickName, avatarUrl })
            .then(() => {
              wx.showToast({ title: '登录成功', icon: 'success' });
              this.loadStats();
            })
            .catch(err => console.error('Sync profile failed:', err));
        },
        fail: (err) => {
          console.error('getUserProfile failed:', err);
          wx.showToast({ title: '获取用户信息失败', icon: 'none' });
        },
      });
    } catch (err) {
      wx.showToast({ title: '登录失败', icon: 'none' });
    }
  },

  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (!res.confirm) return;
        const app = getApp();
        app.globalData.userInfo = { nickName: '', avatarUrl: '', openid: '' };
        this.setData({
          userInfo: app.globalData.userInfo,
          isLoggedIn: false,
          stats: { totalMinutes: 0, totalRecords: 0, streak: 0, longestStreak: 0 },
        });
        wx.showToast({ title: '已退出登录', icon: 'success' });
      },
    });
  },

  toggleDarkMode(e) {
    const isDarkMode = e.detail.value;
    const app = getApp();
    app.globalData.isDarkMode = isDarkMode;
    wx.setStorageSync('isDarkMode', isDarkMode);
    this.setData({ isDarkMode });
    wx.showToast({ title: isDarkMode ? '已开启深色模式' : '已关闭深色模式', icon: 'none' });
  },

  goStats() {
    wx.navigateTo({ url: '/pages/stats/stats' });
  },

  goRecords() {
    wx.switchTab({ url: '/pages/records/index' });
  },

  goPlans() {
    wx.switchTab({ url: '/pages/plans/index' });
  },
});
