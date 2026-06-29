# 学习打卡记录微信小程序 - 产品需求文档

## 概述
- **Summary**: 在现有待办打卡小程序基础上，升级为学习打卡记录微信小程序。用户可制定学习计划、按科目记录每日学习时长与内容、查看学习统计与连续打卡天数，帮助养成良好学习习惯。
- **Purpose**: 解决学习者缺乏系统性学习记录工具的问题，通过打卡机制增强学习动力，通过数据统计反馈学习效果。
- **Target Users**: 学生、自学者、备考人群等需要规律学习并追踪学习进度的用户。

## 项目关键信息
```
APPID: wx2e88a600d65a90d2
云环境ID: cloud1-d0g889dl64933afbe
项目路径: c:\Users\t'x'y\Desktop\3
小程序根目录: miniprogram/
云函数根目录: cloudfunctions/
基础库版本: 3.16.1
```

## Goals
- [Goal-1] 保留现有待办打卡核心功能，平滑升级为学习打卡场景
- [Goal-2] 支持学习计划管理（增删改查）
- [Goal-3] 支持按科目/计划进行每日学习打卡，记录学习时长与学习笔记
- [Goal-4] 提供多维度学习统计（今日/本周/本月/累计）
- [Goal-5] 实现连续打卡天数（Streak）计算与展示，增强用户黏性
- [Goal-6] 提供日历视图，直观展示每月打卡情况
- [Goal-7] 严格遵循微信小程序云开发规范，确保数据安全

## Non-Goals (Out of Scope)
- 不支持社交分享/好友排名功能
- 不支持学习资料文件上传/云存储功能
- 不支持番茄钟/倒计时等学习辅助工具
- 不支持多设备同步（依赖微信账号体系天然支持）
- 不支持消息推送/提醒功能
- 不支持学习群组/协作功能

## Background & Context
- 现有项目为微信云开发快速启动模板，已包含基础的待办CRUD和统计功能
- 现有数据库集合：todos（待办事项）
- 现有云函数：todoFunctions（包含addTodo/getTodos/updateTodo/deleteTodo/getStats）
- 现有页面：index（首页列表）、add（添加待办）、stats（统计页）
- 升级策略：保留原有待办框架，扩展学习相关字段和页面，避免推倒重来

## Functional Requirements

### FR-1: 学习计划管理
- 用户可创建学习计划，包含：计划名称、科目类别、每日目标时长（分钟）、计划开始/结束日期、颜色标识
- 用户可查看学习计划列表
- 用户可编辑和删除学习计划
- 计划状态自动计算（进行中/已结束/未开始）

### FR-2: 学习打卡
- 用户选择计划后进行打卡
- 打卡需记录：学习日期、学习时长（分钟）、学习笔记/心得、打卡时间戳
- 同一计划同一天允许多次打卡（累计时长）
- 打卡后自动更新连续打卡天数

### FR-3: 今日概览
- 首页展示今日已学习总时长
- 展示今日各科目学习时长分布
- 展示当前连续打卡天数（Streak）
- 展示今日打卡记录列表

### FR-4: 学习统计
- 支持今日/本周/本月/全部 时间维度切换
- 展示总学习时长、打卡次数、平均每日时长
- 展示科目分布饼图/柱状图
- 展示连续打卡历史最佳记录

### FR-5: 日历视图
- 以月历形式展示打卡记录
- 有打卡的日期标记为不同颜色（根据学习时长深浅）
- 点击日期可查看当日详细打卡记录

### FR-6: 数据安全与权限
- 所有数据基于微信OpenID隔离，用户只能访问自己的数据
- 数据库操作通过云函数进行，小程序端不直接操作数据库

## Non-Functional Requirements

### NFR-1: 性能
- 页面首屏加载时间 < 1.5秒
- 云函数调用响应时间 < 800ms
- 列表页支持下拉刷新

### NFR-2: 可靠性
- 云函数异常返回友好错误信息
- 关键操作（打卡、删除）需要二次确认
- 网络异常时给出明确提示

### NFR-3: 可用性
- 适配不同屏幕尺寸（rpx单位）
- 支持深色模式（跟随系统）
- 操作后有即时反馈（Toast/Loading）

### NFR-4: 数据安全
- 禁止小程序端直接访问数据库，所有操作走云函数
- 云函数中严格校验用户OpenID
- 数据库集合权限配置为"仅创建者可读写"

## Constraints

### Technical
- 微信小程序基础库 >= 2.2.3（云开发最低要求）
- 使用微信原生小程序框架（WXML/WXSS/JS），不引入第三方框架
- 云开发数据库为文档型数据库（MongoDB-like），需注意查询限制
- 云函数单次返回数据大小限制为1MB
- 云函数超时时间为3秒（默认）/ 20秒（可调）

