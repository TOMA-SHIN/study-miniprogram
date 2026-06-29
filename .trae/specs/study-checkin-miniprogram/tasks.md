# 学习打卡记录微信小程序 - 实现计划

## 数据库创建与配置

### Task 1: 创建云数据库集合并配置权限
- **Priority**: high
- **Depends On**: None
- **Description**:
  在微信开发者工具云开发控制台中创建4个数据库集合，并配置权限和索引。
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-1.1: 4个集合（studyPlans, studyRecords, userStats, subjects）全部创建成功
  - `programmatic` TR-1.2: 集合权限JSON配置正确，非创建者无法读写
  - `programmatic` TR-1.3: 所有索引按spec.md中设计创建成功
- **Steps**:
  1. 打开微信开发者工具，点击"云开发"进入控制台
  2. 进入"数据库"，依次添加4个集合
  3. 对每个集合设置自定义权限（见spec.md权限JSON）
  4. 对每个集合创建对应索引（见spec.md索引设计）
  5. 对subjects集合导入默认科目数据
- **Notes**: 这是所有后续任务的基础，必须先完成

---

## 云函数开发

### Task 2: 创建 studyFunctions 云函数基础框架
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  在 cloudfunctions/ 下新建 studyFunctions 目录，编写基础框架和公共方法。
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-2.1: 云函数可成功部署并运行
  - `programmatic` TR-2.2: 正确初始化云开发环境，获取用户OpenID
  - `programmatic` TR-2.3: 统一错误处理返回格式 {success, message}
- **Steps**:
  1. 新建目录 cloudfunctions/studyFunctions/
  2. 编写 config.json 和 package.json（见spec.md）
  3. 编写 index.js 基础框架：初始化sdk、获取OpenID、路由分发、错误处理
  4. 在云函数中实现数据库连接公共方法
  5. 部署并测试基础调用
- **Notes**: 参照现有 todoFunctions 的结构编写

### Task 3: 实现计划管理云函数API
- **Priority**: high
- **Depends On**: Task 2
- **Description**:
  实现 addPlan / getPlans / updatePlan / deletePlan 四个action。
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-3.1: addPlan 成功创建计划并返回_id
  - `programmatic` TR-3.2: getPlans 正确返回当前用户的计划列表
  - `programmatic` TR-3.3: updatePlan 正确更新指定计划
  - `programmatic` TR-3.4: deletePlan 正确删除指定计划且该计划的打卡记录不受影响
  - `programmatic` TR-3.5: 所有操作只能操作当前openid的数据
- **Steps**:
  1. 实现 addPlan: 参数校验、构造数据、插入studyPlans集合
  2. 实现 getPlans: 根据openid查询，支持activeOnly过滤
  3. 实现 updatePlan: 根据openid+id更新
  4. 实现 deletePlan: 根据openid+id删除
  5. 逐一测试每个action

### Task 4: 实现打卡与记录查询云函数API
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  实现 checkIn / getTodayRecords / getRecordsByDate / getRecordsByRange / deleteRecord 五个action。
- **Acceptance Criteria Addressed**: AC-2, AC-6
- **Test Requirements**:
  - `programmatic` TR-4.1: checkIn 成功保存记录，返回当前streak和总时长
  - `programmatic` TR-4.2: 同一天多次打卡，时长累计正确
  - `programmatic` TR-4.3: getTodayRecords 正确汇总今日数据
  - `programmatic` TR-4.4: getRecordsByRange 正确返回日期范围内记录
  - `programmatic` TR-4.5: deleteRecord 正确删除记录
  - `programmatic` TR-4.6: 连续打卡计算逻辑正确（中断后重新计数）
- **Steps**:
  1. 实现 checkIn: 保存记录到studyRecords，更新userStats的streak和总时长
  2. 实现 getTodayRecords: 按日期查询并汇总今日时长
  3. 实现 getRecordsByRange: 支持startDate/endDate范围查询
  4. 实现 deleteRecord: 软删除或直接删除，重新计算streak
  5. 实现 getSubjects: 从subjects集合读取科目列表
  6. 测试streak计算逻辑的各种边界情况

### Task 5: 实现统计与日历云函数API
- **Priority**: high
- **Depends On**: Task 4
- **Description**:
  实现 getStats / getCalendarData 两个action。
- **Acceptance Criteria Addressed**: AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-5.1: getStats(today) 返回今日统计数据正确
  - `programmatic` TR-5.2: getStats(week) 返回本周（周一到今日）数据正确
  - `programmatic` TR-5.3: getStats(month) 返回本月（1日到今日）数据正确
  - `programmatic` TR-5.4: getStats(all) 返回全部累计数据正确
  - `programmatic` TR-5.5: getCalendarData 返回指定年月的每日汇总数据
  - `programmatic` TR-5.6: 科目分布计算正确
