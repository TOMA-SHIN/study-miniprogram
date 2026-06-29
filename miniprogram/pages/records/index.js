const studyService = require('../../utils/studyService');

Page({
  data: {
    records: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
    subjects: [],
    plans: [],
    date: '',
    subjectIndex: -1,
    planIndex: -1,
    keyword: '',
    isFiltering: false,
    totalRecords: 0,
    totalMinutes: 0,
    avgMinutes: 0,
    isDarkMode: false,
  },

  onLoad() {
    this.loadSubjects();
    this.loadPlans();
    this.loadRecords(true);
  },

  onShow() {
    const app = getApp();
    this.setData({ isDarkMode: app.globalData.isDarkMode });
  },

  onPullDownRefresh() {
    this.loadRecords(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadRecords(false);
    }
  },

  async loadRecords(reset = false) {
    if (reset) {
      this.setData({ page: 1, records: [] });
    }
    this.setData({ loading: true });
    try {
      const { page, pageSize, isFiltering, date, subjectIndex, planIndex, keyword, subjects, plans } = this.data;
      let res;
      if (isFiltering) {
        const subject = subjectIndex >= 0 ? subjects[subjectIndex]?.name : undefined;
        const planId = planIndex >= 0 ? plans[planIndex]?._id : undefined;
        res = await studyService.searchRecords({ date, subject, planId, keyword, page, pageSize });
      } else {
        res = await studyService.getAllRecords(page, pageSize);
      }
      const mergedRecords = [...this.data.records, ...res.list];
      const recordsWithImage = await this.loadImageUrls(mergedRecords);
      this.setData({
        records: recordsWithImage,
        hasMore: res.hasMore,
        page: page + 1,
      });
      this.computeStats();
    } catch (error) {
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  computeStats() {
    const records = this.data.records;
    const totalRecords = records.length;
    const totalMinutes = records.reduce((sum, r) => sum + (r.minutes || 0), 0);
    const avgMinutes = totalRecords > 0 ? Math.round(totalMinutes / totalRecords) : 0;
    this.setData({ totalRecords, totalMinutes, avgMinutes });
  },

  deleteRecord(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该记录吗？',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await studyService.deleteRecord(id);
          const records = this.data.records.filter((r) => r._id !== id);
          this.setData({ records });
          this.computeStats();
          wx.showToast({ title: '删除成功', icon: 'success' });
        } catch (error) {
          wx.showToast({ title: error.message || '删除失败', icon: 'none' });
        }
      },
    });
  },

  goEdit(e) {
    const record = e.currentTarget.dataset.record;
    wx.navigateTo({
      url: `/pages/recordEdit/index?record=${encodeURIComponent(JSON.stringify(record))}`,
    });
  },

  async loadImageUrls(records) {
    const fileIDs = records.filter(r => r.imageFileID).map(r => r.imageFileID);
    if (fileIDs.length === 0) return records;
    try {
      const result = await studyService.getImageUrl(fileIDs);
      const urlMap = {};
      (result.fileList || []).forEach(item => {
        urlMap[item.fileID] = item.tempFileURL;
      });
      return records.map(r => ({
        ...r,
        imageUrl: r.imageFileID ? urlMap[r.imageFileID] || '' : '',
      }));
    } catch (error) {
      console.error('加载图片链接失败:', error);
      return records;
    }
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({ urls: [url], current: url });
  },

  async loadSubjects() {
    try {
      const subjects = await studyService.getSubjects();
      let list = subjects || [];
      // 兼容错误导入的嵌套格式 { subjects: [...] }
      if (list.length === 1 && list[0].subjects && Array.isArray(list[0].subjects)) {
        list = list[0].subjects;
      }
      this.setData({ subjects: list });
    } catch (error) {
      wx.showToast({ title: error.message || '加载科目失败', icon: 'none' });
    }
  },

  async loadPlans() {
    try {
      const plans = await studyService.getPlans();
      this.setData({ plans });
    } catch (error) {
      wx.showToast({ title: error.message || '加载计划失败', icon: 'none' });
    }
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value });
  },

  onSubjectChange(e) {
    this.setData({ subjectIndex: e.detail.value });
  },

  onPlanChange(e) {
    this.setData({ planIndex: e.detail.value });
  },

  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  applyFilter() {
    this.setData({ isFiltering: true });
    this.loadRecords(true);
  },

  clearFilter() {
    this.setData({
      date: '',
      subjectIndex: -1,
      planIndex: -1,
      keyword: '',      isFiltering: false,
    });
    this.loadRecords(true);
  },
});
