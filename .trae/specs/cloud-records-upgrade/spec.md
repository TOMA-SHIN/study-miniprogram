# 音乐记录云存储升级 Spec

## Why

为满足第二次课"云开发数据库与后端"的验收要求，在现有音乐播放器小程序基础上新增一个完整的"音乐记录"功能。用户可通过表单添加音乐相关记录，所有数据写入微信云开发数据库并通过云函数操作，实现换设备登录数据不丢失，从而真实体现云数据库与云后端能力。

## What Changes

- **新增** `miniprogram/pages/records/list/`：记录列表页，从云数据库读取并展示当前用户的全部记录
- **新增** `miniprogram/pages/records/add/`：记录添加页，表单提交后通过云函数写入数据库
- **新增（可选）** `miniprogram/pages/records/edit/`：记录编辑页，支持修改已有记录
- **改造** `miniprogram/app.json`：在 tabBar 新增"记录"入口
- **新增** `cloudfunctions/recordFunctions/`：记录业务云函数（增删改查、搜索筛选、统计）
- **新增** `miniprogram/utils/recordService.js`：前端记录服务封装
- **新增** 云数据库集合 `user_records`：存储用户音乐记录

## Impact

- Affected specs: music-miniprogram-design
- Affected code: `miniprogram/app.json`、`miniprogram/pages/records/*`、`cloudfunctions/recordFunctions/*`、`miniprogram/utils/recordService.js`

## 项目配置

### APPID

```
wx2e88a600d65a90d2
```

### 云环境 ID

```
cloud1-d0g889dl64933afbe
```

### 参考文档

- [微信云开发快速开始](https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloud/basis/getting-started.html)
- [微信云开发数据库](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database.html)
- [微信云开发云函数](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/functions.html)

## 数据库设计

### 集合：`user_records`（用户音乐记录表）

**用途**：存储用户添加的音乐记录/日记

**数据结构**：

```json
{
  "_id": "自动生成",
  "_openid": "用户openid（云函数自动注入）",
  "title": "记录标题",
  "content": "记录内容",
  "category": "记录分类，如：流行/摇滚/民谣/古典",
  "mood": "心情标签，如：开心/难过/放松",
  "createTime": "2026-06-24T00:00:00.000Z",
  "updateTime": "2026-06-24T00:00:00.000Z"
}
```

**权限设置**：

- 仅创建者可读写
- 安全规则：`{"read": "auth.openid == doc._openid", "write": "auth.openid == doc._openid"}`
- 控制台可选模板："仅创建者可读写"

**索引设计**：

| 索引名称 | 字段 | 排序 | 是否唯一 | 用途 |
|---|---|---|---|---|
| idx_openid | `_openid` | 升序 | 否 | 按用户查询记录 |
| idx_createTime | `createTime` | 降序 | 否 | 按时间倒序展示 |
| idx_category | `category` | 升序 | 否 | 按分类筛选 |
| idx_openid_createTime | `_openid` 升序 + `createTime` 降序 | 复合 | 否 | 用户记录按时间倒序的高效查询 |

## 云函数设计

### 云函数：`recordFunctions`

**入口函数**：根据 `event.action` 分发

| action | 说明 | 参数 | 返回 |
|---|---|---|---|
| `addRecord` | 添加记录 | `{ title, content, category, mood }` | `{ success, recordId }` |
| `getRecords` | 获取记录列表 | `{ page, pageSize, category }` | `{ success, list, total }` |
| `updateRecord` | 更新记录 | `{ recordId, title, content, category, mood }` | `{ success }` |
| `deleteRecord` | 删除记录 | `{ recordId }` | `{ success }` |
| `searchRecords` | 搜索记录 | `{ keyword, category }` | `{ success, list }` |
| `getStatistics` | 获取统计 | `{}` | `{ success, total, categoryStats }` |

**package.json**：

