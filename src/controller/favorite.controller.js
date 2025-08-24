const favoriteService = require('../service/favorite.service')

class FavoriteController {
    // 添加收藏
    async addFavorite(ctx, next) {
        try {
            const { id: userId } = ctx.user
            const { targetType, targetId } = ctx.request.body

            if (!targetType || !targetId) {
                ctx.body = {
                    code: 400,
                    message: '参数不完整',
                    data: null
                }
                return
            }

            const result = await favoriteService.addFavorite(userId, targetType, targetId)
            
            ctx.body = {
                code: 0,
                message: '收藏成功',
                data: { id: result.insertId }
            }
        } catch (error) {
            console.error('添加收藏失败:', error)
            ctx.body = {
                code: -1,
                message: error.message || '收藏失败',
                data: null
            }
        }
    }

    // 取消收藏
    async removeFavorite(ctx, next) {
        try {
            const { id: userId } = ctx.user
            const { targetType, targetId } = ctx.params

            const result = await favoriteService.removeFavorite(userId, parseInt(targetType), parseInt(targetId))
            
            if (result.affectedRows === 0) {
                ctx.body = {
                    code: 404,
                    message: '收藏记录不存在',
                    data: null
                }
                return
            }

            ctx.body = {
                code: 0,
                message: '取消收藏成功',
                data: null
            }
        } catch (error) {
            console.error('取消收藏失败:', error)
            ctx.body = {
                code: -1,
                message: '取消收藏失败',
                data: null
            }
        }
    }

    // 检查是否已收藏
    async checkFavorited(ctx, next) {
        try {
            const { id: userId } = ctx.user
            const { targetType, targetId } = ctx.params

            const isFavorited = await favoriteService.isFavorited(userId, parseInt(targetType), parseInt(targetId))
            
            ctx.body = {
                code: 0,
                message: 'success',
                data: { isFavorited }
            }
        } catch (error) {
            console.error('检查收藏状态失败:', error)
            ctx.body = {
                code: -1,
                message: '检查收藏状态失败',
                data: null
            }
        }
    }

    // 获取用户收藏列表
    async getUserFavorites(ctx, next) {
        try {
            const { id: userId } = ctx.user
            const { targetType } = ctx.query
            const queryParams = ctx.query

            const result = await favoriteService.getUserFavorites(
                userId, 
                targetType ? parseInt(targetType) : null, 
                queryParams
            )
            
            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('获取收藏列表失败:', error)
            ctx.body = {
                code: -1,
                message: '获取收藏列表失败',
                data: null
            }
        }
    }

    // 获取用户收藏的商户列表
    async getUserFavoriteMerchants(ctx, next) {
        try {
            const { id: userId } = ctx.user
            const queryParams = ctx.query

            const result = await favoriteService.getUserFavoriteMerchants(userId, queryParams)
            
            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('获取收藏商户列表失败:', error)
            ctx.body = {
                code: -1,
                message: '获取收藏商户列表失败',
                data: null
            }
        }
    }

    // 获取用户收藏的活动列表
    async getUserFavoriteActivities(ctx, next) {
        try {
            const { id: userId } = ctx.user
            const queryParams = ctx.query

            const result = await favoriteService.getUserFavoriteActivities(userId, queryParams)
            
            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('获取收藏活动列表失败:', error)
            ctx.body = {
                code: -1,
                message: '获取收藏活动列表失败',
                data: null
            }
        }
    }

    // 批量检查收藏状态
    async batchCheckFavorited(ctx, next) {
        try {
            const { id: userId } = ctx.user
            const { targets } = ctx.request.body

            if (!targets || !Array.isArray(targets)) {
                ctx.body = {
                    code: 400,
                    message: '参数格式错误',
                    data: null
                }
                return
            }

            const result = await favoriteService.batchCheckFavorited(userId, targets)
            
            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('批量检查收藏状态失败:', error)
            ctx.body = {
                code: -1,
                message: '批量检查收藏状态失败',
                data: null
            }
        }
    }

    // 获取收藏统计
    async getFavoriteStats(ctx, next) {
        try {
            const { id: userId } = ctx.user

            const result = await favoriteService.getFavoriteStats(userId)
            
            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('获取收藏统计失败:', error)
            ctx.body = {
                code: -1,
                message: '获取收藏统计失败',
                data: null
            }
        }
    }

    // 切换收藏状态（收藏/取消收藏）
    async toggleFavorite(ctx, next) {
        try {
            const { id: userId } = ctx.user
            const { targetType, targetId } = ctx.request.body

            if (!targetType || !targetId) {
                ctx.body = {
                    code: 400,
                    message: '参数不完整',
                    data: null
                }
                return
            }

            const isFavorited = await favoriteService.isFavorited(userId, targetType, targetId)
            
            let result
            let message
            
            if (isFavorited) {
                // 取消收藏
                result = await favoriteService.removeFavorite(userId, targetType, targetId)
                message = '取消收藏成功'
            } else {
                // 添加收藏
                result = await favoriteService.addFavorite(userId, targetType, targetId)
                message = '收藏成功'
            }
            
            ctx.body = {
                code: 0,
                message: message,
                data: { 
                    isFavorited: !isFavorited,
                    id: result.insertId || null
                }
            }
        } catch (error) {
            console.error('切换收藏状态失败:', error)
            ctx.body = {
                code: -1,
                message: error.message || '操作失败',
                data: null
            }
        }
    }
}

module.exports = new FavoriteController()
