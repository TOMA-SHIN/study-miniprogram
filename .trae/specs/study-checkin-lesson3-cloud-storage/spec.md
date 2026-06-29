# 学习打卡小程序 - 第三次课升级方案

## 一、升级目标

基于已有的学习打卡小程序，升级为支持微信云开发的完整应用，重点实现：

1. **用户登录与身份识别**
2. **云数据库持久化存储**
3. **云函数处理业务逻辑**
4. **图片上传与云存储**
5. **我的页面与统计展示**
6. **全局加载与错误处理**

## 二、数据库集合设计

### 2.1 studyPlans（学习计划）

| 字段 | 类型 | 说明 |
|---|---|---|
| _openid | string | 用户唯一标识（自动写入） |
| name | string | 计划名称 |
| subject | string | 科目 |
| targetMinutes | number | 目标时长（分钟） |
| color | string | 颜色标识 |
| startDate | string | 开始日期 |
| endDate | string | 结束日期 |
| isActive | boolean | 是否激活 |
| createTime | Date | 创建时间 |
| updateTime | Date | 更新时间 |

**权限**：仅创建者可读写。

**索引**：
- `_openid`：升序，普通索引
- `createTime`：降序，普通索引

### 2.2 studyRecords（打卡记录）

| 字段 | 类型 | 说明 |
|---|---|---|
| _openid | string | 用户唯一标识 |
| planId | string | 关联计划ID |
| date | string | 打卡日期（YYYY-MM-DD） |
| minutes | number | 学习时长 |
| note | string | 笔记 |
| imageFileID | string | 图片云存储文件ID |
| checkInTime | Date | 打卡时间 |
| createTime | Date | 创建时间 |

**权限**：仅创建者可读写。

**索引**：
- `_openid` + `date`：复合索引
- `_openid` + `planId`：复合索引
- `_openid` + `checkInTime`：降序，复合索引

### 2.3 subjects（科目）

| 字段 | 类型 | 说明 |
|---|---|---|
| name | string | 科目名称 |
| sortOrder | number | 排序权重 |

**权限**：所有用户可读，仅管理员可写。

**索引**：
- `sortOrder`：升序，普通索引

### 2.4 userProfiles（用户资料）

| 字段 | 类型 | 说明 |
|---|---|---|
| _openid | string | 用户唯一标识 |
| nickName | string | 昵称 |
| avatarUrl | string | 头像URL |
| totalMinutes | number | 总学习时长 |
| totalRecords | number | 总记录数 |
| streak | number | 连续打卡天数 |
| createTime | Date | 创建时间 |
| updateTime | Date | 更新时间 |

**权限**：仅创建者可读写。

**索引**：
- `_openid`：唯一索引

### 2.5 userStats（用户统计）

| 字段 | 类型 | 说明 |
|---|---|---|
| _openid | string | 用户唯一标识 |
| totalMinutes | number | 总时长 |
| totalCheckIns | number | 总打卡数 |
| currentStreak | number | 当前连续打卡 |
| longestStreak | number | 最长连续打卡 |
| lastCheckInDate | string | 最后打卡日期 |
| updateTime | Date | 更新时间 |

**权限**：仅创建者可读写。

**索引**：
- `_openid`：唯一索引

## 三、云函数设计

### 3.1 studyFunctions（主业务云函数）

统一通过 `action` 字段分发处理：

| action | 功能 |
|---|---|
| addPlan | 添加学习计划 |
| getPlans | 查询计划列表 |
| updatePlan | 更新计划 |
| deletePlan | 删除计划 |
| checkIn | 打卡 |
| getTodayRecords | 获取今日记录 |
| getRecordsByRange | 按日期范围查询 |
| getAllRecords | 分页获取全部记录 |
| searchRecords | 多条件筛选记录 |
| updateRecord | 更新记录 |
| deleteRecord | 删除记录 |
| getStats | 获取统计 |
| getCalendarData | 获取日历数据 |
| getSubjects | 获取科目列表 |
| getUserProfile | 获取用户资料 |
| updateUserProfile | 更新用户资料 |

### 3.2 getImageUrl（图片临时链接云函数）

输入：`fileIDs`（数组，最多50个）
输出：每个 fileID 对应的临时访问 URL

## 四、页面功能

| 页面 | 功能 |
|---|---|
| 首页 | 显示今日统计、今日记录列表、快捷入口 |
| 打卡页 | 选择计划、填写时长笔记、上传图片 |
| 计划页 | 管理学习计划 |
| 记录页 | 查看全部记录、筛选、编辑、删除 |
| 统计页 | 学习统计、科目分布 |
| 我的 | 用户信息、学习统计、深色模式、退出登录 |

## 五、安全与规范

1. 所有云函数通过 `cloud.getWXContext().OPENID` 识别用户身份
2. 数据库查询必须带 `_openid` 条件
3. 不使用 `any` 类型
4. 所有异步操作包含错误处理
5. 图片 fileID 通过 `cloud.getTempFileURL` 转换为临时链接后展示
