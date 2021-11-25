const connection = require('../app/database')

class departmentService{
async getdepartmentList(queryInfo){
  const { offset, size } = queryInfo
  console.log('========',queryInfo)
  const statement = `
  SELECT JSON_ARRAYAGG(JSON_OBJECT('name',d.name,'leader',d.leader,'createAt',d.createAt, 'updateAt',d.updateAt)) userlist,
  COUNT(*) totalCount
  FROM department d LIMIT ?,?;`
  try {
    const [result] = await connection.query(statement, [offset, size])
    return result[0]
  } catch (err) {
    console.log(err)
  }
}
}

module.exports = new departmentService()
