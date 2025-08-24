const activityService = require('../service/activity.service')

class ActivityController {
    // 获取活动分类列表
    async getActivityCategories(ctx, next) {
        try {
            const result = await activityService.getActivityCategories()
            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('获取活动分类失败:', error)
            ctx.body = {
                code: -1,
                message: '获取活动分类失败',
                data: null
            }
        }
    }

    // 分页查询活动列表
    async getActivityPage(ctx, next) {
        try {
            const queryParams = ctx.query
            const result = await activityService.getActivityPage(queryParams)
            
            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('查询活动列表失败:', error)
            ctx.body = {
                code: -1,
                message: '查询活动列表失败',
                data: null
            }
        }
    }

    // 获取活动详情
    async getActivityById(ctx, next) {
        try {
            const { activityId } = ctx.params
            const result = await activityService.getActivityById(activityId)
            
            if (!result) {
                ctx.body = {
                    code: 404,
                    message: '活动不存在',
                    data: null
                }
                return
            }

            // 增加浏览次数
            await activityService.incrementViewCount?.(activityId)

            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('获取活动详情失败:', error)
            ctx.body = {
                code: -1,
                message: '获取活动详情失败',
                data: null
            }
        }
    }

    // 创建活动
    async createActivity(ctx, next) {
        try {
            const activityData = ctx.request.body
            const { id: userId } = ctx.user
            
            // 如果是用户拼约活动，设置创建者信息
            if (activityData.activity_source === 1) {
                activityData.creator_id = userId
            }

            const result = await activityService.createActivity(activityData)
            
            ctx.body = {
                code: 0,
                message: '创建活动成功',
                data: { id: result.insertId }
            }
        } catch (error) {
            console.error('创建活动失败:', error)
            ctx.body = {
                code: -1,
                message: '创建活动失败',
                data: null
            }
        }
    }

    // 用户报名活动
    async signupActivity(ctx, next) {
        try {
            const { activityId } = ctx.params
            const { id: userId } = ctx.user
            const signupData = ctx.request.body

            const result = await activityService.signupActivity(activityId, userId, signupData)
            
            ctx.body = {
                code: 0,
                message: '报名成功',
                data: { id: result.insertId }
            }
        } catch (error) {
            console.error('活动报名失败:', error)
            ctx.body = {
                code: -1,
                message: error.message || '活动报名失败',
                data: null
            }
        }
    }

    // 取消报名
    async cancelSignup(ctx, next) {
        try {
            const { activityId } = ctx.params
            const { id: userId } = ctx.user
            const { cancelReason } = ctx.request.body

            const result = await activityService.cancelSignup(activityId, userId, cancelReason)
            
            if (result.affectedRows === 0) {
                ctx.body = {
                    code: 404,
                    message: '未找到有效的报名记录',
                    data: null
                }
                return
            }

            ctx.body = {
                code: 0,
                message: '取消报名成功',
                data: null
            }
        } catch (error) {
            console.error('取消报名失败:', error)
            ctx.body = {
                code: -1,
                message: '取消报名失败',
                data: null
            }
        }
    }

    // 获取用户的活动报名列表
    async getUserActivitySignups(ctx, next) {
        try {
            const { id: userId } = ctx.user
            const queryParams = ctx.query

            const result = await activityService.getUserActivitySignups(userId, queryParams)
            
            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('获取用户活动报名列表失败:', error)
            ctx.body = {
                code: -1,
                message: '获取用户活动报名列表失败',
                data: null
            }
        }
    }

    // 获取我创建的活动列表
    async getMyCreatedActivities(ctx, next) {
        try {
            const { id: userId } = ctx.user
            const queryParams = ctx.query
            
            // 添加创建者筛选条件
            const query = JSON.parse(queryParams.queryDTO || '{}')
            query.creatorId = userId
            queryParams.queryDTO = JSON.stringify(query)

            const result = await activityService.getActivityPage(queryParams)
            
            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('获取我创建的活动列表失败:', error)
            ctx.body = {
                code: -1,
                message: '获取我创建的活动列表失败',
                data: null
            }
        }
    }
}

module.exports = new ActivityController()
