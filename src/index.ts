import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from './type'
import xhr from './xhr'
import { buildURL } from './helpers/url'
import { transformRequest, transformResponse } from './helpers/data'
import { processHeaders } from './helpers/headers'

function axios(config: AxiosRequestConfig): AxiosPromise {
  // 中间件配置
  processConfig(config)
  return xhr(config).then(res => {
    return transformResponseData(res)
  })
}

// 中间件配置
function processConfig(config: AxiosRequestConfig): void {
  config.url = transformUrl(config)
  config.data = transformRequestData(config)
  config.headers = transformHeaders(config)
}

// url转化
function transformUrl(config: AxiosRequestConfig): string {
  const { url, params } = config
  return buildURL(url, params)
}

// post data处理
function transformRequestData(config: AxiosRequestConfig): any {
  return transformRequest(config.data)
}
// header处理
function transformHeaders(config: AxiosRequestConfig) {
  const { headers = {}, data } = config
  return processHeaders(headers, data)
}

// 响应data处理
function transformResponseData(res: AxiosResponse): AxiosResponse {
  res.data = transformResponse(res.data)
  return res
}

export default axios
