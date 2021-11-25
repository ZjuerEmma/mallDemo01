const connection = require('../app/database')

class RoleServie {
  async getRoleMenu(roleId) {
    const statement = `
      SELECT m.id id,  m.url url,  m.name name,  m.type type,m.parent_id parent_id ,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('id',menu.id,'url',menu.url, 'name',menu.name,'type',menu.type,'parent_id',menu.parent_id)) FROM menu  WHERE menu.parent_id = m.id) children
      FROM menu m
      RIGHT JOIN  role_menu ON m.id = role_menu.menu_id
      RIGHT JOIN role ON role_menu.role_id = role.id
      WHERE role.id = ? AND m.type =1;
    `
    const [result] = await connection.execute(statement, [roleId])
    return result
  }

  async getUserList(offset, size) {

    const statement1 = `
    SELECT JSON_ARRAYAGG(JSON_OBJECT('name',u.name,'realname',u.realname,'cellphone',u.cellphone,'enable',u.enable,'createAt',u.createAt, 'updateAt',u.updateAt)) userlist,
COUNT(*) totalCount
FROM USER u LIMIT ?,?;`
    try {
      const [result] = await connection.query(statement1,[offset,size]);
    console.log(result[0]);
    return result[0]

    } catch(err) {
      console.log(err);
    }

  }
}

module.exports = new RoleServie()
