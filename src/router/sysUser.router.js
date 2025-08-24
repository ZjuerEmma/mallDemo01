const Router = require('koa-router')
const {
    wechatLogin,
    getUserInfo,
    updateUserInfo,
    getUserPage,
    updateUserStatus,
    getUserStats,
    userCheckin,
    getUserCheckinHistory,
    getTodayCheckinStatus,
    deleteUser
} = require('../controller/sysUser.controller')

const { verifyAuth } = require('../middleware/auth.middleware')

const sysUserRouter = new Router({ prefix: '/user' })

// 微信登录（无需认证）
sysUserRouter.post('/wechat-login', wechatLogin)

// 以下接口需要认证
sysUserRouter.use(verifyAuth)

// 获取用户信息
sysUserRouter.get('/info', getUserInfo)

// 更新用户信息
sysUserRouter.put('/info', updateUserInfo)

// 用户签到
sysUserRouter.post('/checkin', userCheckin)

// 获取用户签到记录
sysUserRouter.get('/checkin/history', getUserCheckinHistory)

// 获取今日签到状态
sysUserRouter.get('/checkin/today', getTodayCheckinStatus)

// 以下是管理端接口（可能需要更高权限，这里暂时只验证登录）

// 分页查询用户列表
sysUserRouter.get('/page', getUserPage)

// 获取用户统计信息
sysUserRouter.get('/stats', getUserStats)

// 更新用户状态
sysUserRouter.put('/:userId/status', updateUserStatus)

// 删除用户
sysUserRouter.delete('/:userId', deleteUser)

module.exports = sysUserRouter
