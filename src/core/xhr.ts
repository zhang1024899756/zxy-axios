import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../type'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'
import { isURLSameOrigin } from '../helpers/url'
import cookie from '../helpers/cookie'
import { isFormData } from '../helpers/util'

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
      withCredentials,
      cancelToken,
      xsrfCookieName,
      xsrfHeaderName,
      onDownloadProgress,
      onUploadProgress,
      auth,
      validateStatus
    } = config

    const request = new XMLHttpRequest()

    // 初始化,   这里将method转化为了大写
    request.open(method.toUpperCase(), url!, true)

    // 配置 request
    configureRequest()
    // 给 request 添加事件处理函数
    addEvents()
    // 处理请求 headers
    processHeaders()
    // 处理请求取消逻辑
    processCancel()

    // 发送请求到服务器
    request.send(data)

    function configureRequest(): void {
      if (responseType) {
        request.responseType = responseType
      }

      if (timeout) {
        request.timeout = timeout
      }

      if (withCredentials) {
        request.withCredentials = true
      }
    }

    function addEvents(): void {
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

      // 下载/上传进度条
      if (onDownloadProgress) {
        request.onprogress = onDownloadProgress
      }
      if (onUploadProgress) {
        request.upload.onprogress = onUploadProgress
      }
    }

    function processHeaders(): void {
      // 如果请求的数据是 FormData 类型，我们应该主动删除请求 headers 中的 Content-Type 字段，
      // 让浏览器自动根据请求数据设置 Content-Type
      if (isFormData(data)) {
        delete headers['Content-Type']
      }
      // XSRF防御
      // 如果是配置 withCredentials 为 true 或者是同域请求
      if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
        // 从 cookie 中读取 xsrf 的 token 值
        const xsrfValue = cookie.read(xsrfCookieName)
        if (xsrfValue) {
          // 如果能读到，则把它添加到请求 headers 的 xsrf 相关字段中
          headers[xsrfHeaderName!] = xsrfValue
        }
      }
      // 传入的 data 为空的时候，请求 header 配置 Content-Type 是没有意义的，把它删除
      Object.keys(headers).forEach(name => {
        if (data === null && name.toLowerCase() === 'content-type') {
          delete headers[name]
        } else {
          request.setRequestHeader(name, headers[name])
        }
      })
      // 配置 auth 属性
      // 值为 Basic 加密串。 这里的加密串是 username:password base64 加密
      if (auth) {
        headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password)
      }
    }

    function processCancel(): void {
      // 如果设置了取消，则注册一个取消请求的Promise
      if (cancelToken) {
        cancelToken.promise
          .then(reason => {
            request.abort()
            reject(reason)
          })
          .catch(
            /* istanbul ignore next  */
            () => {
              // do nothing
            }
          )
      }
    }

    // (工具)处理判断
    function handleResponse(response: AxiosResponse) {
      // if (response.status >= 200 && response.status < 300)
      if (!validateStatus || validateStatus(response.status)) {
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
