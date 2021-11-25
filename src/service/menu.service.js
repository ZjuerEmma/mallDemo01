const connection = require('../app/database')

class MenuService{
  async getMenuList(offset, size, userId){
    const statement = `
      SELECT JSON_ARRAYAGG(JSON_OBJECT('permission',m.permission,'url',m.url, 'name',m.name,'type',m.type,'createAt',m.createAt, 'updateAt',m.updateAt)) userlist,
      COUNT(*) totalCount
      FROM menu m
      RIGHT JOIN  role_menu ON m.id = role_menu.menu_id
      RIGHT JOIN role ON role_menu.role_id = role.id
      WHERE role.id = ?;`
    const [result] = await connection.execute(statement, [userId])
    return result[0]
  }
}

module.exports = new MenuService()



