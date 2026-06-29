const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const COLLECTION = 'todos';

function getOpenId() {
  const { OPENID } = cloud.getWXContext();
  return OPENID;
}

function createTodoData(todo, openId) {
  const now = new Date().toISOString();
  return {
    _openid: openId,
    title: todo.title.trim(),
    category: todo.category || '其他',
    priority: todo.priority || 'medium',
    dueDate: todo.dueDate || '',
    completed: false,
    completedAt: null,
    createTime: now,
    updateTime: now,
  };
}

async function addTodo(event) {
  const openId = getOpenId();
  const todo = event.todo || {};
  if (!todo.title || !todo.title.trim()) {
    return { success: false, message: '待办内容不能为空' };
  }
  const data = createTodoData(todo, openId);
  const result = await db.collection(COLLECTION).add({ data });
  return { success: true, data: { _id: result._id } };
}

async function getTodos() {
  const openId = getOpenId();
  const result = await db.collection(COLLECTION)
    .where({ _openid: openId })
    .orderBy('createTime', 'desc')
    .get();
  return { success: true, data: result.data };
}

async function updateTodo(event) {
  const openId = getOpenId();
  const { id, data } = event;
  if (!id) {
    return { success: false, message: '缺少待办ID' };
  }
  const updateData = { ...data, updateTime: new Date().toISOString() };
  await db.collection(COLLECTION)
    .where({ _openid: openId, _id: id })
    .update({ data: updateData });
  return { success: true };
}

async function deleteTodo(event) {
  const openId = getOpenId();
  const { id } = event;
  if (!id) {
    return { success: false, message: '缺少待办ID' };
  }
  await db.collection(COLLECTION)
    .where({ _openid: openId, _id: id })
    .remove();
  return { success: true };
}

function calculateCompletionRate(todos) {
  if (todos.length === 0) return 0;
  const completedCount = todos.filter((item) => item.completed).length;
  return Math.round((completedCount / todos.length) * 100);
}

function buildCategoryStats(todos) {
  const groups = {};
  todos.forEach((todo) => {
    if (!groups[todo.category]) {
      groups[todo.category] = { total: 0, completed: 0 };
    }
    groups[todo.category].total += 1;
    if (todo.completed) groups[todo.category].completed += 1;
  });
  return Object.keys(groups).map((category) => ({
    category,
    total: groups[category].total,
    completed: groups[category].completed,
    rate: Math.round((groups[category].completed / groups[category].total) * 100),
  }));
}

async function getStats() {
  const openId = getOpenId();
  const result = await db.collection(COLLECTION)
    .where({ _openid: openId })
    .orderBy('completedAt', 'desc')
    .get();
  const todos = result.data;
  const completed = todos.filter((item) => item.completed);
  return {
    success: true,
    total: todos.length,
    completed: completed.length,
    completionRate: calculateCompletionRate(todos),
    categoryStats: buildCategoryStats(todos),
    recentCompleted: completed.slice(0, 5),
  };
}

exports.main = async (event) => {
  const { action } = event;
  try {
    switch (action) {
      case 'addTodo': return await addTodo(event);
      case 'getTodos': return await getTodos();
      case 'updateTodo': return await updateTodo(event);
      case 'deleteTodo': return await deleteTodo(event);
      case 'getStats': return await getStats();
      default: return { success: false, message: '未知操作' };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message || '服务器错误' };
  }
};
