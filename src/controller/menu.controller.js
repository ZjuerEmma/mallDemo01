const menuService = require('../service/menu.service')

class MenuController {
  async list(ctx, next) {
    const { offset, size } = ctx.request.body
    const { id } = ctx.user
    const result = await menuService.getMenuList(offset, size, id)
    ctx.body = {
      code: 0,
      data: result
    }

  }
}

module.exports = new MenuController()
