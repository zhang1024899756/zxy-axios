import axios from '../../src/index'

// 测试数组类型参数
// axios({
//   method: 'get',
//   url: '/base/get',
//   params: {
//     foo: ['bar', 'baz']
//   }
// })

// // 测试对象类型参数
// axios({
//   method: 'get',
//   url: '/base/get',
//   params: {
//     foo: {
//       bar: 'baz'
//     }
//   }
// })

// const date = new Date()

// // 测试时间类型参数
// axios({
//   method: 'get',
//   url: '/base/get',
//   params: {
//     date
//   }
// })

// // 测试特殊字符参数
// axios({
//   method: 'get',
//   url: '/base/get',
//   params: {
//     foo: '@:$, '
//   }
// })

// // 测试空值（无效值）参数
// axios({
//   method: 'get',
//   url: '/base/get',
//   params: {
//     foo: 'bar',
//     baz: null
//   }
// })

// // 测试带哈希号#
// axios({
//   method: 'get',
//   url: '/base/get#hash',
//   params: {
//     foo: 'bar'
//   }
// })

// // 测试参数拼接
// axios({
//   method: 'get',
//   url: '/base/get?foo=bar',
//   params: {
//     bar: 'baz'
//   }
// })

// axios({
//   method: 'post',
//   url: '/base/post',
//   data: {a: 1,b: 2}
// }).then(res=>{
//   console.log(res)
// })

// const arr = new Int32Array([21, 31])

// axios({
//   method: 'post',
//   url: '/base/buffer',
//   data: arr
// }).then(res=>{
//   console.log(res)
// })

axios({
  method: 'post',
  url: '/base/post',
  headers: {
    'content-type': 'application/json'
  },
  data: {a: 1,b: 2}
}).then(res=>{
  console.log(res)
})

// const paramsString = 'q=URLUtils.searchParams&topic=api'
// const searchParams = new URLSearchParams(paramsString)

// axios({
//   method: 'post',
//   url: '/base/post',
//   data: searchParams
// }).then(res=>{
//   console.log(res)
// })
