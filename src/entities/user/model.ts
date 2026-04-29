import axios from 'axios'
import { create } from 'zustand'
import { t } from 'i18next'

import {LOCALSTORAGE_SESSION_KEY} from '../../shared/configs/constants'

import { userAuth } from './api'

import type { AuthResponseData } from './types'

export interface IUserStore {
    session: AuthResponseData | null,
    setSession: (session: AuthResponseData) => void,

    login: (values: object) => Promise<void>,
    logout: (session: AuthResponseData | null) => void,
    loginRedirect: string,
    isLoggedIn: boolean,
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const getSuccessPayloadError = (payload: unknown): string | null => {
  if (!isRecord(payload)) {
    return null
  }

  if (typeof payload.detail === 'string' && payload.detail.trim()) {
    return payload.detail
  }

  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message
  }

  if (typeof payload.error === 'string' && payload.error.trim()) {
    return payload.error
  }

  if (Array.isArray(payload.errors) && payload.errors.length) {
    return payload.errors
      .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
      .join('|')
  }

  return null
}

const isValidSessionResponse = (payload: unknown): payload is AuthResponseData => {
  if (!isRecord(payload)) {
    return false
  }

  return typeof payload.access_token === 'string'
    && typeof payload.token_type === 'string'
    && typeof payload.user_id === 'number'
    && typeof payload.username === 'string'
    && typeof payload.role_id === 'number'
    && typeof payload.role === 'string'
    && typeof payload.redirect_url === 'string'
    && typeof payload.exp === 'number'
    && Array.isArray(payload.permissions)
}

export const useUserStore = create<IUserStore>((set, get) => {
  const sessionFromStorage = JSON.parse(localStorage.getItem(LOCALSTORAGE_SESSION_KEY)!) ?? null;

  return {
    session: sessionFromStorage,
    isLoggedIn: !!sessionFromStorage && new Date(sessionFromStorage.exp * 1000) > new Date(),
    loginRedirect: '/',

    setSession: (session) => {
      localStorage.setItem(LOCALSTORAGE_SESSION_KEY, JSON.stringify(session));
      const isAlive = !!session && new Date(session.exp * 1000) > new Date()
      set({ session });
      set({ isLoggedIn: isAlive });
    },

    login: async (values) => {
      try {
        const response = await userAuth(values);
        if (!axios.isAxiosError(response)) {
          const payload = response?.data
          const payloadError = getSuccessPayloadError(payload)

          if (payloadError) {
            throw payloadError
          }

          if (!isValidSessionResponse(payload)) {
            throw t('global:Unknown error')
          }

          get().setSession(payload);
          return
        }

        throw response.message || t('global:Unknown error')
      } catch (error) {
        let errorText = t('global:Unknown error');
        if (axios.isAxiosError(error)) {
          errorText = error.response?.data?.detail ?? error.message;
        } else if (typeof error === 'string') {
          errorText = error;
        } else if (error instanceof Error) {
          errorText = error.message;
        }
        throw errorText;
      }
    },

    logout: () => {
      localStorage.removeItem(LOCALSTORAGE_SESSION_KEY);
      set({ session: null, isLoggedIn: false });
    },
  };
});
