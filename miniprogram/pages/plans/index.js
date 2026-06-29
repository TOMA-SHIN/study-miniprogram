const studyService = require('../../utils/studyService');

function computeStatus(startDate, endDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    if (today > end) {
      return { status: 'ended', statusText: '已结束' };
    }
  }

  if (today < start) {
    return { status: 'notstarted', statusText: '未开始' };
  }

  return { status: 'ongoing', statusText: '进行中' };
}

Page({
  data: {
    plans: [],
    loading: false,
    isDarkMode: false,
  },

  onShow() {
    this.loadPlans();
    const app = getApp();
    this.setData({ isDarkMode: app.globalData.isDarkMode });
  },

  async loadPlans() {
    this.setData({ loading: true });
    try {
      const plans = await studyService.getPlans();
      const enriched = plans.map(plan => {
        const { status, statusText } = computeStatus(plan.startDate, plan.endDate);
        return { ...plan, status, statusText };
      });
      this.setData({ plans: enriched });
    } catch (error) {
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  goAdd() {
    wx.navigateTo({ url: '/pages/planForm/planForm' });
  },

  goEdit(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/planForm/planForm?id=${id}` });
  },

  doDelete(event) {
    const id = event.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该学习计划吗？',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await studyService.deletePlan(id);
          wx.showToast({ title: '删除成功', icon: 'success' });
          this.loadPlans();
        } catch (error) {
          wx.showToast({ title: error.message || '删除失败', icon: 'none' });
        }
      },
    });
  },
});
