# 学习打卡小程序 - 第三次课云存储与用户身份升级 - 实现计划

## Task 1: 创建 userProfiles 数据库集合与索引
- **Priority**: high
- **Depends On**: None
- **Description**:
  在微信云开发控制台中新建 `userProfiles` 集合，设置权限和索引。
- **Acceptance Criteria Addressed**: 用户登录与身份识别
- **Test Requirements**:
  - `programmatic` TR-1.1: `userProfiles` 集合存在
  - `programmatic` TR-1.2: 集合权限为"仅创建者可读写"
  - `programmatic` TR-1.3: `_openid` 字段存在唯一索引
- **Steps**:
  1. 打开微信开发者工具 -> 云开发控制台 -> 数据库
  2. 点击 "+" 新建集合，名称填 `userProfiles`
  3. 进入集合 -> 权限设置 -> 选择"仅创建者可读写"
  4. 进入索引管理 -> 添加索引：名称 `idx_openid_unique`，字段 `_openid` 升序，属性选"唯一"

## Task 2: 扩展 studyFunctions 云函数
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  在现有 `cloudfunctions/studyFunctions/index.js` 中新增 `getUserProfile`、`updateUserProfile` action，并扩展 `checkIn` 和 `updateRecord` 支持 `imageFileID`。
- **Acceptance Criteria Addressed**: 用户登录与身份识别、云存储使用
- **Test Requirements**:
  - `programmatic` TR-2.1: `getUserProfile` 首次调用时自动创建用户资料记录
  - `programmatic` TR-2.2: `getUserProfile` 返回结构包含 nickName、avatarUrl、totalMinutes、totalRecords、streak
  - `programmatic` TR-2.3: `updateUserProfile` 能更新 nickName 和 avatarUrl
  - `programmatic` TR-2.4: `checkIn` 传入 imageFileID 后能正确存入 studyRecords
  - `programmatic` TR-2.5: `updateRecord` 传入 imageFileID 后能正确更新
- **Steps**:
  1. 新增 `getUserProfile(event, openid)`：查询 userProfiles，不存在则创建默认记录，返回 profile
  2. 新增 `updateUserProfile(event, openid)`：更新 nickName、avatarUrl、updateTime
  3. 修改 `addRecord`（checkIn 内部调用的添加记录函数）：在 data 中增加 `imageFileID: event.imageFileID || ''`
  4. 修改 `updateRecord`：支持更新 `imageFileID` 字段
  5. 在 exports.main 的 switch 中注册 2 个新 action
  6. 右键 studyFunctions 目录 -> 创建并部署：云端安装依赖

## Task 3: 新建 getImageUrl 独立云函数
- **Priority**: high
- **Depends On**: None
- **Description**:
  新建独立云函数 `cloudfunctions/getImageUrl/`，使用 `cloud.getTempFileURL` 将云存储 fileID 转换为临时 HTTPS 链接。
- **Acceptance Criteria Addressed**: 云存储使用（多人共享图片场景）
- **Test Requirements**:
  - `programmatic` TR-3.1: 云函数接收 `{ fileIDs: string[] }`，返回 `{ success, data: { fileList } }`
  - `programmatic` TR-3.2: 内部使用 `cloud.getTempFileURL({ fileList: fileIDs })`
  - `programmatic` TR-3.3: 返回的临时链接可在小程序内正常显示图片
  - `programmatic` TR-3.4: 传入不存在的 fileID 时返回错误信息而非崩溃
- **Steps**:
  1. 在项目根目录下创建 `cloudfunctions/getImageUrl/` 目录
  2. 创建 `cloudfunctions/getImageUrl/index.js`：
     - 引入 `cloud`
     - `cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })`
     - `exports.main = async (event, context) => { ... }`
     - 从 event 中取 `fileIDs` 数组
     - 调用 `cloud.getTempFileURL({ fileList: fileIDs })`
     - 返回成功响应
  3. 创建 `cloudfunctions/getImageUrl/package.json`：设置 name 为 "getImageUrl"，main 为 "index.js"
  4. 右键 getImageUrl 目录 -> 创建并部署：云端安装依赖

## [x] Task 4: 更新客户端服务层 studyService.js
- **Priority**: high
- **Depends On**: Task 2, Task 3
- **Description**:
  在 `miniprogram/utils/studyService.js` 中新增用户资料和图片相关的封装方法。
- **Acceptance Criteria Addressed**: 用户登录与身份识别、云存储使用
- **Test Requirements**:
  - `programmatic` TR-4.1: 新增 `getUserProfile()` 方法
  - `programmatic` TR-4.2: 新增 `updateUserProfile(data)` 方法
  - `programmatic` TR-4.3: 新增 `getImageUrl(fileIDs)` 方法
  - `programmatic` TR-4.4: `checkIn` 和 `updateRecord` 方法支持 imageFileID 参数
- **Steps**:
  1. 新增 `getUserProfile()` 方法
  2. 新增 `updateUserProfile(data)` 方法
  3. 新增 `getImageUrl(fileIDs)` 方法
  4. 修改 `checkIn(planId, date, minutes, note, imageFileID)` 签名，增加可选参数
  5. 修改 `updateRecord(id, data)` 签名，data 中可包含 imageFileID
  6. 更新 module.exports

