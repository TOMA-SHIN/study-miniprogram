# 学习打卡小程序 - 第二次课云开发升级 - 实现计划

## Task 1: 补充云数据库索引
- **Priority**: high
- **Depends On**: None
- **Description**:
  在 `studyRecords` 集合中补充或确认 `checkInTime` 降序索引，支撑分页查询性能。
- **Acceptance Criteria Addressed**: 全量打卡记录列表展示能力
- **Test Requirements**:
  - `programmatic` TR-1.1: `studyRecords` 集合存在 `checkInTime` 字段的降序索引
  - `programmatic` TR-1.2: 索引创建后，分页查询云函数响应时间 < 500ms
- **Steps**:
  1. 打开微信开发者工具 -> 云开发控制台 -> 数据库 -> studyRecords 集合
  2. 进入"索引管理"
  3. 若已有 `idx_checkintime` 为升序，删除后重建为降序；若没有则新建
  4. 索引名称：`idx_checkintime_desc`，字段：`checkInTime`，排序：降序，属性：非唯一

## Task 2: 扩展云函数 API
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  在现有 `cloudfunctions/studyFunctions/index.js` 中新增 `getAllRecords`、`updateRecord`、`searchRecords` 三个 action。
- **Acceptance Criteria Addressed**: 全量打卡记录列表展示能力、记录编辑能力、记录筛选与搜索能力
- **Test Requirements**:
  - `programmatic` TR-2.1: `getAllRecords` 返回 `{ list, total, hasMore }`，list 中包含关联的计划名称和科目
  - `programmatic` TR-2.2: `updateRecord` 只能更新当前 openid 的数据，更新失败返回错误
  - `programmatic` TR-2.3: `searchRecords` 支持所有筛选条件组合，keyword 支持模糊匹配
  - `programmatic` TR-2.4: 分页逻辑正确，page=1 返回前 20 条，page=2 返回第 21-40 条
- **Steps**:
  1. 在 index.js 中新增 `getAllRecords` 函数：按 checkInTime 降序分页查询，关联 studyPlans 补全 planName/subject/color
  2. 在 index.js 中新增 `updateRecord` 函数：校验 openid，更新指定字段，成功后重新计算 userStats
  3. 在 index.js 中新增 `searchRecords` 函数：动态构造 where 条件（keyword 用 db.RegExp），分页返回
  4. 在 exports.main 的 switch 中注册 3 个新 action
  5. 右键 studyFunctions 目录 -> 创建并部署：云端安装依赖

## Task 3: 更新客户端服务层 studyService.js
- **Priority**: high
- **Depends On**: Task 2
- **Description**:
  在 `miniprogram/utils/studyService.js` 中新增对应云函数的封装方法。
- **Acceptance Criteria Addressed**: 全量打卡记录列表展示能力、记录编辑能力、记录筛选与搜索能力
- **Test Requirements**:
  - `programmatic` TR-3.1: `getAllRecords(page, pageSize)` 正确调用云函数并返回数据
  - `programmatic` TR-3.2: `updateRecord(id, data)` 正确调用云函数
  - `programmatic` TR-3.3: `searchRecords(filters)` 正确将筛选条件传递给云函数
- **Steps**:
  1. 新增 `getAllRecords(page = 1, pageSize = 20)` 方法
  2. 新增 `updateRecord(id, data)` 方法
  3. 新增 `searchRecords(filters)` 方法
  4. 更新 module.exports 导出列表

## Task 4: 创建全量打卡记录列表页（pages/records/index）
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  创建全新的记录列表页面，展示从云数据库读取的全部打卡记录，支持分页、下拉刷新、上拉加载。
- **Acceptance Criteria Addressed**: 全量打卡记录列表展示能力、记录删除能力
- **Test Requirements**:
  - `human-judgment` TR-4.1: 页面布局清晰，记录卡片信息完整（日期、计划名、科目、时长、笔记）
  - `programmatic` TR-4.2: 首次进入加载第一页数据并渲染
  - `programmatic` TR-4.3: 下拉刷新重新加载第一页
  - `programmatic` TR-4.4: 滚动到底部自动加载下一页，数据追加到列表
  - `programmatic` TR-4.5: 点击"删除"弹出确认框，确认后调用 deleteRecord 并移除列表项
- **Steps**:
  1. 创建 `pages/records/` 目录和 4 个页面文件（index.js, index.json, index.wxml, index.wxss）
  2. 编写 index.js：data 定义（records, page, pageSize, hasMore, loading），onLoad 加载第一页，onPullDownRefresh 刷新，onReachBottom 加载更多，deleteRecord 处理
  3. 编写 index.wxml：顶部统计汇总卡片 + 筛选栏占位 + 记录列表 + 底部加载状态 + 空状态提示
  4. 编写 index.wxss：卡片样式、列表样式、加载状态样式
  5. 在 app.json 中注册 `pages/records/index` 页面

## Task 5: 创建记录编辑页（pages/recordEdit/index）
- **Priority**: medium
- **Depends On**: Task 3
- **Description**:
  创建记录编辑页面，允许用户修改打卡记录的时长、笔记和日期。
- **Acceptance Criteria Addressed**: 记录编辑能力
- **Test Requirements**:
  - `programmatic` TR-5.1: 进入编辑页时正确回显记录数据（通过页面参数传入 record id）
  - `programmatic` TR-5.2: 时长输入限制 1-1440，空值或超范围有 Toast 提示
  - `programmatic` TR-5.3: 提交后调用 updateRecord，成功返回列表页并刷新
