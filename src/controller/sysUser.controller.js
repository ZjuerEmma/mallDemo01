const sysUserService = require('../service/sysUser.service')
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../app/config')

class SysUserController {
    // 微信登录
    async wechatLogin(ctx, next) {
        try {
            const userInfo = ctx.request.body
            const clientIp = ctx.ip || ctx.request.ip
            
            // 添加登录IP
            userInfo.last_login_ip = clientIp

            const user = await sysUserService.createOrUpdateUser(userInfo)
            
            if (user.status === 0) {
                ctx.body = {
                    code: 403,
                    message: '用户已被禁用',
                    data: null
                }
                return
            }

            // 生成JWT token
            const token = jwt.sign(
                { id: user.id, nickname: user.nickname },
                PRIVATE_KEY,
                { expiresIn: 60 * 60 * 24 * 7, algorithm: 'RS256' } // 7天有效期
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
                message: '登录失败',
                data: null
            }
        }
    }

    // 获取用户信息
    async getUserInfo(ctx, next) {
        try {
            const { id: userId } = ctx.user
            const user = await sysUserService.getUserById(userId)
            
            if (!user) {
                ctx.body = {
                    code: 404,
                    message: '用户不存在',
                    data: null
                }
                return
            }

            // 不返回敏感信息
            delete user.wechat_openid
            delete user.wechat_unionid
            delete user.last_login_ip

            ctx.body = {
                code: 0,
                message: 'success',
                data: user
            }
        } catch (error) {
            console.error('获取用户信息失败:', error)
            ctx.body = {
                code: -1,
                message: '获取用户信息失败',
                data: null
            }
        }
    }

    // 更新用户信息
    async updateUserInfo(ctx, next) {
        try {
            const { id: userId } = ctx.user
            const userInfo = ctx.request.body

            const result = await sysUserService.updateUser(userId, userInfo)
            
            if (result.affectedRows === 0) {
                ctx.body = {
                    code: 404,
                    message: '用户不存在',
                    data: null
                }
                return
            }

            ctx.body = {
                code: 0,
                message: '更新成功',
                data: null
            }
        } catch (error) {
            console.error('更新用户信息失败:', error)
            ctx.body = {
                code: -1,
                message: '更新用户信息失败',
                data: null
            }
        }
    }

    // 分页查询用户列表（管理端）
    async getUserPage(ctx, next) {
        try {
            const queryParams = ctx.query
            const result = await sysUserService.getUserPage(queryParams)
            
            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('查询用户列表失败:', error)
            ctx.body = {
                code: -1,
                message: '查询用户列表失败',
                data: null
            }
        }
    }

    // 更新用户状态（管理端）
    async updateUserStatus(ctx, next) {
        try {
            const { userId } = ctx.params
            const { status } = ctx.query

            if (status === undefined) {
                ctx.body = {
                    code: 400,
                    message: '状态参数不能为空',
                    data: null
                }
                return
            }

            const result = await sysUserService.updateUserStatus(userId, status)
            
            if (result.affectedRows === 0) {
                ctx.body = {
                    code: 404,
                    message: '用户不存在',
                    data: null
                }
                return
            }

            ctx.body = {
                code: 0,
                message: '更新用户状态成功',
                data: null
            }
        } catch (error) {
            console.error('更新用户状态失败:', error)
            ctx.body = {
                code: -1,
                message: '更新用户状态失败',
                data: null
            }
        }
    }

    // 获取用户统计信息
    async getUserStats(ctx, next) {
        try {
            const result = await sysUserService.getUserStats()
            
            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('获取用户统计失败:', error)
            ctx.body = {
                code: -1,
                message: '获取用户统计失败',
                data: null
            }
        }
    }

    // 用户签到
    async userCheckin(ctx, next) {
        try {
            const { id: userId } = ctx.user

            const result = await sysUserService.userCheckin(userId)
            
            ctx.body = {
                code: 0,
                message: '签到成功',
                data: { id: result.insertId }
            }
        } catch (error) {
            console.error('用户签到失败:', error)
            ctx.body = {
                code: -1,
                message: error.message || '签到失败',
                data: null
            }
        }
    }

    // 获取用户签到记录
    async getUserCheckinHistory(ctx, next) {
        try {
            const { id: userId } = ctx.user
            const { days = 30 } = ctx.query

            const result = await sysUserService.getUserCheckinHistory(userId, days)
            
            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('获取签到记录失败:', error)
            ctx.body = {
                code: -1,
                message: '获取签到记录失败',
                data: null
            }
        }
    }

    // 获取今日签到状态
    async getTodayCheckinStatus(ctx, next) {
        try {
            const { id: userId } = ctx.user

            const hasCheckedIn = await sysUserService.getTodayCheckinStatus(userId)
            
            ctx.body = {
                code: 0,
                message: 'success',
                data: { hasCheckedIn }
            }
        } catch (error) {
            console.error('获取签到状态失败:', error)
            ctx.body = {
                code: -1,
                message: '获取签到状态失败',
                data: null
            }
        }
    }

    // 删除用户（管理端）
    async deleteUser(ctx, next) {
        try {
            const { userId } = ctx.params
            const result = await sysUserService.deleteUser(userId)
            
            if (result.affectedRows === 0) {
                ctx.body = {
                    code: 404,
                    message: '用户不存在',
                    data: null
                }
                return
            }

            ctx.body = {
                code: 0,
                message: '删除用户成功',
                data: null
            }
        } catch (error) {
            console.error('删除用户失败:', error)
            ctx.body = {
                code: -1,
                message: '删除用户失败',
                data: null
            }
        }
    }
}

module.exports = new SysUserController()
