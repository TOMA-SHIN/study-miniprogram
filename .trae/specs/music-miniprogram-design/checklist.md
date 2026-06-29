# Checklist - 音乐播放微信小程序验收检查清单

## 一、项目配置

- [ ] `miniprogram/app.js` 中云环境 ID 已配置为 `cloud1-d0g889dl64933afbe`
- [ ] `miniprogram/app.json` 中页面路由包含 `pages/index/index`、`pages/player/index`、`pages/search/index`、`pages/mine/index`
- [ ] `miniprogram/app.json` 中 tabBar 配置正确（首页、搜索、我的三个 tab）
- [ ] `miniprogram/app.json` 中 `window` 配置合理（导航栏标题、背景色等）
- [ ] `miniprogram/app.wxss` 中全局样式定义了主色调 `#1aad19`、背景色 `#f6f6f6`、字体等
- [ ] `project.config.json` 中 `appid` 为 `wx2e88a600d65a90d2`

## 二、原有代码清理

- [ ] 已删除 `miniprogram/pages/example/` 目录
- [ ] 已删除 `miniprogram/components/cloudTipModal/` 目录
- [ ] 已删除 `cloudfunctions/quickstartFunctions/` 目录
- [ ] `miniprogram/app.json` 中已移除原有示例页面路由

## 三、工具函数

- [ ] `miniprogram/utils/util.js` 存在且包含时间格式化函数（秒转 mm:ss）
- [ ] `miniprogram/utils/audioManager.js` 存在且封装了 `wx.createInnerAudioContext()`
- [ ] `audioManager.js` 实现了播放/暂停/停止/跳转方法
- [ ] `audioManager.js` 实现了上一首/下一首切换逻辑
- [ ] `audioManager.js` 实现了播放模式切换（顺序/随机/单曲循环）
- [ ] `audioManager.js` 实现了播放队列管理
- [ ] `audioManager.js` 实现了事件监听（onPlay/onPause/onEnded/onTimeUpdate/onError）
- [ ] `miniprogram/utils/db.js` 存在且封装了数据库操作函数

## 四、组件

### 歌曲列表组件（musicList）
- [ ] `miniprogram/components/musicList/` 目录下包含 `index.js`、`index.json`、`index.wxml`、`index.wxss` 四个文件
- [ ] 组件接收歌曲数组作为 properties
- [ ] 组件展示歌曲名称、歌手名称
- [ ] 组件支持点击歌曲触发播放事件
- [ ] 组件支持收藏状态显示

### 迷你播放器组件（miniPlayer）
- [ ] `miniprogram/components/miniPlayer/` 目录下包含 `index.js`、`index.json`、`index.wxml`、`index.wxss` 四个文件
- [ ] 组件显示当前播放歌曲封面和名称
- [ ] 组件包含播放/暂停按钮
- [ ] 组件点击可跳转到播放页
- [ ] 组件在未播放时隐藏

## 五、首页（pages/index）

- [ ] 页面包含轮播图区域（swiper 组件）
- [ ] 页面包含推荐歌单区域（横向滚动）
- [ ] 页面包含热门歌曲列表区域
- [ ] 页面集成了 miniPlayer 组件
- [ ] 页面数据从云函数 `musicFunctions` 加载（action: `getHomeData`）
- [ ] 点击歌曲可直接播放
- [ ] 点击歌单可进入歌单详情查看歌曲

## 六、播放页（pages/player）

- [ ] 页面展示歌曲封面（带旋转动画）
- [ ] 页面包含播放/暂停控制按钮
- [ ] 页面包含上一首/下一首按钮
- [ ] 页面包含可拖拽的进度条（slider 组件）
- [ ] 页面展示歌词并支持滚动
- [ ] 页面包含播放模式切换按钮
- [ ] 页面包含收藏/取消收藏按钮
- [ ] 播放页通过 `onLoad` 接收歌曲 ID 参数
- [ ] 页面正确调用音频管理器控制播放

## 七、搜索页（pages/search）

- [ ] 页面包含搜索输入框
- [ ] 搜索输入实现了防抖处理
- [ ] 搜索结果通过云函数 `musicFunctions` 搜索（action: `searchSongs`）
- [ ] 搜索结果使用 musicList 组件展示
- [ ] 页面包含搜索历史区域
- [ ] 搜索历史使用本地存储（`wx.setStorageSync`/`wx.getStorageSync`）
- [ ] 页面集成了 miniPlayer 组件

## 八、我的页面（pages/mine）

