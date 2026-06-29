# 学习打卡小程序 - 第三次课云存储与用户身份升级 - 验证清单

## 数据库验证

- [ ] **Checkpoint 1**: `userProfiles` 集合创建正确
  - 集合名称为 `userProfiles`
  - 权限为"仅创建者可读写"
  - 存在 `_openid` 唯一索引
  - 验证方式：云开发控制台 -> 数据库 -> userProfiles -> 索引管理

## 云函数验证

- [ ] **Checkpoint 2**: `studyFunctions` 新 action 部署成功
  - `getUserProfile`、`updateUserProfile` 已注册到 switch 分支
  - `checkIn` 和 `updateRecord` 支持 `imageFileID` 参数
  - 云函数部署无报错
  - 验证方式：右键 studyFunctions -> 创建并部署，控制台无红色报错

- [ ] **Checkpoint 3**: `getUserProfile` 功能正确
  - 首次调用时自动创建默认用户资料记录
  - 返回包含 nickName、avatarUrl、totalMinutes、totalRecords、streak
  - 只能返回当前 openid 的数据
  - 验证方式：在微信开发者工具云函数测试界面调用

- [ ] **Checkpoint 4**: `updateUserProfile` 功能正确
  - 能成功更新 nickName 和 avatarUrl
  - 无法更新其他 openid 的数据
  - 验证方式：调用后检查数据库记录是否更新

- [ ] **Checkpoint 5**: `getImageUrl` 独立云函数正确
  - 接收 `{ fileIDs: string[] }`
  - 内部使用 `cloud.getTempFileURL({ fileList: fileIDs })`
  - 返回临时链接可在小程序 image 组件中正常显示
  - 传入不存在的 fileID 时返回错误信息而非崩溃
  - 验证方式：上传一张图片到云存储，获取 fileID，调用云函数测试

## 客户端服务层验证

- [ ] **Checkpoint 6**: `studyService.js` 方法封装完整
  - 新增 `getUserProfile()`、`updateUserProfile(data)`、`getImageUrl(fileIDs)`
  - `checkIn` 和 `updateRecord` 支持 imageFileID 参数
  - 验证方式：检查 `utils/studyService.js` 代码

## 用户信息验证

- [ ] **Checkpoint 7**: `app.js` 用户信息获取正确
  - onLaunch 中调用 `wx.getUserProfile` 获取头像昵称
  - 获取成功后同步到云端 userProfiles
  - globalData 中包含 userInfo
  - 用户拒绝授权时显示默认头像和"点击登录"
  - 验证方式：首次打开小程序，观察是否弹出授权框

- [ ] **Checkpoint 8**: 首页用户信息显示正确
  - 首页顶部显示用户头像（圆形）和昵称
  - 头像使用 `image` 组件正确绑定 avatarUrl
  - 未获取信息时显示默认头像
  - 验证方式：手动查看首页 UI

## 云存储验证

- [ ] **Checkpoint 9**: 打卡页图片上传功能正常
  - 点击"上传图片"调用 `wx.chooseMedia` 选择图片
  - 选择后上传到云存储，路径格式为 `records/{openid}/{timestamp}.jpg`
  - 上传成功后显示缩略图
  - 提交打卡后 `studyRecords` 记录包含 `imageFileID`
  - 上传失败时有 Toast 错误提示
  - 验证方式：打卡时上传图片，检查数据库记录和云存储文件

- [ ] **Checkpoint 10**: 记录列表图片显示正常
  - 有图片的记录卡片显示缩略图
  - 无图片的记录不显示图片区域
  - 点击图片可预览（`wx.previewImage`）
  - 验证方式：查看记录列表页，点击缩略图测试预览

- [ ] **Checkpoint 11**: 记录编辑图片替换正常
  - 编辑页回显时显示已有图片
  - 点击"更换图片"可重新上传
  - 点击"删除图片"可移除图片
  - 提交后数据库记录正确更新
  - 验证方式：编辑一条有图片的记录，测试更换和删除

## 页面功能验证

- [ ] **Checkpoint 12**: "我的"页面功能正常
  - 显示用户头像、昵称
  - 显示累计学习时长、累计打卡次数、连续打卡天数
  - 统计数据与 userProfiles 集合一致
  - 提供"分享给好友"按钮
  - 页面布局清晰美观
  - 验证方式：手动进入"我的"页面，对比数据库数据

- [ ] **Checkpoint 13**: 分享功能正常
  - 首页和"我的"页面定义 `onShareAppMessage`
  - 分享标题包含连续打卡天数
  - 点击分享按钮弹出微信分享面板
  - 验证方式：点击分享，发送给文件传输助手测试

- [ ] **Checkpoint 14**: app.json 配置正确
  - pages 数组包含 `pages/profile/index`
  - tabBar list 包含 5 个页面（首页、打卡、计划、记录、我的）
  - 各 tabBar 页面能正常切换
  - 验证方式：检查 app.json，手动切换各 tab

## 加载与错误处理验证

- [ ] **Checkpoint 15**: 全局加载状态完善
  - 首页加载今日数据时有 loading 提示
  - 打卡页加载计划时有 loading 提示
  - 记录列表加载时有 loading 提示
  - "我的"页面加载用户资料时有 loading 提示
  - 验证方式：模拟慢网络（开发者工具 Network 面板 -> Slow 3G），观察 loading

- [ ] **Checkpoint 16**: 错误处理完善
  - 所有云函数调用失败时有 Toast 错误提示
  - 无空 catch 块
  - 表单提交成功后有成功反馈 Toast
  - 验证方式：断开网络测试各页面，观察错误提示

## 代码规范验证

- [ ] **Checkpoint 17**: 代码规范符合要求
  - 变量/函数使用 camelCase
  - 无 hardcode 密钥或敏感信息
  - 错误处理完善
  - 数据库操作全部走云函数
  - 验证方式：代码审查
