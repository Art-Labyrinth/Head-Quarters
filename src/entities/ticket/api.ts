import {AxiosError, AxiosResponse} from 'axios'

import { request } from '../../shared/api'

export const getTicketList = async (params: URLSearchParams): Promise<AxiosResponse | AxiosError> =>
  request.get('/tickets/list', { params })
