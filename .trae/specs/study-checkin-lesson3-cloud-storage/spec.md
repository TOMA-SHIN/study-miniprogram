# 学习打卡小程序 - 第三次课云存储与用户身份升级 Spec

## Why

第三次课要求实现**用户身份识别**、**云存储使用**和**完善的加载/错误处理**。现有学习打卡小程序已经完成了计划管理、打卡记录、列表展示、编辑删除和筛选功能，但缺少用户头像昵称展示、图片上传能力和个人中心页面。本次升级在已有基础上，新增打卡图片上传、用户资料管理和"我的"页面，直接满足第三次课全部验收要求并覆盖加分项。

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

- **新建** `userProfiles` 云数据库集合：存储用户昵称、头像、累计统计
- **扩展** `studyRecords` 集合：新增 `imageFileID` 字段，关联云存储图片
- **扩展** `cloudfunctions/studyFunctions/index.js`：新增 `getUserProfile`、`updateUserProfile`、`getImageUrl` 三个 action；扩展 `checkIn` 和 `updateRecord` 支持图片
- **新建** `cloudfunctions/getImageUrl/` 独立云函数：用 `cloud.getTempFileURL` 将云存储 fileID 换临时链接（满足"多人共享图片"场景要求）
- **扩展** `miniprogram/utils/studyService.js`：新增用户资料和图片相关封装方法
- **改造** `miniprogram/app.js`：统一获取用户信息，存储到 globalData
- **改造** `miniprogram/pages/index/index`：顶部显示用户头像和昵称，添加分享功能
- **改造** `miniprogram/pages/checkin/checkin`：增加图片选择和上传功能
- **改造** `miniprogram/pages/records/index`：记录卡片显示图片缩略图
- **改造** `miniprogram/pages/recordEdit/index`：支持替换打卡图片
- **新增** `miniprogram/pages/profile/index`："我的"页面，展示个人资料和累计统计
- **改造** `miniprogram/app.json`：tabBar 增加"我的"入口

## Impact

- Affected specs: study-checkin-lesson2-cloud-records
- Affected code:
  - `cloudfunctions/studyFunctions/index.js`（新增 action + 扩展现有 action）
  - `cloudfunctions/getImageUrl/index.js`（全新云函数）
  - `miniprogram/utils/studyService.js`（新增封装方法）
  - `miniprogram/app.js`（用户信息获取）
  - `miniprogram/pages/index/index`（用户信息显示 + 分享）
  - `miniprogram/pages/checkin/checkin`（图片上传）
  - `miniprogram/pages/records/index`（图片显示）
  - `miniprogram/pages/recordEdit/index`（图片替换）
  - `miniprogram/pages/profile/index`（全新页面）
  - `miniprogram/app.json`（tabBar 更新）

## ADDED Requirements

### Requirement: 用户登录与身份识别

The system SHALL 获取并展示用户微信头像和昵称，在云数据库中存储用户资料。

#### Scenario: 用户首次打开小程序
- **WHEN** 用户打开小程序
- **THEN** 系统调用 `wx.getUserProfile` 获取用户昵称和头像
- **AND** 调用云函数 `getUserProfile` 将用户信息存入 `userProfiles` 集合
- **AND** 首页顶部显示用户头像和昵称

#### Scenario: 用户查看个人资料
- **WHEN** 用户进入"我的"页面
- **THEN** 显示用户头像、昵称
- **AND** 显示累计学习时长、累计打卡次数、连续打卡天数

### Requirement: 云存储使用

The system SHALL 支持用户为打卡记录上传图片，图片存储在云存储中，可在小程序内正常访问。

#### Scenario: 用户打卡时上传图片
- **WHEN** 用户在打卡页点击"上传图片"
- **THEN** 调用 `wx.chooseMedia` 选择一张图片
- **AND** 调用 `wx.cloud.uploadFile` 上传到云存储，路径为 `records/{openid}/{timestamp}.jpg`
- **AND** 上传成功后获得 `fileID`
- **AND** 用户提交打卡时，`fileID` 随记录存入 `studyRecords` 集合的 `imageFileID` 字段
- **AND** 打卡成功后返回首页，记录卡片显示图片缩略图

#### Scenario: 多人共享图片链接转换
- **WHEN** 系统需要显示云存储图片（fileID）
- **THEN** 调用云函数 `getImageUrl`，传入 `{ fileIDs: [fileID] }`
- **AND** 云函数内部使用 `cloud.getTempFileURL({ fileList: fileIDs })` 换取临时 HTTPS 链接
- **AND** 返回临时链接列表，小程序用 `image` 组件显示

