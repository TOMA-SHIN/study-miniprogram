# 音乐播放微信小程序 Spec

## Why

用户希望基于现有的微信云开发小程序模板，开发一个完整的音乐播放微信小程序。当前项目模板为云开发 QuickStart，包含基础的云函数、数据库、云存储示例代码，需要将其改造为音乐播放小程序。

## What Changes

- **改造** `miniprogram/app.js`：配置云环境 ID 为 `cloud1-d0g889dl64933afbe`
- **改造** `miniprogram/app.json`：配置小程序页面路由和 tabBar
- **改造** `miniprogram/app.wxss`：定义全局音乐小程序样式
- **新增** `miniprogram/pages/index/`：首页（推荐歌单、热门歌曲）
- **新增** `miniprogram/pages/player/`：音乐播放页（播放控制、进度条、歌词）
- **新增** `miniprogram/pages/search/`：搜索页（歌曲搜索）
- **新增** `miniprogram/pages/mine/`：我的页面（收藏、播放历史）
- **新增** `miniprogram/components/musicList/`：歌曲列表组件
- **新增** `miniprogram/components/miniPlayer/`：底部迷你播放器组件
- **新增** `miniprogram/utils/`：工具函数（音频管理、格式化）
- **新增** `miniprogram/images/icons/`：音乐相关图标
- **新增** `cloudfunctions/musicFunctions/`：音乐业务云函数
- **删除** 原有 QuickStart 示例页面和组件（`pages/example/`、`components/cloudTipModal/`）

## Impact

