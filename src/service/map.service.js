const connection = require('../app/database')

class MapService {
    // 获取附近的商户
    async getNearbyMerchants(longitude, latitude, radius = 5000, categoryId = null, limit = 20) {
        let whereConditions = ['m.status = 1', 'm.is_deleted = 0']
        let params = [latitude, longitude, latitude, radius / 1000] // 转换为公里

        if (categoryId) {
            whereConditions.push('m.category_id = ?')
            params.push(categoryId)
        }

        const whereClause = whereConditions.join(' AND ')

        const statement = `
            SELECT 
                m.id,
                m.name,
                m.category_id,
                m.description,
                m.logo as icon,
                m.phone,
                m.address,
                m.longitude,
                m.latitude,
                m.business_hours,
                m.rating,
                m.review_count,
                mc.name as category_name,
                mc.icon as category_icon,
                (6371 * acos(cos(radians(?)) * cos(radians(m.latitude)) * 
                cos(radians(m.longitude) - radians(?)) + 
                sin(radians(?)) * sin(radians(m.latitude)))) as distance,
                (SELECT COUNT(*) FROM coupon c WHERE c.merchant_id = m.id AND c.status = 1 AND c.end_time > NOW()) as available_coupon_count
            FROM merchant m
            LEFT JOIN merchant_category mc ON m.category_id = mc.id
            WHERE ${whereClause}
                AND (6371 * acos(cos(radians(?)) * cos(radians(m.latitude)) * 
                cos(radians(m.longitude) - radians(?)) + 
                sin(radians(?)) * sin(radians(m.latitude)))) <= ?
            ORDER BY distance ASC
            LIMIT ?
        `
        
        params.push(...params.slice(0, 4)) // 重复距离计算参数
        params.push(limit)
        
        const [result] = await connection.execute(statement, params)
        return result
    }

    // 获取附近的活动
    async getNearbyActivities(longitude, latitude, radius = 5000, categoryId = null, limit = 20) {
        let whereConditions = ['a.status = 1', 'a.is_deleted = 0', 'a.start_time > NOW()']
        let params = [latitude, longitude, latitude, radius / 1000]

        if (categoryId) {
            whereConditions.push('a.category_id = ?')
            params.push(categoryId)
        }

        const whereClause = whereConditions.join(' AND ')

        const statement = `
            SELECT 
                a.id,
                a.title,
                a.category_id,
                a.description,
                a.cover_image,
                a.start_time,
                a.end_time,
                a.address,
                a.longitude,
                a.latitude,
                a.max_participants,
                a.current_participants,
                a.activity_source,
                a.activity_type,
                a.price,
                a.signup_fee,
                a.creator_name,
                ac.name as category_name,
                ac.icon as category_icon,
                (6371 * acos(cos(radians(?)) * cos(radians(a.latitude)) * 
                cos(radians(a.longitude) - radians(?)) + 
                sin(radians(?)) * sin(radians(a.latitude)))) as distance,
                CASE 
                    WHEN a.start_time > NOW() THEN '未开始'
                    WHEN a.end_time < NOW() OR a.status = 2 THEN '已结束'
                    ELSE '进行中'
                END as activity_status_desc
            FROM activity a
            LEFT JOIN activity_category ac ON a.category_id = ac.id
            WHERE ${whereClause}
                AND (6371 * acos(cos(radians(?)) * cos(radians(a.latitude)) * 
                cos(radians(a.longitude) - radians(?)) + 
                sin(radians(?)) * sin(radians(a.latitude)))) <= ?
            ORDER BY distance ASC, a.start_time ASC
            LIMIT ?
        `
        
        params.push(...params.slice(0, 4))
        params.push(limit)
        
        const [result] = await connection.execute(statement, params)
        return result
    }

    // 搜索地址（模糊搜索）
    async searchLocations(keyword, longitude = null, latitude = null, limit = 10) {
        let orderBy = 'ORDER BY m.rating DESC, m.review_count DESC'
        let params = [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]

        // 如果提供了坐标，按距离排序
        if (longitude && latitude) {
            orderBy = `ORDER BY (6371 * acos(cos(radians(${latitude})) * cos(radians(m.latitude)) * 
                cos(radians(m.longitude) - radians(${longitude})) + 
                sin(radians(${latitude})) * sin(radians(m.latitude)))) ASC`
        }

        const statement = `
            SELECT 
                'merchant' as type,
                m.id,
                m.name,
                m.address,
                m.longitude,
                m.latitude,
                m.logo as icon,
                m.rating,
                mc.name as category_name
                ${longitude && latitude ? `, (6371 * acos(cos(radians(${latitude})) * cos(radians(m.latitude)) * 
                cos(radians(m.longitude) - radians(${longitude})) + 
                sin(radians(${latitude})) * sin(radians(m.latitude)))) as distance` : ''}
            FROM merchant m
            LEFT JOIN merchant_category mc ON m.category_id = mc.id
            WHERE (m.name LIKE ? OR m.address LIKE ? OR m.description LIKE ?)
                AND m.status = 1 AND m.is_deleted = 0
            
            UNION ALL
            
            SELECT 
                'activity' as type,
                a.id,
                a.title as name,
                a.address,
                a.longitude,
                a.latitude,
                a.cover_image as icon,
                NULL as rating,
                ac.name as category_name
                ${longitude && latitude ? `, (6371 * acos(cos(radians(${latitude})) * cos(radians(a.latitude)) * 
                cos(radians(a.longitude) - radians(${longitude})) + 
                sin(radians(${latitude})) * sin(radians(a.latitude)))) as distance` : ''}
            FROM activity a
            LEFT JOIN activity_category ac ON a.category_id = ac.id
            WHERE (a.title LIKE ? OR a.address LIKE ? OR a.description LIKE ?)
                AND a.status = 1 AND a.is_deleted = 0 AND a.start_time > NOW()
            
            ${orderBy}
            LIMIT ?
        `
        
        params.push(...params.slice(0, 3)) // 重复活动搜索参数
        params.push(limit)
        
        const [result] = await connection.execute(statement, params)
        return result
    }

