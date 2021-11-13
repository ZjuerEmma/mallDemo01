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