- Affected specs: 云开发 QuickStart（完全替换为音乐小程序）
- Affected code: `miniprogram/` 目录全部文件、`cloudfunctions/` 目录

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
- [微信音频 API](https://developers.weixin.qq.com/miniprogram/dev/api/media/audio/wx.createInnerAudioContext.html)

## 页面结构

```
miniprogram/
├── app.js                    # 入口，配置云环境
├── app.json                  # 全局配置、页面路由、tabBar
├── app.wxss                  # 全局样式
├── sitemap.json              # 站点地图
├── utils/
│   ├── audioManager.js       # 音频管理器封装
│   ├── util.js               # 通用工具函数
│   └── db.js                 # 数据库操作封装
├── images/
│   └── icons/                # 图标资源
├── components/
│   ├── musicList/            # 歌曲列表组件
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   └── miniPlayer/           # 底部迷你播放器组件
│       ├── index.js
│       ├── index.json
│       ├── index.wxml
│       └── index.wxss
└── pages/
    ├── index/                # 首页（推荐）
    │   ├── index.js
    │   ├── index.json
    │   ├── index.wxml
    │   └── index.wxss
    ├── player/               # 播放页
    │   ├── index.js
    │   ├── index.json
    │   ├── index.wxml
    │   └── index.wxss
    ├── search/               # 搜索页
    │   ├── index.js
    │   ├── index.json
    │   ├── index.wxml
    │   └── index.wxss
    └── mine/                 # 我的页面
        ├── index.js
        ├── index.json
        ├── index.wxml
        └── index.wxss
```

## 云函数结构

```
cloudfunctions/
└── musicFunctions/
    ├── index.js              # 云函数入口
    ├── config.json           # 权限配置
    └── package.json          # 依赖配置
```

## 数据库设计

### 集合 1：`songs`（歌曲表）

**用途**：存储歌曲基本信息

**数据结构**：
```json
{
  "_id": "自动生成",
  "_openid": "创建者openid（管理员）",
  "title": "歌曲名称",
  "artist": "歌手名称",
  "album": "专辑名称",
  "coverUrl": "封面图片云存储 fileID",
  "audioUrl": "音频文件云存储 fileID",
  "lyrics": "歌词文本（LRC 格式）",
  "duration": 240,
  "playCount": 0,
  "createTime": "2026-06-17T00:00:00.000Z",
  "updateTime": "2026-06-17T00:00:00.000Z"
}
```

**权限设置**：
- 所有用户可读，仅管理员可写
- 规则：`{"read": true, "write": "auth.openid == doc._openid || doc._openid == 'admin' || false"}`
- 简化规则（推荐）：`{"read": true, "write": false}`（前端不可写，仅通过云函数操作）

**索引**：
| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | text | 支持歌曲名模糊搜索 |
| `artist` | text | 支持歌手名模糊搜索 |
| `playCount` | number | 按播放量排序 |
| `createTime` | number | 按创建时间排序 |

**初始数据**：需手动或通过云函数添加至少 10 首测试歌曲

---

### 集合 2：`playlists`（歌单表）

**用途**：存储推荐歌单

**数据结构**：
```json
{
  "_id": "自动生成",
  "name": "歌单名称",
  "coverUrl": "歌单封面云存储 fileID",
  "description": "歌单描述",
  "songIds": ["song_id_1", "song_id_2"],
  "playCount": 0,
  "createTime": "2026-06-17T00:00:00.000Z"
}
```

**权限设置**：
- 所有用户可读，仅管理员可写
- 规则：`{"read": true, "write": false}`

**索引**：
| 字段 | 类型 | 说明 |
|------|------|------|
| `playCount` | number | 按播放量排序 |
| `createTime` | number | 按创建时间排序 |

---

### 集合 3：`user_favorites`（用户收藏表）

**用途**：存储用户收藏的歌曲

**数据结构**：
```json
{
  "_id": "自动生成",
  "_openid": "用户openid",
  "songId": "歌曲ID",
  "createTime": "2026-06-17T00:00:00.000Z"
}
```

**权限设置**：
- 仅创建者可读写
- 规则：`{"read": "auth.openid == doc._openid", "write": "auth.openid == doc._openid"}`

**索引**：
| 字段 | 类型 | 唯一 | 说明 |
|------|------|------|------|
| `_openid` | string | 否 | 按用户查询收藏 |
| `songId` | string | 否 | 按歌曲查询 |
| `_openid + songId` | 复合索引 | 是 | 防止重复收藏 |

---

### 集合 4：`play_history`（播放历史表）

**用途**：存储用户播放记录

**数据结构**：
```json
{
  "_id": "自动生成",
  "_openid": "用户openid",
  "songId": "歌曲ID",
  "playTime": "2026-06-17T00:00:00.000Z"
}
```

**权限设置**：
- 仅创建者可读写
- 规则：`{"read": "auth.openid == doc._openid", "write": "auth.openid == doc._openid"}`

**索引**：
| 字段 | 类型 | 说明 |
|------|------|------|
| `_openid` | string | 按用户查询 |
| `playTime` | number | 按播放时间倒序 |

---

### 集合 5：`admin_config`（管理员配置表，可选）

**用途**：存储首页推荐配置、轮播图等

**数据结构**：
```json
{
  "_id": "自动生成",
  "type": "banner|recommend",
  "data": {},
  "order": 0,
  "createTime": "2026-06-17T00:00:00.000Z"
}
```

**权限设置**：
- 仅管理员可读写
- 规则：`{"read": true, "write": false}`

---

## 云函数设计

### 云函数：`musicFunctions`

**入口函数**：根据 `event.action` 分发

| action | 说明 | 参数 | 返回 |
|--------|------|------|------|
| `getSongList` | 获取歌曲列表 | `{ page, pageSize, category }` | `{ list, total }` |
| `getSongDetail` | 获取歌曲详情 | `{ songId }` | `{ song }` |
| `searchSongs` | 搜索歌曲 | `{ keyword, page, pageSize }` | `{ list, total }` |
| `getPlaylists` | 获取歌单列表 | `{ page, pageSize }` | `{ list, total }` |
| `getPlaylistDetail` | 获取歌单详情 | `{ playlistId }` | `{ playlist, songs }` |
| `addFavorite` | 收藏歌曲 | `{ songId }` | `{ success }` |
| `removeFavorite` | 取消收藏 | `{ songId }` | `{ success }` |
| `getFavorites` | 获取收藏列表 | `{ page, pageSize }` | `{ list, total }` |
| `addPlayHistory` | 添加播放记录 | `{ songId }` | `{ success }` |
| `getPlayHistory` | 获取播放历史 | `{ page, pageSize }` | `{ list, total }` |
| `incrementPlayCount` | 增加歌曲播放量 | `{ songId }` | `{ success }` |
| `getHomeData` | 获取首页数据 | `{}` | `{ banners, recommendPlaylists, hotSongs }` |

**package.json 依赖**：
```json
{
  "name": "musicFunctions",
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

---

## 核心功能模块

### 1. 音频管理器（`utils/audioManager.js`）

封装 `wx.createInnerAudioContext()`，提供：
- 播放/暂停/停止
- 上一首/下一首
- 进度获取与跳转
- 播放模式切换（顺序/随机/单曲循环）
- 播放状态监听（onPlay/onPause/onEnded/onTimeUpdate/onError）
- 播放队列管理

### 2. 首页（`pages/index/`）

- 顶部轮播图（从 `admin_config` 获取）
- 推荐歌单列表（从 `playlists` 获取）
- 热门歌曲列表（从 `songs` 按 `playCount` 排序）
- 点击歌曲直接播放，点击歌单进入歌单详情

### 3. 播放页（`pages/player/`）

- 歌曲封面展示（旋转动画）
- 播放控制栏（播放/暂停、上一首、下一首）
- 进度条（可拖拽）
- 歌词滚动展示
- 播放模式切换
- 收藏按钮

### 4. 搜索页（`pages/search/`）

- 搜索输入框
- 搜索结果列表
- 热门搜索（可选）
- 搜索历史（本地存储）

### 5. 我的页面（`pages/mine/`）

- 用户头像/昵称（可选，使用微信头像）
- 我的收藏
- 播放历史
- 关于小程序

### 6. 底部迷你播放器（`components/miniPlayer/`）

- 在首页、搜索页、我的页面底部显示
- 显示当前播放歌曲封面和名称
- 播放/暂停按钮
- 点击跳转到播放页

### 7. 歌曲列表组件（`components/musicList/`）

- 通用歌曲列表，支持传入歌曲数组
- 显示歌曲名、歌手、专辑
- 点击播放
- 支持收藏状态显示

---

## tabBar 配置

```json
{
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#1aad19",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "images/icons/home.png",
        "selectedIconPath": "images/icons/home-active.png"
      },
      {
        "pagePath": "pages/search/index",
        "text": "搜索",
        "iconPath": "images/icons/search.png",
        "selectedIconPath": "images/icons/search-active.png"
      },
      {
        "pagePath": "pages/mine/index",
        "text": "我的",
        "iconPath": "images/icons/mine.png",
        "selectedIconPath": "images/icons/mine-active.png"
      }
    ]
  }
}
```

---

## 全局样式规范

- 主色调：`#1aad19`（微信绿）
- 背景色：`#f6f6f6`
- 文字颜色：`#333333`（主文字）、`#666666`（次要文字）、`#999999`（辅助文字）
- 字体：PingFang SC, -apple-system, sans-serif
- 圆角：`16rpx`（卡片）、`8rpx`（按钮）

