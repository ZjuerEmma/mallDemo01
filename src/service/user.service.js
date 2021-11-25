const connection = require('../app/database')

class UserService {
    async create(user) {
        const { name, password,cellphone, realname, department_id, role_id} = user
        // const statement = `INSERT INTO user (name, password) VALUES (?, ?);`
        const statement = `INSERT INTO user (name,password, cellphone, realname, department_id, role_id, enable) VALUES (?,?,?, ?, ?, ?,1);`
        const result = await connection.execute(statement,[name, password,cellphone, realname, department_id, role_id])

        return result[0]
    }

    async getUserList(queryInfo) {
      const { offset, size } = queryInfo
      const keys = Object.keys(queryInfo)
      if (keys.length !== 2) {
        const name = queryInfo.name
        const statement1 = `
      SELECT JSON_ARRAYAGG(JSON_OBJECT('name',u.name,'realname',u.realname,'cellphone',u.cellphone,'enable',u.enable,'createAt',u.createAt, 'updateAt',u.updateAt)) userlist,
  COUNT(*) totalCount
  FROM user u WHERE name=? LIMIT ?,?;`
      try {
        const [result] = await connection.query(statement1,[name,offset,size]);
      console.log(result[0]);
      return result[0]

      } catch(err) {
        console.log(err);
      }
      } else {
        const statement = `
      SELECT JSON_ARRAYAGG(JSON_OBJECT('name',u.name,'realname',u.realname,'cellphone',u.cellphone,'enable',u.enable,'createAt',u.createAt, 'updateAt',u.updateAt)) userlist,
  COUNT(*) totalCount
  FROM user u LIMIT ?,?;`
      try {
        const [result] = await connection.query(statement,[offset,size]);
      console.log(result[0]);
      return result[0]

      } catch(err) {
        console.log(err);
      }
      }

    }

    async updateUsercellphoneByUserName(userName, cellphone) {
      const statement = `UPDATE user SET cellphone = ? WHERE name = ?;`
      const [result] = await connection.execute(statement, [cellphone, userName])
      return result
    }

    async getUserById(userId) {
      const statement = `
        SELECT user.id id, user.name name, user.realname realname, user.cellphone cellphone, user.createAt createAt, user.updateAt updateAt, JSON_OBJECT('id',role.id, 'name',role.name,'createAt',role.createAt,'updateAt',role.updateAt) role, JSON_OBJECT('id',department.id,'name', department.name) department
        FROM user LEFT JOIN department ON user.department_id = department.id
        LEFT JOIN role ON user.role_id = role.id
        WHERE user.id = ?;
      `
      const [result] = await connection.execute(statement, [userId])
      return result[0]
    }

    async getUserMenu(userId) {
      const statement = `
        SELECT m.id id,  m.url url,  m.name name,  m.type type,m.parent_id parent_id ,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('id',menu.id,'url',menu.url, 'name',menu.name,'type',menu.type,'parent_id',menu.parent_id)) FROM menu  WHERE menu.parent_id = m.id) children
        FROM menu m
        RIGHT JOIN  role_menu ON m.id = role_menu.menu_id
        RIGHT JOIN role ON role_menu.role_id = role.id
        WHERE role.id = ? AND m.type =1;
      `
      const [result] = await connection.execute(statement, [userId])
      return result
    }

    async deleteByUserName(userName) {
        const statement = `DELETE FROM user WHERE name = ?;`
        try {
        const [result] = await connection.execute(statement, [userName])
        console.log('==============',result)
        return result
        } catch (err) {
          console.log(err)
        }

    }

    async getUserByName(name) {
      const statement = `SELECT * FROM user WHERE name = ?;`
      const [result] = await connection.execute(statement, [name])

      return result[0]
    }
    async updateAvatarUrlById(userId, avatarUrl) {
        const statement = `UPDATE user SET avatar_url = ? WHERE id = ?;`
        const result = await connection.execute(statement, [avatarUrl, userId])

        return result
    }
}

 module.exports = new UserService()
