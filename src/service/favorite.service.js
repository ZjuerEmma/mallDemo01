const connection = require('../app/database')

class FavoriteService {
    // 添加收藏
    async addFavorite(userId, targetType, targetId) {
        // 检查是否已收藏
        const checkStatement = `
            SELECT id FROM user_favorite 
            WHERE user_id = ? AND target_type = ? AND target_id = ?
        `
        const [existing] = await connection.execute(checkStatement, [userId, targetType, targetId])
        
        if (existing.length > 0) {
            throw new Error('已经收藏过了')
        }

        // 验证目标是否存在
        await this.validateTarget(targetType, targetId)

        const statement = `
            INSERT INTO user_favorite (user_id, target_type, target_id)
            VALUES (?, ?, ?)
        `
        const [result] = await connection.execute(statement, [userId, targetType, targetId])
        return result
    }

    // 取消收藏
    async removeFavorite(userId, targetType, targetId) {
        const statement = `
            DELETE FROM user_favorite 
            WHERE user_id = ? AND target_type = ? AND target_id = ?
        `
        const [result] = await connection.execute(statement, [userId, targetType, targetId])
        return result
    }

    // 检查是否已收藏
    async isFavorited(userId, targetType, targetId) {
        const statement = `
            SELECT COUNT(*) as count FROM user_favorite 
            WHERE user_id = ? AND target_type = ? AND target_id = ?
        `
        const [result] = await connection.execute(statement, [userId, targetType, targetId])
        return result[0].count > 0
    }

    // 获取用户收藏列表
    async getUserFavorites(userId, targetType = null, queryParams = {}) {
        const { current = 1, size = 10 } = queryParams
        const offset = (current - 1) * size

        let whereConditions = ['uf.user_id = ?']
        let params = [userId]

        if (targetType !== null) {
            whereConditions.push('uf.target_type = ?')
            params.push(targetType)
        }

        const whereClause = whereConditions.join(' AND ')

        let statement = ''
        
        if (targetType === 1 || targetType === null) {
            // 商户收藏
            statement = `
                SELECT 
                    uf.id,
                    uf.target_type,
                    uf.target_id,
                    uf.create_time as favorite_time,
                    m.name,
                    m.description,
                    m.logo as icon,
                    m.address,
                    m.longitude,
                    m.latitude,
                    m.rating,
                    m.review_count,
                    mc.name as category_name,
                    'merchant' as type
                FROM user_favorite uf
                LEFT JOIN merchant m ON uf.target_id = m.id AND uf.target_type = 1
                LEFT JOIN merchant_category mc ON m.category_id = mc.id
                WHERE ${whereClause} AND uf.target_type = 1
                    AND m.is_deleted = 0 AND m.status = 1
            `
        }

        if (targetType === 2 || targetType === null) {
            // 活动收藏
            const activityStatement = `
                SELECT 
                    uf.id,
                    uf.target_type,
                    uf.target_id,
                    uf.create_time as favorite_time,
                    a.title as name,
                    a.description,
                    a.cover_image as icon,
                    a.address,
                    a.longitude,
                    a.latitude,
                    a.start_time,
                    a.end_time,
                    a.max_participants,
                    a.current_participants,
                    a.activity_type,
                    ac.name as category_name,
                    'activity' as type
                FROM user_favorite uf
                LEFT JOIN activity a ON uf.target_id = a.id AND uf.target_type = 2
                LEFT JOIN activity_category ac ON a.category_id = ac.id
                WHERE ${whereClause} AND uf.target_type = 2
                    AND a.is_deleted = 0 AND a.status = 1
            `
            
            if (targetType === null) {
                statement = `(${statement}) UNION ALL (${activityStatement})`
            } else {
                statement = activityStatement
            }
        }

        statement += ` ORDER BY favorite_time DESC LIMIT ? OFFSET ?`
        const dataParams = [...params, size, offset]

        const [result] = await connection.execute(statement, dataParams)

        // 获取总数
        const countStatement = `
            SELECT COUNT(*) as total FROM user_favorite uf
            ${targetType !== null ? `WHERE uf.user_id = ? AND uf.target_type = ?` : `WHERE uf.user_id = ?`}
        `
        const countParams = targetType !== null ? [userId, targetType] : [userId]
        const [countResult] = await connection.execute(countStatement, countParams)

        return {
            records: result,
            total: countResult[0].total,
            size: size,
            current: current,
            pages: Math.ceil(countResult[0].total / size)
        }
    }

    // 获取用户收藏的商户列表
    async getUserFavoriteMerchants(userId, queryParams = {}) {
        return await this.getUserFavorites(userId, 1, queryParams)
    }

    // 获取用户收藏的活动列表
    async getUserFavoriteActivities(userId, queryParams = {}) {
        return await this.getUserFavorites(userId, 2, queryParams)
    }

    // 批量检查收藏状态
    async batchCheckFavorited(userId, targets) {
        if (!targets || targets.length === 0) {
            return []
        }

        const placeholders = targets.map(() => '(?, ?)').join(',')
        const statement = `
            SELECT target_type, target_id
            FROM user_favorite 
            WHERE user_id = ? AND (target_type, target_id) IN (${placeholders})
        `
        
        const params = [userId]
        targets.forEach(target => {
            params.push(target.targetType, target.targetId)
        })

        const [result] = await connection.execute(statement, params)
        
        // 构建结果映射
        const favoriteMap = {}
        result.forEach(item => {
            const key = `${item.target_type}_${item.target_id}`
            favoriteMap[key] = true
        })

        return targets.map(target => ({
            targetType: target.targetType,
            targetId: target.targetId,
            isFavorited: favoriteMap[`${target.targetType}_${target.targetId}`] || false
        }))
    }

    // 验证目标是否存在
    async validateTarget(targetType, targetId) {
        let statement = ''
        let tableName = ''

        switch (targetType) {
            case 1: // 商户
                tableName = 'merchant'
                statement = `SELECT id FROM ${tableName} WHERE id = ? AND is_deleted = 0 AND status = 1`
                break
            case 2: // 活动
                tableName = 'activity'
                statement = `SELECT id FROM ${tableName} WHERE id = ? AND is_deleted = 0 AND status = 1`
                break
            default:
                throw new Error('不支持的收藏类型')
        }

        const [result] = await connection.execute(statement, [targetId])
        if (result.length === 0) {
            throw new Error(`${tableName === 'merchant' ? '商户' : '活动'}不存在或已下线`)
        }
    }

    // 获取收藏统计
    async getFavoriteStats(userId) {
        const statement = `
            SELECT 
                target_type,
                COUNT(*) as count
            FROM user_favorite 
            WHERE user_id = ?
            GROUP BY target_type
        `
        const [result] = await connection.execute(statement, [userId])
        
        const stats = {
            merchant: 0,
            activity: 0,
            total: 0
        }

        result.forEach(item => {
            if (item.target_type === 1) {
                stats.merchant = item.count
            } else if (item.target_type === 2) {
                stats.activity = item.count
            }
            stats.total += item.count
        })

        return stats
    }
}

module.exports = new FavoriteService()
