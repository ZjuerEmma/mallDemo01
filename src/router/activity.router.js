const Router = require('koa-router')
const {
    getActivityCategories,
    getActivityPage,
    getActivityById,
    createActivity,
    signupActivity,
    cancelSignup,
    getUserActivitySignups,
    getMyCreatedActivities
} = require('../controller/activity.controller')

const { verifyAuth } = require('../middleware/auth.middleware')

const activityRouter = new Router({ prefix: `${process.env.ROUTER_PREFIX}/activity` })

// 获取活动分类列表
activityRouter.get('/categories', getActivityCategories)

// 分页查询活动列表
activityRouter.get('/page', getActivityPage)

// 获取活动详情
activityRouter.get('/:activityId', getActivityById)

// 创建活动 (需要认证)
activityRouter.post('/', verifyAuth, createActivity)

// 用户报名活动 (需要认证)
activityRouter.post('/:activityId/signup', verifyAuth, signupActivity)

// 取消报名 (需要认证)
activityRouter.post('/:activityId/cancel', verifyAuth, cancelSignup)

// 获取用户的活动报名列表 (需要认证)
activityRouter.get('/my/signups', verifyAuth, getUserActivitySignups)

// 获取我创建的活动列表 (需要认证)
activityRouter.get('/my/created', verifyAuth, getMyCreatedActivities)

module.exports = activityRouter
