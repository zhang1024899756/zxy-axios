const toString = Object.prototype.toString

// 知识点： 使用val is Date类型谓词  进行类型保护
export function isDate(val: any): val is Date {
  return toString.call(val) === '[object Date]'
}

// export function isObject (val: any): val is Object {
//   return val !== null && typeof val === 'object'
// }

// 只识别普通 JSON 对象
// 对于 FormData、ArrayBuffer 这些类型不做处理
export function isPlainObject(val: any): val is Object {
  return toString.call(val) === '[object Object]'
}
