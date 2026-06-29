# Tasks - 音乐播放微信小程序开发任务清单

## 阶段一：项目初始化与配置

- [x] Task 1: 项目基础配置
  - [x] SubTask 1.1: 修改 `miniprogram/app.js`，配置云环境 ID 为 `cloud1-d0g889dl64933afbe`
  - [x] SubTask 1.2: 修改 `miniprogram/app.json`，配置页面路由和 tabBar（首页、搜索、我的）
  - [x] SubTask 1.3: 修改 `miniprogram/app.wxss`，定义全局样式（主色调、字体、通用类）
  - [x] SubTask 1.4: 清理原有示例代码：删除 `pages/example/` 目录、`components/cloudTipModal/` 目录
  - [x] SubTask 1.5: 删除原有云函数 `cloudfunctions/quickstartFunctions/`

## 阶段二：工具函数与核心模块

- [x] Task 2: 创建工具函数
  - [x] SubTask 2.1: 创建 `miniprogram/utils/util.js`，实现时间格式化、防抖节流等通用函数
  - [x] SubTask 2.2: 创建 `miniprogram/utils/audioManager.js`，封装音频播放器单例
    - 实现播放/暂停/停止/跳转方法
    - 实现上一首/下一首切换逻辑
    - 实现播放模式切换（顺序/随机/单曲循环）
    - 实现播放队列管理
    - 实现事件监听（onPlay/onPause/onEnded/onTimeUpdate/onError）
  - [x] SubTask 2.3: 创建 `miniprogram/utils/db.js`，封装数据库操作
    - 封装歌曲查询、搜索、收藏、历史记录等操作
    - 统一错误处理

## 阶段三：组件开发

- [x] Task 3: 创建歌曲列表组件
  - [x] SubTask 3.1: 创建 `miniprogram/components/musicList/index.js`
  - [x] SubTask 3.2: 创建 `miniprogram/components/musicList/index.json`
  - [x] SubTask 3.3: 创建 `miniprogram/components/musicList/index.wxml`
  - [x] SubTask 3.4: 创建 `miniprogram/components/musicList/index.wxss`
  - [x] SubTask 3.5: 实现组件功能：接收歌曲数组 props，展示歌曲列表，点击播放，收藏状态显示

- [x] Task 4: 创建底部迷你播放器组件
  - [x] SubTask 4.1: 创建 `miniprogram/components/miniPlayer/index.js`
  - [x] SubTask 4.2: 创建 `miniprogram/components/miniPlayer/index.json`
  - [x] SubTask 4.3: 创建 `miniprogram/components/miniPlayer/index.wxml`
  - [x] SubTask 4.4: 创建 `miniprogram/components/miniPlayer/index.wxss`
  - [x] SubTask 4.5: 实现组件功能：显示当前播放歌曲封面和名称，播放/暂停按钮，点击跳转播放页

## 阶段四：页面开发

- [x] Task 5: 开发首页（推荐页）
  - [x] SubTask 5.1: 创建 `miniprogram/pages/index/index.js`，实现数据加载逻辑
    - 加载轮播图数据（从 admin_config 集合）
    - 加载推荐歌单（从 playlists 集合）
    - 加载热门歌曲（从 songs 集合按 playCount 排序）
  - [x] SubTask 5.2: 创建 `miniprogram/pages/index/index.json`，配置组件引用
  - [x] SubTask 5.3: 创建 `miniprogram/pages/index/index.wxml`，实现页面结构
    - 轮播图区域
    - 推荐歌单区域（横向滚动）
    - 热门歌曲列表区域
  - [x] SubTask 5.4: 创建 `miniprogram/pages/index/index.wxss`，实现页面样式
  - [x] SubTask 5.5: 集成 miniPlayer 组件到底部