### Requirement: 加载状态与错误处理

The system SHALL 在所有网络请求时显示 loading 状态，失败时给出错误提示，成功时给出反馈。

#### Scenario: 数据加载
- **WHEN** 页面加载数据时
- **THEN** 显示 "加载中..." 提示（wx.showLoading 或页面内 loading 状态）
- **AND** 加载完成后隐藏 loading
- **WHEN** 网络请求失败
- **THEN** 显示 Toast 错误提示（如 "加载失败，请重试"）

#### Scenario: 表单提交
- **WHEN** 用户提交打卡表单
- **THEN** 按钮显示 loading 状态
- **AND** 提交成功后显示 "打卡成功" Toast
- **AND** 提交失败后显示具体错误信息

### Requirement: 新增"我的"页面

The system SHALL 提供"我的"页面，展示用户个人数据和累计统计。

#### Scenario: 用户查看"我的"页面
- **WHEN** 用户点击底部 tabBar "我的"
- **THEN** 跳转到 `pages/profile/index`
- **AND** 显示用户头像、昵称
- **AND** 显示累计学习时长、累计打卡次数、连续打卡天数
- **AND** 提供"分享给好友"按钮

### Requirement: 分享给微信好友

The system SHALL 支持将小程序分享给微信好友。

#### Scenario: 用户分享小程序
- **WHEN** 用户点击"分享给好友"或在首页点击右上角分享
- **THEN** 弹出微信分享面板
- **AND** 分享标题为"学习打卡 - 我已坚持打卡 X 天"
- **AND** 分享路径为首页

## MODIFIED Requirements

### Requirement: 打卡记录支持图片

The system SHALL 允许用户在打卡时上传一张图片，并在记录列表和编辑页中显示和修改。

#### Scenario: 编辑记录时替换图片
- **WHEN** 用户在记录编辑页看到已有图片
- **THEN** 可以点击"更换图片"重新选择上传
- **AND** 提交后更新 `studyRecords` 的 `imageFileID` 字段

## REMOVED Requirements

无

---

## 数据库设计

### 新建集合

#### userProfiles（用户资料）

| 字段 | 类型 | 说明 |
|------|------|------|
| `_openid` | string | 用户唯一标识 |
| `nickName` | string | 用户昵称 |
| `avatarUrl` | string | 头像 URL |
| `totalMinutes` | number | 累计学习时长（分钟） |
| `totalRecords` | number | 累计打卡次数 |
| `streak` | number | 连续打卡天数 |
| `createTime` | date | 创建时间 |
| `updateTime` | date | 更新时间 |

**权限**：仅创建者可读写
**索引**：
| 索引名称 | 字段 | 排序 | 属性 | 用途 |
|---------|------|------|------|------|
| idx_openid_unique | `_openid` | 升序 | **唯一** | 按 openid 精确查询用户资料 |

### 已有集合扩展

#### studyRecords（打卡记录）

新增字段：
| 字段 | 类型 | 说明 |
|------|------|------|
| `imageFileID` | string | 云存储图片 fileID（可选） |

### 云存储

- **路径规则**：`records/{openid}/{Date.now()}_${random}.jpg`
- **访问方式**：通过 `cloud.getTempFileURL` 换取临时 HTTPS 链接显示
- **权限**：默认仅创建者可读写

---

## 云函数设计

### studyFunctions 扩展 action

| action | 说明 | 参数 | 返回 |
|--------|------|------|------|
| `getUserProfile` | 获取或创建用户资料 | 无（从 context 取 openid） | `{ success, data: profile }` |
| `updateUserProfile` | 更新用户资料 | `{ nickName, avatarUrl }` | `{ success }` |
| `checkIn` | 扩展支持图片 | 增加 `imageFileID?` | 不变 |
| `updateRecord` | 扩展支持图片 | 增加 `imageFileID?` | 不变 |

### 独立云函数 getImageUrl

| 参数 | 说明 | 返回 |
|------|------|------|
| `{ fileIDs: string[] }` | 云存储 fileID 列表 | `{ success, data: { fileList: [{ fileID, tempFileURL, status, errMsg }] } }` |

**实现要点**：
- 使用 `cloud.getTempFileURL({ fileList: fileIDs })` 换取临时链接
- 支持批量转换（最多 50 个 fileID）
- 返回原始 fileID 与临时 URL 的映射关系
