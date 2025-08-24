const Router = require('koa-router')
const {
    getMerchantCoupons,
    getUserCoupons,
    receiveCoupon,
    useCoupon,
    getCouponPage,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getCouponById
} = require('../controller/coupon.controller')

const { verifyAuth } = require('../middleware/auth.middleware')

const couponRouter = new Router({ prefix: `${process.env.ROUTER_PREFIX}/coupon` })

// 获取商户可用优惠券列表
couponRouter.get('/merchant/:merchantId', getMerchantCoupons)

// 获取优惠券详情
couponRouter.get('/:couponId', getCouponById)

// 分页查询优惠券列表（管理端，需要认证）
couponRouter.get('/page', verifyAuth, getCouponPage)

// 创建优惠券（需要认证）
couponRouter.post('/', verifyAuth, createCoupon)

// 更新优惠券（需要认证）
couponRouter.put('/:couponId', verifyAuth, updateCoupon)

// 删除优惠券（需要认证）
couponRouter.delete('/:couponId', verifyAuth, deleteCoupon)

// 用户领取优惠券（需要认证）
couponRouter.post('/:couponId/receive', verifyAuth, receiveCoupon)

// 使用优惠券（需要认证）
couponRouter.post('/use/:couponCode', verifyAuth, useCoupon)

// 获取用户优惠券列表（需要认证）
couponRouter.get('/user/my', verifyAuth, getUserCoupons)

module.exports = couponRouter
