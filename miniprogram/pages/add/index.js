const todoService = require('../../utils/todoService');

const CATEGORIES = ['学习', '工作', '生活', '健康', '其他'];
const PRIORITIES = ['high', 'medium', 'low'];

function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

Page({
  data: {
    title: '',
    categoryIndex: 0,
    priorityIndex: 1,
    dueDate: getTodayDate(),
    categories: CATEGORIES,
    priorities: PRIORITIES,
  },

  onTitleInput(event) {
    this.setData({ title: event.detail.value });
  },

  onCategoryChange(event) {
    this.setData({ categoryIndex: event.detail.value });
  },

  onPriorityChange(event) {
    this.setData({ priorityIndex: event.detail.value });
  },

  onDateChange(event) {
    this.setData({ dueDate: event.detail.value });
  },

  async submitTodo() {
    const { title, categoryIndex, priorityIndex, dueDate } = this.data;
    if (!title.trim()) {
      wx.showToast({ title: '请输入待办内容', icon: 'none' });
      return;
    }

    try {
      await todoService.addTodo({
        title: title.trim(),
        category: CATEGORIES[categoryIndex],
        priority: PRIORITIES[priorityIndex],
        dueDate,
      });
      wx.showToast({ title: '添加成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1000);
    } catch (error) {
      wx.showToast({ title: '添加失败', icon: 'none' });
    }
  },
});
