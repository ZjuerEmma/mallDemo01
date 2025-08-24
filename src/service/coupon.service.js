const connection = require('../app/database')

class CouponService {
    // 获取商户可用优惠券列表
    async getMerchantCoupons(merchantId) {
        const statement = `
            SELECT 
                c.id,
                c.merchant_id,
                c.name,
                c.description,
                c.type,
                c.discount_amount,
                c.discount_rate,
                c.min_amount,
                c.total_count,
                c.used_count,
                c.start_time,
                c.end_time,
                c.status,
                m.name as merchant_name,
                m.logo as merchant_logo
            FROM coupon c
            LEFT JOIN merchant m ON c.merchant_id = m.id
            WHERE c.merchant_id = ? 
                AND c.status = 1 
                AND c.is_deleted = 0
                AND c.start_time <= NOW() 
                AND c.end_time > NOW()
                AND c.used_count < c.total_count
            ORDER BY c.discount_amount DESC, c.end_time ASC
        `
        const [result] = await connection.execute(statement, [merchantId])
        return result
    }

    // 获取用户优惠券列表
    async getUserCoupons(userId, status = null) {
        let whereConditions = ['uc.user_id = ?']
        let params = [userId]

        if (status !== null) {
            whereConditions.push('uc.status = ?')
            params.push(status)
        }

        const whereClause = whereConditions.join(' AND ')

        const statement = `
            SELECT 
                uc.id,
                uc.user_id,
                uc.coupon_code,
                uc.status,
                uc.receive_time,
                uc.use_time,
                uc.expire_time,
                c.name as coupon_name,
                c.description as coupon_description,
                c.type as coupon_type,
                c.discount_amount,
                c.discount_rate,
                c.min_amount,
                m.name as merchant_name,
                m.logo as merchant_logo,
                m.address as merchant_address
            FROM user_coupon uc
            LEFT JOIN coupon c ON uc.coupon_id = c.id
            LEFT JOIN merchant m ON c.merchant_id = m.id
            WHERE ${whereClause}
            ORDER BY 
                CASE uc.status 
                    WHEN 1 THEN 1  -- 未使用优先
                    WHEN 3 THEN 2  -- 已过期其次
                    WHEN 2 THEN 3  -- 已使用最后
                END,
                uc.expire_time ASC
        `
        const [result] = await connection.execute(statement, params)
        return result
    }

    // 用户领取优惠券
    async receiveCoupon(userId, couponId) {
        // 检查优惠券是否存在且可领取
        const couponStatement = `
            SELECT * FROM coupon 
            WHERE id = ? AND status = 1 AND is_deleted = 0
                AND start_time <= NOW() AND end_time > NOW()
                AND used_count < total_count
        `
        const [couponResult] = await connection.execute(couponStatement, [couponId])
        
        if (couponResult.length === 0) {
            throw new Error('优惠券不存在或已失效')
        }

        const coupon = couponResult[0]

        // 检查用户是否已领取过该优惠券
        const checkStatement = `
            SELECT id FROM user_coupon 
            WHERE user_id = ? AND coupon_id = ?
        `
        const [existingCoupon] = await connection.execute(checkStatement, [userId, couponId])
        
        if (existingCoupon.length > 0) {
            throw new Error('您已领取过该优惠券')
        }

        // 生成优惠券码
        const couponCode = this.generateCouponCode(userId, couponId)

        // 计算过期时间
        const expireTime = coupon.end_time

        // 领取优惠券
        const insertStatement = `
            INSERT INTO user_coupon (
                user_id, coupon_id, coupon_code, status, expire_time
            ) VALUES (?, ?, ?, 1, ?)
        `
        const [insertResult] = await connection.execute(insertStatement, [
            userId, couponId, couponCode, expireTime
        ])

        // 更新优惠券已使用数量
        await connection.execute(
            'UPDATE coupon SET used_count = used_count + 1 WHERE id = ?',
            [couponId]
        )

        return { id: insertResult.insertId, couponCode }
    }

