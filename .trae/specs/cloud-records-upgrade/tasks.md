# Tasks - 音乐记录云存储升级任务清单

## 阶段一：数据库与云函数准备

- [ ] Task 1: 创建数据库集合与索引
  - [ ] SubTask 1.1: 在微信开发者工具云开发控制台创建 `user_records` 集合
  - [ ] SubTask 1.2: 设置集合权限为"仅创建者可读写"
  - [ ] SubTask 1.3: 创建 `_openid` 升序非唯一索引
  - [ ] SubTask 1.4: 创建 `createTime` 降序非唯一索引
  - [ ] SubTask 1.5: 创建 `category` 升序非唯一索引
  - [ ] SubTask 1.6: 创建 `_openid` 升序 + `createTime` 降序复合非唯一索引

- [ ] Task 2: 创建并部署记录业务云函数
  - [x] SubTask 2.1: 创建 `cloudfunctions/recordFunctions/package.json`
  - [x] SubTask 2.2: 创建 `cloudfunctions/recordFunctions/config.json`
  - [x] SubTask 2.3: 实现 `addRecord` action：校验参数并写入 `user_records`
  - [x] SubTask 2.4: 实现 `getRecords` action：按用户 openid 分页查询
  - [x] SubTask 2.5: 实现 `updateRecord` action：校验权限并更新记录
  - [x] SubTask 2.6: 实现 `deleteRecord` action：校验权限并删除记录
  - [x] SubTask 2.7: 实现 `searchRecords` action：按关键词/分类搜索
  - [x] SubTask 2.8: 实现 `getStatistics` action：统计用户记录数与分类分布
  - [ ] SubTask 2.9: 在微信开发者工具中右键上传并部署 `recordFunctions`（云端安装依赖）

## 阶段二：前端页面开发

- [x] Task 3: 开发记录列表页 `pages/records/list/`
  - [x] SubTask 3.1: 创建 `index.js`：加载记录、下拉刷新、上拉加载、删除操作
  - [x] SubTask 3.2: 创建 `index.json`：配置页面标题与组件
  - [x] SubTask 3.3: 创建 `index.wxml`：统计卡片、筛选搜索、记录列表、空状态
  - [x] SubTask 3.4: 创建 `index.wxss`：列表页样式
  - [x] SubTask 3.5: 实现跳转到添加页、编辑页的逻辑

- [x] Task 4: 开发记录添加页 `pages/records/add/`
  - [x] SubTask 4.1: 创建 `index.js`：表单数据绑定与提交
  - [x] SubTask 4.2: 创建 `index.json`：配置页面标题
  - [x] SubTask 4.3: 创建 `index.wxml`：标题输入、内容输入、分类选择、心情选择、提交按钮
  - [x] SubTask 4.4: 创建 `index.wxss`：表单页样式
  - [x] SubTask 4.5: 实现表单校验（标题、内容非空）与提交反馈

- [x] Task 5（可选）: 开发记录编辑页 `pages/records/edit/`
  - [x] SubTask 5.1: 创建 `index.js`：接收 recordId 参数、回显数据、更新提交
  - [x] SubTask 5.2: 创建 `index.json`
  - [x] SubTask 5.3: 创建 `index.wxml`
  - [x] SubTask 5.4: 创建 `index.wxss`

- [x] Task 6: 改造 `app.json` 集成 tabBar 入口
  - [x] SubTask 6.1: 在 `pages` 数组中添加 `pages/records/list/index`
  - [x] SubTask 6.2: 在 `tabBar.list` 中添加"记录"项
  - [x] SubTask 6.3: 准备或复用 tabBar 图标文件

## 阶段三：工具函数与联调

- [x] Task 7: 创建前端记录服务 `miniprogram/utils/recordService.js`
  - [x] SubTask 7.1: 封装 `callRecordFunction` 统一调用 `recordFunctions`
  - [x] SubTask 7.2: 导出 `addRecord`、`getRecords`、`updateRecord`、`deleteRecord`、`searchRecords`、`getStatistics`

- [ ] Task 8: 功能联调与测试
  - [ ] SubTask 8.1: 测试添加记录后能在云开发控制台看到真实数据
  - [ ] SubTask 8.2: 测试列表页能正确展示记录
  - [ ] SubTask 8.3: 测试下拉刷新与上拉加载
  - [ ] SubTask 8.4: 测试换设备登录数据不丢失
  - [ ] SubTask 8.5: 测试删除/编辑记录
  - [ ] SubTask 8.6: 测试搜索筛选与统计展示
  - [ ] SubTask 8.7: 测试 tabBar 切换与页面跳转无报错

## Task Dependencies

- Task 2 依赖 Task 1
- Task 3、4、5 依赖 Task 2 和 Task 7
- Task 6 可与 Task 3 并行
- Task 7 可与 Task 2 并行
- Task 8 依赖 Task 3、4、5、6、7 全部完成

## 并行开发建议

1. **并行组 1**：Task 1（数据库准备）+ Task 2（云函数开发）+ Task 7（前端服务封装）
2. **并行组 2**：Task 3（列表页）+ Task 4（添加页）+ Task 6（tabBar 改造）
3. **串行**：Task 5（编辑页）在 Task 4 完成后进行
4. **最后**：Task 8（联调测试）
