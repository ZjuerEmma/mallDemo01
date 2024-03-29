const Router = require('koa-router')

const { list } = require('../controller/menu.controller')

const { verifyAuth } = require('../middleware/auth.middleware')


const menuRouter = new Router({prefix: '/menu'})

menuRouter.post('/list',verifyAuth, list)

module.exports = menuRouter

