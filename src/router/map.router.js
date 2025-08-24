const Router = require('koa-router')
const {
    getNearbyMerchants,
    getNearbyActivities,
    searchLocations,
    getHotLocations,
    getBatchLocations,
    calculateDistance,
    getAreaStats,
    getMapData
} = require('../controller/map.controller')

const mapRouter = new Router({ prefix: '/map' })

// 获取附近的商户
mapRouter.get('/nearby/merchants', getNearbyMerchants)

// 获取附近的活动
mapRouter.get('/nearby/activities', getNearbyActivities)

// 获取综合地图数据（商户+活动）
mapRouter.get('/data', getMapData)

// 搜索地址
mapRouter.get('/search', searchLocations)

// 获取热门地点
mapRouter.get('/hot-locations', getHotLocations)

// 批量获取地点信息
mapRouter.post('/batch-locations', getBatchLocations)

// 计算距离
mapRouter.get('/distance', calculateDistance)

// 获取区域统计
mapRouter.get('/area-stats', getAreaStats)

module.exports = mapRouter
