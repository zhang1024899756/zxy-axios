import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../type'
import xhr from './xhr'
import { buildURL } from '../helpers/url'
import { transformRequest, transformResponse } from '../helpers/data'
import { processHeaders, flattenHeaders } from '../helpers/headers'
import transform from './transform'

export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  // 中间件配置
  processConfig(config)
  return xhr(config).then(res => {
    return transformResponseData(res)
  })
}

// 中间件配置
function processConfig(config: AxiosRequestConfig): void {
  config.url = transformUrl(config)
  // config.headers = transformHeaders(config)
  // config.data = transformRequestData(config)
  config.data = transform(config.data, config.headers, config.transformRequest)
  config.headers = flattenHeaders(config.headers, config.method!)
}

// url转化
function transformUrl(config: AxiosRequestConfig): string {
  const { url, params } = config
  return buildURL(url!, params)
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
  // res.data = transformResponse(res.data)
  res.data = transform(res.data, res.headers, res.config.transformResponse)
  return res
}
