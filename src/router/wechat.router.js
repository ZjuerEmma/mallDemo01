const Router = require('koa-router')
const {
    getAuthUrl,
    authCallback,
    refreshToken,
    validateToken,
    getUserInfo,
    getJsApiConfig,
    login,
    getConfig
} = require('../controller/wechat.controller')

const wechatRouter = new Router({ prefix: `${process.env.ROUTER_PREFIX}/wechat` })

// 获取微信配置信息
wechatRouter.get('/config', getConfig)

// 获取微信授权URL
wechatRouter.get('/auth-url', getAuthUrl)

// 微信授权回调处理
wechatRouter.get('/callback', authCallback)

// 微信登录（前端直接调用）
wechatRouter.post('/login', login)

// 刷新access_token
wechatRouter.post('/refresh-token', refreshToken)

// 验证access_token有效性
wechatRouter.get('/validate-token', validateToken)

// 获取微信用户信息
wechatRouter.get('/user-info', getUserInfo)

// 获取JS-SDK配置
wechatRouter.get('/js-api-config', getJsApiConfig)

module.exports = wechatRouter
