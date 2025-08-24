const Router = require('koa-router')
const {
    getHotMerchantCategories,
    getMerchantPage,
    getMerchantById,
    createMerchant,
    updateMerchant,
    deleteMerchant,
    updateMerchantStatus,
    getMerchantCategories
} = require('../controller/merchant.controller')

const { verifyAuth } = require('../middleware/auth.middleware')

const merchantRouter = new Router({ prefix: '/merchant' })

// 获取热门商户分类
merchantRouter.get('/categories/hot', getHotMerchantCategories)

// 获取商户分类列表
merchantRouter.get('/categories', getMerchantCategories)

// 分页查询商户列表
merchantRouter.get('/page', getMerchantPage)

// 获取商户详情
merchantRouter.get('/:merchantId', getMerchantById)

// 创建商户 (需要认证)
merchantRouter.post('/', verifyAuth, createMerchant)

// 更新商户 (需要认证)
merchantRouter.put('/:merchantId', verifyAuth, updateMerchant)

// 删除商户 (需要认证)
merchantRouter.delete('/:merchantId', verifyAuth, deleteMerchant)

// 更新商户状态 (需要认证)
merchantRouter.put('/:merchantId/status', verifyAuth, updateMerchantStatus)

module.exports = merchantRouter