### Business
- 个人学习工具，不涉及付费
- 数据存储在微信云开发，需关注免费额度

### Dependencies
- 微信云开发环境：cloud1-d0g889dl64933afbe
- 依赖微信登录体系获取OpenID
- 图表库：使用微信小程序官方canvas或轻量图表组件（如需引入需评估体积）

## Assumptions
- 用户使用同一微信账号登录，OpenID唯一标识用户
- 用户每日学习时长合理范围在1分钟-24小时之间
- 学习计划数量不超过100条/用户（性能考虑）
- 打卡记录数量不超过10000条/用户（考虑分页）
- 用户设备支持微信小程序基础库3.16.1+

## Acceptance Criteria

### AC-1: 学习计划创建
- **Given**: 用户在计划管理页点击"新建计划"
- **When**: 填写计划名称"英语单词"、科目"英语"、目标时长30分钟、选择开始日期
- **Then**: 计划成功保存到数据库，列表页显示新计划
- **Verification**: `programmatic`
- **Notes**: 名称不能为空，目标时长必须是正整数

### AC-2: 学习打卡
- **Given**: 用户已创建学习计划，在首页或打卡页
- **When**: 选择计划"英语单词"，输入时长25分钟，填写笔记"背了50个单词"
- **Then**: 打卡记录保存成功，今日总时长增加25分钟，连续打卡天数+1（如果昨日有打卡）
- **Verification**: `programmatic`
- **Notes**: 时长必须>0，同一计划同一天可多次打卡累计

### AC-3: 今日概览展示
- **Given**: 用户今日已完成多次打卡
- **When**: 打开首页
- **Then**: 正确显示今日总时长、各科目分布、连续打卡天数、打卡记录列表
- **Verification**: `human-judgment`
- **Notes**: 数据需要准确汇总，界面布局清晰

### AC-4: 统计页面
- **Given**: 用户有多日打卡记录
- **When**: 切换今日/本周/本月/全部维度
- **Then**: 统计数据正确切换，科目分布正确计算
- **Verification**: `programmatic`
- **Notes**: 本周定义为本周一到今日，本月定义为本月1日到今日

### AC-5: 日历视图
- **Given**: 用户有历史打卡记录
- **When**: 打开日历页，切换月份
- **Then**: 有打卡的日期有标记，点击可查看详情
- **Verification**: `human-judgment`
- **Notes**: 标记颜色根据学习时长深浅变化

### AC-6: 数据隔离
- **Given**: 用户A和用户B各自有学习数据
- **When**: 各自登录查看
- **Then**: 只能看到自己的计划和打卡记录
- **Verification**: `programmatic`
- **Notes**: 通过云函数中OpenID校验实现

### AC-7: 连续打卡计算
- **Given**: 用户连续5天有打卡记录，第6天未打卡，第7天打卡
- **When**: 系统计算连续打卡天数
- **Then**: 第5天显示streak=5，第6天streak=0（中断），第7天streak=1（重新计数）
- **Verification**: `programmatic`
- **Notes**: 连续打卡定义为连续自然日有打卡记录

## Open Questions
- [ ] 是否需要支持学习计划的暂停/恢复功能？
- [ ] 图表展示使用原生canvas还是引入轻量图表库（如ucharts）？
- [ ] 是否需要数据导出功能（如导出月度学习报告）？
- [ ] 连续打卡中断后，是否保留历史最高 streak 记录？

---

## 数据库设计详细规范

### 集合1: studyPlans（学习计划）

**用途**: 存储用户创建的学习计划

**文档结构**:
```javascript
{
  _id: string,          // 系统自动生成
  _openid: string,      // 用户OpenID，自动注入
  name: string,         // 计划名称，如"英语单词"
  subject: string,      // 科目类别，如"英语"
  targetMinutes: number, // 每日目标时长（分钟），默认30
  color: string,        // 颜色标识，如"#4CAF50"，用于UI展示
  startDate: string,    // 开始日期，格式"YYYY-MM-DD"
  endDate: string,      // 结束日期，格式"YYYY-MM-DD"，可为空表示长期
  isActive: boolean,    // 是否激活，默认true
  createTime: Date,     // 创建时间
  updateTime: Date,     // 更新时间
}
```

**集合权限**:
```json
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid",
  "create": true,
  "delete": "doc._openid == auth.openid"
}
```

