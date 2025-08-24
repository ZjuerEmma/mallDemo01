const connection = require('../app/database')

class MerchantService {
    // 获取热门商户分类
    async getHotMerchantCategories() {
        const statement = `
            SELECT 
                mc.id,
                mc.name,
                mc.icon,
                mc.sort_order,
                COUNT(m.id) as merchant_count
            FROM merchant_category mc
            LEFT JOIN merchant m ON mc.id = m.category_id AND m.status = 1 AND m.is_deleted = 0
            WHERE mc.status = 1 AND mc.is_deleted = 0
            GROUP BY mc.id, mc.name, mc.icon, mc.sort_order
            ORDER BY mc.sort_order ASC, merchant_count DESC
        `
        const [result] = await connection.execute(statement)
        return result
    }

    // 分页查询商户列表
    async getMerchantPage(queryParams) {
        const { size = 10, current = 1, queryDTO } = queryParams
        const offset = (current - 1) * size
        
        let query = JSON.parse(queryDTO || '{}')
        let whereConditions = ['m.status = 1', 'm.is_deleted = 0']
        let params = []

        // 关键词搜索
        if (query.keyword) {
            whereConditions.push('(m.name LIKE ? OR m.description LIKE ? OR m.address LIKE ?)')
            const keyword = `%${query.keyword}%`
            params.push(keyword, keyword, keyword)
        }

        // 分类筛选
        if (query.categoryId) {
            whereConditions.push('m.category_id = ?')
            params.push(query.categoryId)
        }

        // 状态筛选
        if (query.status !== undefined) {
            whereConditions.push('m.status = ?')
            params.push(query.status)
        }

        // 地理位置筛选（如果有经纬度和半径）
        // if (query.latitude && query.longitude && query.radius) {
        //     whereConditions.push(`
        //         (6371 * acos(cos(radians(?)) * cos(radians(m.latitude)) * 
        //         cos(radians(m.longitude) - radians(?)) + 
        //         sin(radians(?)) * sin(radians(m.latitude)))) <= ?
        //     `)
        //     params.push(query.latitude, query.longitude, query.latitude, query.radius / 1000)
        // }

        const whereClause = whereConditions.join(' AND ')

        // 查询总数
        const countStatement = `
            SELECT COUNT(*) as total
            FROM merchant m
            WHERE ${whereClause}
        `
        const [countResult] = await connection.execute(countStatement, params)
        const total = countResult[0].total
        
        console.log('total', total, params);
        

        // 查询数据 - 创建新的参数数组避免污染
        const dataStatement = `
            SELECT 
                m.id,
                m.name,
                m.category_id,
                m.description,
                m.logo as icon,
                m.images,
                m.phone,
                m.address,
                m.longitude,
                m.latitude,
                m.business_hours,
                m.tags,
                m.rating,
                m.review_count,
                m.status,
                m.create_time,
                m.update_time,
                mc.name as category_name,
                mc.icon as category_icon,
                (SELECT COUNT(*) FROM coupon c WHERE c.merchant_id = m.id AND c.status = 1 AND c.end_time > NOW()) as available_coupon_count
            FROM merchant m
            LEFT JOIN merchant_category mc ON m.category_id = mc.id
            WHERE ${whereClause}
            ORDER BY m.rating DESC, m.review_count DESC, m.create_time DESC
            LIMIT ? OFFSET ?
        `
        
        console.log('dataStatement', dataStatement, size, offset);
        const dataParams = [...params, String(size), String(offset)]
        console.log('dataParams', dataParams);
        const [dataResult] = await connection.execute(dataStatement, dataParams)
        // const dataResult = []

        return {
            records: dataResult,
            total: total,
            size: size,
            current: current,
            pages: Math.ceil(total / size)
        }
    }

    // 获取商户详情
    async getMerchantById(merchantId) {
        const statement = `
            SELECT 
                m.id,
                m.name,
                m.category_id,
                m.description,
                m.logo as icon,
                m.images,
                m.phone,
                m.address,
                m.longitude,
                m.latitude,
                m.business_hours,
                m.tags,
                m.rating,
                m.review_count,
                m.status,
                m.create_time,
                m.update_time,
                mc.name as category_name,
                mc.icon as category_icon,
                (SELECT COUNT(*) FROM coupon c WHERE c.merchant_id = m.id AND c.status = 1 AND c.end_time > NOW()) as available_coupon_count
            FROM merchant m
            LEFT JOIN merchant_category mc ON m.category_id = mc.id
            WHERE m.id = ? AND m.is_deleted = 0
        `
        const [result] = await connection.execute(statement, [merchantId])
        return result[0]
    }

    // 创建商户
    async createMerchant(merchantData) {
        const {
            name, category_id, description, logo, images, phone, address,
            longitude, latitude, business_hours, tags, rating = 0, review_count = 0
        } = merchantData

        const statement = `
            INSERT INTO merchant (
                name, category_id, description, logo, images, phone, address,
                longitude, latitude, business_hours, tags, rating, review_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
        const [result] = await connection.execute(statement, [
            name, category_id, description, logo, JSON.stringify(images), phone,
            address, longitude, latitude, business_hours, JSON.stringify(tags),
            rating, review_count
        ])
        return result
    }

    // 更新商户
    async updateMerchant(merchantId, merchantData) {
        const {
            name, category_id, description, logo, images, phone, address,
            longitude, latitude, business_hours, tags, rating, review_count
        } = merchantData

        const statement = `
            UPDATE merchant SET 
                name = ?, category_id = ?, description = ?, logo = ?, images = ?,
                phone = ?, address = ?, longitude = ?, latitude = ?, business_hours = ?,
                tags = ?, rating = ?, review_count = ?, update_time = NOW()
            WHERE id = ? AND is_deleted = 0
        `
        const [result] = await connection.execute(statement, [
            name, category_id, description, logo, JSON.stringify(images), phone,
            address, longitude, latitude, business_hours, JSON.stringify(tags),
            rating, review_count, merchantId
        ])
        return result
    }

    // 删除商户（软删除）
    async deleteMerchant(merchantId) {
        const statement = `UPDATE merchant SET is_deleted = 1, update_time = NOW() WHERE id = ?`
        const [result] = await connection.execute(statement, [merchantId])
        return result
    }

    // 更新商户状态
    async updateMerchantStatus(merchantId, status) {
        const statement = `UPDATE merchant SET status = ?, update_time = NOW() WHERE id = ? AND is_deleted = 0`
        const [result] = await connection.execute(statement, [status, merchantId])
        return result
    }

    // 获取商户分类列表
    async getMerchantCategories() {
        const statement = `
            SELECT id, name, icon, sort_order, status
            FROM merchant_category 
            WHERE is_deleted = 0 AND status = 1
            ORDER BY sort_order ASC
        `
        const [result] = await connection.execute(statement)
        return result
    }
}

module.exports = new MerchantService()
