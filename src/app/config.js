const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')

// 确保从项目根目录加载 .env 文件
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
console.log('dotenv 配置文件路径:', path.resolve(__dirname, '../../.env'))

const PRIVATE_KEY = fs.readFileSync(path.resolve(__dirname, './keys/private.key'))
const PUBLIC_KEY = fs.readFileSync(path.resolve(__dirname, './keys/public.key'))
console.log(1233, process.env.ROUTER_PREFIX, process.env.APP_PORT, process.env.MYSQL_HOST, process.env.MYSQL_PORT, process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, process.env.WECHAT_APP_ID, process.env.WECHAT_APP_SECRET, process.env.WECHAT_REDIRECT_URI, process.env.ROUTER_PREFIX);

const {
    APP_HOST,
    APP_PORT,
    MYSQL_HOST,
    MYSQL_PORT,
    MYSQL_DATABASE,
    MYSQL_USER,
    MYSQL_PASSWORD,
    WECHAT_APP_ID,
    WECHAT_APP_SECRET,
    WECHAT_REDIRECT_URI,
    ROUTER_PREFIX,
} = process.env

// const {
//     APP_HOST = 'localhost',
//     APP_PORT = 8000,
//     MYSQL_HOST = 'localhost',
//     MYSQL_PORT = 3306,
//     MYSQL_DATABASE = 'coderwhy',
//     MYSQL_USER = 'root',
//     MYSQL_PASSWORD = 'Coderwhy01.',
//     WECHAT_APP_ID = '',
//     WECHAT_APP_SECRET = '',
//     WECHAT_REDIRECT_URI = '',
// } = process.env

// 调试信息：检查环境变量是否正确加载
console.log('Environment variables loaded:')
console.log('MYSQL_HOST:', MYSQL_HOST)
console.log('MYSQL_PORT:', MYSQL_PORT)
console.log('MYSQL_DATABASE:', MYSQL_DATABASE)
console.log('MYSQL_USER:', MYSQL_USER)
console.log('MYSQL_PASSWORD:', MYSQL_PASSWORD ? '***设置了密码***' : '***密码为空***')
console.log('从 process.env 读取的 MYSQL_PASSWORD:', process.env.MYSQL_PASSWORD ? '***有值***' : '***无值***')

module.exports = {
    APP_HOST,
    APP_PORT,
    MYSQL_HOST,
    MYSQL_PORT,
    MYSQL_DATABASE,
    MYSQL_USER,
    MYSQL_PASSWORD,
    WECHAT_APP_ID,
    WECHAT_APP_SECRET,
    WECHAT_REDIRECT_URI,
    ROUTER_PREFIX,
}

module.exports.PRIVATE_KEY = PRIVATE_KEY
module.exports.PUBLIC_KEY = PUBLIC_KEY
