const couponService = require('../service/coupon.service')

class CouponController {
    // 获取商户可用优惠券列表
    async getMerchantCoupons(ctx, next) {
        try {
            const { merchantId } = ctx.params
            const result = await couponService.getMerchantCoupons(merchantId)
            
            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('获取商户优惠券失败:', error)
            ctx.body = {
                code: -1,
                message: '获取商户优惠券失败',
                data: null
            }
        }
    }

    // 获取用户优惠券列表
    async getUserCoupons(ctx, next) {
        try {
            const { id: userId } = ctx.user
            const { status } = ctx.query
            
            const result = await couponService.getUserCoupons(userId, status)
            
            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('获取用户优惠券失败:', error)
            ctx.body = {
                code: -1,
                message: '获取用户优惠券失败',
                data: null
            }
        }
    }

    // 用户领取优惠券
    async receiveCoupon(ctx, next) {
        try {
            const { couponId } = ctx.params
            const { id: userId } = ctx.user
            
            const result = await couponService.receiveCoupon(userId, couponId)
            
            ctx.body = {
                code: 0,
                message: '领取优惠券成功',
                data: result
            }
        } catch (error) {
            console.error('领取优惠券失败:', error)
            ctx.body = {
                code: -1,
                message: error.message || '领取优惠券失败',
                data: null
            }
        }
    }

    // 使用优惠券
    async useCoupon(ctx, next) {
        try {
            const { couponCode } = ctx.params
            const { id: userId } = ctx.user
            
            const result = await couponService.useCoupon(userId, couponCode)
            
            ctx.body = {
                code: 0,
                message: '使用优惠券成功',
                data: result
            }
        } catch (error) {
            console.error('使用优惠券失败:', error)
            ctx.body = {
                code: -1,
                message: error.message || '使用优惠券失败',
                data: null
            }
        }
    }

    // 分页查询优惠券列表（管理端）
    async getCouponPage(ctx, next) {
        try {
            const queryParams = ctx.query
            const result = await couponService.getCouponPage(queryParams)
            
            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('查询优惠券列表失败:', error)
            ctx.body = {
                code: -1,
                message: '查询优惠券列表失败',
                data: null
            }
        }
    }

    // 创建优惠券
    async createCoupon(ctx, next) {
        try {
            const couponData = ctx.request.body
            
            // 验证必填字段
            const { merchant_id, name, type, total_count, start_time, end_time } = couponData
            if (!merchant_id || !name || !type || !total_count || !start_time || !end_time) {
                ctx.body = {
                    code: 400,
                    message: '缺少必填字段',
                    data: null
                }
                return
            }

            const result = await couponService.createCoupon(couponData)
            
            ctx.body = {
                code: 0,
                message: '创建优惠券成功',
                data: { id: result.insertId }
            }
        } catch (error) {
            console.error('创建优惠券失败:', error)
            ctx.body = {
                code: -1,
                message: '创建优惠券失败',
                data: null
            }
        }
    }

    // 更新优惠券
    async updateCoupon(ctx, next) {
        try {
            const { couponId } = ctx.params
            const couponData = ctx.request.body
            
            const result = await couponService.updateCoupon(couponId, couponData)
            
            if (result.affectedRows === 0) {
                ctx.body = {
                    code: 404,
                    message: '优惠券不存在或已删除',
                    data: null
                }
                return
            }

            ctx.body = {
                code: 0,
                message: '更新优惠券成功',
                data: null
            }
        } catch (error) {
            console.error('更新优惠券失败:', error)
            ctx.body = {
                code: -1,
                message: '更新优惠券失败',
                data: null
            }
        }
    }

    // 删除优惠券
    async deleteCoupon(ctx, next) {
        try {
            const { couponId } = ctx.params
            const result = await couponService.deleteCoupon(couponId)
            
            if (result.affectedRows === 0) {
                ctx.body = {
                    code: 404,
                    message: '优惠券不存在',
                    data: null
                }
                return
            }

            ctx.body = {
                code: 0,
                message: '删除优惠券成功',
                data: null
            }
        } catch (error) {
            console.error('删除优惠券失败:', error)
            ctx.body = {
                code: -1,
                message: '删除优惠券失败',
                data: null
            }
        }
    }

    // 获取优惠券详情
    async getCouponById(ctx, next) {
        try {
            const { couponId } = ctx.params
            const result = await couponService.getCouponById(couponId)
            
            if (!result) {
                ctx.body = {
                    code: 404,
                    message: '优惠券不存在',
                    data: null
                }
                return
            }

            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('获取优惠券详情失败:', error)
            ctx.body = {
                code: -1,
                message: '获取优惠券详情失败',
                data: null
            }
        }
    }
}

module.exports = new CouponController()