- [x] Task 6: 开发播放页
  - [x] SubTask 6.1: 创建 `miniprogram/pages/player/index.js`，实现播放控制逻辑
    - 接收歌曲 ID 参数，加载歌曲详情
    - 实现播放/暂停控制
    - 实现进度条拖拽
    - 实现上一首/下一首切换
    - 实现播放模式切换
    - 实现收藏/取消收藏
    - 实现歌词解析与滚动
  - [x] SubTask 6.2: 创建 `miniprogram/pages/player/index.json`
  - [x] SubTask 6.3: 创建 `miniprogram/pages/player/index.wxml`，实现页面结构
    - 封面展示（旋转动画）
    - 歌词滚动区域
    - 进度条
    - 播放控制栏
  - [x] SubTask 6.4: 创建 `miniprogram/pages/player/index.wxss`，实现页面样式

- [x] Task 7: 开发搜索页
  - [x] SubTask 7.1: 创建 `miniprogram/pages/search/index.js`，实现搜索逻辑
    - 实现搜索输入与防抖
    - 调用云函数搜索歌曲
    - 管理搜索历史（本地存储）
  - [x] SubTask 7.2: 创建 `miniprogram/pages/search/index.json`
  - [x] SubTask 7.3: 创建 `miniprogram/pages/search/index.wxml`，实现页面结构
    - 搜索输入框
    - 搜索历史区域
    - 搜索结果列表
  - [x] SubTask 7.4: 创建 `miniprogram/pages/search/index.wxss`，实现页面样式
  - [x] SubTask 7.5: 集成 miniPlayer 组件到底部

- [x] Task 8: 开发我的页面
  - [x] SubTask 8.1: 创建 `miniprogram/pages/mine/index.js`，实现数据加载逻辑
    - 加载用户收藏列表
    - 加载播放历史
  - [x] SubTask 8.2: 创建 `miniprogram/pages/mine/index.json`
  - [x] SubTask 8.3: 创建 `miniprogram/pages/mine/index.wxml`，实现页面结构
    - 用户信息区域（头像、昵称）
    - 我的收藏入口
    - 播放历史入口
  - [x] SubTask 8.4: 创建 `miniprogram/pages/mine/index.wxss`，实现页面样式
  - [x] SubTask 8.5: 集成 miniPlayer 组件到底部

## 阶段五：云函数开发

- [x] Task 9: 创建音乐业务云函数
  - [x] SubTask 9.1: 创建 `cloudfunctions/musicFunctions/package.json`，配置依赖
  - [x] SubTask 9.2: 创建 `cloudfunctions/musicFunctions/config.json`，配置权限
  - [x] SubTask 9.3: 创建 `cloudfunctions/musicFunctions/index.js`，实现云函数入口
    - 实现 getSongList：获取歌曲列表（分页）
    - 实现 getSongDetail：获取歌曲详情
    - 实现 searchSongs：搜索歌曲（模糊匹配 title 和 artist）
    - 实现 getPlaylists：获取歌单列表
    - 实现 getPlaylistDetail：获取歌单详情及歌曲
    - 实现 addFavorite：收藏歌曲
    - 实现 removeFavorite：取消收藏
    - 实现 getFavorites：获取用户收藏列表
    - 实现 addPlayHistory：添加播放记录
    - 实现 getPlayHistory：获取播放历史
    - 实现 incrementPlayCount：增加歌曲播放量
    - 实现 getHomeData：获取首页推荐数据

## 阶段六：图标与资源准备

- [x] Task 10: 准备图标资源
  - [x] SubTask 10.1: 创建或获取 tabBar 图标：home.png/home-active.png（已存在），search.png/search-active.png, mine.png/mine-active.png（需用户添加）
  - [x] SubTask 10.2: 创建或获取播放控制图标：play.png, pause.png, prev.png, next.png（需用户添加）
  - [x] SubTask 10.3: 创建或获取功能图标：favorite.png/favorite-active.png, mode-sequence.png, mode-random.png, mode-single.png（需用户添加）
  - [x] SubTask 10.4: 创建或获取默认封面：music-default.png（需用户添加）
  - [x] SubTask 10.5: 已创建图标说明文档 `miniprogram/images/icons/ICONS_README.md`，指导用户准备所需图标

