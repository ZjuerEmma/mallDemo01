const Router = require('koa-router')
const {
    login,
    success
 } = require('../controller/auth.controller.js')

const {
    verifyLogin,
    verifyAuth
 } = require('../middleware/auth.middleware')

const authRouter = new Router()

authRouter.post('/login',verifyLogin, login )
authRouter.get('/test', verifyAuth, success)
authRouter.get('/1', success)


module.exports = authRouter
