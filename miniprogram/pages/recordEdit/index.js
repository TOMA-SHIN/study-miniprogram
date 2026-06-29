const studyService = require('../../utils/studyService');

Page({
  data: {
    id: '',
    date: '',
    minutes: '',
    note: '',
    planName: '',
    loading: false,
    imageFileID: '',
    imageTempUrl: '',
    uploadingImage: false,
    isDarkMode: false,
  },

  onLoad(options) {
    const app = getApp();
    this.setData({ isDarkMode: app.globalData.isDarkMode });
    const record = JSON.parse(decodeURIComponent(options.record));
    this.setData({
      id: record._id,
      date: record.date,
      minutes: String(record.minutes),
      note: record.note,
      planName: record.planName,
      imageFileID: record.imageFileID || '',
    });
    if (record.imageFileID) {
      this.loadImageUrl(record.imageFileID);
    }
  },

  async loadImageUrl(fileID) {
    try {
      const result = await studyService.getImageUrl([fileID]);
      const fileList = result.fileList || [];
      if (fileList.length > 0) {
        this.setData({ imageTempUrl: fileList[0].tempFileURL });
      }
    } catch (error) {
      console.error('加载图片链接失败:', error);
    }
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value });
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

  async submit() {
    const { id, date, minutes, note, imageFileID } = this.data;
    const num = Number(minutes);
    if (Number.isNaN(num) || num < 1 || num > 1440) {
      wx.showToast({ title: '时长需在 1-1440 分钟之间', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    try {
      await studyService.updateRecord(id, { minutes: num, note, date, imageFileID });
      wx.showToast({ title: '保存成功', icon: 'success' });
      wx.navigateBack();
    } catch (err) {
      wx.showToast({ title: err.message || '保存失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  }
});
