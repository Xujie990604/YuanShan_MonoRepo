import { showToast } from 'vant'


/**
 * 处理接口中 HTTP 错误码
 * @param code http 状态码
 */
export function handleHTTPCode(code: number, toast: boolean): void {
  if (!toast) return
  let toastText = ''
  const httpCodeText = {
    400: '请求错误',
    401: '未授权',
    403: '拒绝访问',
    404: '未找到资源',
    500: '服务器错误',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时',
  }
  switch (true) {
    // NOTE: 如果有需要添加额外操作的错误码，自行添加 case 分支
    // case code === xxxx:
    //   ...... do something
    //   toastText = 'xxxxxx'
    // break;

    default:
      toastText =
        httpCodeText[code as keyof typeof httpCodeText] ||
        '网络请求失败' + `${code !== undefined ? code : ''}`
  }

  showToast({
    message: toastText,
    position: 'bottom',
    duration: 2000,
  })
}

/**
 * 处理接口中云端业务错误码
 * @param code http 状态码
 */
export function handleBusinessCode(data: any, toast: boolean): void {
  if (!toast) return
  const { code, message } = data
  let toastText = ''
  switch (true) {
    // NOTE: 如果有需要添加额外操作的错误码，自行添加 case 分支
    // case code === xxxx:
    //   ...... do something
    //   toastText = 'xxxxxx'
    // break;

    // Token 认证失败、过期
    case code === 1001 || code === 1002:
      localStorage.clear()
      toastText = message
      break
    default:
      toastText =
        message || `请求失败( ${code})`
  }
  showToast({
    message: toastText,
    position: 'bottom',
    duration: 2000,
  })
}


