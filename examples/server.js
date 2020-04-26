const express = require('express')
const bodyParser = require('body-parser')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const WebpackConfig = require('./webpack.config')

const app = express()
const compiler = webpack(WebpackConfig)

//打包中间件配置
app.use(
  webpackDevMiddleware(compiler, {
    publicPath: '/__build__/',
    stats: {
      colors: true,
      chunks: false
    }
  })
)
//热更新中间件
app.use(webpackHotMiddleware(compiler))
//静态文件夹
app.use(express.static(__dirname))
//解析
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))



//路由
const router = express.Router()

router.get('/simple/get', function(req, res) {
  res.json({
    msg: `hello world`
  })
})
router.get('/base/get', function(req, res) {
  res.json(req.query)
})
//注册路由
app.use(router)











const port = process.env.PORT || 8081
module.exports = app.listen(port, () => {
  console.log(`
  zhangxinyu-------(${new Date().getHours()+new Date().getMinutes()})----------
  Server listening on http://localhost:${port}, Ctrl+C to stop
  `)
})


