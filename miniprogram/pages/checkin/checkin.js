const studyService = require('../../utils/studyService');

Page({
  data: {
    plans: [],
    planNames: [],
    planIndex: -1,
    minutes: '',
    note: '',
    todayMinutes: 0,
    loading: false,
    imageFileID: '',
    imageTempUrl: '',
    uploadingImage: false,
    isDarkMode: false,
  },

  onLoad() {
    this.loadPlans();
  },

  onShow() {
    this.loadPlans();
    const app = getApp();
    this.setData({ isDarkMode: app.globalData.isDarkMode });
  },

  async loadPlans() {
    try {
      const plans = await studyService.getPlans(true);
      console.log('[checkin] getPlans raw:', JSON.stringify(plans));
      const activePlans = plans.filter(p => p.isActive !== false);
      const planNames = activePlans.map(p => p.name || '未命名');
      this.setData({ plans: activePlans, planNames });
      if (activePlans.length === 0) {
        console.warn('[checkin] 没有激活的学习计划');
      }
    } catch (err) {
      console.error('[checkin] 加载计划失败:', err);
      wx.showToast({ title: '加载计划失败', icon: 'none' });
    }
  },

  goCreatePlan() {
    wx.switchTab({ url: '/pages/plans/index' });
  },

  async onPlanChange(e) {
    const planIndex = Number(e.detail.value);
    this.setData({ planIndex, todayMinutes: 0 });
    const plan = this.data.plans[planIndex];
    if (!plan) return;
    try {
      const records = await studyService.getTodayRecords();
      const mins = records
        .filter(r => r.planId === plan._id)
        .reduce((sum, r) => sum + (Number(r.minutes) || 0), 0);
      this.setData({ todayMinutes: mins });
    } catch (err) {
      wx.showToast({ title: '查询时长失败', icon: 'none' });
    }
  },

  onMinutesInput(e) {
    this.setData({ minutes: e.detail.value });
  },

  onNoteInput(e) {
    this.setData({ note: e.detail.value });
  },

  async chooseImage() {
    try {
      const res = await wx.chooseMedia({ mediaType: ['image'], count: 1, sourceType: ['album', 'camera'] });
      const tempFilePath = res.tempFiles[0].tempFilePath;
      this.setData({ imageTempUrl: tempFilePath, uploadingImage: true });

      // Upload to cloud storage
      const cloudPath = `records/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath: tempFilePath,
      });
      this.setData({ imageFileID: uploadRes.fileID, uploadingImage: false });
      wx.showToast({ title: '上传成功', icon: 'success' });
    } catch (err) {
      console.error('Image upload failed:', err);
      wx.showToast({ title: '上传失败', icon: 'none' });
      this.setData({ uploadingImage: false });
    }
  },

  removeImage() {
    this.setData({ imageFileID: '', imageTempUrl: '' });
  },

  async submitCheckIn() {
    const { plans, planIndex, minutes, note, imageFileID } = this.data;
    if (planIndex < 0) {
      wx.showToast({ title: '请选择学习计划', icon: 'none' });
      return;
    }
    const m = Number(minutes);
    if (!m || m <= 0 || m > 1440) {
      wx.showToast({ title: '时长应为1-1440分钟', icon: 'none' });
      return;
    }
    const plan = plans[planIndex];
    const date = this.getTodayStr();
    this.setData({ loading: true });
    try {
      await studyService.checkIn(plan._id, date, m, note, imageFileID);
      wx.showToast({ title: '打卡成功', icon: 'success' });
      setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1200);
    } catch (err) {
      wx.showToast({ title: '打卡失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  getTodayStr() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
});
