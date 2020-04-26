import { AxiosRequestConfig } from './type'
import xhr from './xhr'
import { buildURL } from './helpers/url'

function axios(config: AxiosRequestConfig) {
  processConfig(config)
  xhr(config)
}

// 中间件配置
function processConfig(config: AxiosRequestConfig): void {
  config.url = transformUrl(config)
}

// url转化
function transformUrl(config: AxiosRequestConfig): string {
  const { url, params } = config
  return buildURL(url, params)
}

export default axios