## Task 5: 改造 app.js 统一获取用户信息
- **Priority**: high
- **Depends On**: Task 4
- **Description**:
  在 `miniprogram/app.js` 的 onLaunch 中获取用户头像昵称，存入 globalData，并同步到云数据库。
- **Acceptance Criteria Addressed**: 用户登录与身份识别
- **Test Requirements**:
  - `programmatic` TR-5.1: onLaunch 中调用 `wx.getUserProfile` 获取用户信息
  - `programmatic` TR-5.2: 获取成功后调用 `studyService.getUserProfile()` 和 `updateUserProfile()` 同步到云端
  - `programmatic` TR-5.3: globalData 中包含 userInfo（nickName、avatarUrl、openid）
  - `programmatic` TR-5.4: 用户拒绝授权时 graceful degradation，显示默认头像和"未登录"
- **Steps**:
  1. 在 app.js globalData 中增加 `userInfo: { nickName: '', avatarUrl: '', openid: '' }`
  2. 在 onLaunch 中添加 `getUserInfo()` 方法
  3. 使用 `wx.getUserProfile({ desc: '用于展示用户头像和昵称' })` 获取信息
  4. 成功后调用 `studyService.updateUserProfile({ nickName, avatarUrl })`
  5. 将用户信息存入 globalData

## Task 6: 改造首页显示用户头像和昵称
- **Priority**: high
- **Depends On**: Task 5
- **Description**:
  在首页顶部添加用户信息区域，显示头像和昵称，并添加分享功能。
- **Acceptance Criteria Addressed**: 用户登录与身份识别、分享给微信好友
- **Test Requirements**:
  - `human-judgment` TR-6.1: 首页顶部有用户信息区域，布局美观
  - `programmatic` TR-6.2: 头像使用 `image` 组件，`src` 绑定 avatarUrl
  - `programmatic` TR-6.3: 页面定义 `onShareAppMessage`，返回标题包含连续打卡天数
  - `programmatic` TR-6.4: 未获取到用户信息时显示默认头像和"点击登录"
- **Steps**:
  1. 修改 index.js：onLoad 时从 app.globalData 读取 userInfo，如果没有则触发获取
  2. 修改 index.wxml：在 stats-card 上方添加用户信息区域（头像 + 昵称）
  3. 添加 `onShareAppMessage` 方法
  4. 修改 index.wxss：添加用户头像样式（圆形、带边框）

## Task 7: 打卡页增加图片上传功能
- **Priority**: high
- **Depends On**: Task 4
- **Description**:
  在打卡页添加图片选择器和上传功能，用户可为打卡记录附加一张图片。
- **Acceptance Criteria Addressed**: 云存储使用
- **Test Requirements**:
  - `programmatic` TR-7.1: 点击"上传图片"调用 `wx.chooseMedia({ mediaType: ['image'], count: 1 })`
  - `programmatic` TR-7.2: 选择后调用 `wx.cloud.uploadFile` 上传到云存储
  - `programmatic` TR-7.3: 上传路径为 `records/{openid}/{timestamp}_${random}.jpg`
  - `programmatic` TR-7.4: 上传成功后显示图片缩略图，提交时携带 fileID
  - `programmatic` TR-7.5: 上传失败时显示 Toast 错误提示
- **Steps**:
  1. 修改 checkin.js：
     - data 中增加 `imageFileID: ''`, `imageTempUrl: ''`
     - 新增 `chooseImage()` 方法：选择图片 -> 上传 -> 显示缩略图
     - 修改 `submitCheckIn`：提交时传入 imageFileID
  2. 修改 checkin.wxml：在表单底部添加图片上传区域（上传按钮 + 图片预览）
  3. 修改 checkin.wxss：添加图片上传区域样式

## Task 8: 记录列表显示图片缩略图
- **Priority**: high
- **Depends On**: Task 3, Task 7
- **Description**:
  在记录列表页中，为包含图片的记录显示缩略图，点击可预览。
- **Acceptance Criteria Addressed**: 云存储使用
- **Test Requirements**:
  - `programmatic` TR-8.1: 记录卡片在有 imageFileID 时显示图片缩略图
  - `programmatic` TR-8.2: 调用 `studyService.getImageUrl([fileID])` 获取临时链接
  - `programmatic` TR-8.3: 点击图片调用 `wx.previewImage` 预览
  - `programmatic` TR-8.4: 无图片时不显示图片区域
- **Steps**:
  1. 修改 records/index.js：
     - 加载记录后，收集所有有 imageFileID 的记录
     - 批量调用 `studyService.getImageUrl(fileIDs)` 获取临时链接
     - 将临时链接写入记录对象的 `imageTempUrl` 字段
  2. 修改 records/index.wxml：在记录卡片中添加图片缩略图区域
  3. 修改 records/index.wxss：添加图片缩略图样式（固定高度、圆角、object-fit cover）