---

## 图标资源说明

需要准备的图标图标（可使用现有模板中的图标或自行添加）：
- `home.png` / `home-active.png`：首页 tab 图标（可复用现有）
- `search.png` / `search-active.png`：搜索 tab 图标
- `mine.png` / `mine-active.png`：我的 tab 图标
- `play.png` / `pause.png`：播放/暂停按钮
- `prev.png` / `next.png`：上一首/下一首
- `favorite.png` / `favorite-active.png`：收藏图标
- `mode-sequence.png` / `mode-random.png` / `mode-single.png`：播放模式图标
- `music-default.png`：默认歌曲封面

> 注意：图标文件需开发者自行准备并放入 `miniprogram/images/icons/` 目录。开发阶段可使用占位图标或使用现有模板中的图标替代。

---

## 云存储目录规划

```
cloud://cloud1-d0g889dl64933afbe/
├── music/                  # 音频文件
│   ├── song1.mp3
│   ├── song2.mp3
│   └── ...
├── covers/                 # 歌曲封面
│   ├── cover1.png
│   ├── cover2.png
│   └── ...
├── playlists/              # 歌单封面
│   ├── playlist1.png
│   └── ...
└── banners/                # 首页轮播图
    ├── banner1.png
    └── ...
```

---

## 开发前准备（引导用户完成）

