import { AxiosRequestConfig, AxiosResponse } from '../type'

export class AxiosError extends Error {
  isAxiosError: boolean
  config: AxiosRequestConfig
  code?: string | null
  request?: any
  response?: AxiosResponse

  constructor(
    message: string,
    config: AxiosRequestConfig,
    code?: string | null,
    request?: any,
    response?: AxiosResponse
  ) {
    super(message)

    this.config = config
    this.code = code
    this.request = request
    this.response = response
    this.isAxiosError = true

    // 使用 Object.setPrototypeOf(this, AxiosError.prototype)，
    // 这段代码的目的是为了解决 TypeScript 继承一些内置对象的时候的坑
    Object.setPrototypeOf(this, AxiosError.prototype)
  }
}

// 对外暴露了一个 createError 的工厂方法
export function createError(
  message: string,
  config: AxiosRequestConfig,
  code?: string | null,
  request?: any,
  response?: AxiosResponse
): AxiosError {
  const error = new AxiosError(message, config, code, request, response)

  return error
}
