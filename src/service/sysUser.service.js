const connection = require('../app/database')

class SysUserService {
    // 创建或更新用户（微信登录）
    async createOrUpdateUser(userInfo) {
        const {
            username, nickname, avatar, phone, email, gender,
            birthday, wechat_openid, wechat_unionid, last_login_ip
        } = userInfo

        // 检查用户是否已存在
        let existingUser = null
        if (wechat_openid) {
            existingUser = await this.getUserByOpenId(wechat_openid)
        } else if (wechat_unionid) {
            existingUser = await this.getUserByUnionId(wechat_unionid)
        } else if (phone) {
            existingUser = await this.getUserByPhone(phone)
        }

        if (existingUser) {
            // 更新用户信息
            const updateStatement = `
                UPDATE sys_user SET 
                    nickname = ?, avatar = ?, phone = ?, email = ?, gender = ?,
                    birthday = ?, last_login_time = NOW(), last_login_ip = ?,
                    update_time = NOW()
                WHERE id = ?
            `
            await connection.execute(updateStatement, [
                nickname || existingUser.nickname,
                avatar || existingUser.avatar,
                phone || existingUser.phone,
                email || existingUser.email,
                gender !== undefined ? gender : existingUser.gender,
                birthday || existingUser.birthday,
                last_login_ip,
                existingUser.id
            ])
            
            return await this.getUserById(existingUser.id)
        } else {
            // 创建新用户
            const insertStatement = `
                INSERT INTO sys_user (
                    username, nickname, avatar, phone, email, gender, birthday,
                    wechat_openid, wechat_unionid, last_login_time, last_login_ip
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
            `
            const [result] = await connection.execute(insertStatement, [
                username, nickname, avatar, phone, email, gender, birthday,
                wechat_openid, wechat_unionid, last_login_ip
            ])
            
            return await this.getUserById(result.insertId)
        }
    }

    // 根据ID获取用户
    async getUserById(userId) {
        const statement = `
            SELECT * FROM sys_user 
            WHERE id = ? AND is_deleted = 0
        `
        const [result] = await connection.execute(statement, [userId])
        return result[0]
    }

    // 根据OpenID获取用户
    async getUserByOpenId(openId) {
        const statement = `
            SELECT * FROM sys_user 
            WHERE wechat_openid = ? AND is_deleted = 0
        `
        const [result] = await connection.execute(statement, [openId])
        return result[0]
    }

    // 根据UnionID获取用户
    async getUserByUnionId(unionId) {
        const statement = `
            SELECT * FROM sys_user 
            WHERE wechat_unionid = ? AND is_deleted = 0
        `
        const [result] = await connection.execute(statement, [unionId])
        return result[0]
    }

    // 根据手机号获取用户
    async getUserByPhone(phone) {
        const statement = `
            SELECT * FROM sys_user 
            WHERE phone = ? AND is_deleted = 0
        `
        const [result] = await connection.execute(statement, [phone])
        return result[0]
    }

    // 更新用户信息
    async updateUser(userId, userInfo) {
        const {
            nickname, avatar, phone, email, gender, birthday
        } = userInfo

        const statement = `
            UPDATE sys_user SET 
                nickname = ?, avatar = ?, phone = ?, email = ?, 
                gender = ?, birthday = ?, update_time = NOW()
            WHERE id = ? AND is_deleted = 0
        `
        const [result] = await connection.execute(statement, [
            nickname, avatar, phone, email, gender, birthday, userId
        ])
        return result
    }

    // 更新用户状态
    async updateUserStatus(userId, status) {
        const statement = `
            UPDATE sys_user SET status = ?, update_time = NOW() 
            WHERE id = ? AND is_deleted = 0
        `
        const [result] = await connection.execute(statement, [status, userId])
        return result
    }

    // 删除用户（软删除）
    async deleteUser(userId) {
        const statement = `
            UPDATE sys_user SET is_deleted = 1, update_time = NOW() 
            WHERE id = ?
        `
        const [result] = await connection.execute(statement, [userId])
        return result
    }

    // 分页查询用户列表（管理端）
    async getUserPage(queryParams) {
        const { size = 10, current = 1, nickname, phone, status, gender } = queryParams
        const offset = (current - 1) * size

        let whereConditions = ['is_deleted = 0']
        let params = []

        if (nickname) {
            whereConditions.push('nickname LIKE ?')
            params.push(`%${nickname}%`)
        }

        if (phone) {
            whereConditions.push('phone LIKE ?')
            params.push(`%${phone}%`)
        }

        if (status !== undefined) {
            whereConditions.push('status = ?')
            params.push(status)
        }

        if (gender !== undefined) {
            whereConditions.push('gender = ?')
            params.push(gender)
        }

        const whereClause = whereConditions.join(' AND ')

        // 查询总数
        const countStatement = `
            SELECT COUNT(*) as total FROM sys_user WHERE ${whereClause}
        `
        const [countResult] = await connection.execute(countStatement, params)
        const total = countResult[0].total

        // 查询数据 - 创建新的参数数组避免污染
        const dataStatement = `
            SELECT 
                id, username, nickname, avatar, phone, email, gender, birthday,
                status, last_login_time, last_login_ip, create_time, update_time
            FROM sys_user 
            WHERE ${whereClause}
            ORDER BY create_time DESC
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

    // 获取用户统计信息
    async getUserStats() {
        const statement = `
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN status = 1 THEN 1 END) as active_users,
                COUNT(CASE WHEN status = 0 THEN 1 END) as inactive_users,
                COUNT(CASE WHEN DATE(create_time) = CURDATE() THEN 1 END) as today_new_users,
                COUNT(CASE WHEN DATE(last_login_time) = CURDATE() THEN 1 END) as today_active_users
            FROM sys_user 
            WHERE is_deleted = 0
        `
        const [result] = await connection.execute(statement)
        return result[0]
    }

    // 用户签到
    async userCheckin(userId) {
        // 检查今日是否已签到
        const checkStatement = `
            SELECT config_value FROM sys_config 
            WHERE config_key = ? AND DATE(create_time) = CURDATE()
        `
        const checkinKey = `user_checkin_${userId}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`
        const [existing] = await connection.execute(checkStatement, [checkinKey])
        
        if (existing.length > 0) {
            throw new Error('今日已签到')
        }

        // 记录签到
        const insertStatement = `
            INSERT INTO sys_config (config_key, config_value, config_desc)
            VALUES (?, NOW(), '用户签到记录')
        `
        const [result] = await connection.execute(insertStatement, [checkinKey])
        
        return result
    }

    // 获取用户签到记录
    async getUserCheckinHistory(userId, days = 30) {
        const statement = `
            SELECT 
                config_key,
                config_value as checkin_time,
                DATE(create_time) as checkin_date
            FROM sys_config 
            WHERE config_key LIKE ? 
                AND create_time >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            ORDER BY create_time DESC
        `
        const keyPattern = `user_checkin_${userId}_%`
        const [result] = await connection.execute(statement, [keyPattern, days])
        return result
    }

    // 检查今日是否已签到
    async getTodayCheckinStatus(userId) {
        const checkinKey = `user_checkin_${userId}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`
        const statement = `
            SELECT COUNT(*) as count FROM sys_config 
            WHERE config_key = ? AND DATE(create_time) = CURDATE()
        `
        const [result] = await connection.execute(statement, [checkinKey])
        return result[0].count > 0
    }
}

module.exports = new SysUserService()