**索引设计**:
| 索引名 | 字段 | 排序 | 属性 | 说明 |
|--------|------|------|------|------|
| idx_openid | _openid | 升序 | 普通索引 | 按用户查询 |
| idx_openid_active | _openid(升), isActive(升) | 复合索引 | 普通索引 | 查询用户的激活计划 |
| idx_subject | subject | 升序 | 普通索引 | 按科目统计 |

**创建方式**:
1. 登录微信开发者工具
2. 点击"云开发"按钮进入云开发控制台
3. 选择"数据库" -> "添加集合" -> 输入集合名"studyPlans"
4. 进入集合 -> "权限设置" -> 选择"自定义权限" -> 粘贴上述JSON
5. 进入"索引管理" -> 创建上述索引

---

### 集合2: studyRecords（学习打卡记录）

**用途**: 存储每次学习打卡记录

**文档结构**:
```javascript
{
  _id: string,          // 系统自动生成
  _openid: string,      // 用户OpenID
  planId: string,       // 关联的学习计划ID
  date: string,         // 打卡日期，格式"YYYY-MM-DD"
  minutes: number,      // 学习时长（分钟）
  note: string,         // 学习笔记/心得，最多500字
  checkInTime: Date,    // 打卡时间戳
  createTime: Date,     // 创建时间
}
```

**集合权限**:
```json
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid",
  "create": true,
  "delete": "doc._openid == auth.openid"
}
```

**索引设计**:
| 索引名 | 字段 | 排序 | 属性 | 说明 |
|--------|------|------|------|------|
| idx_openid_date | _openid(升), date(降) | 复合索引 | 普通索引 | 按用户和日期查询，最常用 |
| idx_openid_plan | _openid(升), planId(升) | 复合索引 | 普通索引 | 查询某计划的所有记录 |
| idx_date | date | 降序 | 普通索引 | 日期范围查询 |
| idx_checkintime | checkInTime | 降序 | 普通索引 | 时间排序 |

**创建方式**: 同studyPlans集合创建流程

---

### 集合3: userStats（用户统计缓存）

**用途**: 缓存用户连续打卡天数等统计信息，避免每次实时计算

**文档结构**:
```javascript
{
  _id: string,          // 系统自动生成
  _openid: string,      // 用户OpenID
  currentStreak: number,   // 当前连续打卡天数
  longestStreak: number,   // 历史最高连续打卡天数
  totalMinutes: number,    // 累计学习分钟数
  totalCheckIns: number,   // 累计打卡次数
  lastCheckInDate: string, // 最后打卡日期"YYYY-MM-DD"
  updateTime: Date,        // 更新时间
}
```

**集合权限**:
```json
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid",
  "create": true,
  "delete": "doc._openid == auth.openid"
}
```

**索引设计**:
| 索引名 | 字段 | 排序 | 属性 | 说明 |
|--------|------|------|------|------|
| idx_openid | _openid | 升序 | 唯一索引 | 每个用户一条记录 |

---

### 集合4: subjects（科目字典）

**用途**: 预定义科目类别，用于前端选择器

**文档结构**:
```javascript
{
  _id: string,
  name: string,      // 科目名称，如"英语"
  icon: string,      // 图标标识（可选）
  sortOrder: number, // 排序权重
}
```

**集合权限**:
```json
{
  "read": true,
  "write": false,
  "create": false,
  "delete": false
}
```
> 注：此集合为只读字典表，由管理员在控制台维护，所有用户可读。

**默认数据**:
```javascript
[
  { name: "语文", icon: "book", sortOrder: 1 },
  { name: "数学", icon: "calculate", sortOrder: 2 },
  { name: "英语", icon: "language", sortOrder: 3 },
  { name: "物理", icon: "atom", sortOrder: 4 },
  { name: "化学", icon: "flask", sortOrder: 5 },
  { name: "生物", icon: "leaf", sortOrder: 6 },
  { name: "历史", icon: "clock", sortOrder: 7 },
  { name: "地理", icon: "map", sortOrder: 8 },
  { name: "政治", icon: "balance", sortOrder: 9 },
  { name: "编程", icon: "code", sortOrder: 10 },
  { name: "考研", icon: "graduation", sortOrder: 11 },
  { name: "考证", icon: "certificate", sortOrder: 12 },
  { name: "其他", icon: "more", sortOrder: 99 }
]
```

---

## 云函数设计详细规范

### 云函数1: studyFunctions（主云函数）

**路径**: `cloudfunctions/studyFunctions/`

**功能**: 整合所有学习相关后端逻辑

**API设计**:

