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

authRouter.post('/api/login',verifyLogin, login )
authRouter.get('/api/test', verifyAuth, success)


module.exports = authRouter
