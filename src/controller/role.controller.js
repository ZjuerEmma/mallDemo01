const roleService = require('../service/role.service')

class RoleController {
  async roleMenu(ctx,next) {

    const { roleId } = ctx.params
    const result = await roleService.getRoleMenu(roleId)
    ctx.body = {
      code: 0,
      data: result
    }
  }

  async list(ctx, next) {
    const { offset, size } = ctx.request.body
    const result = await roleService.getUserList(offset, size)
    ctx.body = {
      code: 0,
      data: result
    }
  }
}

module.exports = new RoleController()
