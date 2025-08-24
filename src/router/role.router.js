const Router = require('koa-router')

const { verifyAuth } = require('../middleware/auth.middleware')
const { roleMenu, list } = require('../controller/role.controller')

const roleRouter = new Router({prefix: `${process.env.ROUTER_PREFIX}/role`})

roleRouter.get('/:roleId/menu', verifyAuth, roleMenu)
roleRouter.post('/list',verifyAuth, list)

module.exports = roleRouter

