const studyService = require('../../utils/studyService');

const COLOR_OPTIONS = [
  '#4CAF50',
  '#2196F3',
  '#FF9800',
  '#9C27B0',
  '#F44336',
  '#00BCD4',
  '#795548',
];

Page({
  data: {
    name: '',
    subjectIndex: -1,
    subjects: [],
    targetMinutes: '',
    color: COLOR_OPTIONS[0],
    startDate: '',
    endDate: '',
    isEdit: false,
    id: '',
    colorOptions: COLOR_OPTIONS,
  },

  async onLoad(options) {
    await this.loadSubjects();
    if (options.id) {
      this.setData({ isEdit: true, id: options.id });
      wx.setNavigationBarTitle({ title: '编辑计划' });
      await this.loadPlan(options.id);
    } else {
      wx.setNavigationBarTitle({ title: '新建计划' });
    }
  },

  async loadSubjects() {
    try {
      const subjects = await studyService.getSubjects();
      console.log('[planForm] subjects raw:', JSON.stringify(subjects));
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

  async loadPlan(id) {
    try {
      const plans = await studyService.getPlans();
      const plan = plans.find(p => p._id === id);
      if (!plan) {
        wx.showToast({ title: '计划不存在', icon: 'none' });
        return;
      }
      const subjectIndex = this.data.subjects.findIndex(s => s.name === plan.subject);
      this.setData({
        name: plan.name || '',
        subjectIndex: subjectIndex > -1 ? subjectIndex : -1,
        targetMinutes: plan.targetMinutes ? String(plan.targetMinutes) : '',
        color: plan.color || COLOR_OPTIONS[0],
        startDate: plan.startDate || '',
        endDate: plan.endDate || '',
      });
    } catch (error) {
      wx.showToast({ title: error.message || '加载计划失败', icon: 'none' });
    }
  },

  onNameInput(event) {
    this.setData({ name: event.detail.value });
  },

  onSubjectChange(event) {
    this.setData({ subjectIndex: Number(event.detail.value) });
  },

  onMinutesInput(event) {
    this.setData({ targetMinutes: event.detail.value });
  },

  onColorSelect(event) {
    this.setData({ color: event.currentTarget.dataset.color });
  },

  onStartDateChange(event) {
    this.setData({ startDate: event.detail.value });
  },

  onEndDateChange(event) {
    this.setData({ endDate: event.detail.value });
  },

  validateForm() {
    if (!this.data.name.trim()) {
      wx.showToast({ title: '请输入计划名称', icon: 'none' });
      return false;
    }
    return true;
  },

  buildPlanData() {
    const { subjects, subjectIndex, name, targetMinutes, color, startDate, endDate } = this.data;
    return {
      name: name.trim(),
      subject: subjects[subjectIndex]?.name || '',
      targetMinutes: Number(targetMinutes) || 0,
      color,
      startDate,
      endDate: endDate || null,
    };
  },

  async submit() {
    if (!this.validateForm()) return;
    const data = this.buildPlanData();
    try {
      if (this.data.isEdit) {
        await studyService.updatePlan(this.data.id, data);
      } else {
        await studyService.addPlan(data);
      }
      wx.showToast({ title: '保存成功', icon: 'success' });
      wx.navigateBack();
    } catch (error) {
      wx.showToast({ title: error.message || '保存失败', icon: 'none' });
    }
  },
});
