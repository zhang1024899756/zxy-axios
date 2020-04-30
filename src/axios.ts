import { AxiosRequestConfig, AxiosStatic } from './type'
import Axios from './core/Axios'
import { extend } from './helpers/util'
import defaults from './defaults'
import mergeConfig from './core/mergeConfig'
import CancelToken from './cancel/CancelToken'
import Cancel, { isCancel } from './cancel/Cancel'

// createInstance 工厂函数
function createInstance(config: AxiosRequestConfig): AxiosStatic {
  const context = new Axios(config)
  // 创建instance 指向 Axios.prototype.request 方法，并绑定了上下文 context
  const instance = Axios.prototype.request.bind(context)

  // 通过 extend 方法把 context 中的原型方法和实例方法全部拷贝到 instance 上，
  // 这样就实现了一个混合对象
  // 混合后instance会拥有 Axios 类的所有原型和实例属性
  extend(instance, context)

  // 由于这里 TypeScript 不能正确推断 instance 的类型
  // 这里做一下类型断言
  return instance as AxiosStatic
}

const axios = createInstance(defaults)

axios.create = function create(config) {
  return createInstance(mergeConfig(defaults, config))
}

axios.all = function all(promises) {
  return Promise.all(promises)
}

axios.spread = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr)
  }
}

axios.CancelToken = CancelToken
axios.Cancel = Cancel
axios.isCancel = isCancel

axios.Axios = Axios

export default axios
