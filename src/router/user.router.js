const Router = require('koa-router')

const { create, userInfo, list, userMenu, deleteUserName,updateUsercellphone } = require('../controller/user.controller')
const { verifyAuth } = require('../middleware/auth.middleware')

const {
    verifyUser,
    handlePassword
} = require('../middleware/user.middleware')

const userRouter = new Router({ prefix: `${process.env.ROUTER_PREFIX}/admin/user` })

userRouter.post('/', verifyUser, create)
userRouter.get('/:userId', verifyAuth, userInfo)
userRouter.post('/list',verifyAuth, list)
userRouter.get('/:userId/menu', verifyAuth, userMenu)
userRouter.patch('/:userName',verifyAuth, updateUsercellphone)
userRouter.delete('/:userName', verifyAuth, deleteUserName)



module.exports = userRouter