    // 使用优惠券
    async useCoupon(userId, couponCode) {
        // 查找用户优惠券
        const statement = `
            SELECT uc.*, c.merchant_id, c.min_amount, c.discount_amount, c.discount_rate
            FROM user_coupon uc
            LEFT JOIN coupon c ON uc.coupon_id = c.id
            WHERE uc.user_id = ? AND uc.coupon_code = ? AND uc.status = 1
        `
        const [result] = await connection.execute(statement, [userId, couponCode])
        
        if (result.length === 0) {
            throw new Error('优惠券不存在或已使用')
        }

        const userCoupon = result[0]

        // 检查是否过期
        if (new Date(userCoupon.expire_time) < new Date()) {
            // 更新状态为已过期
            await connection.execute(
                'UPDATE user_coupon SET status = 3 WHERE id = ?',
                [userCoupon.id]
            )
            throw new Error('优惠券已过期')
        }

        // 使用优惠券
        const updateStatement = `
            UPDATE user_coupon 
            SET status = 2, use_time = NOW() 
            WHERE id = ?
        `
        const [updateResult] = await connection.execute(updateStatement, [userCoupon.id])

        return updateResult
    }

    // 分页查询优惠券列表（管理端）
    async getCouponPage(queryParams) {
        const { size = 10, current = 1, merchantId, status, keyword } = queryParams
        const offset = (current - 1) * size

        let whereConditions = ['c.is_deleted = 0']
        let params = []

        if (merchantId) {
            whereConditions.push('c.merchant_id = ?')
            params.push(merchantId)
        }

        if (status !== undefined) {
            whereConditions.push('c.status = ?')
            params.push(status)
        }

        if (keyword) {
            whereConditions.push('(c.name LIKE ? OR c.description LIKE ?)')
            const keywordPattern = `%${keyword}%`
            params.push(keywordPattern, keywordPattern)
        }

        const whereClause = whereConditions.join(' AND ')

        // 查询总数
        const countStatement = `
            SELECT COUNT(*) as total
            FROM coupon c
            WHERE ${whereClause}
        `
        const [countResult] = await connection.execute(countStatement, params)
        const total = countResult[0].total

        // 查询数据 - 创建新的参数数组避免污染
        const dataStatement = `
            SELECT 
                c.*,
                m.name as merchant_name,
                m.logo as merchant_logo
            FROM coupon c
            LEFT JOIN merchant m ON c.merchant_id = m.id
            WHERE ${whereClause}
            ORDER BY c.create_time DESC
            LIMIT ? OFFSET ?
        `
        
        const dataParams = [...params, size, offset]
        const [dataResult] = await connection.execute(dataStatement, dataParams)

        return {
            records: dataResult,
            total: total,
            size: size,
            current: current,
            pages: Math.ceil(total / size)
        }
    }

    // 创建优惠券
    async createCoupon(couponData) {
        const {
            merchant_id, name, description, type, discount_amount, discount_rate,
            min_amount, total_count, start_time, end_time
        } = couponData

        const statement = `
            INSERT INTO coupon (
                merchant_id, name, description, type, discount_amount, discount_rate,
                min_amount, total_count, start_time, end_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
        const [result] = await connection.execute(statement, [
            merchant_id, name, description, type, discount_amount, discount_rate,
            min_amount, total_count, start_time, end_time
        ])
        return result
    }

    // 更新优惠券
    async updateCoupon(couponId, couponData) {
        const {
            name, description, type, discount_amount, discount_rate,
            min_amount, total_count, start_time, end_time, status
        } = couponData

        const statement = `
            UPDATE coupon SET 
                name = ?, description = ?, type = ?, discount_amount = ?, 
                discount_rate = ?, min_amount = ?, total_count = ?, 
                start_time = ?, end_time = ?, status = ?, update_time = NOW()
            WHERE id = ? AND is_deleted = 0
        `
        const [result] = await connection.execute(statement, [
            name, description, type, discount_amount, discount_rate,
            min_amount, total_count, start_time, end_time, status, couponId
        ])
        return result
    }

    // 删除优惠券（软删除）
    async deleteCoupon(couponId) {
        const statement = `UPDATE coupon SET is_deleted = 1, update_time = NOW() WHERE id = ?`
        const [result] = await connection.execute(statement, [couponId])
        return result
    }

    // 生成优惠券码
    generateCouponCode(userId, couponId) {
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2, 8).toUpperCase()
        return `CPN${userId}${couponId}${timestamp}${random}`
    }

    // 获取优惠券详情
    async getCouponById(couponId) {
        const statement = `
            SELECT 
                c.*,
                m.name as merchant_name,
                m.logo as merchant_logo,
                m.address as merchant_address
            FROM coupon c
            LEFT JOIN merchant m ON c.merchant_id = m.id
            WHERE c.id = ? AND c.is_deleted = 0
        `
        const [result] = await connection.execute(statement, [couponId])
        return result[0]
    }
}

module.exports = new CouponService()