## 阶段七：测试数据准备

- [ ] Task 11: 准备测试数据
  - [ ] SubTask 11.1: 通过云存储上传测试音频文件到 `music/` 目录
  - [ ] SubTask 11.2: 通过云存储上传测试封面图片到 `covers/` 目录
  - [ ] SubTask 11.3: 通过云开发控制台向 `songs` 集合添加至少 10 首测试歌曲记录
  - [ ] SubTask 11.4: 通过云开发控制台向 `playlists` 集合添加至少 3 个测试歌单记录
  - [ ] SubTask 11.5: 通过云开发控制台向 `admin_config` 集合添加首页轮播图配置

## 阶段八：集成测试与优化

- [ ] Task 12: 功能集成测试
  - [ ] SubTask 12.1: 测试首页数据加载与展示
  - [ ] SubTask 12.2: 测试歌曲播放功能（播放/暂停/进度/上下首）
  - [ ] SubTask 12.3: 测试搜索功能
  - [ ] SubTask 12.4: 测试收藏功能
  - [ ] SubTask 12.5: 测试播放历史功能
  - [ ] SubTask 12.6: 测试歌单查看功能
  - [ ] SubTask 12.7: 测试 tabBar 切换与 miniPlayer 展示

- [ ] Task 13: 代码优化与清理
  - [ ] SubTask 13.1: 检查并优化代码结构
  - [ ] SubTask 13.2: 添加必要的错误处理和用户提示
  - [ ] SubTask 13.3: 检查样式一致性
  - [ ] SubTask 13.4: 清理无用代码和注释

## 阶段九：部署准备

- [ ] Task 14: 部署前准备
  - [ ] SubTask 14.1: 在微信开发者工具中上传并部署云函数 `musicFunctions`
  - [ ] SubTask 14.2: 在微信开发者工具中创建数据库集合和索引
  - [ ] SubTask 14.3: 确认所有图标资源已就位
  - [ ] SubTask 14.4: 确认测试数据已录入
  - [ ] SubTask 14.5: 进行真机预览测试

---

## Task Dependencies

- Task 2（工具函数）依赖 Task 1（项目配置）
- Task 3、4（组件）依赖 Task 2（工具函数）
- Task 5、6、7、8（页面）依赖 Task 3、4（组件）
- Task 9（云函数）可与 Task 3、4、5、6、7、8 并行开发
- Task 10（图标）可与 Task 2-9 并行准备
- Task 11（测试数据）依赖 Task 9（云函数）和 Task 10（图标）
- Task 12（集成测试）依赖 Task 1-11 全部完成
- Task 13（优化）依赖 Task 12（测试）
- Task 14（部署）依赖 Task 13（优化）

---

## 并行开发建议

以下任务可以并行进行以提高效率：

1. **并行组 1**：Task 2（工具函数）+ Task 9（云函数）+ Task 10（图标准备）
2. **并行组 2**：Task 3（歌曲列表组件）+ Task 4（迷你播放器组件）
3. **并行组 3**：Task 5（首页）+ Task 6（播放页）+ Task 7（搜索页）+ Task 8（我的页面）

---

## 开发注意事项

1. **音频播放**：微信小程序音频播放需使用 `wx.createInnerAudioContext()`，注意处理音频加载失败的情况
2. **云函数调用**：前端调用云函数时需正确处理异步和错误
3. **数据库权限**：严格按照设计的权限规则配置集合权限
4. **图片资源**：封面图片建议使用云存储 fileID，通过 `<image>` 组件直接加载
5. **性能优化**：列表数据使用分页加载，避免一次性加载过多数据
6. **用户体验**：添加加载状态、空状态、错误状态的 UI 提示
