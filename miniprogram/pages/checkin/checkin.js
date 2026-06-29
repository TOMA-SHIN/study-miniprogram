const studyService = require('../../utils/studyService');
const { getTodayStr } = require('../../utils/util');

Page({
  data: {
    plans: [],
    planIndex: -1,
    date: getTodayStr(),
    minutes: 30,
    note: '',
    loading: false,
    subjects: [],
    imageFileID: '',
    imageTempUrl: '',
    uploadingImage: false,
    isDarkMode: false,
  },

  onShow() {
    this.loadPlans();
    this.loadSubjects();
    const app = getApp();
    this.setData({ isDarkMode: app.globalData.isDarkMode });
  },

  async loadPlans() {
    try {
      const plans = await studyService.getPlans(true);
      this.setData({ plans });
    } catch (error) {
      wx.showToast({ title: error.message || '加载计划失败', icon: 'none' });
    }
  },

  async loadSubjects() {
    try {
      const subjects = await studyService.getSubjects();
      this.setData({ subjects });
    } catch (error) {
      wx.showToast({ title: error.message || '加载科目失败', icon: 'none' });
    }
  },

  onPlanChange(e) {
    this.setData({ planIndex: e.detail.value });
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value });
  },

  onMinutesChange(e) {
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

  goAddPlan() {
    wx.navigateTo({ url: '/pages/planForm/planForm' });
  },

  async submitCheckIn() {
    const { plans, planIndex, date, minutes, note, imageFileID } = this.data;
    if (planIndex < 0 || plans.length === 0) {
      wx.showToast({ title: '请先选择一个计划', icon: 'none' });
      return;
    }
    if (!minutes || minutes <= 0) {
      wx.showToast({ title: '请输入有效时长', icon: 'none' });
      return;
    }
    const plan = plans[planIndex];
    this.setData({ loading: true });
    try {
      await studyService.checkIn(plan._id, date, Number(minutes), note, imageFileID);
      wx.showToast({ title: '打卡成功', icon: 'success' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 1000);
    } catch (error) {
      wx.showToast({ title: error.message || '打卡失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
});
