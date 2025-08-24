# 游详符平台后端API文档

## 项目概述

基于现有的 Node.js + Koa2 + MySQL 架构，为游详符平台开发的后端接口，包含用户管理、商户管理、活动管理、优惠券管理、用户收藏、地图服务和微信授权等功能模块。

## 技术栈

- **框架**: Koa2
- **数据库**: MySQL
- **认证**: JWT (RS256算法)
- **ORM**: 原生MySQL2连接池
- **架构**: MVC模式 (Router -> Controller -> Service -> Database)

## 项目结构

```
src/
├── app/                    # 应用配置
│   ├── config.js          # 环境配置
│   ├── database.js        # 数据库连接
│   ├── error-handle.js    # 错误处理
│   └── index.js           # 应用入口
├── controller/            # 控制器层
├── service/              # 服务层
├── router/               # 路由层
├── middleware/           # 中间件
└── main.js              # 启动文件
```

## 数据库表说明

### 核心表结构

1. **sys_user** - 系统用户表（微信用户）
2. **merchant** - 商户表
3. **merchant_category** - 商户分类表
4. **activity** - 活动表
5. **activity_category** - 活动分类表
6. **activity_signup** - 活动报名表
7. **coupon** - 优惠券表
8. **user_coupon** - 用户优惠券表
9. **user_favorite** - 用户收藏表
10. **sys_config** - 系统配置表

## API接口模块

### 1. 用户管理模块 (`/user`)

**主要功能**:
- 微信登录注册
- 用户信息管理
- 用户签到
- 用户统计

**核心接口**:
- `POST /user/wechat-login` - 微信登录
- `GET /user/info` - 获取用户信息
- `PUT /user/info` - 更新用户信息
- `POST /user/checkin` - 用户签到
- `GET /user/page` - 分页查询用户列表（管理端）

### 2. 商户管理模块 (`/merchant`)

**主要功能**:
- 商户信息CRUD
- 商户分类管理
- 地理位置搜索
- 热门商户推荐

**核心接口**:
- `GET /merchant/categories/hot` - 获取热门商户分类
- `GET /merchant/page` - 分页查询商户列表
- `GET /merchant/:merchantId` - 获取商户详情
- `POST /merchant` - 创建商户（需认证）
- `PUT /merchant/:merchantId` - 更新商户（需认证）

### 3. 活动管理模块 (`/activity`)

**主要功能**:
- 活动信息CRUD
- 活动报名管理
- 活动分类管理
- 用户拼约活动

**核心接口**:
- `GET /activity/categories` - 获取活动分类列表
- `GET /activity/page` - 分页查询活动列表
- `GET /activity/:activityId` - 获取活动详情
- `POST /activity` - 创建活动（需认证）
- `POST /activity/:activityId/signup` - 报名活动（需认证）
- `POST /activity/:activityId/cancel` - 取消报名（需认证）

### 4. 优惠券模块 (`/coupon`)

**主要功能**:
- 优惠券CRUD
- 用户领取优惠券
- 优惠券使用
- 商户优惠券管理

**核心接口**:
- `GET /coupon/merchant/:merchantId` - 获取商户可用优惠券
- `GET /coupon/user/my` - 获取用户优惠券列表（需认证）
- `POST /coupon/:couponId/receive` - 领取优惠券（需认证）
- `POST /coupon/use/:couponCode` - 使用优惠券（需认证）

### 5. 用户收藏模块 (`/favorite`)

**主要功能**:
- 收藏/取消收藏
- 收藏列表管理
- 批量操作
- 收藏统计

**核心接口**:
- `POST /favorite` - 添加收藏（需认证）
- `POST /favorite/toggle` - 切换收藏状态（需认证）
- `GET /favorite/list` - 获取收藏列表（需认证）
- `GET /favorite/merchants` - 获取收藏的商户（需认证）
- `GET /favorite/activities` - 获取收藏的活动（需认证）

### 6. 地图服务模块 (`/map`)

**主要功能**:
- 地理位置搜索
- 附近商户/活动查询
- 距离计算
- 热门地点推荐

**核心接口**:
- `GET /map/nearby/merchants` - 获取附近商户
- `GET /map/nearby/activities` - 获取附近活动
- `GET /map/data` - 获取综合地图数据
- `GET /map/search` - 搜索地址
- `GET /map/distance` - 计算距离

### 7. 微信授权模块 (`/wechat`)

**主要功能**:
- 微信网页授权
- 用户信息获取
- JS-SDK配置
- Token管理

**核心接口**:
- `GET /wechat/auth-url` - 获取微信授权URL
- `GET /wechat/callback` - 微信授权回调
- `POST /wechat/login` - 微信登录
- `GET /wechat/js-api-config` - 获取JS-SDK配置

## 认证机制

### JWT认证
- 使用RS256算法
- Token有效期7天
- 需要认证的接口在Header中添加: `Authorization: Bearer <token>`

### 认证流程
1. 用户通过微信授权获取code
2. 后端通过code获取微信用户信息
3. 创建或更新用户记录
4. 生成JWT token返回给前端
5. 前端后续请求携带token访问需要认证的接口

## 环境配置

### 必需的环境变量

```env
# 服务器配置
APP_HOST=localhost
APP_PORT=8000

# 数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=coderwhy
MYSQL_USER=root
MYSQL_PASSWORD=your_password

# 微信配置
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
WECHAT_REDIRECT_URI=your_redirect_uri
```

## 数据格式规范

### 统一响应格式

```json
{
  "code": 0,           // 0-成功, -1-失败, 其他-具体错误码
  "message": "success", // 响应消息
  "data": {}           // 响应数据
}
```

### 分页数据格式

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "records": [],      // 数据列表
    "total": 100,       // 总数
    "size": 10,         // 每页大小
    "current": 1,       // 当前页
    "pages": 10         // 总页数
  }
}
```

## 部署说明

### 启动步骤

1. 安装依赖
```bash
npm install
```

2. 配置环境变量
创建 `.env` 文件并配置必要的环境变量

3. 初始化数据库
导入 `youxiangfu_platform.sql` 文件到MySQL数据库

4. 生成JWT密钥对
确保 `src/app/keys/` 目录下有 `private.key` 和 `public.key` 文件

5. 启动服务
```bash
npm start
```

### 注意事项

1. **数据库连接**: 确保MySQL服务正常运行且配置正确
2. **JWT密钥**: 生产环境请使用安全的RSA密钥对
3. **微信配置**: 需要在微信公众平台配置正确的回调域名
4. **跨域设置**: 根据前端域名配置CORS策略
5. **日志监控**: 建议添加完善的日志记录和监控

## API测试

推荐使用Postman或类似工具进行接口测试，所有接口都遵循RESTful设计规范。

### 测试账号
- 已知测试用户: userId=3, name=lilei, password=abc123（用于现有认证系统）

### 常用测试场景
1. 微信登录流程测试
2. 商户列表查询和筛选
3. 活动报名和取消流程
4. 优惠券领取和使用
5. 收藏功能测试
6. 地图搜索功能测试
