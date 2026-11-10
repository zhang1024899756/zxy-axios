# zxy-axios

一款全新重构、实现了全部浏览器端 axios 官方库功能并做了扩展的 HTTP 库，使用方法与官方保持一致。

```bash
npm install zxy-axios
```

## 特性

- 支持 `axios(config)`、`axios(url, config)` 两种调用方式，以及 `get / delete / head / options / post / put / patch` 语法糖
- `baseURL`、`params`（数组、对象、Date、URLSearchParams）、`paramsSerializer` 处理
- 请求/响应拦截器（`interceptors.request/response.use`、`eject`）
- `transformRequest` / `transformResponse` 数据管道
- 取消请求（`CancelToken.source()`、`isCancel`）
- 超时、`withCredentials`、`validateStatus`、`responseType`、`onDownloadProgress` / `onUploadProgress`
- `auth`（Basic）、XSRF（`xsrfCookieName` / `xsrfHeaderName`）、FormData 自动处理 Content-Type
- `axios.create()` 多实例、`axios.all()` / `axios.spread()`

## 使用

```ts
import axios from 'zxy-axios'

axios.defaults.baseURL = 'https://example.com/api'

axios.get('/user', { params: { id: 1 } }).then(res => {
  console.log(res.data)
})

axios.post('/user', { name: 'zxy' })

// 拦截器
axios.interceptors.request.use(config => {
  config.headers['X-Token'] = 'token'
  return config
})

// 取消请求
const source = axios.CancelToken.source()
axios.get('/slow', { cancelToken: source.token }).catch(err => {
  if (axios.isCancel(err)) {
    console.log('请求已取消:', err.message)
  }
})
source.cancel('用户主动取消')
```

## 开发

```bash
npm install          # 安装依赖
npm run dev          # 启动 examples 演示（webpack dev server）
npm test             # 运行单元测试并输出覆盖率
npm run lint         # ESLint 检查
npm run typecheck    # TypeScript 类型检查
npm run build        # 产出 dist（UMD/ES + 类型声明）与 docs
```

## 测试

单元测试基于 Jest + ts-jest，通过打桩 `XMLHttpRequest` / `document` 在 Node 环境下覆盖浏览器侧逻辑：

```
Test Suites: 14 passed
Tests:       115 passed
Coverage:    98.7% statements / 96.7% branches
```

## License

[MIT](./LICENSE)