    // 获取热门地点
    async getHotLocations(limit = 10) {
        const statement = `
            SELECT 
                'merchant' as type,
                m.id,
                m.name,
                m.address,
                m.longitude,
                m.latitude,
                m.logo as icon,
                m.rating,
                m.review_count,
                mc.name as category_name,
                (m.rating * m.review_count) as popularity_score
            FROM merchant m
            LEFT JOIN merchant_category mc ON m.category_id = mc.id
            WHERE m.status = 1 AND m.is_deleted = 0 AND m.rating > 0
            ORDER BY popularity_score DESC, m.review_count DESC
            LIMIT ?
        `
        
        const [result] = await connection.execute(statement, [limit])
        return result
    }

    // 批量获取地点信息
    async getBatchLocations(locations) {
        if (!locations || locations.length === 0) {
            return []
        }

        const merchantIds = []
        const activityIds = []

        locations.forEach(loc => {
            if (loc.type === 'merchant') {
                merchantIds.push(loc.id)
            } else if (loc.type === 'activity') {
                activityIds.push(loc.id)
            }
        })

        const results = []

        // 查询商户
        if (merchantIds.length > 0) {
            const merchantPlaceholders = merchantIds.map(() => '?').join(',')
            const merchantStatement = `
                SELECT 
                    'merchant' as type,
                    m.id,
                    m.name,
                    m.address,
                    m.longitude,
                    m.latitude,
                    m.logo as icon,
                    m.rating,
                    m.review_count,
                    mc.name as category_name
                FROM merchant m
                LEFT JOIN merchant_category mc ON m.category_id = mc.id
                WHERE m.id IN (${merchantPlaceholders}) AND m.status = 1 AND m.is_deleted = 0
            `
            const [merchantResult] = await connection.execute(merchantStatement, merchantIds)
            results.push(...merchantResult)
        }

        // 查询活动
        if (activityIds.length > 0) {
            const activityPlaceholders = activityIds.map(() => '?').join(',')
            const activityStatement = `
                SELECT 
                    'activity' as type,
                    a.id,
                    a.title as name,
                    a.address,
                    a.longitude,
                    a.latitude,
                    a.cover_image as icon,
                    NULL as rating,
                    NULL as review_count,
                    ac.name as category_name
                FROM activity a
                LEFT JOIN activity_category ac ON a.category_id = ac.id
                WHERE a.id IN (${activityPlaceholders}) AND a.status = 1 AND a.is_deleted = 0
            `
            const [activityResult] = await connection.execute(activityStatement, activityIds)
            results.push(...activityResult)
        }

        return results
    }

    // 计算两点之间的距离
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371 // 地球半径（公里）
        const dLat = this.toRadians(lat2 - lat1)
        const dLon = this.toRadians(lon2 - lon1)
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c * 1000 // 返回米
    }

    // 转换角度到弧度
    toRadians(degrees) {
        return degrees * (Math.PI / 180)
    }

    // 获取区域统计
    async getAreaStats(southwest, northeast) {
        const { lat: swLat, lng: swLng } = southwest
        const { lat: neLat, lng: neLng } = northeast

        const statement = `
            SELECT 
                'merchant' as type,
                COUNT(*) as count
            FROM merchant m
            WHERE m.status = 1 AND m.is_deleted = 0
                AND m.latitude BETWEEN ? AND ?
                AND m.longitude BETWEEN ? AND ?
            
            UNION ALL
            
            SELECT 
                'activity' as type,
                COUNT(*) as count
            FROM activity a
            WHERE a.status = 1 AND a.is_deleted = 0 AND a.start_time > NOW()
                AND a.latitude BETWEEN ? AND ?
                AND a.longitude BETWEEN ? AND ?
        `
        
        const [result] = await connection.execute(statement, [
            swLat, neLat, swLng, neLng,
            swLat, neLat, swLng, neLng
        ])
        
        const stats = { merchant: 0, activity: 0, total: 0 }
        result.forEach(item => {
            stats[item.type] = item.count
            stats.total += item.count
        })
        
        return stats
    }
}

module.exports = new MapService()
