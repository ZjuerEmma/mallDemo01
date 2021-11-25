const jwt = require('jsonwebtoken')

const errorType = require('../constants/error-types')
const Service = require('../service/user.service')
const authService = require('../service/auth.service')
const md5password = require('../utils/password-handle')
const { PUBLIC_KEY } = require('../app/config')

const verifyLogin = async (ctx, next) => {
    const { name, password } = ctx.request.body
    console.log(name, password)
    //2. 判断用户密码是否为空
    if (!name || !password) {
        const error = new Error(errorType.NAME_OR_PASSWORD_IS_REQUIRED)
        return ctx.app.emit('error', error, ctx)
    }
    //3 判断用户是否存在

    const  result = await Service.getUserByName(name)
    const user = result
    console.log(user)
    if (!user) {
        const error = new Error(errorType.USER_NOT_EXISTS);
        return ctx.app.emit('error', error, ctx)
    }

    //判断密码是否和数据库中一致（加密后的密码）
    // if (md5password(password) !== user.password) {
    //     const error = new Error(errorType.PASSWORD_IS_INCORRECT)
    //     return ctx.app.emit('error', error, ctx)
    // }
    //取消加密
    if (password !== user.password) {
      const error = new Error(errorType.PASSWORD_IS_INCORRECT)
      return ctx.app.emit('error', error, ctx)
  }

    ctx.user = user

    await next()
}

const verifyAuth = async (ctx, next) => {

    const authorization = ctx.headers.authorization

    if (!authorization) {
        const error = new Error(errorType.UNAUTHORIZED)
        ctx.app.emit('error', error, ctx)
        return
    }

        const token = authorization.replace('Bearer ', '')
        const result = jwt.verify(token, PUBLIC_KEY, {
            algorithms: ['RS256']
        })

        console.log('============auth.middleware')
        ctx.user = result

        await next()

    // try {
    //     const result = jwt.verify(token, PUBLIC_KEY, {
    //         algorithms: ['RS256']
    //     })
    //     ctx.user = result
    //     await next()
    // } catch (err) {
    //     const error = new Error(errorType.UNAUTHORIZED)
    //     ctx.app.emit('error', error, ctx)
    // }
}

//让所有label、comement、 moment的update和delete中验证信息汇总到一个函数中
//方式一： 使得verifyPermission成为一个函数，然后在router中传入moment、label等表的信息；
// const verifyPermission = (tableName) => {
//     return async (ctx, next) => {
//         const { reviseId } = ctx.params
//         const { id } = ctx.user
//         const isPermission = await authService.checkUserInfoMatchedOrNot(tableName, reviseId, id)

//         if(!isPermission) {
//             const error = new Error(errorType.UNPERMITTED)
//             return ctx.app.emit('error', error, ctx)

//         }

//         await next()
//     }
// }

// 方式二，为了使router的接口完全符合restful 风格，建议rutouer中不传入参数；
const verifyPermission = async (ctx, next) => {

    const [tableNameId, tableName_id]= Object.entries(ctx.params).flat(1)
    // const tableName = tableNameId.slice(0, tableNameId.length - 2)
    const tableName = tableNameId.replace('Id', '')

    const { id } = ctx.user
    const isPermission = await authService.checkUserInfoMatchedOrNot(tableName, tableName_id, id)

    if(!isPermission) {
        const error = new Error(errorType.UNPERMITTED)
        return ctx.app.emit('error', error, ctx)

    }

    await next()
}

// const veryCommentPermission = async (ctx, next) => {
//     const { commentId } = ctx.params
//     const { id } = ctx.user

//     console.log(id)

//     const isPermission = await authService.checkComment(commentId, id)

//     if(!isPermission) {
//         const error = new Error(errorType.UNPERMITTED)
//         return ctx.app.emit('error', error, ctx)

//     }

//     await next()
// }

module.exports = {
    verifyLogin,
    verifyAuth,
    verifyPermission
}
