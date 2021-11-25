const connection = require('../app/database')

class AuthService {

    //此处的id是评论、动态或者标签等id
    async checkUserInfoMatchedOrNot(tableName, id, userId) {
        const statement = `SELECT * FROM ${tableName} WHERE id = ? AND user_id = ?;`

        const [result] = await connection.execute(statement, [id, userId])

        return result.length === 0 ? false: true
    }

}

module.exports = new AuthService()
