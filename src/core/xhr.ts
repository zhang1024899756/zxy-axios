import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../type'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'

// 整个XMLHttpRequest对象的生命周期包含如下阶段：
// 创建－初始化请求－发送请求－接收数据－解析数据－完成

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const {
      data = null,
      url,
      method = 'get',
      headers,
      responseType,
      timeout,
      withCredentials
    } = config

    const request = new XMLHttpRequest()

    if (responseType) {
      request.responseType = responseType
    }

    if (timeout) {
      request.timeout = timeout
    }

    if (withCredentials) {
      request.withCredentials = true
    }

    // 这里将method转化为了大写
    request.open(method.toUpperCase(), url!, true)

    // 状态变化钩子
    request.onreadystatechange = function handleLoad() {
      // (0)未初始化  (1)载入  (2)载入完成  (3)交互  (4)完成
      // (4)完成,此阶段确认全部数据都已经解析为客户端可用的格式
      if (request.readyState !== 4) {
        return
      }
      // 请求状态码为0说明为错误状态
      if (request.status === 0) {
        return
      }
      const responseHeaders = parseHeaders(request.getAllResponseHeaders())
      // 加一步处理responseType为text情况
      const responseData =
        responseType && responseType !== 'text' ? request.response : request.responseText
      // 包装好 AxiosResponse
      const response: AxiosResponse = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      }
      handleResponse(response)
    }

    // 网络异常时抛出错误
    request.onerror = function handleError() {
      reject(createError('Network Error', config, null, request))
    }
    // 网络超时错误
    request.ontimeout = function handleTimeout() {
      reject(
        createError(`Timeout of ${config.timeout} ms exceeded`, config, 'ECONNABORTED', request)
      )
    }

    // 传入的 data 为空的时候，请求 header 配置 Content-Type 是没有意义的，把它删除
    Object.keys(headers).forEach(name => {
      if (data === null && name.toLowerCase() === 'content-type') {
        delete headers[name]
      } else {
        request.setRequestHeader(name, headers[name])
      }
    })

    // 发送请求到服务器
    request.send(data)

    // 处理判断
    function handleResponse(response: AxiosResponse) {
      if (response.status >= 200 && response.status < 300) {
        resolve(response)
      } else {
        reject(
          createError(
            `Request failed with status code ${response.status}`,
            config,
            null,
            request,
            response
          )
        )
      }
    }
  })
}