## Task 9: 记录编辑支持图片替换
- **Priority**: medium
- **Depends On**: Task 7
- **Description**:
  在记录编辑页中显示已有图片，并支持更换图片。
- **Acceptance Criteria Addressed**: 打卡记录支持图片
- **Test Requirements**:
  - `programmatic` TR-9.1: 编辑页回显时显示已有图片（通过 fileID 换临时链接）
  - `programmatic` TR-9.2: 点击"更换图片"可重新选择并上传
  - `programmatic` TR-9.3: 提交后更新 imageFileID
  - `programmatic` TR-9.4: 点击"删除图片"可移除图片（imageFileID 设为空字符串）
- **Steps**:
  1. 修改 recordEdit/index.js：
     - data 中增加 `imageFileID` 和 `imageTempUrl`
     - onLoad 时如果 record 有 imageFileID，调用 getImageUrl 获取临时链接显示
     - 新增 `chooseImage()` 和 `removeImage()` 方法
     - 修改 submit：提交 data 中包含 imageFileID
  2. 修改 recordEdit/index.wxml：添加图片显示/更换/删除区域
  3. 修改 recordEdit/index.wxss：添加图片相关样式

## Task 10: 创建"我的"页面
- **Priority**: high
- **Depends On**: Task 4, Task 5
- **Description**:
  创建全新的个人中心页面，展示用户资料、累计统计和分享功能。
- **Acceptance Criteria Addressed**: 新增"我的"页面、分享给微信好友
- **Test Requirements**:
  - `human-judgment` TR-10.1: 页面布局清晰，信息层级分明
  - `programmatic` TR-10.2: 显示用户头像、昵称、累计统计
  - `programmatic` TR-10.3: 统计数据从 userProfiles 集合读取
  - `programmatic` TR-10.4: 提供"分享给好友"按钮，调用 `wx.showShareMenu` 或定义 `onShareAppMessage`
  - `programmatic` TR-10.5: 添加到 tabBar 后能正常访问
- **Steps**:
  1. 创建 `pages/profile/` 目录和 4 个页面文件
  2. index.js：onLoad 获取 userInfo 和 userProfile 数据，定义 onShareAppMessage
  3. index.wxml：用户信息卡片 + 统计卡片（总时长、总记录、连续天数）+ 分享按钮 + 关于区域
  4. index.wxss：用户信息区域样式、统计卡片样式、分享按钮样式
  5. 在 app.json tabBar 中增加"我的"入口

## Task 11: 完善全局加载与错误处理
- **Priority**: medium
- **Depends On**: Task 2, Task 4
- **Description**:
  检查并补充所有页面的 loading 状态和错误提示，确保用户体验一致。
- **Acceptance Criteria Addressed**: 加载状态与错误处理
- **Test Requirements**:
  - `human-judgment` TR-11.1: 所有页面加载数据时有 loading 提示
  - `human-judgment` TR-11.2: 网络请求失败时有明确的 Toast 错误提示
  - `human-judgment` TR-11.3: 表单提交成功后有成功反馈 Toast
  - `programmatic` TR-11.4: 无空 catch 块，所有错误都被记录或提示
- **Steps**:
  1. 检查 index.js：确保 loadTodayData 有 loading 和错误处理
  2. 检查 checkin.js：确保 loadPlans 和 submitCheckIn 有完善处理
  3. 检查 records/index.js：确保 loadRecords、applyFilter 有 loading 和错误处理
  4. 检查 profile/index.js：确保加载用户资料有 loading 和错误处理
  5. 检查 studyService.js：确保 callFunction 的 catch 抛出可读的异常信息

## Task 12: 更新 app.json 与全局配置
- **Priority**: high
- **Depends On**: Task 10
- **Description**:
  在 app.json 中注册"我的"页面，更新 tabBar，确保全局配置正确。
- **Acceptance Criteria Addressed**: 页面数量 >= 3
- **Test Requirements**:
  - `programmatic` TR-12.1: app.json pages 数组包含 `pages/profile/index`
  - `programmatic` TR-12.2: tabBar list 包含 5 个页面（首页、打卡、计划、记录、我的）
  - `programmatic` TR-12.3: 各 tabBar 页面能正常切换，无白屏
- **Steps**:
  1. 在 app.json pages 数组末尾添加 `"pages/profile/index"`
  2. 在 tabBar list 末尾添加 `{ "pagePath": "pages/profile/index", "text": "我的" }`

---

## 任务依赖图

```
Task 1 (数据库集合)
    |
    v
Task 2 (studyFunctions扩展) ---> Task 4 (客户端服务层)
    |                              |
    |                              v
    |                         Task 5 (app.js用户信息)
    |                              |
    |                              v
    |                         Task 6 (首页改造)
    |                              |
    |                              v
    |                         Task 11 (加载错误处理)
    |
Task 3 (getImageUrl云函数) ---> Task 8 (记录列表图片)
    |                              |
    |                              v
    |                         Task 9 (记录编辑图片)
    |                              |
    |                              v
    |                         Task 7 (打卡页图片)
    |
Task 10 ("我的"页面) ---> Task 12 (app.json更新)
```
