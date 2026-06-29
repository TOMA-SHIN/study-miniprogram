# Checklist - 音乐记录云存储升级验收清单

## 一、数据库集合

- [ ] `user_records` 集合已在云开发控制台创建
- [ ] 集合权限设置为"仅创建者可读写"
- [ ] `_openid` 升序非唯一索引已创建
- [ ] `createTime` 降序非唯一索引已创建
- [ ] `category` 升序非唯一索引已创建
- [ ] `_openid` 升序 + `createTime` 降序复合索引已创建

## 二、云函数

- [x] `cloudfunctions/recordFunctions/package.json` 存在且依赖 `wx-server-sdk`
- [x] `cloudfunctions/recordFunctions/config.json` 存在
- [x] `cloudfunctions/recordFunctions/index.js` 存在且实现入口分发
- [x] 实现 `addRecord` action
- [x] 实现 `getRecords` action
- [x] 实现 `updateRecord` action
- [x] 实现 `deleteRecord` action
- [x] 实现 `searchRecords` action
- [x] 实现 `getStatistics` action
- [ ] 云函数已在微信开发者工具中上传并部署成功

## 三、前端服务

- [x] `miniprogram/utils/recordService.js` 存在
- [x] 封装统一调用 `recordFunctions` 的方法
- [x] 导出增删改查、搜索、统计接口

## 四、页面文件

- [x] `pages/records/list/index.js` 存在
- [x] `pages/records/list/index.json` 存在
- [x] `pages/records/list/index.wxml` 存在
- [x] `pages/records/list/index.wxss` 存在
- [x] `pages/records/add/index.js` 存在
- [x] `pages/records/add/index.json` 存在
- [x] `pages/records/add/index.wxml` 存在
- [x] `pages/records/add/index.wxss` 存在
- [x] `pages/records/edit/index.js` 存在（可选）
- [x] `pages/records/edit/index.json` 存在（可选）
- [x] `pages/records/edit/index.wxml` 存在（可选）
- [x] `pages/records/edit/index.wxss` 存在（可选）

## 五、tabBar 与导航

- [x] `app.json` 中 `pages` 数组包含 `pages/records/list/index`
- [x] `app.json` 中 `tabBar.list` 包含"记录"项
- [x] tabBar 图标文件存在或已复用现有图标
- [x] 列表页能正常跳转到添加页
- [x] 列表页能正常跳转到编辑页（可选）

## 六、功能验收（必须项）

- [ ] 添加页有表单，用户能输入内容并提交
- [ ] 提交后数据真实写入云数据库 `user_records` 集合
- [ ] 列表页能从云数据库读取并展示所有记录
- [ ] 换设备登录后记录数据仍然存在
- [ ] 页面之间能正常跳转，控制台无报错

## 七、功能验收（加分项）

- [x] 支持删除已有记录
- [x] 支持编辑已有记录
- [x] 支持按分类筛选记录
- [x] 支持按关键词搜索记录
- [x] 列表页顶部展示统计信息（总记录数、分类数量等）

## 八、代码质量

- [x] 函数职责单一，无超长函数
- [x] 命名规范：变量/函数 camelCase，页面/组件文件小写
- [x] 无空 `catch {}` 静默吞错
- [x] 无硬编码密钥或敏感信息
- [x] 云函数中包含必要的参数校验与权限校验
