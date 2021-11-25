const departmentService = require('../service/department.service')
class departmentController{
  async list(ctx, next) {
    const queryInfo = ctx.request.body
    const result = await departmentService.getdepartmentList(queryInfo)
    ctx.body = {
      code: 0,
      data: result
    }
  }
}

module.exports = new departmentController()
