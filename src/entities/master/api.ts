import {AxiosError, AxiosResponse} from 'axios'

import { request } from '../../shared/api'

export const getMasterList = async (params: URLSearchParams): Promise<AxiosResponse | AxiosError> =>
  request.get('/masters/list', { params })
