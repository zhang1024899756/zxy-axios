import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../type'
import xhr from './xhr'
import { buildURL, isAbsoluteURL, combineURL } from '../helpers/url'
import { transformRequest, transformResponse } from '../helpers/data'
import { processHeaders, flattenHeaders } from '../helpers/headers'
import transform from './transform'

export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  throwIfCancellationRequested(config)
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
export function transformUrl(config: AxiosRequestConfig): string {
  let { url, params, paramsSerializer, baseURL } = config
  if (baseURL && !isAbsoluteURL(url!)) {
    url = combineURL(baseURL, url)
  }
  return buildURL(url!, params, paramsSerializer)
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

// 发送请求前检查一下配置的 cancelToken 是否已经使用过了，如果已经被用过则不用法请求，直接抛异常
function throwIfCancellationRequested(config: AxiosRequestConfig): void {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested()
  }
}
