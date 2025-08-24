const wechatService = require('../service/wechat.service')
const sysUserService = require('../service/sysUser.service')
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../app/config')

class WechatController {
    // 获取微信授权URL
    async getAuthUrl(ctx, next) {
        try {
            const { state = 'STATE', scope = 'snsapi_userinfo' } = ctx.query
            
            const authUrl = wechatService.generateAuthUrl(state, scope)
            
            ctx.body = {
                code: 0,
                message: 'success',
                data: { authUrl }
            }
        } catch (error) {
            console.error('获取微信授权URL失败:', error)
            ctx.body = {
                code: -1,
                message: '获取微信授权URL失败',
                data: null
            }
        }
    }

    // 微信授权回调处理
    async authCallback(ctx, next) {
        try {
            const { code, state } = ctx.query

            if (!code) {
                ctx.body = {
                    code: 400,
                    message: '授权码不能为空',
                    data: null
                }
                return
            }

            // 1. 通过code获取access_token
            const tokenInfo = await wechatService.getAccessToken(code)
            
            // 2. 通过access_token获取用户信息
            const wechatUserInfo = await wechatService.getUserInfo(
                tokenInfo.access_token, 
                tokenInfo.openid
            )

            // 3. 解析用户信息
            const userInfo = wechatService.parseUserInfo(wechatUserInfo)
            
            // 4. 添加登录IP
            userInfo.last_login_ip = ctx.ip || ctx.request.ip

            // 5. 创建或更新用户
            const user = await sysUserService.createOrUpdateUser(userInfo)

            if (user.status === 0) {
                ctx.body = {
                    code: 403,
                    message: '用户已被禁用',
                    data: null
                }
                return
            }

            // 6. 生成JWT token
            const token = jwt.sign(
                { id: user.id, nickname: user.nickname },
                PRIVATE_KEY,
                { expiresIn: 60 * 60 * 24 * 7, algorithm: 'RS256' }
            )

            ctx.body = {
                code: 0,
                message: '授权成功',
                data: {
                    user: {
                        id: user.id,
                        nickname: user.nickname,
                        avatar: user.avatar,
                        phone: user.phone,
                        email: user.email,
                        gender: user.gender
                    },
                    token,
                    wechatInfo: {
                        openid: tokenInfo.openid,
                        access_token: tokenInfo.access_token,
                        refresh_token: tokenInfo.refresh_token,
                        expires_in: tokenInfo.expires_in
                    }
                }
            }
        } catch (error) {
            console.error('微信授权回调处理失败:', error)
            ctx.body = {
                code: -1,
                message: error.message || '授权失败',
                data: null
            }
        }
    }

    // 刷新access_token
    async refreshToken(ctx, next) {
        try {
            const { refresh_token } = ctx.request.body

            if (!refresh_token) {
                ctx.body = {
                    code: 400,
                    message: 'refresh_token不能为空',
                    data: null
                }
                return
            }

            const tokenInfo = await wechatService.refreshAccessToken(refresh_token)
            
            ctx.body = {
                code: 0,
                message: '刷新token成功',
                data: tokenInfo
            }
        } catch (error) {
            console.error('刷新token失败:', error)
            ctx.body = {
                code: -1,
                message: error.message || '刷新token失败',
                data: null
            }
        }
    }

    // 验证access_token有效性
    async validateToken(ctx, next) {
        try {
            const { access_token, openid } = ctx.query

            if (!access_token || !openid) {
                ctx.body = {
                    code: 400,
                    message: 'access_token和openid不能为空',
                    data: null
                }
                return
            }

            const isValid = await wechatService.validateAccessToken(access_token, openid)
            
            ctx.body = {
                code: 0,
                message: 'success',
                data: { isValid }
            }
        } catch (error) {
            console.error('验证token失败:', error)
            ctx.body = {
                code: -1,
                message: '验证token失败',
                data: null
            }
        }
    }

    // 获取微信用户信息
    async getUserInfo(ctx, next) {
        try {
            const { access_token, openid } = ctx.query

            if (!access_token || !openid) {
                ctx.body = {
                    code: 400,
                    message: 'access_token和openid不能为空',
                    data: null
                }
                return
            }

            const userInfo = await wechatService.getUserInfo(access_token, openid)
            
            ctx.body = {
                code: 0,
                message: 'success',
                data: userInfo
            }
        } catch (error) {
            console.error('获取微信用户信息失败:', error)
            ctx.body = {
                code: -1,
                message: error.message || '获取用户信息失败',
                data: null
            }
        }
    }

    // 获取JS-SDK配置
    async getJsApiConfig(ctx, next) {
        try {
            const { url } = ctx.query

            if (!url) {
                ctx.body = {
                    code: 400,
                    message: 'URL参数不能为空',
                    data: null
                }
                return
            }

            const config = await wechatService.getJsApiConfig(url)
            
            ctx.body = {
                code: 0,
                message: 'success',
                data: config
            }
        } catch (error) {
            console.error('获取JS-SDK配置失败:', error)
            ctx.body = {
                code: -1,
                message: error.message || '获取JS-SDK配置失败',
                data: null
            }
        }
    }

    // 微信登录（用于前端直接调用）
    async login(ctx, next) {
        try {
            const { code } = ctx.request.body

            if (!code) {
                ctx.body = {
                    code: 400,
                    message: '授权码不能为空',
                    data: null
                }
                return
            }

            // 通过code获取用户信息并登录
            const tokenInfo = await wechatService.getAccessToken(code)
            const wechatUserInfo = await wechatService.getUserInfo(
                tokenInfo.access_token, 
                tokenInfo.openid
            )

            const userInfo = wechatService.parseUserInfo(wechatUserInfo)
            userInfo.last_login_ip = ctx.ip || ctx.request.ip

            const user = await sysUserService.createOrUpdateUser(userInfo)

            if (user.status === 0) {
                ctx.body = {
                    code: 403,
                    message: '用户已被禁用',
                    data: null
                }
                return
            }

            const token = jwt.sign(
                { id: user.id, nickname: user.nickname },
                PRIVATE_KEY,
                { expiresIn: 60 * 60 * 24 * 7, algorithm: 'RS256' }
            )

            ctx.body = {
                code: 0,
                message: '登录成功',
                data: {
                    user: {
                        id: user.id,
                        nickname: user.nickname,
                        avatar: user.avatar,
                        phone: user.phone,
                        email: user.email,
                        gender: user.gender
                    },
                    token
                }
            }
        } catch (error) {
            console.error('微信登录失败:', error)
            ctx.body = {
                code: -1,
                message: error.message || '登录失败',
                data: null
            }
        }
    }

    // 获取微信配置信息
    async getConfig(ctx, next) {
        try {
            ctx.body = {
                code: 0,
                message: 'success',
                data: {
                    appId: wechatService.appId,
                    // 不返回敏感信息
                    redirectUri: wechatService.redirectUri
                }
            }
        } catch (error) {
            console.error('获取微信配置失败:', error)
            ctx.body = {
                code: -1,
                message: '获取微信配置失败',
                data: null
            }
        }
    }
}

module.exports = new WechatController()
