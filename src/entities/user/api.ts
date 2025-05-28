import type { AxiosError, AxiosResponse } from 'axios'
import type {AuthResponseData} from "./types.ts";

import { request } from '../../shared/api'

export const userAuth = (values: object): Promise<AxiosResponse<AuthResponseData> | AxiosError> =>
  request.post('/user/auth', values)
