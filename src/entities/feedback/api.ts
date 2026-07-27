import {AxiosError, AxiosResponse} from 'axios'

import { request } from '../../shared/api'

export const getFeedbackRecords = async (params: URLSearchParams): Promise<AxiosResponse | AxiosError> =>
  request.get('/feedback/records', { params })

/** Soft delete — the row keeps existing with `deleted_at` set. */
export const deleteFeedbackRecord = async (
  id: number,
  source: string,
): Promise<AxiosResponse | AxiosError> =>
  request.delete(`/feedback/records/${id}`, { params: { source } })
