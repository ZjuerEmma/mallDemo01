const Router = require('koa-router')
const { list } = require('../controller/department.controller')

const { verifyAuth } = require('../middleware/auth.middleware')


const departmentRouter = new Router({prefix: `${process.env.ROUTER_PREFIX}/department`})

departmentRouter.post('/list',verifyAuth,list)

module.exports = departmentRouter
