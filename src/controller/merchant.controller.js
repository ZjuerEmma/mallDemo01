const merchantService = require('../service/merchant.service')

class MerchantController {
    // 获取热门商户分类
    async getHotMerchantCategories(ctx, next) {
        try {
            const result = await merchantService.getHotMerchantCategories()
            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('获取热门商户分类失败:', error)
            ctx.body = {
                code: -1,
                message: '获取热门商户分类失败',
                data: null
            }
        }
    }

    // 分页查询商户列表
    async getMerchantPage(ctx, next) {
        try {
            const queryParams = ctx.query
            const result = await merchantService.getMerchantPage(queryParams)
            
            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('查询商户列表失败:', error)
            ctx.body = {
                code: -1,
                message: '查询商户列表失败',
                data: null
            }
        }
    }

    // 获取商户详情
    async getMerchantById(ctx, next) {
        try {
            const { merchantId } = ctx.params
            const result = await merchantService.getMerchantById(merchantId)
            
            if (!result) {
                ctx.body = {
                    code: 404,
                    message: '商户不存在',
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
            console.error('获取商户详情失败:', error)
            ctx.body = {
                code: -1,
                message: '获取商户详情失败',
                data: null
            }
        }
    }

    // 创建商户
    async createMerchant(ctx, next) {
        try {
            const merchantData = ctx.request.body
            const result = await merchantService.createMerchant(merchantData)
            
            ctx.body = {
                code: 0,
                message: '创建商户成功',
                data: { id: result.insertId }
            }
        } catch (error) {
            console.error('创建商户失败:', error)
            ctx.body = {
                code: -1,
                message: '创建商户失败',
                data: null
            }
        }
    }

    // 更新商户
    async updateMerchant(ctx, next) {
        try {
            const { merchantId } = ctx.params
            const merchantData = ctx.request.body
            const result = await merchantService.updateMerchant(merchantId, merchantData)
            
            if (result.affectedRows === 0) {
                ctx.body = {
                    code: 404,
                    message: '商户不存在或已删除',
                    data: null
                }
                return
            }

            ctx.body = {
                code: 0,
                message: '更新商户成功',
                data: null
            }
        } catch (error) {
            console.error('更新商户失败:', error)
            ctx.body = {
                code: -1,
                message: '更新商户失败',
                data: null
            }
        }
    }

    // 删除商户
    async deleteMerchant(ctx, next) {
        try {
            const { merchantId } = ctx.params
            const result = await merchantService.deleteMerchant(merchantId)
            
            if (result.affectedRows === 0) {
                ctx.body = {
                    code: 404,
                    message: '商户不存在',
                    data: null
                }
                return
            }

            ctx.body = {
                code: 0,
                message: '删除商户成功',
                data: null
            }
        } catch (error) {
            console.error('删除商户失败:', error)
            ctx.body = {
                code: -1,
                message: '删除商户失败',
                data: null
            }
        }
    }

    // 更新商户状态
    async updateMerchantStatus(ctx, next) {
        try {
            const { merchantId } = ctx.params
            const { status } = ctx.query
            
            if (status === undefined) {
                ctx.body = {
                    code: 400,
                    message: '状态参数不能为空',
                    data: null
                }
                return
            }

            const result = await merchantService.updateMerchantStatus(merchantId, status)
            
            if (result.affectedRows === 0) {
                ctx.body = {
                    code: 404,
                    message: '商户不存在或已删除',
                    data: null
                }
                return
            }

            ctx.body = {
                code: 0,
                message: '更新商户状态成功',
                data: null
            }
        } catch (error) {
            console.error('更新商户状态失败:', error)
            ctx.body = {
                code: -1,
                message: '更新商户状态失败',
                data: null
            }
        }
    }

    // 获取商户分类列表
    async getMerchantCategories(ctx, next) {
        try {
            const result = await merchantService.getMerchantCategories()
            ctx.body = {
                code: 0,
                message: 'success',
                data: result
            }
        } catch (error) {
            console.error('获取商户分类失败:', error)
            ctx.body = {
                code: -1,
                message: '获取商户分类失败',
                data: null
            }
        }
    }
}

module.exports = new MerchantController()
