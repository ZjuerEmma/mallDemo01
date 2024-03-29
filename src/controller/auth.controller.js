const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../app/config')

class AuthController {
    async login(ctx, next) {
        const { id, name } = ctx.user
        const token = jwt.sign({ id, name }, PRIVATE_KEY, {
            expiresIn: 60 * 60 * 24,
            algorithm: 'RS256'
        })
        ctx.body = {
            code: 0,
            data: {
              id,
            name,
            token
            }
        }
    }

    async success(ctx, next) {
        ctx.body = 'authorization success'
    }
}

module.exports = new AuthController()
