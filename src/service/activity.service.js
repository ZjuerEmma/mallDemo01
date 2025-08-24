const connection = require('../app/database')

class ActivityService {
    // 获取活动分类列表
    async getActivityCategories() {
        const statement = `
            SELECT id, name, icon, sort_order, status
            FROM activity_category 
            WHERE is_deleted = 0 AND status = 1
            ORDER BY sort_order ASC
        `
        const [result] = await connection.execute(statement)
        return result
    }

    // 分页查询活动列表
    async getActivityPage(queryParams) {
        const { size = 10, current = 1, queryDTO } = queryParams
        const offset = (current - 1) * size
        
        let query = JSON.parse(queryDTO || '{}')
        let whereConditions = ['a.status = 1', 'a.is_deleted = 0']
        let params = []

        // 关键词搜索
        if (query.keyword) {
            whereConditions.push('(a.title LIKE ? OR a.description LIKE ? OR a.content LIKE ?)')
            const keyword = `%${query.keyword}%`
            params.push(keyword, keyword, keyword)
        }

        // 分类筛选
        if (query.categoryId) {
            whereConditions.push('a.category_id = ?')
            params.push(query.categoryId)
        }

        // 活动来源筛选
        if (query.activitySource !== undefined) {
            whereConditions.push('a.activity_source = ?')
            params.push(query.activitySource)
        }

        // 活动类型筛选
        if (query.activityType) {
            whereConditions.push('a.activity_type = ?')
            params.push(query.activityType)
        }

        // 时间范围筛选
        if (query.startTime) {
            whereConditions.push('a.start_time >= ?')
            params.push(query.startTime)
        }
        if (query.endTime) {
            whereConditions.push('a.end_time <= ?')
            params.push(query.endTime)
        }

        // 地理位置筛选
        if (query.latitude && query.longitude && query.radius) {
            whereConditions.push(`
                (6371 * acos(cos(radians(?)) * cos(radians(a.latitude)) * 
                cos(radians(a.longitude) - radians(?)) + 
                sin(radians(?)) * sin(radians(a.latitude)))) <= ?
            `)
            params.push(query.latitude, query.longitude, query.latitude, query.radius / 1000)
        }

        const whereClause = whereConditions.join(' AND ')

        // 查询总数
        const countStatement = `
            SELECT COUNT(*) as total
            FROM activity a
            WHERE ${whereClause}
        `
        const [countResult] = await connection.execute(countStatement, params)
        const total = countResult[0].total

        // 查询数据 - 创建新的参数数组避免污染
        const dataStatement = `
            SELECT 
                a.id,
                a.title,
                a.category_id,
                a.merchant_id,
                a.description,
                a.content,
                a.cover_image,
                a.images,
                a.start_time,
                a.end_time,
                a.address,
                a.longitude,
                a.latitude,
                a.max_participants,
                a.current_participants,
                a.tags,
                a.status,
                a.create_time,
                a.update_time,
                a.activity_source,
                a.activity_type,
                a.price,
                a.venue_name,
                a.signup_fee,
                a.creator_id,
                a.creator_name,
                a.creator_avatar,
                a.signup_deadline,
                a.allow_waitlist,
                a.max_waitlist,
                a.current_waitlist,
                a.contact_info,
                a.requirements,
                a.popularity_score,
                a.view_count,
                a.share_count,
                ac.name as category_name,
                ac.icon as category_icon,
                m.name as merchant_name,
                COALESCE(signup_stats.confirmed_count, 0) as actual_participants,
                COALESCE(signup_stats.waitlist_count, 0) as actual_waitlist_count,
                CASE 
                    WHEN a.start_time > NOW() THEN '未开始'
                    WHEN a.end_time < NOW() OR a.status = 2 THEN '已结束'
                    ELSE '进行中'
                END as activity_status_desc,
                CASE 
                    WHEN a.activity_source = 1 THEN
                        CASE 
                            WHEN a.status != 1 THEN '活动已结束'
                            WHEN a.signup_deadline IS NOT NULL AND a.signup_deadline < NOW() THEN '报名已截止'
                            WHEN a.current_participants >= a.max_participants THEN
                                CASE 
                                    WHEN a.allow_waitlist = 1 AND (a.max_waitlist IS NULL OR a.current_waitlist < a.max_waitlist) THEN '可候补'
                                    ELSE '已满员'
                                END
                            ELSE '可报名'
                        END
                    ELSE '商户活动'
                END as signup_status_desc
            FROM activity a
            LEFT JOIN activity_category ac ON a.category_id = ac.id
            LEFT JOIN merchant m ON a.merchant_id = m.id
            LEFT JOIN (
                SELECT 
                    activity_id,
                    COUNT(CASE WHEN status IN (0,1,4) AND is_waitlist = 0 THEN 1 END) as confirmed_count,
                    COUNT(CASE WHEN status = 3 AND is_waitlist = 1 THEN 1 END) as waitlist_count
                FROM activity_signup 
                WHERE is_deleted = 0 
                GROUP BY activity_id
            ) signup_stats ON a.id = signup_stats.activity_id
            WHERE ${whereClause}
            ORDER BY a.popularity_score DESC, a.create_time DESC
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

    // 获取活动详情
    async getActivityById(activityId) {
        const statement = `
            SELECT 
                a.*,
                ac.name as category_name,
                ac.icon as category_icon,
                m.name as merchant_name,
                m.phone as merchant_phone,
                m.address as merchant_address,
                COALESCE(signup_stats.confirmed_count, 0) as actual_participants,
                COALESCE(signup_stats.waitlist_count, 0) as actual_waitlist_count,
                CASE 
                    WHEN a.start_time > NOW() THEN '未开始'
                    WHEN a.end_time < NOW() OR a.status = 2 THEN '已结束'
                    ELSE '进行中'
                END as activity_status_desc,
                CASE 
                    WHEN a.activity_source = 1 THEN
                        CASE 
                            WHEN a.status != 1 THEN '活动已结束'
                            WHEN a.signup_deadline IS NOT NULL AND a.signup_deadline < NOW() THEN '报名已截止'
                            WHEN a.current_participants >= a.max_participants THEN
                                CASE 
                                    WHEN a.allow_waitlist = 1 AND (a.max_waitlist IS NULL OR a.current_waitlist < a.max_waitlist) THEN '可候补'
                                    ELSE '已满员'
                                END
                            ELSE '可报名'
                        END
                    ELSE '商户活动'
                END as signup_status_desc
            FROM activity a
            LEFT JOIN activity_category ac ON a.category_id = ac.id
            LEFT JOIN merchant m ON a.merchant_id = m.id
            LEFT JOIN (
                SELECT 
                    activity_id,
                    COUNT(CASE WHEN status IN (0,1,4) AND is_waitlist = 0 THEN 1 END) as confirmed_count,
                    COUNT(CASE WHEN status = 3 AND is_waitlist = 1 THEN 1 END) as waitlist_count
                FROM activity_signup 
                WHERE is_deleted = 0 
                GROUP BY activity_id
            ) signup_stats ON a.id = signup_stats.activity_id
            WHERE a.id = ? AND a.is_deleted = 0
        `
        const [result] = await connection.execute(statement, [activityId])
        return result[0]
    }

    // 创建活动
    async createActivity(activityData) {
        const {
            title, category_id, merchant_id, description, content, cover_image, images,
            start_time, end_time, address, longitude, latitude, max_participants,
            tags, activity_source = 0, activity_type, price = 0, venue_name,
            signup_fee = 0, creator_id, creator_name, creator_avatar, signup_deadline,
            allow_waitlist = 0, max_waitlist = 0, contact_info, requirements
        } = activityData

        const statement = `
            INSERT INTO activity (
                title, category_id, merchant_id, description, content, cover_image, images,
                start_time, end_time, address, longitude, latitude, max_participants,
                tags, activity_source, activity_type, price, venue_name, signup_fee,
                creator_id, creator_name, creator_avatar, signup_deadline, allow_waitlist,
                max_waitlist, contact_info, requirements
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
        const [result] = await connection.execute(statement, [
            title, category_id, merchant_id, description, content, cover_image,
            JSON.stringify(images), start_time, end_time, address, longitude, latitude,
            max_participants, JSON.stringify(tags), activity_source, activity_type,
            price, venue_name, signup_fee, creator_id, creator_name, creator_avatar,
            signup_deadline, allow_waitlist, max_waitlist, contact_info, requirements
        ])
        return result
    }

    // 用户报名活动
    async signupActivity(activityId, userId, signupData) {
        const {
            user_name, user_avatar, user_phone, remark, contact_info,
            emergency_contact, special_requirements
        } = signupData

        // 检查活动是否存在且可报名
        const activity = await this.getActivityById(activityId)
        if (!activity) {
            throw new Error('活动不存在')
        }

        if (activity.status !== 1) {
            throw new Error('活动已结束或禁用')
        }

        if (activity.signup_deadline && new Date(activity.signup_deadline) < new Date()) {
            throw new Error('报名已截止')
        }

        // 检查是否已报名
        const checkStatement = `
            SELECT id FROM activity_signup 
            WHERE activity_id = ? AND user_id = ? AND is_deleted = 0
        `
        const [existingSignup] = await connection.execute(checkStatement, [activityId, userId])
        if (existingSignup.length > 0) {
            throw new Error('您已报名该活动')
        }

        // 判断是否需要候补
        const isWaitlist = activity.current_participants >= activity.max_participants
        let waitlistOrder = null

        if (isWaitlist) {
            if (!activity.allow_waitlist) {
                throw new Error('活动已满员且不支持候补')
            }
            if (activity.max_waitlist && activity.current_waitlist >= activity.max_waitlist) {
                throw new Error('候补名额已满')
            }

            // 获取候补排序号
            const waitlistOrderStatement = `
                SELECT COALESCE(MAX(waitlist_order), 0) + 1 as next_order
                FROM activity_signup 
                WHERE activity_id = ? AND is_waitlist = 1 AND is_deleted = 0
            `
            const [orderResult] = await connection.execute(waitlistOrderStatement, [activityId])
            waitlistOrder = orderResult[0].next_order
        }

        const insertStatement = `
            INSERT INTO activity_signup (
                activity_id, user_id, user_name, user_avatar, user_phone,
                status, remark, is_waitlist, waitlist_order, contact_info,
                emergency_contact, special_requirements
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
        const [result] = await connection.execute(insertStatement, [
            activityId, userId, user_name, user_avatar, user_phone,
            isWaitlist ? 3 : 0, remark, isWaitlist ? 1 : 0, waitlistOrder,
            contact_info, emergency_contact, special_requirements
        ])

        // 更新活动参与人数
        if (isWaitlist) {
            await connection.execute(
                'UPDATE activity SET current_waitlist = current_waitlist + 1 WHERE id = ?',
                [activityId]
            )
        } else {
            await connection.execute(
                'UPDATE activity SET current_participants = current_participants + 1 WHERE id = ?',
                [activityId]
            )
        }

        return result
    }

    // 取消报名
    async cancelSignup(activityId, userId, cancelReason) {
        const statement = `
            UPDATE activity_signup 
            SET status = 2, cancel_time = NOW(), cancel_reason = ?
            WHERE activity_id = ? AND user_id = ? AND status IN (0, 1, 3) AND is_deleted = 0
        `
        const [result] = await connection.execute(statement, [cancelReason, activityId, userId])

        if (result.affectedRows > 0) {
            // 更新活动参与人数
            const signupInfo = await connection.execute(
                'SELECT is_waitlist FROM activity_signup WHERE activity_id = ? AND user_id = ? AND is_deleted = 0',
                [activityId, userId]
            )
            
            if (signupInfo[0].length > 0) {
                const isWaitlist = signupInfo[0][0].is_waitlist
                if (isWaitlist) {
                    await connection.execute(
                        'UPDATE activity SET current_waitlist = current_waitlist - 1 WHERE id = ?',
                        [activityId]
                    )
                } else {
                    await connection.execute(
                        'UPDATE activity SET current_participants = current_participants - 1 WHERE id = ?',
                        [activityId]
                    )
                }
            }
        }

        return result
    }

    // 获取用户的活动报名列表
    async getUserActivitySignups(userId, queryParams = {}) {
        const { status, activityType, current = 1, size = 10 } = queryParams
        const offset = (current - 1) * size

        let whereConditions = ['asign.user_id = ?', 'asign.is_deleted = 0']
        let params = [userId]

        if (status !== undefined) {
            whereConditions.push('asign.status = ?')
            params.push(status)
        }

        if (activityType) {
            whereConditions.push('a.activity_type = ?')
            params.push(activityType)
        }

        const whereClause = whereConditions.join(' AND ')

        const statement = `
            SELECT 
                asign.*,
                a.title,
                a.cover_image,
                a.start_time,
                a.end_time,
                a.address,
                a.activity_type,
                a.price,
                a.signup_fee,
                ac.name as category_name
            FROM activity_signup asign
            LEFT JOIN activity a ON asign.activity_id = a.id
            LEFT JOIN activity_category ac ON a.category_id = ac.id
            WHERE ${whereClause}
            ORDER BY asign.signup_time DESC
            LIMIT ? OFFSET ?
        `
        
        const dataParams = [...params, size, offset]
        const [result] = await connection.execute(statement, dataParams)
        return result
    }
}

module.exports = new ActivityService()
