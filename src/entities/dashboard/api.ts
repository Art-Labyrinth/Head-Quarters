import { AxiosError, AxiosResponse } from 'axios'
import { request } from '../../shared/api'
import type { SalesStatsData } from './types'

export const getSalesStats = async (): Promise<AxiosResponse<SalesStatsData> | AxiosError> =>
  request.get('/orders/stats/sales')
