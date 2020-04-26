import { isDate, isPlainObject } from './util'

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

export function buildURL(url: string, params?: any): string {
  // 没有参数直接原封不动返回
  if (!params) {
    return url
  }
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

  let serializedParams = parts.join('&')

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
