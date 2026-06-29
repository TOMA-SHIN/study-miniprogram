const studyService = require('./utils/studyService');

App({
  globalData: {
    userInfo: {
      nickName: '',
      avatarUrl: '',
      openid: '',
    },
    isDarkMode: false,
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }
    wx.cloud.init({
      env: 'cloud1-d0g889dl64933afbe',
      traceUser: true,
    });

    const isDarkMode = wx.getStorageSync('isDarkMode') === true;
    this.globalData.isDarkMode = isDarkMode;
    this.initUserInfo();
  },

  async initUserInfo() {
    try {
      // 1. wx.login 确保会话有效
      await new Promise((resolve, reject) => {
        wx.login({ success: resolve, fail: reject });
      });
      // 2. 从云端获取用户资料（含 openid）
      const profile = await studyService.getUserProfile();
      const { nickName, avatarUrl, openid } = profile;
      this.globalData.userInfo = {
        nickName: nickName || '',
        avatarUrl: avatarUrl || '',
        openid: openid || '',
      };
    } catch (error) {
      console.error('initUserInfo failed:', error);
    }
  },

  onError(msg) {
    console.error('App onError:', msg);
  },

  onUnhandledRejection(res) {
    console.error('App onUnhandledRejection:', res.reason);
  },
});
