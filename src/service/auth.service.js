const connection = require('../app/database')

class AuthService {

    //此处的id是评论、动态或者标签等id
    async checkUserInfoMatchedOrNot(tableName, id, userId) {
        const statement = `SELECT * FROM ${tableName} WHERE id = ? AND user_id = ?;`

        const [result] = await connection.execute(statement, [id, userId])

        return result.length === 0 ? false: true
    }

    // async checkMoment(momentId, userId) {
    //     const statement = `SELECT * FROM moment WHERE ID = ?;`

    //     const [result] = await connection.execute(statement, [momentId])
    //     if (result[0].user_id === userId) {
    //         return true
    //     }
    //     return false
    // }

    // async checkComment(commentId, userId) {
    //     const statement = `SELECT * FROM comment WHERE comment_id = ?;`

    //     const [result] = await connection.execute(statement, [commentId])
    //     console.log(result[0].user_id, userId)
    //     if (result[0].user_id === userId) {
    //         return true
    //     }
    //     return false
    // }
}

module.exports = new AuthService()
