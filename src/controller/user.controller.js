const fs = require('fs')

const service = require('../service/user.service')
// const fileService = require('../service/file.service')
// const { AVATAR_PATH } = require('../constants/flie-path')


class UserController {
    async create(ctx, next) {
        const user = ctx.request.body
        const result = await service.create(user)

        ctx.body = result
    }

    async userInfo(ctx, next) {
      const { userId } = ctx.params
      const result = await service.getUserById(userId)
      ctx.body = {
        code: 0,
        data: result
      }
    }

    async list(ctx, next) {
      const queryInfo = ctx.request.body
      const result = await service.getUserList(queryInfo)
      ctx.body = {
        code: 0,
        data: result
      }
    }

    async updateUsercellphone(ctx, next) {
      const { userName } = ctx.params
      const { cellphone } = ctx.request.body
      const result = await service.updateUsercellphoneByUserName(userName, cellphone)
      ctx.body = {
        code: 0,
        data: result
      }
    }

    async userMenu(ctx,next) {

      const { userId } = ctx.params
      const result = await service.getUserMenu(userId)
      ctx.body = {
        code: 0,
        data: result
      }
    }

    async deleteUserName(ctx, next) {
      const { userName } = ctx.params
      const result = await service.deleteByUserName(userName)
      ctx.body = {
        code: 1,
        data: result
      }
    }
    // async avatarInfo(ctx, next) {
    //     const { userId } = ctx.params

    //     const [avatarInfo] = await fileService.getAvatarByUserId(userId)
    //     const avatarInfoTransformed = avatarInfo[0]

    //     //设置响应类型后，浏览器直到文件类型会自动显示图片原始信息。否则会直接下载
    //     //很奇怪的是，无论我使用avatarInfo还是avatarInfoTransformed都可以直接显示图片。
    //     ctx.response.set('content-type', avatarInfoTransformed.mimetype)
    //     ctx.body = fs.createReadStream(`${AVATAR_PATH}/${avatarInfoTransformed.filename}`)

    // }
}

module.exports = new UserController()
