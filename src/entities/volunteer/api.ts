import {AxiosError, AxiosResponse} from 'axios'

import { request } from '../../shared/api'

export const getVolunteerList = async (params: URLSearchParams): Promise<AxiosResponse | AxiosError> =>
  request.get('/volunteers/list', { params })