| Action | 功能 | 入参 | 返回 |
|--------|------|------|------|
| addPlan | 添加学习计划 | { name, subject, targetMinutes, color, startDate, endDate } | { success, data: { _id } } |
| getPlans | 获取学习计划列表 | { activeOnly? } | { success, data: [...] } |
| updatePlan | 更新学习计划 | { id, data } | { success } |
| deletePlan | 删除学习计划 | { id } | { success } |
| checkIn | 学习打卡 | { planId, date, minutes, note } | { success, data: { streak, totalMinutes } } |
| getTodayRecords | 获取今日打卡记录 | 无 | { success, data: { records, totalMinutes, streak } } |
| getRecordsByDate | 按日期获取记录 | { date } | { success, data: [...] } |
| getRecordsByRange | 按日期范围获取记录 | { startDate, endDate } | { success, data: [...] } |
| getStats | 获取统计数据 | { period: 'today' \| 'week' \| 'month' \| 'all' } | { success, data: {...} } |
| getCalendarData | 获取日历数据 | { year, month } | { success, data: [...] } |
| deleteRecord | 删除打卡记录 | { id } | { success } |
| getSubjects | 获取科目列表 | 无 | { success, data: [...] } |

**特殊逻辑 - 连续打卡计算**:
```javascript
// 伪代码
function calculateStreak(openid, todayDate) {
  const records = db.collection('studyRecords')
    .where({ _openid: openid })
    .orderBy('date', 'desc')
    .get();
  
  let streak = 0;
  let checkDate = new Date(todayDate);
  
  for (const record of records) {
    const recordDate = new Date(record.date);
    const diffDays = (checkDate - recordDate) / (1000 * 60 * 60 * 24);
    
    if (diffDays === 0 || diffDays === streak + 1) {
      streak++;
      checkDate = recordDate;
    } else {
      break;
    }
  }
  
  return streak;
}
```

**错误处理规范**:
- 所有异常统一捕获，返回 `{ success: false, message: string }`
- 参数校验失败返回400级别错误信息
- 数据库操作失败返回具体错误信息
- 使用 `console.error` 记录错误日志

**config.json**:
```json
{
  "permissions": {
    "openapi": []
  }
}
```

**package.json**:
```json
{
  "name": "studyFunctions",
  "version": "1.0.0",
  "description": "学习打卡云函数",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "latest"
  }
}
```

**部署命令**:
```bash
# 在微信开发者工具中右键点击 studyFunctions 文件夹
# 选择"创建并部署：云端安装依赖"
```

---

## 页面结构设计

### 页面1: pages/index/index（首页 - 今日概览）

**功能**: 展示今日学习概览，快速打卡入口

**UI布局**:
```
┌─────────────────────────────┐
│ 学习打卡           [设置]    │
├─────────────────────────────┤
│ 今日已学习      连续打卡     │
│   125分钟        7天         │
├─────────────────────────────┤
│ + 快速打卡                  │
├─────────────────────────────┤
│ 今日打卡记录 (3条)          │
│ ┌─────────────────────────┐ │
│ │ 🟢 英语单词    25分钟   │ │
│ │    背了50个单词         │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 🔵 数学练习    60分钟   │ │
│ │    完成了第三章习题     │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ [今日] [本周] [本月] [全部] │
│ 各科目分布柱状图...         │
└─────────────────────────────┘
```

**数据绑定**:
- `todayMinutes`: 今日总时长
- `currentStreak`: 当前连续打卡天数
- `todayRecords`: 今日打卡记录数组
- `subjectDistribution`: 今日科目分布

---

### 页面2: pages/checkin/checkin（打卡页）

**功能**: 选择计划进行打卡

**UI布局**:
```
┌─────────────────────────────┐
│ 学习打卡                     │
├─────────────────────────────┤
│ 选择计划: [英语单词 ▼]      │
├─────────────────────────────┤
│ 学习时长: [  45  ] 分钟     │
├─────────────────────────────┤
│ 学习笔记:                   │
│ ┌─────────────────────────┐ │
│ │ 今天学习了...           │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│      [确认打卡]             │
└─────────────────────────────┘
```

**交互逻辑**:
- 选择计划后显示该计划今日已学习时长
- 时长输入范围1-1440分钟
- 笔记限制500字
- 提交成功后返回首页并刷新

---

### 页面3: pages/plans/plans（计划管理页）

**功能**: 管理学习计划

