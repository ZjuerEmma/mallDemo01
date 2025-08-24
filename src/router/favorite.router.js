const Router = require('koa-router')
const {
    addFavorite,
    removeFavorite,
    checkFavorited,
    getUserFavorites,
    getUserFavoriteMerchants,
    getUserFavoriteActivities,
    batchCheckFavorited,
    getFavoriteStats,
    toggleFavorite
} = require('../controller/favorite.controller')

const { verifyAuth } = require('../middleware/auth.middleware')

const favoriteRouter = new Router({ prefix: `${process.env.ROUTER_PREFIX}/favorite` })

// 所有收藏接口都需要认证
favoriteRouter.use(verifyAuth)

// 添加收藏
favoriteRouter.post('/', addFavorite)

// 切换收藏状态
favoriteRouter.post('/toggle', toggleFavorite)

// 取消收藏
favoriteRouter.delete('/:targetType/:targetId', removeFavorite)

// 检查是否已收藏
favoriteRouter.get('/check/:targetType/:targetId', checkFavorited)

// 获取用户收藏列表
favoriteRouter.get('/list', getUserFavorites)

// 获取用户收藏的商户列表
favoriteRouter.get('/merchants', getUserFavoriteMerchants)

// 获取用户收藏的活动列表
favoriteRouter.get('/activities', getUserFavoriteActivities)

// 批量检查收藏状态
favoriteRouter.post('/batch-check', batchCheckFavorited)

// 获取收藏统计
favoriteRouter.get('/stats', getFavoriteStats)

module.exports = favoriteRouter
