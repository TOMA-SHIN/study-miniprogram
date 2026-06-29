async function callFunction(action, data) {
  try {
    const result = await wx.cloud.callFunction({
      name: 'todoFunctions',
      data: { action, ...data },
    });
    return result.result;
  } catch (error) {
    console.error(`todoFunctions ${action} failed:`, error);
    throw error;
  }
}

function addTodo(todo) {
  return callFunction('addTodo', { todo });
}

function getTodos() {
  return callFunction('getTodos');
}

function updateTodo(id, data) {
  return callFunction('updateTodo', { id, data });
}

function deleteTodo(id) {
  return callFunction('deleteTodo', { id });
}

function getStats() {
  return callFunction('getStats');
}

module.exports = {
  addTodo,
  getTodos,
  updateTodo,
  deleteTodo,
  getStats,
};