**UI布局**:
```
┌─────────────────────────────┐
│ 学习计划           [+新建]  │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 🟢 英语单词    进行中   │ │
│ │ 目标: 30分钟/天         │ │
│ │ 周期: 2024-01 ~ 2024-06 │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 🔵 数学练习    已结束   │ │
│ │ ...                     │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**功能**:
- 列表展示所有计划
- 左滑显示编辑/删除按钮
- 点击新建跳转到planForm页
- 状态标签：未开始/进行中/已结束

---

### 页面4: pages/planForm/planForm（计划表单页）

**功能**: 新增/编辑学习计划

**表单字段**:
- 计划名称（必填，最多20字）
- 科目类别（必填，picker选择）
- 每日目标时长（必填，数字输入，默认30）
- 颜色标识（可选，颜色选择器）
- 开始日期（必填，默认今天）
- 结束日期（可选，留空表示长期）

---

### 页面5: pages/calendar/calendar（日历页）

**功能**: 月历视图展示打卡情况

**UI布局**:
```
┌─────────────────────────────┐
│ < 2024年1月 >               │
├─────────────────────────────┤
│ 日  一  二  三  四  五  六  │
│     1    2    3    4    5   │
│     🟢  🟢                  │
│  6    7    8    9   10   11 │
│            🟡               │
├─────────────────────────────┤
│ 1月5日 周日                 │
│ 总学习时长: 85分钟          │
│ ├─ 英语单词 30分钟          │
│ └─ 数学练习 55分钟          │
└─────────────────────────────┘
```

**颜色规则**:
- 无打卡：空白
- 1-30分钟：浅绿 `#A5D6A7`
- 31-60分钟：中绿 `#66BB6A`
- 61-120分钟：深绿 `#43A047`
- 120分钟+：最深 `#2E7D32`

---

### 页面6: pages/stats/stats（统计页）

**功能**: 详细学习统计（原stats页升级）

**UI布局**:
```
┌─────────────────────────────┐
│ 学习统计                     │
├─────────────────────────────┤
│ [今日] [本周] [本月] [全部]  │
├─────────────────────────────┤
│ 总时长  打卡次  平均/日      │
│ 125分   3次     42分        │
├─────────────────────────────┤
│ 连续打卡: 7天               │
│ 历史最高: 15天              │
├─────────────────────────────┤
│ 科目分布                    │
│ ████████░░░░░░░░ 英语 60%   │
│ ████░░░░░░░░░░░░ 数学 30%   │
│ ██░░░░░░░░░░░░░░ 其他 10%   │
├─────────────────────────────┤
│ 最近打卡                    │
│ ...                         │
└─────────────────────────────┘
```

---

## 全局样式规范

**颜色变量**（在 app.wxss 中定义）:
```css
:root {
  --primary: #4CAF50;
  --primary-light: #A5D6A7;
  --primary-dark: #388E3C;
  --accent: #FF9800;
  --danger: #f44336;
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-hint: #999999;
  --bg-page: #f5f5f5;
  --bg-card: #ffffff;
  --border: #e0e0e0;
}
```

**字体规范**:
- 页面标题: 36rpx, bold
- 卡片标题: 32rpx, bold
- 正文: 28rpx, normal
- 辅助文字: 24rpx, normal
- 数字展示: 48rpx, bold, primary color

**间距规范**:
- 页面边距: 24rpx
- 卡片内边距: 24rpx
- 卡片间距: 16rpx
- 元素间距: 16rpx

---

## 小程序端服务层设计

**utils/studyService.js**:
```javascript
async function callFunction(action, data) {
  const result = await wx.cloud.callFunction({
    name: 'studyFunctions',
    data: { action, ...data },
  });
  if (!result.result.success) {
    throw new Error(result.result.message);
  }
  return result.result.data;
}

module.exports = {
  addPlan: (plan) => callFunction('addPlan', { plan }),
  getPlans: (activeOnly) => callFunction('getPlans', { activeOnly }),
  // ... 其他方法
};
```

---

## 升级迁移策略

1. **保留原有功能**: 原有 todos 集合和 todoFunctions 云函数保留，不删除
2. **新增集合**: 创建 studyPlans、studyRecords、userStats、subjects 集合
3. **新增云函数**: 创建 studyFunctions 云函数
4. **新增页面**: 创建 checkin、plans、planForm、calendar 页面
5. **改造首页**: index页从待办列表改为今日概览
6. **改造统计页**: stats页增加时间维度切换
7. **渐进升级**: 用户数据不受影响，新旧功能并存

---

## 开发顺序建议

1. 数据库集合创建与权限配置
2. 云函数 studyFunctions 基础框架搭建
3. 计划管理功能（plans + planForm页面）
4. 打卡功能（checkin页面）
5. 首页今日概览（改造index页面）
6. 日历功能（calendar页面）
7. 统计功能（改造stats页面）
8. 联调测试与优化
