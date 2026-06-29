# 学习打卡小程序 - 第二次课云开发升级 - 验证清单

## 数据库验证

- [ ] **Checkpoint 1**: `studyRecords` 集合分页索引正确
  - 存在 `checkInTime` 字段的降序索引（名称：`idx_checkintime_desc`）
  - 验证方式：云开发控制台 -> 数据库 -> studyRecords -> 索引管理

## 云函数验证

- [ ] **Checkpoint 2**: `studyFunctions` 云函数新 action 部署成功
  - `getAllRecords`、`updateRecord`、`searchRecords` 三个 action 已注册到 switch 分支
  - 云函数部署无报错
  - 验证方式：右键 studyFunctions -> 创建并部署 -> 云端安装依赖，控制台无红色报错

- [ ] **Checkpoint 3**: `getAllRecords` 功能正确
  - 返回结构为 `{ list, total, hasMore }`
  - 列表项包含关联的计划名称、科目、颜色
  - 分页正确：page=1 返回前 pageSize 条，page=2 返回下一页
  - 只能返回当前 openid 的数据
  - 验证方式：在微信开发者工具云函数测试界面调用，或使用小程序真机调试查看 Network

- [ ] **Checkpoint 4**: `updateRecord` 功能正确
  - 能成功更新 minutes、note、date 字段
  - 无法更新其他 openid 创建的记录（返回权限错误）
  - 更新后 userStats 统计数据同步刷新
  - 验证方式：编辑一条记录，刷新首页/统计页查看数据是否同步

- [ ] **Checkpoint 5**: `searchRecords` 功能正确
  - 支持 startDate + endDate 范围筛选
  - 支持 subject 筛选
  - 支持 planId 筛选
  - 支持 keyword 模糊匹配 note 字段
  - 支持多条件组合（AND 关系）
  - 分页参数正确
  - 验证方式：在记录列表页使用各筛选条件，对比结果与数据库数据

## 客户端服务层验证

- [x] **Checkpoint 6**: `studyService.js` 方法封装完整
  - 新增 `getAllRecords(page, pageSize)` 方法
  - 新增 `updateRecord(id, data)` 方法
  - 新增 `searchRecords(filters)` 方法
  - 所有方法错误处理统一，失败时抛出异常
  - 验证方式：检查 `utils/studyService.js` 代码

## 页面功能验证

- [x] **Checkpoint 7**: 记录列表页（records/index）功能正常
  - 首次进入自动加载第一页数据
  - 每条记录卡片显示：日期、计划名称、科目、时长、笔记摘要
  - 下拉刷新重新加载并清空旧列表
  - 滚动到底部自动加载下一页，数据追加
  - 无数据时显示空状态提示
  - 加载中有 loading 提示
  - 点击"删除"有二次确认，删除后列表移除该项
  - 点击"编辑"跳转到 recordEdit 页
  - 验证方式：手动操作页面，构造 25+ 条数据测试分页

- [x] **Checkpoint 8**: 记录编辑页（recordEdit/index）功能正常
  - 进入页面正确回显原记录的日期、时长、笔记
  - 日期 picker 可修改
  - 时长输入限制 1-1440
  - 笔记 textarea 正常输入
  - 提交后返回列表页并刷新
  - 验证方式：编辑一条记录，检查列表页和首页数据是否同步更新

- [x] **Checkpoint 9**: 筛选与搜索功能正常
  - 日期范围筛选生效
  - 科目筛选生效
  - 计划筛选生效
  - 关键词搜索生效
  - 点击"清空"恢复全部记录
  - 筛选后分页仍然正确
  - 验证方式：分别测试单条件和组合条件筛选

- [x] **Checkpoint 10**: 统计汇总显示正确
  - 顶部统计卡片显示：记录总数、总学习时长、平均每次时长
  - 筛选后统计数据同步更新
  - 无记录时显示 0
  - 验证方式：对比列表数据手动计算统计值

- [x] **Checkpoint 11**: 首页入口正常
  - 首页有"查看全部记录"入口按钮/链接
  - 点击后正确跳转到 `pages/records/index`
  - 验证方式：手动点击测试

- [x] **Checkpoint 12**: app.json 配置正确
  - pages 数组包含 `"pages/records/index"` 和 `"pages/recordEdit/index"`
  - 页面路由无 404
  - 验证方式：检查 app.json，点击各页面导航测试

## 数据跨设备验证

- [ ] **Checkpoint 13**: 数据换设备不丢失
  - 使用同一微信账号，在开发者工具模拟器和真机（或两个不同模拟器）上登录
  - 在 A 设备添加/编辑/删除记录
  - 在 B 设备打开记录列表，数据与 A 设备完全一致
  - 验证方式：双设备对比测试

## 性能与体验验证

- [ ] **Checkpoint 14**: 分页加载性能达标
  - 每页 20 条，分页查询响应时间 < 500ms
  - 快速滚动无卡顿
  - 验证方式：开发者工具 Network 面板观察云函数调用耗时

- [ ] **Checkpoint 15**: 空状态与异常处理友好
  - 无记录时列表页显示空状态插画/提示
  - 网络异常时有 Toast 提示
  - 云函数报错时页面不白屏
  - 验证方式：断开网络测试，清空数据测试

## 代码规范验证

- [ ] **Checkpoint 16**: 代码规范符合要求
  - 变量/函数使用 camelCase
  - 无 hardcode 密钥或敏感信息
  - 错误处理完善，无空 catch 块
  - 数据库操作全部走云函数，小程序端无直接 `wx.cloud.database()` 调用
  - 验证方式：代码审查
