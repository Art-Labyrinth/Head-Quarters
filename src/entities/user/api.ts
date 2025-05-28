import { AxiosError, AxiosResponse } from 'axios'
import qs from 'qs'

import { request } from '../../shared/api'

import { AuthResponseData } from './types'

export const userAuth = (
    values: Record<string, string>
): Promise<AxiosResponse<AuthResponseData> | AxiosError> => {
    return request.post('/user/auth', qs.stringify(values), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
}