### 1. 云环境配置确认
- 确认云环境 `cloud1-d0g889dl64933afbe` 已开通
- 确认云环境中有足够的存储空间

### 2. 创建数据库集合
在微信开发者工具中，点击「云开发」->「数据库」，依次创建以下集合：
1. `songs` - 权限选择「所有用户可读，仅管理员可写」
2. `playlists` - 权限选择「所有用户可读，仅管理员可写」
3. `user_favorites` - 权限选择「仅创建者可读写」
4. `play_history` - 权限选择「仅创建者可读写」
5. `admin_config` - 权限选择「仅管理员可读写」

### 3. 创建数据库索引
在微信开发者工具中，进入各集合的「索引设置」，按上述索引表添加索引。

### 4. 上传云函数
在微信开发者工具中，右键 `cloudfunctions/musicFunctions/` 目录，选择「上传并部署 - 云端安装依赖」。

### 5. 上传测试数据
- 通过云存储上传音频文件到 `music/` 目录
- 上传封面图片到 `covers/` 目录
- 通过云开发控制台或云函数向 `songs` 集合添加歌曲记录
- 向 `playlists` 集合添加歌单记录

### 6. 准备图标资源
将所需图标文件放入 `miniprogram/images/icons/` 目录。

---

## ADDED Requirements

### Requirement: 音乐播放能力
The system SHALL 提供完整的音乐播放功能，包括播放、暂停、进度控制、上下首切换。

#### Scenario: 用户播放音乐
- **WHEN** 用户点击歌曲列表中的歌曲
- **THEN** 系统调用音频 API 播放该歌曲，底部迷你播放器显示歌曲信息
- **AND** 播放页展示封面、歌词、进度条

#### Scenario: 用户切换歌曲
- **WHEN** 用户在播放页点击上一首/下一首按钮
- **THEN** 系统切换到对应歌曲并继续播放

### Requirement: 歌曲搜索能力
The system SHALL 提供歌曲搜索功能，支持按歌曲名和歌手名搜索。

#### Scenario: 用户搜索歌曲
- **WHEN** 用户在搜索页输入关键词
- **THEN** 系统调用云函数搜索匹配的歌曲并展示结果

### Requirement: 收藏管理能力
The system SHALL 提供歌曲收藏功能，用户可收藏/取消收藏歌曲。

#### Scenario: 用户收藏歌曲
- **WHEN** 用户在播放页或歌曲列表点击收藏按钮
- **THEN** 系统将歌曲添加到用户收藏列表

### Requirement: 播放历史能力
The system SHALL 记录用户播放历史，展示最近播放的歌曲。

#### Scenario: 系统记录播放历史
- **WHEN** 用户播放一首歌曲
- **THEN** 系统将播放记录写入 `play_history` 集合

### Requirement: 歌单展示能力
The system SHALL 在首页展示推荐歌单，用户可点击歌单查看歌曲列表。

#### Scenario: 用户查看歌单
- **WHEN** 用户在首页点击推荐歌单
- **THEN** 系统展示该歌单的歌曲列表

---

## MODIFIED Requirements

### Requirement: 云环境配置
The system SHALL 在 `app.js` 中配置云环境 ID 为 `cloud1-d0g889dl64933afbe`。

#### Scenario: 小程序启动
- **WHEN** 小程序启动
- **THEN** 系统调用 `wx.cloud.init()` 初始化云环境 `cloud1-d0g889dl64933afbe`

---

## REMOVED Requirements

### Requirement: QuickStart 示例功能
**Reason**: 音乐小程序不需要云开发 QuickStart 的示例功能
**Migration**: 删除 `pages/example/` 目录、`components/cloudTipModal/` 目录，清理 `app.json` 中的相关页面路由
