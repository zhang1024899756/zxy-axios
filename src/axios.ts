import { AxiosInstance, AxiosRequestConfig } from './type'
import Axios from './core/Axios'
import { extend } from './helpers/util'
import defaults from './defaults'

// createInstance 工厂函数
function createInstance(config: AxiosRequestConfig): AxiosInstance {
  const context = new Axios(config)
  // 创建instance 指向 Axios.prototype.request 方法，并绑定了上下文 context
  const instance = Axios.prototype.request.bind(context)

  // 通过 extend 方法把 context 中的原型方法和实例方法全部拷贝到 instance 上，
  // 这样就实现了一个混合对象
  // 混合后instance会拥有 Axios 类的所有原型和实例属性
  extend(instance, context)

  // 由于这里 TypeScript 不能正确推断 instance 的类型
  // 这里做一下类型断言
  return instance as AxiosInstance
}

const axios = createInstance(defaults)

export default axios
