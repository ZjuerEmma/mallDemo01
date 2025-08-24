const https = require('https')
const querystring = require('querystring')

class WechatService {
    constructor() {
        // 微信公众号配置（从环境变量获取）
        this.appId = process.env.WECHAT_APP_ID || ''
        this.appSecret = process.env.WECHAT_APP_SECRET || ''
        this.redirectUri = process.env.WECHAT_REDIRECT_URI || ''
    }

    // 生成微信授权URL
    generateAuthUrl(state = 'STATE', scope = 'snsapi_userinfo') {
        const params = {
            appid: this.appId,
            redirect_uri: encodeURIComponent(this.redirectUri),
            response_type: 'code',
            scope: scope,
            state: state
        }

        const queryString = querystring.stringify(params)
        return `https://open.weixin.qq.com/connect/oauth2/authorize?${queryString}#wechat_redirect`
    }

    // 通过code获取access_token
    async getAccessToken(code) {
        return new Promise((resolve, reject) => {
            const params = querystring.stringify({
                appid: this.appId,
                secret: this.appSecret,
                code: code,
                grant_type: 'authorization_code'
            })

            const options = {
                hostname: 'api.weixin.qq.com',
                path: `/sns/oauth2/access_token?${params}`,
                method: 'GET'
            }

            const req = https.request(options, (res) => {
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk
                })
                res.on('end', () => {
                    try {
                        const result = JSON.parse(data)
                        if (result.errcode) {
                            reject(new Error(result.errmsg || '获取access_token失败'))
                        } else {
                            resolve(result)
                        }
                    } catch (error) {
                        reject(new Error('解析响应数据失败'))
                    }
                })
            })

            req.on('error', (error) => {
                reject(error)
            })

            req.end()
        })
    }

    // 刷新access_token
    async refreshAccessToken(refreshToken) {
        return new Promise((resolve, reject) => {
            const params = querystring.stringify({
                appid: this.appId,
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            })

            const options = {
                hostname: 'api.weixin.qq.com',
                path: `/sns/oauth2/refresh_token?${params}`,
                method: 'GET'
            }

            const req = https.request(options, (res) => {
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk
                })
                res.on('end', () => {
                    try {
                        const result = JSON.parse(data)
                        if (result.errcode) {
                            reject(new Error(result.errmsg || '刷新access_token失败'))
                        } else {
                            resolve(result)
                        }
                    } catch (error) {
                        reject(new Error('解析响应数据失败'))
                    }
                })
            })

            req.on('error', (error) => {
                reject(error)
            })

            req.end()
        })
    }

    // 获取用户信息
    async getUserInfo(accessToken, openId) {
        return new Promise((resolve, reject) => {
            const params = querystring.stringify({
                access_token: accessToken,
                openid: openId,
                lang: 'zh_CN'
            })

            const options = {
                hostname: 'api.weixin.qq.com',
                path: `/sns/userinfo?${params}`,
                method: 'GET'
            }

            const req = https.request(options, (res) => {
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk
                })
                res.on('end', () => {
                    try {
                        const result = JSON.parse(data)
                        if (result.errcode) {
                            reject(new Error(result.errmsg || '获取用户信息失败'))
                        } else {
                            resolve(result)
                        }
                    } catch (error) {
                        reject(new Error('解析响应数据失败'))
                    }
                })
            })

            req.on('error', (error) => {
                reject(error)
            })

            req.end()
        })
    }

    // 检验授权凭证（access_token）是否有效
    async validateAccessToken(accessToken, openId) {
        return new Promise((resolve, reject) => {
            const params = querystring.stringify({
                access_token: accessToken,
                openid: openId
            })

            const options = {
                hostname: 'api.weixin.qq.com',
                path: `/sns/auth?${params}`,
                method: 'GET'
            }

            const req = https.request(options, (res) => {
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk
                })
                res.on('end', () => {
                    try {
                        const result = JSON.parse(data)
                        resolve(result.errcode === 0)
                    } catch (error) {
                        resolve(false)
                    }
                })
            })

            req.on('error', (error) => {
                resolve(false)
            })

            req.end()
        })
    }

    // 获取微信JS-SDK配置
    async getJsApiConfig(url) {
        try {
            // 这里需要实现获取jsapi_ticket的逻辑
            // 通常需要先获取access_token，再获取jsapi_ticket
            const accessToken = await this.getGlobalAccessToken()
            const ticket = await this.getJsApiTicket(accessToken)
            
            const timestamp = Math.floor(Date.now() / 1000)
            const nonceStr = this.generateNonceStr()
            const signature = this.generateSignature(ticket, timestamp, nonceStr, url)

            return {
                appId: this.appId,
                timestamp: timestamp,
                nonceStr: nonceStr,
                signature: signature
            }
        } catch (error) {
            throw new Error('获取JS-SDK配置失败: ' + error.message)
        }
    }

    // 获取全局access_token（用于调用其他接口）
    async getGlobalAccessToken() {
        return new Promise((resolve, reject) => {
            const params = querystring.stringify({
                grant_type: 'client_credential',
                appid: this.appId,
                secret: this.appSecret
            })

            const options = {
                hostname: 'api.weixin.qq.com',
                path: `/cgi-bin/token?${params}`,
                method: 'GET'
            }

            const req = https.request(options, (res) => {
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk
                })
                res.on('end', () => {
                    try {
                        const result = JSON.parse(data)
                        if (result.errcode) {
                            reject(new Error(result.errmsg || '获取全局access_token失败'))
                        } else {
                            resolve(result.access_token)
                        }
                    } catch (error) {
                        reject(new Error('解析响应数据失败'))
                    }
                })
            })

            req.on('error', (error) => {
                reject(error)
            })

            req.end()
        })
    }

    // 获取jsapi_ticket
    async getJsApiTicket(accessToken) {
        return new Promise((resolve, reject) => {
            const params = querystring.stringify({
                access_token: accessToken,
                type: 'jsapi'
            })

            const options = {
                hostname: 'api.weixin.qq.com',
                path: `/cgi-bin/ticket/getticket?${params}`,
                method: 'GET'
            }

            const req = https.request(options, (res) => {
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk
                })
                res.on('end', () => {
                    try {
                        const result = JSON.parse(data)
                        if (result.errcode !== 0) {
                            reject(new Error(result.errmsg || '获取jsapi_ticket失败'))
                        } else {
                            resolve(result.ticket)
                        }
                    } catch (error) {
                        reject(new Error('解析响应数据失败'))
                    }
                })
            })

            req.on('error', (error) => {
                reject(error)
            })

            req.end()
        })
    }

    // 生成随机字符串
    generateNonceStr() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15)
    }

    // 生成签名
    generateSignature(ticket, timestamp, nonceStr, url) {
        const crypto = require('crypto')
        const string = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`
        return crypto.createHash('sha1').update(string).digest('hex')
    }

    // 解析用户信息（统一格式）
    parseUserInfo(wechatUserInfo) {
        return {
            wechat_openid: wechatUserInfo.openid,
            wechat_unionid: wechatUserInfo.unionid,
            nickname: wechatUserInfo.nickname,
            avatar: wechatUserInfo.headimgurl,
            gender: wechatUserInfo.sex, // 1-男，2-女，0-未知
            country: wechatUserInfo.country,
            province: wechatUserInfo.province,
            city: wechatUserInfo.city
        }
    }
}

module.exports = new WechatService()
