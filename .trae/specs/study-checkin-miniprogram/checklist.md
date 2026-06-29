# 学习打卡记录微信小程序 - 验证清单

## 数据库验证

- [ ] **Checkpoint 1**: 云数据库集合创建完成
  - 4个集合全部创建成功：studyPlans、studyRecords、userStats、subjects
  - 集合权限配置正确（仅创建者可读写，subjects为只读）
  - 验证方式：微信开发者工具 -> 云开发控制台 -> 数据库 -> 检查集合列表和权限设置

- [ ] **Checkpoint 2**: 数据库索引创建完成
  - studyPlans 集合有3个索引：idx_openid、idx_openid_active、idx_subject
  - studyRecords 集合有4个索引：idx_openid_date、idx_openid_plan、idx_date、idx_checkintime
  - userStats 集合有1个唯一索引：idx_openid
  - 验证方式：云开发控制台 -> 数据库 -> 各集合 -> 索引管理

- [ ] **Checkpoint 3**: 科目字典数据导入完成
  - subjects 集合包含默认13个科目数据
  - 数据字段完整：name、icon、sortOrder
  - 验证方式：云开发控制台 -> 数据库 -> subjects -> 检查数据

## 云函数验证

- [ ] **Checkpoint 4**: studyFunctions 云函数部署成功
  - 云函数目录结构正确：config.json、package.json、index.js
  - 可在微信开发者工具中成功部署
  - 验证方式：右键 studyFunctions 目录 -> 创建并部署：云端安装依赖 -> 无报错

- [ ] **Checkpoint 5**: 云函数 OpenID 获取正确
  - 任意action调用都能正确获取当前用户OpenID
  - 返回数据中包含正确的openid信息
  - 验证方式：在小程序端调用studyService.test()或在云函数测试界面测试

- [ ] **Checkpoint 6**: 计划管理API功能完整
  - addPlan: 能成功创建计划，参数校验正确（空名称拒绝）
  - getPlans: 只返回当前用户的计划
  - updatePlan: 能正确更新计划字段
  - deletePlan: 能正确删除指定计划
  - 验证方式：通过小程序页面操作或在开发者工具云函数测试界面调用

- [ ] **Checkpoint 7**: 打卡API功能完整
  - checkIn: 能保存打卡记录，返回streak和总时长
  - getTodayRecords: 返回今日所有打卡记录和总时长
  - getRecordsByRange: 返回指定日期范围内记录
  - deleteRecord: 删除记录后数据消失
  - 验证方式：通过打卡页面操作后检查数据库数据

- [ ] **Checkpoint 8**: 统计与日历API功能完整
  - getStats(today/week/month/all): 各维度统计数据正确
  - getCalendarData: 返回指定年月的每日学习时长汇总
  - 验证方式：对比数据库原始数据和接口返回数据

- [ ] **Checkpoint 9**: 连续打卡计算逻辑正确
  - 场景A：连续5天打卡，streak=5
  - 场景B：连续5天打卡，第6天不打卡，streak=0
  - 场景C：连续5天打卡，中断1天，第7天打卡，streak=1
  - 验证方式：构造测试数据，调用接口验证返回的streak值

- [ ] **Checkpoint 10**: 数据隔离有效
  - 用户A创建的计划和打卡记录，用户B无法查询到
  - 所有数据库操作都通过_openid过滤
  - 验证方式：使用两个不同微信账号测试

## 小程序端验证

- [ ] **Checkpoint 11**: studyService.js 封装完整
  - 所有云函数action都有对应的封装方法
  - 错误处理统一，调用失败会抛出异常
  - 验证方式：检查 utils/studyService.js 代码

- [ ] **Checkpoint 12**: 计划管理页（plans）功能正常
  - 页面能正确展示计划列表
  - 新建计划按钮跳转到planForm页
  - 计划卡片显示名称、科目、目标时长、状态标签
  - 左滑或长按可删除计划，有二次确认
  - 验证方式：手动操作页面