```json
{
  "name": "recordFunctions",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

**config.json**：

```json
{
  "permissions": {
    "openapi": []
  }
}
```

## 页面结构

```
miniprogram/
└── pages/
    └── records/
        ├── list/          # 记录列表页（tabBar 入口）
        │   ├── index.js
        │   ├── index.json
        │   ├── index.wxml
        │   └── index.wxss
        ├── add/           # 添加记录页
        │   ├── index.js
        │   ├── index.json
        │   ├── index.wxml
        │   └── index.wxss
        └── edit/          # 编辑记录页（可选）
            ├── index.js
            ├── index.json
            ├── index.wxml
            └── index.wxss
```

## tabBar 改造

在原有 tabBar 基础上新增"记录"项：

```json
{
  "pagePath": "pages/records/list/index",
  "text": "记录",
  "iconPath": "images/icons/records.png",
  "selectedIconPath": "images/icons/records-active.png"
}
```

> 若暂无 records 图标，可复用 `images/icons/examples.png` / `examples-active.png`，或准备新图标后替换路径。

## ADDED Requirements

### Requirement: 音乐记录添加能力

The system SHALL 提供表单页面，允许用户输入记录标题、内容、分类、心情并提交到云数据库。

#### Scenario: 用户成功添加记录

- **WHEN** 用户在添加页填写表单并点击提交
- **THEN** 系统校验输入内容
- **AND** 调用云函数 `recordFunctions.addRecord` 将记录写入 `user_records` 集合
- **AND** 写入成功后返回列表页并刷新列表

### Requirement: 音乐记录列表展示能力

The system SHALL 从云数据库读取当前用户的所有记录并分页展示。

#### Scenario: 用户查看记录列表

- **WHEN** 用户进入记录列表页
- **THEN** 系统调用云函数 `recordFunctions.getRecords` 拉取记录
- **AND** 按创建时间倒序展示
- **AND** 支持下拉刷新与上拉加载更多

### Requirement: 数据跨设备持久化能力

The system SHALL 确保用户添加的记录存储在云端，换设备登录后仍可查看。

#### Scenario: 用户换设备登录

- **WHEN** 用户使用同一微信账号在新设备打开小程序
- **THEN** 系统通过 `wx.cloud.callFunction` 调用后端
- **AND** 后端根据用户 `openid` 查询并返回该用户的全部记录

### Requirement: 记录删除与编辑能力（可选）

The system SHALL 允许用户删除或修改自己创建的记录。

#### Scenario: 用户删除记录

- **WHEN** 用户在列表页左滑或点击删除按钮
- **THEN** 系统调用云函数 `recordFunctions.deleteRecord`
- **AND** 从云数据库移除该记录

#### Scenario: 用户编辑记录

- **WHEN** 用户点击编辑按钮
- **THEN** 系统跳转编辑页并回显数据
- **AND** 提交时调用 `recordFunctions.updateRecord` 更新数据库

### Requirement: 记录搜索与筛选能力（可选）

The system SHALL 支持按关键词搜索标题/内容，以及按分类筛选记录。

#### Scenario: 用户搜索记录

- **WHEN** 用户在列表页输入关键词或选择分类
- **THEN** 系统调用 `recordFunctions.searchRecords`
- **AND** 展示匹配结果

### Requirement: 记录统计展示能力（可选）

The system SHALL 在列表页顶部展示记录统计信息。

#### Scenario: 用户查看统计

- **WHEN** 用户进入列表页
- **THEN** 系统调用 `recordFunctions.getStatistics`
- **AND** 展示总记录数、各分类数量等汇总信息

## MODIFIED Requirements

### Requirement: 小程序底部导航

The system SHALL 在底部 tabBar 新增"记录"入口，使用户可以访问记录列表页。

#### Scenario: 用户切换 tab

- **WHEN** 用户点击"记录" tab
- **THEN** 系统跳转到 `pages/records/list/index`
- **AND** 展示该用户的音乐记录列表

## REMOVED Requirements

无