- [ ] 页面包含用户信息区域（头像、昵称）
- [ ] 页面包含"我的收藏"入口
- [ ] 页面包含"播放历史"入口
- [ ] 收藏列表通过云函数加载（action: `getFavorites`）
- [ ] 播放历史通过云函数加载（action: `getPlayHistory`）
- [ ] 页面集成了 miniPlayer 组件

## 九、云函数（musicFunctions）

- [ ] `cloudfunctions/musicFunctions/package.json` 存在且依赖包含 `wx-server-sdk`
- [ ] `cloudfunctions/musicFunctions/config.json` 存在
- [ ] `cloudfunctions/musicFunctions/index.js` 存在且实现了入口分发逻辑
- [ ] 云函数实现了 `getSongList` action（分页获取歌曲列表）
- [ ] 云函数实现了 `getSongDetail` action（获取歌曲详情）
- [ ] 云函数实现了 `searchSongs` action（模糊搜索 title 和 artist）
- [ ] 云函数实现了 `getPlaylists` action（获取歌单列表）
- [ ] 云函数实现了 `getPlaylistDetail` action（获取歌单详情及歌曲）
- [ ] 云函数实现了 `addFavorite` action（收藏歌曲）
- [ ] 云函数实现了 `removeFavorite` action（取消收藏）
- [ ] 云函数实现了 `getFavorites` action（获取用户收藏列表）
- [ ] 云函数实现了 `addPlayHistory` action（添加播放记录）
- [ ] 云函数实现了 `getPlayHistory` action（获取播放历史）
- [ ] 云函数实现了 `incrementPlayCount` action（增加播放量）
- [ ] 云函数实现了 `getHomeData` action（获取首页推荐数据）
- [ ] 云函数包含正确的错误处理

## 十、数据库集合

- [ ] `songs` 集合已创建，权限为"所有用户可读，仅管理员可写"
- [ ] `songs` 集合包含 `title`（text）、`artist`（text）、`playCount`（number）、`createTime`（number）索引
- [ ] `playlists` 集合已创建，权限为"所有用户可读，仅管理员可写"
- [ ] `playlists` 集合包含 `playCount`（number）、`createTime`（number）索引
- [ ] `user_favorites` 集合已创建，权限为"仅创建者可读写"
- [ ] `user_favorites` 集合包含 `_openid + songId` 复合唯一索引
- [ ] `play_history` 集合已创建，权限为"仅创建者可读写"
- [ ] `play_history` 集合包含 `_openid`、`playTime` 索引
- [ ] `admin_config` 集合已创建，权限为"仅管理员可读写"

## 十一、图标资源

- [ ] `miniprogram/images/icons/` 目录下包含 tabBar 图标（home/home-active/search/search-active/mine/mine-active）
- [ ] 包含播放控制图标（play/pause/prev/next）
- [ ] 包含功能图标（favorite/favorite-active/mode-sequence/mode-random/mode-single）
- [ ] 包含默认封面图（music-default.png）

## 十二、代码质量

- [ ] 所有 JS 文件未使用 `any` 类型（TS 场景）
- [ ] 无空 `catch {}` 静默吞错
- [ ] 函数职责单一，无超长函数（建议 ≤30 行）
- [ ] 命名规范：变量/函数 camelCase，组件 PascalCase
- [ ] 无硬编码密钥或敏感信息
- [ ] 云函数中未关闭 TS strict 或禁用 ESLint

## 十三、功能验收

- [ ] 首页能正确加载轮播图、推荐歌单、热门歌曲
- [ ] 点击歌曲可正常播放，底部迷你播放器显示歌曲信息
- [ ] 播放页封面旋转动画正常
- [ ] 播放/暂停/上一首/下一首功能正常
- [ ] 进度条可拖拽跳转播放进度
- [ ] 歌词滚动展示正常
- [ ] 播放模式切换正常（顺序/随机/单曲循环）
- [ ] 搜索功能可正确搜索歌曲
- [ ] 搜索历史可保存和展示
- [ ] 收藏/取消收藏功能正常
- [ ] 播放历史可正确记录
- [ ] 我的页面可展示收藏列表和播放历史
- [ ] tabBar 切换正常，miniPlayer 在非播放页正确展示
- [ ] 歌单详情页可正确展示歌曲列表

## 十四、部署验证

- [ ] 云函数 `musicFunctions` 已在微信开发者工具中上传并部署成功
- [ ] 数据库集合和索引已在云开发控制台创建
- [ ] 测试数据（歌曲、歌单）已录入数据库
- [ ] 测试音频和封面已上传至云存储
- [ ] 真机预览测试通过
