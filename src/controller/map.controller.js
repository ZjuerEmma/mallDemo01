const mapService = require('../service/map.service')

class MapController {
    // 获取附近的商户
    async getNearbyMerchants(ctx, next) {
        try {
            const { longitude, latitude, radius = 5000, categoryId, limit = 20 } = ctx.query

            if (!longitude || !latitude) {
                ctx.body = {
                    code: 400,
                    message: '经纬度参数不能为空',
                    data: null
                }
                return
            }

            const result = await mapService.getNearbyMerchants(
                parseFloat(longitude),
                parseFloat(latitude),
                parseInt(radius),
                categoryId ? parseInt(categoryId) : null,
                parseInt(limit)
            )

            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('获取附近商户失败:', error)
            ctx.body = {
                code: -1,
                message: '获取附近商户失败',
                data: null
            }
        }
    }

    // 获取附近的活动
    async getNearbyActivities(ctx, next) {
        try {
            const { longitude, latitude, radius = 5000, categoryId, limit = 20 } = ctx.query

            if (!longitude || !latitude) {
                ctx.body = {
                    code: 400,
                    message: '经纬度参数不能为空',
                    data: null
                }
                return
            }

            const result = await mapService.getNearbyActivities(
                parseFloat(longitude),
                parseFloat(latitude),
                parseInt(radius),
                categoryId ? parseInt(categoryId) : null,
                parseInt(limit)
            )

            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('获取附近活动失败:', error)
            ctx.body = {
                code: -1,
                message: '获取附近活动失败',
                data: null
            }
        }
    }

    // 搜索地址
    async searchLocations(ctx, next) {
        try {
            const { keyword, longitude, latitude, limit = 10 } = ctx.query

            if (!keyword) {
                ctx.body = {
                    code: 400,
                    message: '搜索关键词不能为空',
                    data: null
                }
                return
            }

            const result = await mapService.searchLocations(
                keyword,
                longitude ? parseFloat(longitude) : null,
                latitude ? parseFloat(latitude) : null,
                parseInt(limit)
            )

            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('搜索地址失败:', error)
            ctx.body = {
                code: -1,
                message: '搜索地址失败',
                data: null
            }
        }
    }

    // 获取热门地点
    async getHotLocations(ctx, next) {
        try {
            const { limit = 10 } = ctx.query

            const result = await mapService.getHotLocations(parseInt(limit))

            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('获取热门地点失败:', error)
            ctx.body = {
                code: -1,
                message: '获取热门地点失败',
                data: null
            }
        }
    }

    // 批量获取地点信息
    async getBatchLocations(ctx, next) {
        try {
            const { locations } = ctx.request.body

            if (!locations || !Array.isArray(locations)) {
                ctx.body = {
                    code: 400,
                    message: '位置列表参数格式错误',
                    data: null
                }
                return
            }

            const result = await mapService.getBatchLocations(locations)

            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('批量获取地点信息失败:', error)
            ctx.body = {
                code: -1,
                message: '批量获取地点信息失败',
                data: null
            }
        }
    }

    // 计算距离
    async calculateDistance(ctx, next) {
        try {
            const { lat1, lon1, lat2, lon2 } = ctx.query

            if (!lat1 || !lon1 || !lat2 || !lon2) {
                ctx.body = {
                    code: 400,
                    message: '坐标参数不完整',
                    data: null
                }
                return
            }

            const distance = mapService.calculateDistance(
                parseFloat(lat1),
                parseFloat(lon1),
                parseFloat(lat2),
                parseFloat(lon2)
            )

            ctx.body = {
                code: 0,
                message: 'success',
                data: {
                    distance: Math.round(distance), // 返回整数米
                    distanceText: distance > 1000 ? 
                        `${(distance / 1000).toFixed(1)}km` : 
                        `${Math.round(distance)}m`
                }
            }
        } catch (error) {
            console.error('计算距离失败:', error)
            ctx.body = {
                code: -1,
                message: '计算距离失败',
                data: null
            }
        }
    }

    // 获取区域统计
    async getAreaStats(ctx, next) {
        try {
            const { southwest, northeast } = ctx.query

            if (!southwest || !northeast) {
                ctx.body = {
                    code: 400,
                    message: '区域边界参数不能为空',
                    data: null
                }
                return
            }

            const swCoords = southwest.split(',')
            const neCoords = northeast.split(',')

            if (swCoords.length !== 2 || neCoords.length !== 2) {
                ctx.body = {
                    code: 400,
                    message: '区域边界参数格式错误',
                    data: null
                }
                return
            }

            const sw = { lat: parseFloat(swCoords[0]), lng: parseFloat(swCoords[1]) }
            const ne = { lat: parseFloat(neCoords[0]), lng: parseFloat(neCoords[1]) }

            const result = await mapService.getAreaStats(sw, ne)

            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('获取区域统计失败:', error)
            ctx.body = {
                code: -1,
                message: '获取区域统计失败',
                data: null
            }
        }
    }

    // 获取综合地图数据（商户+活动）
    async getMapData(ctx, next) {
        try {
            const { longitude, latitude, radius = 5000, limit = 20 } = ctx.query

            if (!longitude || !latitude) {
                ctx.body = {
                    code: 400,
                    message: '经纬度参数不能为空',
                    data: null
                }
                return
            }

            const lon = parseFloat(longitude)
            const lat = parseFloat(latitude)
            const rad = parseInt(radius)
            const lim = parseInt(limit)

            // 并行获取商户和活动数据
            const [merchants, activities] = await Promise.all([
                mapService.getNearbyMerchants(lon, lat, rad, null, lim),
                mapService.getNearbyActivities(lon, lat, rad, null, lim)
            ])

            // 合并并标记类型
            const mapData = [
                ...merchants.map(item => ({ ...item, type: 'merchant' })),
                ...activities.map(item => ({ ...item, type: 'activity' }))
            ]

            // 按距离排序
            mapData.sort((a, b) => (a.distance || 0) - (b.distance || 0))

            ctx.body = {
                code: 0,
                message: 'success',
                data: {
                    total: mapData.length,
                    merchants: merchants.length,
                    activities: activities.length,
                    list: mapData.slice(0, lim) // 限制总数
                }
            }
        } catch (error) {
            console.error('获取地图数据失败:', error)
            ctx.body = {
                code: -1,
                message: '获取地图数据失败',
                data: null
            }
        }
    }
}

module.exports = new MapController()
