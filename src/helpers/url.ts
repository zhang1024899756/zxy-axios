import { isDate, isPlainObject, isURLSearchParams } from './util'

interface URLOrigin {
  protocol: string
  host: string
}

// 特殊字符编码
function encode(val: string): string {
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+') // 空格转换为+号
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}

// url格式化
export function buildURL(
  url: string,
  params?: any,
  paramsSerializer?: (params: any) => string
): string {
  // 没有参数直接原封不动返回
  if (!params) {
    return url
  }

  let serializedParams

  if (paramsSerializer) {
    serializedParams = paramsSerializer(params)
  } else if (isURLSearchParams(params)) {
    serializedParams = params.toString()
  } else {
    const parts: string[] = []

    // 遍历对象中的所有健
    // Object.keys函数使用参数时，会执行以下步骤：
    // 将参数转换成Object类型的对象
    // 通过转换后的对象获得属性列表properties
    // 将List类型的属性列表properties转换为Array得到最终的结果
    Object.keys(params).forEach(key => {
      const val = params[key]

      // 忽略空值
      if (val === null || typeof val === 'undefined') {
        return
      }

      let values = []
      // 如果当前params[key]是数组
      // /base/get?foo[]=bar&foo[]=baz'
      if (Array.isArray(val)) {
        values = val
        key += '[]'
      } else {
        values = [val]
      }

      values.forEach(val => {
        if (isDate(val)) {
          // /base/get?date=2019-04-01T05:55:39.030Z
          val = val.toISOString()
        } else if (isPlainObject(val)) {
          val = JSON.stringify(val)
        }
        // /base/get?foo=%7B%22bar%22:%22baz%22%7D
        parts.push(`${encode(key)}=${encode(val)}`)
      })
    })

    serializedParams = parts.join('&')
  }

  if (serializedParams) {
    // 去掉哈希#
    const markIndex = url.indexOf('#')
    if (markIndex !== -1) {
      url = url.slice(0, markIndex)
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
  }

  return url
}

// 判断同域
// 同域名的判断主要利用了一个技巧，创建一个 a 标签的 DOM，
// 然后设置 href 属性为我们传入的 url，然后可以获取该 DOM 的 protocol、host。
// 当前页面的 url 和请求的 url 都通过这种方式获取，然后对比它们的 protocol 和 host 是否相同
export function isURLSameOrigin(requestURL: string): boolean {
  const parsedOrigin = resolveURL(requestURL)
  return (
    parsedOrigin.protocol === currentOrigin.protocol && parsedOrigin.host === currentOrigin.host
  )
}
const urlParsingNode = document.createElement('a')
const currentOrigin = resolveURL(window.location.href)

function resolveURL(url: string): URLOrigin {
  urlParsingNode.setAttribute('href', url)
  const { protocol, host } = urlParsingNode

  return {
    protocol,
    host
  }
}

// 判断是否是绝对URL
export function isAbsoluteURL(url: string): boolean {
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url)
}
// 拼接URL
export function combineURL(baseURL: string, relativeURL?: string): string {
  return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL
}