- **Steps**:
  1. 实现 getStats: 根据period参数聚合计算
  2. 实现 getCalendarData: 按年月查询，返回每天的totalMinutes
  3. 使用聚合查询(aggregate)优化统计性能
  4. 对每种period类型进行测试

---

## 小程序端服务层

### Task 6: 编写 studyService.js 客户端服务层
- **Priority**: high
- **Depends On**: Task 2
- **Description**:
  在 miniprogram/utils/ 下创建 studyService.js，封装所有云函数调用。
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-4
- **Test Requirements**:
  - `programmatic` TR-6.1: 所有云函数action都有对应的封装方法
  - `programmatic` TR-6.2: 错误处理统一抛出异常，带错误信息
  - `programmatic` TR-6.3: 每个方法都有成功/失败的测试用例
- **Steps**:
  1. 创建 studyService.js
  2. 实现 callFunction 通用方法
  3. 封装所有action方法（addPlan/getPlans/updatePlan/deletePlan/checkIn/...）
  4. 参照现有 todoService.js 的写法
  5. 在现有 utils/util.js 中补充日期格式化辅助函数

---

## 页面开发

### Task 7: 开发计划管理页（plans + planForm）
- **Priority**: high
- **Depends On**: Task 3, Task 6
- **Description**:
  创建 pages/plans/ 和 pages/planForm/ 两个页面，实现计划增删改查。
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgment` TR-7.1: 页面布局清晰，信息展示完整
  - `programmatic` TR-7.2: 新建计划表单验证正确（必填项、字数限制）
  - `programmatic` TR-7.3: 编辑计划回显数据正确
  - `programmatic` TR-7.4: 删除计划有二次确认，删除后列表刷新
  - `programmatic` TR-7.5: 计划状态（未开始/进行中/已结束）计算正确
- **Steps**:
  1. 创建 pages/plans/ 目录和4个页面文件
  2. 创建 pages/planForm/ 目录和4个页面文件
  3. 在 app.json 中注册新页面路由
  4. 编写 plans 页面：列表渲染、左滑删除、跳转到planForm
  5. 编写 planForm 页面：表单输入、picker选择科目、日期选择、颜色选择
  6. 集成 studyService 进行数据操作
  7. 测试完整的CRUD流程

### Task 8: 开发打卡页（checkin）
- **Priority**: high
- **Depends On**: Task 4, Task 6
- **Description**:
  创建 pages/checkin/ 页面，实现选择计划、输入时长、填写笔记、提交打卡。
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgment` TR-8.1: 页面布局符合设计，操作流畅
  - `programmatic` TR-8.2: 时长输入限制1-1440，非数字/超出范围有提示
  - `programmatic` TR-8.3: 笔记输入限制500字
  - `programmatic` TR-8.4: 选择计划后显示该计划今日已学时长
  - `programmatic` TR-8.5: 打卡成功后返回首页并刷新数据
  - `programmatic` TR-8.6: 网络异常或接口失败有Toast提示
- **Steps**:
  1. 创建 pages/checkin/ 目录和4个页面文件
  2. 在 app.json 中注册页面
  3. 实现计划选择器（picker）：从studyService.getPlans()加载
  4. 实现时长输入（input type="number"）
  5. 实现笔记输入（textarea）
  6. 实现提交逻辑：调用studyService.checkIn
  7. 测试各种输入边界

