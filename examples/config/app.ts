import axios from '../../src/index'

axios.defaults.headers.common['test2'] = 123

axios({
  url: '/config/post',
  method: 'post',
  data: {
    b: 1
  },
  headers: {
    test: '321'
  }
}).then(res => {
  console.log(res)
})

axios({
  transformRequest: [(function(data) {
    return {b:2,...data}
  }), ...(axios.defaults.transformRequest as AxiosTransformer[])],
  transformResponse: [...(axios.defaults.transformResponse as AxiosTransformer[]), function(data) {
    if (typeof data === 'object') {
      data.b = 2
    }
    return data
  }],
  url: '/config/post',
  method: 'post',
  data: {
    a: 1
  }
}).then((res) => {
  console.log(res)
})
