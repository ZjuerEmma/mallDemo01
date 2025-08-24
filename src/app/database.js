const mysql = require('mysql2')

const config = require('./config')

console.log('数据库连接配置:')
console.log('Host:', config.MYSQL_HOST)
console.log('Port:', config.MYSQL_PORT)
console.log('Database:', config.MYSQL_DATABASE)
console.log('User:', config.MYSQL_USER)
console.log('Password:', config.MYSQL_PASSWORD ? '***已设置***' : '***未设置***')

const connections = mysql.createPool({
    host: config.MYSQL_HOST,
    port: config.MYSQL_PORT,
    database: config.MYSQL_DATABASE,
    user: config.MYSQL_USER,
    password: config.MYSQL_PASSWORD,
})

// 测试数据库连接
connections.getConnection((err, conn) => {
  if (err) {
    console.log("数据库连接失败:", err);
  } else {
    console.log("数据库连接成功~");
    conn.release(); // 释放连接回连接池
  }
});
module.exports = connections.promise()