### Task 9: 改造首页（index）为今日概览
- **Priority**: high
- **Depends On**: Task 4, Task 6, Task 8
- **Description**:
  重写 pages/index/ 页面，从待办列表改为今日学习概览，包含快速打卡入口。
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgment` TR-9.1: 首页布局清晰，信息层级分明
  - `programmatic` TR-9.2: 今日总时长计算准确
  - `programmatic` TR-9.3: 连续打卡天数显示正确
  - `programmatic` TR-9.4: 今日打卡记录列表渲染正确
  - `programmatic` TR-9.5: 科目分布数据展示正确
  - `programmatic` TR-9.6: 下拉刷新功能正常
  - `programmatic` TR-9.7: 点击"快速打卡"跳转到checkin页
- **Steps**:
  1. 重写 index.wxml：统计卡片 + 快速打卡按钮 + 记录列表 + 科目分布
  2. 重写 index.wxss：新的样式布局
  3. 重写 index.js：加载今日数据的方法（getTodayRecords）
  4. 添加下拉刷新 onPullDownRefresh
  5. 添加页面 onShow 自动刷新
  6. 保留原待办功能入口（可选，如底部tab或更多页面）

### Task 10: 开发日历页（calendar）
- **Priority**: medium
- **Depends On**: Task 5, Task 6
- **Description**:
  创建 pages/calendar/ 页面，实现月历视图和打卡标记。
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `human-judgment` TR-10.1: 月历布局正确，星期排列准确
  - `programmatic` TR-10.2: 有打卡的日期有颜色标记
  - `programmatic` TR-10.3: 颜色深浅根据学习时长正确变化
  - `programmatic` TR-10.4: 切换月份正确加载对应数据
  - `programmatic` TR-10.5: 点击日期显示当日详情
  - `human-judgment` TR-10.6: 空状态（无打卡月份）有友好提示
- **Steps**:
  1. 创建 pages/calendar/ 目录和4个页面文件
  2. 在 app.json 中注册页面
  3. 实现月历渲染逻辑：计算当月天数、星期偏移
  4. 调用 getCalendarData 加载打卡数据
  5. 根据时长设置5档颜色
  6. 实现点击日期弹出详情（或底部面板展示）
  7. 实现月份切换（上一月/下一月）

### Task 11: 改造统计页（stats）
- **Priority**: medium
- **Depends On**: Task 5, Task 6
- **Description**:
  升级 pages/stats/ 页面，增加时间维度切换和更丰富的统计展示。
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-11.1: 页面布局清晰，统计信息易读
  - `programmatic` TR-11.2: 切换维度（今日/本周/本月/全部）数据更新正确
  - `programmatic` TR-11.3: 科目分布百分比计算正确
  - `programmatic` TR-11.4: 连续打卡天数和历史最高显示正确
  - `programmatic` TR-11.5: 平均每日时长计算正确（有打卡的天数/总天数）
  - `programmatic` TR-11.6: 空状态有友好提示
- **Steps**:
  1. 重写 stats.wxml：时间维度切换tab + 统计卡片 + 科目分布 + 最近打卡
  2. 重写 stats.wxss：适配新布局
  3. 重写 stats.js：集成 getStats 接口，实现维度切换
  4. 使用canvas或纯CSS实现简单的科目分布条形图
  5. 测试各维度数据准确性

---

## 全局配置与优化

### Task 12: 更新 app.json 和全局样式
- **Priority**: high
- **Depends On**: Task 7, Task 8
- **Description**:
  更新小程序全局配置，注册所有新页面，统一导航栏和样式。
- **Acceptance Criteria Addressed**: N/A
- **Test Requirements**:
  - `programmatic` TR-12.1: app.json 中所有页面路径正确
  - `human-judgment` TR-12.2: 导航栏标题和颜色符合设计规范
  - `human-judgment` TR-12.3: 全局样式统一，无明显样式冲突
- **Steps**:
  1. 更新 app.json 的 pages 数组，按正确顺序排列
  2. 更新 window 配置：navigationBarTitleText改为"学习打卡"
  3. 更新 app.wxss：添加CSS变量、全局样式类
  4. 检查各页面json配置，确保独立导航栏标题正确

### Task 13: 端到端联调测试
- **Priority**: high
- **Depends On**: Task 7, Task 8, Task 9, Task 10, Task 11, Task 12
- **Description**:
  完整测试所有用户场景，确保数据流正确。
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7
- **Test Requirements**:
  - `programmatic` TR-13.1: 完整流程：创建计划 -> 打卡 -> 查看今日 -> 查看统计 -> 查看日历
  - `programmatic` TR-13.2: 数据一致性：各页面显示的今日总时长一致
  - `programmatic` TR-13.3: 连续打卡场景：连续3天打卡 -> 第4天不打卡 -> 第5天打卡，streak正确
  - `programmatic` TR-13.4: 多用户隔离：用户A数据对用户B不可见
  - `programmatic` TR-13.5: 边界测试：无计划时首页显示空状态、无打卡时统计页显示空状态
  - `human-judgment` TR-13.6: 整体UI体验流畅，无明显的布局错乱或加载问题
- **Steps**:
  1. 制定测试用例表（覆盖所有AC）
  2. 逐个执行测试用例，记录结果
  3. 修复发现的bug
  4. 重复测试直到通过

---

## 任务依赖图

```
Task 1 (数据库)  --->  Task 2 (云函数框架)  --->  Task 3 (计划API)
                                              --->  Task 4 (打卡API)
                                              --->  Task 5 (统计API)
                                              --->  Task 6 (客户端服务)

Task 3 + Task 6  --->  Task 7 (计划页面)
Task 4 + Task 6  --->  Task 8 (打卡页面)
Task 4 + Task 6 + Task 8  --->  Task 9 (首页改造)
Task 5 + Task 6  --->  Task 10 (日历页面)
Task 5 + Task 6  --->  Task 11 (统计改造)

Task 7 + Task 8  --->  Task 12 (全局配置)

Task 7+8+9+10+11+12  --->  Task 13 (联调测试)
```
