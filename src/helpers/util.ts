const toString = Object.prototype.toString

// 知识点： 使用val is Date类型谓词  进行类型保护
export function isDate(val: any): val is Date {
  return toString.call(val) === '[object Date]'
}

export function isObject(val: any): val is Object {
  return toString.call(val) === '[object Object]'
}

// 只识别普通 JSON 对象
// 对于 FormData、ArrayBuffer 这些类型不做处理
export function isPlainObject(val: any): val is Object {
  console.log('toString.call(val)', toString.call(val), val)
  return toString.call(val) === '[object Object]' || toString.call(val) === '[object String]'
}

// 辅助函数 extend
// 辅助混合对象实现
// extend 方法的实现用到了交叉类型，并且用到了类型断言。extend 的最终目的是把 from 里的属性都扩展到 to 中，包括原型上的属性
export function extend<T, U>(to: T, from: U): T & U {
  for (const key in from) {
    ;(to as T & U)[key] = from[key] as any
  }
  return to as T & U
}

// 复杂配置策略合并
export function deepMerge(...objs: any[]): any {
  const result = Object.create(null) // 建一个空对象
  objs.forEach(obj => {
    if (obj) {
      Object.keys(obj).forEach(key => {
        const val = obj[key]
        if (isObject(val)) {
          if (isObject(result[key])) {
            result[key] = deepMerge(result[key], val)
          } else {
            result[key] = deepMerge(val)
          }
        } else {
          result[key] = val
        }
      })
    }
  })

  return result
}