- [ ] **Checkpoint 13**: 计划表单页（planForm）功能正常
  - 表单包含：名称、科目picker、目标时长、颜色选择、开始/结束日期
  - 提交时校验必填项
  - 编辑模式能正确回显数据
  - 验证方式：新建计划和编辑计划各操作一次

- [ ] **Checkpoint 14**: 打卡页（checkin）功能正常
  - 计划选择器加载正常
  - 时长输入限制1-1440
  - 笔记输入限制500字
  - 选择计划后显示该计划今日已学时长
  - 打卡成功后返回首页，首页数据刷新
  - 验证方式：多次打卡测试

- [ ] **Checkpoint 15**: 首页（index）今日概览展示正确
  - 今日总时长计算准确
  - 连续打卡天数显示正确
  - 今日打卡记录列表渲染正确
  - 科目分布数据展示正确
  - 下拉刷新功能正常
  - 点击"快速打卡"跳转到checkin页
  - 验证方式：对比数据库数据和页面显示

- [ ] **Checkpoint 16**: 日历页（calendar）功能正常
  - 月历渲染正确，星期排列准确
  - 有打卡的日期有颜色标记
  - 颜色深浅根据学习时长正确变化
  - 切换月份正确加载对应数据
  - 点击日期显示当日详情
  - 验证方式：查看多个月份的日历

- [ ] **Checkpoint 17**: 统计页（stats）功能正常
  - 时间维度切换（今日/本周/本月/全部）数据更新正确
  - 总时长、打卡次数、平均时长计算正确
  - 科目分布百分比计算正确
  - 连续打卡天数和历史最高显示正确
  - 验证方式：切换各维度检查数据

- [ ] **Checkpoint 18**: 全局配置正确
  - app.json 中 pages 数组包含所有页面路径
  - 导航栏标题为"学习打卡"，颜色为绿色主题
  - 全局样式变量定义完整
  - 验证方式：检查 app.json 和 app.wxss

## 用户体验验证

- [ ] **Checkpoint 19**: 空状态处理友好
  - 无计划时，首页和计划页显示空状态提示
  - 无打卡记录时，统计页显示空状态提示
  - 无打卡的月份，日历页显示空状态提示
  - 验证方式：清空数据后查看各页面

- [ ] **Checkpoint 20**: 网络异常处理完善
  - 云函数调用失败时有Toast提示
  - 加载数据时有loading状态
  - 提交表单时有防重复提交机制
  - 验证方式：模拟网络异常测试

- [ ] **Checkpoint 21**: 响应式布局适配
  - 在不同屏幕尺寸下布局正常（如iPhone SE和iPhone 14 Pro Max）
  - 使用rpx单位，无固定像素值
  - 验证方式：在开发者工具切换不同设备预览

- [ ] **Checkpoint 22**: 数据一致性
  - 首页、统计页、日历页显示的今日总时长一致
  - 打卡后各页面数据同步更新
  - 删除记录后各页面数据同步更新
  - 验证方式：对比多页面数据

## 性能验证

- [ ] **Checkpoint 23**: 页面加载性能
  - 首页首屏加载时间 < 1.5秒
  - 云函数调用响应时间 < 800ms
  - 列表页滚动流畅，无卡顿
  - 验证方式：开发者工具性能面板或体感测试

- [ ] **Checkpoint 24**: 云函数性能
  - getStats 接口响应时间 < 500ms
  - getCalendarData 接口响应时间 < 500ms
  - 大数据量时（1000条记录）查询仍正常
  - 验证方式：开发者工具网络面板

## 代码规范验证

- [ ] **Checkpoint 25**: 代码规范符合要求
  - 变量/函数使用 camelCase
  - 云函数action命名统一
  - 无 hardcode 密钥或敏感信息
  - 错误处理完善，无空catch块
  - 验证方式：代码审查

- [x] **Checkpoint 26**: 微信云开发规范遵循
  - 数据库操作全部走云函数，小程序端无直接db操作
  - 云函数中使用 DYNAMIC_CURRENT_ENV 初始化
  - _openid 字段由系统自动注入，不人工构造
  - 验证方式：全局搜索 wx.cloud.database() 调用位置