- **Steps**:
  1. 创建 `pages/recordEdit/` 目录和 4 个页面文件
  2. 编写 index.js：onLoad 接收 record 参数并回显，表单校验，提交调用 studyService.updateRecord
  3. 编写 index.wxml：日期选择器、时长输入、笔记文本域、保存按钮
  4. 编写 index.wxss：表单样式
  5. 在 app.json 中注册 `pages/recordEdit/index` 页面

## Task 6: 为记录列表页添加筛选与搜索功能
- **Priority**: medium
- **Depends On**: Task 4, Task 5
- **Description**:
  在记录列表页顶部增加筛选栏，支持按日期范围、科目、计划筛选，支持按笔记关键词搜索。
- **Acceptance Criteria Addressed**: 记录筛选与搜索能力
- **Test Requirements**:
  - `programmatic` TR-6.1: 选择日期范围后列表只展示范围内记录
  - `programmatic` TR-6.2: 选择科目后列表只展示该科目记录
  - `programmatic` TR-6.3: 输入关键词后列表只展示笔记匹配的记录
  - `programmatic` TR-6.4: 点击"清空"恢复展示全部记录
  - `human-judgment` TR-6.5: 筛选栏 UI 简洁，操作直观
- **Steps**:
  1. 在 records/index.js 中添加筛选条件 data（startDate, endDate, subject, planId, keyword）
  2. 加载 plans 和 subjects 数据用于筛选选项
  3. 编写筛选 UI：日期范围 picker、科目 picker、计划 picker、搜索 input、清空按钮
  4. 筛选条件变化时调用 searchRecords 并重新渲染列表

## Task 7: 为记录列表页添加统计汇总
- **Priority**: medium
- **Depends On**: Task 4
- **Description**:
  在记录列表页顶部展示当前列表（或当前筛选范围）的统计信息。
- **Acceptance Criteria Addressed**: 记录统计汇总展示
- **Test Requirements**:
  - `programmatic` TR-7.1: 统计卡片显示记录总数、总时长、平均时长
  - `programmatic` TR-7.2: 切换筛选条件后统计数据同步更新
- **Steps**:
  1. 在 records/index.js 中添加计算统计的方法（遍历当前 records 数组）
  2. 在 index.wxml 顶部添加统计卡片：总记录数、总时长、平均时长
  3. 每次加载/刷新/筛选数据后重新计算并更新统计

## Task 8: 改造首页增加记录列表入口
- **Priority**: high
- **Depends On**: Task 4
- **Description**:
  在首页（pages/index/index）增加"查看全部记录"按钮/链接，引导用户进入记录列表页。
- **Acceptance Criteria Addressed**: 首页导航
- **Test Requirements**:
  - `human-judgment` TR-8.1: 首页有显眼的"查看全部记录"入口
  - `programmatic` TR-8.2: 点击后正确跳转到 pages/records/index
- **Steps**:
  1. 修改 pages/index/index.wxml：在"今日打卡记录"区域下方或合适位置添加"查看全部记录 >"入口
  2. 修改 pages/index/index.js：添加 goRecords 方法，使用 wx.navigateTo 跳转

## Task 9: 更新 app.json 全局配置
- **Priority**: high
- **Depends On**: Task 4, Task 5
- **Description**:
  在 app.json 中注册新页面，并确保导航栏标题等全局配置正确。
- **Acceptance Criteria Addressed**: 全局配置
- **Test Requirements**:
  - `programmatic` TR-9.1: app.json 中 pages 数组包含 records 和 recordEdit 路径
  - `programmatic` TR-9.2: 各页面能正常访问，无 404
- **Steps**:
  1. 在 app.json 的 pages 数组末尾添加 `"pages/records/index"` 和 `"pages/recordEdit/index"`

## [x] Task 10: 端到端联调与测试
- **Priority**: high
- **Depends On**: Task 2, Task 3, Task 4, Task 5, Task 6, Task 7, Task 8, Task 9
- **Description**:
  完整测试记录列表、编辑、删除、筛选、统计的全部流程，验证数据跨设备一致性。
- **Acceptance Criteria Addressed**: 全部
- **Test Requirements**:
  - `programmatic` TR-10.1: 完整流程：打卡 -> 首页查看 -> 进入全部记录列表 -> 编辑记录 -> 筛选记录 -> 删除记录，数据一致
  - `programmatic` TR-10.2: 换设备登录同一微信账号，记录列表数据完全一致
  - `programmatic` TR-10.3: 分页加载 50 条以上数据时无重复、无遗漏
  - `programmatic` TR-10.4: 无网络时给出明确 Toast 提示
  - `human-judgment` TR-10.5: 整体 UI 体验流畅，无明显的布局错乱或加载问题
- **Steps**:
  1. 构造 25+ 条测试数据，验证分页加载
  2. 测试编辑后统计是否正确更新
  3. 测试删除后列表和统计是否正确更新
  4. 测试各筛选条件组合
  5. 在开发者工具切换不同设备模拟器，验证数据一致性

---

## 任务依赖图

```
Task 1 (数据库索引)
    |
    v
Task 2 (云函数扩展) ---> Task 3 (客户端服务层)
    |                          |
    |                          v
    |                   Task 4 (记录列表页) ---> Task 6 (筛选搜索)
    |                          |                  |
    |                          v                  v
    |                   Task 7 (统计汇总) <------ Task 6
    |                          |
    |                          v
    |                   Task 8 (首页入口)
    |                          |
    |                          v
    |                   Task 9 (app.json)
    |                          |
    +------------------------->|
                               v
                         Task 5 (编辑页)
                               |
                               v
                        Task 10 (联调测试)
```
