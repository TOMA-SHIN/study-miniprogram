# 学习打卡小程序 - 第二次课云开发升级 Spec

## Why

现有学习打卡小程序已具备计划管理和打卡能力，数据也存储在云数据库中。但对照第二次课"云开发数据库与后端"的验收要求，核心缺口是**缺少一个独立的全量记录列表页**来直接体现"从云数据库读取并展示所有记录"的能力。本次升级在已有云基础设施上，新增全量打卡记录列表、记录编辑/删除、条件筛选和统计汇总，用最少的改动直接满足课程验收要求，并覆盖全部加分项。

## 项目关键信息

```
APPID: wx2e88a600d65a90d2
云环境ID: cloud1-d0g889dl64933afbe
项目路径: c:\Users\t'x'y\Desktop\3
小程序根目录: miniprogram/
云函数根目录: cloudfunctions/
基础库版本: 3.16.1
```

## What Changes

- **新增** `cloudfunctions/studyFunctions/index.js` 中的 3 个 action：`getAllRecords`（分页查询）、`updateRecord`（编辑记录）、`searchRecords`（条件筛选）
- **新增** `miniprogram/pages/records/index`：全量打卡记录列表页（从云数据库读取、分页展示、下拉刷新、上拉加载更多）
- **新增** `miniprogram/pages/recordEdit/index`：记录编辑页（修改时长、笔记、日期）
- **新增** `miniprogram/utils/studyService.js` 中对应的客户端封装方法
- **改造** `miniprogram/pages/index/index`：首页增加"查看全部记录"入口按钮
- **改造** `miniprogram/app.json`：注册新增页面路由
- **新增** 云数据库索引：`studyRecords` 集合增加 `idx_checkintime_desc` 索引，支撑分页查询性能

## Impact

- Affected specs: study-checkin-miniprogram
- Affected code:
  - `cloudfunctions/studyFunctions/index.js`（新增 action）
  - `miniprogram/utils/studyService.js`（新增封装方法）
  - `miniprogram/pages/records/index`（全新页面）
  - `miniprogram/pages/recordEdit/index`（全新页面）
  - `miniprogram/pages/index/index.wxml` & `.js`（增加入口）
  - `miniprogram/app.json`（注册路由）

## ADDED Requirements

### Requirement: 全量打卡记录列表展示能力

The system SHALL 提供一个列表页面，从云数据库读取当前用户的全部打卡记录，按时间倒序分页展示，支持下拉刷新和上拉加载更多。

#### Scenario: 用户查看全部打卡记录
- **WHEN** 用户进入"全部记录"页面
- **THEN** 系统调用云函数 `studyFunctions.getAllRecords` 拉取记录
- **AND** 按打卡时间倒序展示在列表中
- **AND** 每条记录显示：日期、计划名称、科目、学习时长、笔记摘要
- **AND** 列表底部有"加载更多"，无更多数据时提示"没有更多了"

#### Scenario: 下拉刷新与上拉加载
- **WHEN** 用户在列表页下拉
- **THEN** 重新加载第一页数据并停止刷新动画
- **WHEN** 用户滚动到底部
- **THEN** 自动加载下一页数据并追加到列表

### Requirement: 记录编辑能力

The system SHALL 允许用户修改自己创建的打卡记录。

#### Scenario: 用户编辑打卡记录
- **WHEN** 用户在记录列表点击"编辑"
- **THEN** 跳转到编辑页并回显该记录的日期、时长、笔记
- **AND** 用户修改后提交
- **AND** 系统调用云函数 `studyFunctions.updateRecord` 更新数据库
- **AND** 更新成功后返回列表页并刷新

### Requirement: 记录删除能力

The system SHALL 允许用户删除自己创建的打卡记录，删除前需二次确认。

#### Scenario: 用户删除打卡记录
- **WHEN** 用户在记录列表点击"删除"
- **THEN** 弹出确认框
- **AND** 确认后调用云函数 `studyFunctions.deleteRecord`（已有）删除记录
- **AND** 列表中移除该记录

### Requirement: 记录筛选与搜索能力

The system SHALL 支持按日期范围、科目、关联计划筛选记录，支持按笔记关键词搜索。

#### Scenario: 用户筛选记录
- **WHEN** 用户在列表顶部选择筛选条件（如日期范围 2024-06-01 ~ 2024-06-30）
- **THEN** 调用云函数 `studyFunctions.searchRecords` 按条件查询
- **AND** 列表展示筛选结果
- **WHEN** 用户清空筛选条件
- **THEN** 恢复展示全部记录

### Requirement: 记录统计汇总展示

The system SHALL 在记录列表顶部展示当前筛选范围内的统计信息。

#### Scenario: 用户查看统计汇总
- **WHEN** 用户进入记录列表页（或切换筛选条件）
- **THEN** 在列表顶部显示：记录总数、总学习时长、平均每次时长

## MODIFIED Requirements

### Requirement: 首页导航

The system SHALL 在首页增加"查看全部记录"入口，使用户可以访问全量打卡记录列表页。

#### Scenario: 用户从首页进入记录列表
- **WHEN** 用户在首页点击"查看全部记录"
- **THEN** 系统跳转到 `pages/records/index`
- **AND** 展示该用户的全部打卡记录列表

## REMOVED Requirements

无

---

## 数据库设计补充

### 已有集合复用

本次升级**不新建集合**，复用已有的 `studyRecords` 集合。需补充一个索引：

| 集合 | 索引名称 | 字段 | 排序 | 属性 | 用途 |
|------|---------|------|------|------|------|
| studyRecords | idx_checkintime_desc | `checkInTime` | 降序 | 普通索引 | 支撑分页查询按时间倒序排序 |

> 注意：若之前已按第一次课的 spec 创建了 `idx_checkintime` 索引，需确认其排序为降序；若创建的是升序，建议删除后重建为降序，或额外创建一个降序索引用于分页。

### 已有集合权限（保持现状）

| 集合 | 权限类型 |
|------|---------|
| studyPlans | 仅创建者可读写 |
| studyRecords | 仅创建者可读写 |
| userStats | 仅创建者可读写 |
| subjects | 所有用户可读 |

---

## 云函数设计补充

### 在现有 `studyFunctions` 中新增 action

| action | 说明 | 参数 | 返回 |
|--------|------|------|------|
| `getAllRecords` | 分页获取全部打卡记录 | `{ page = 1, pageSize = 20 }` | `{ success, data: { list, total, hasMore } }` |
| `updateRecord` | 更新打卡记录 | `{ id, minutes?, note?, date? }` | `{ success }` |
| `searchRecords` | 条件筛选记录 | `{ startDate?, endDate?, subject?, planId?, keyword?, page = 1, pageSize = 20 }` | `{ success, data: { list, total, hasMore } }` |

#### getAllRecords 特殊逻辑
- 按 `checkInTime` 降序排序
- 支持分页：`skip = (page - 1) * pageSize`, `limit = pageSize`
- 返回结果需关联 `studyPlans` 集合，补全计划名称、科目、颜色字段
- 返回 `hasMore` 标志，用于前端判断是否还有更多数据

#### updateRecord 特殊逻辑
- 只能更新当前 `openid` 创建的记录
- 更新后同步重新计算并更新 `userStats` 中的统计数据

#### searchRecords 特殊逻辑
- 所有筛选条件为"与"关系（AND）
- `keyword` 模糊匹配 `note` 字段（使用 db.RegExp）
- 同样按 `checkInTime` 降序分页返回
