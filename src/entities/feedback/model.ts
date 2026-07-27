import axios from 'axios'
import { create } from 'zustand'

import { deleteFeedbackRecord, getFeedbackRecords } from './api.ts'
import { FeedbackAnyRecord } from './types.ts'

const errorTextOf = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError(error)) {
    return fallback
  }

  const detail = error.response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

export type FeedbackRecordsStore = {
  items: FeedbackAnyRecord[]
  total: number
  loading: boolean
  error: string | null

  getRecords: (search: URLSearchParams) => Promise<void>
  /** Resolves to true when the row was actually deleted. */
  removeRecord: (id: number, source: string) => Promise<boolean>
}

/**
 * One dataset at a time: the endpoint reads either contact messages or a single
 * survey version, never both, so a single page of rows is all we hold.
 */
export const useFeedbackRecordsStore = create<FeedbackRecordsStore>((set) => ({
  items: [],
  total: 0,
  loading: false,
  error: null,

  getRecords: async (search) => {
    set({ loading: true, error: null })

    try {
      const response = await getFeedbackRecords(search)

      if (!axios.isAxiosError(response)) {
        set({
          items: response.data?.items ?? [],
          total: response.data?.total ?? 0,
        })
      }
    } catch (error) {
      set({
        error: errorTextOf(error, 'Не удалось загрузить записи.'),
        items: [],
        total: 0,
      })
    } finally {
      set({ loading: false })
    }
  },

  removeRecord: async (id, source) => {
    try {
      await deleteFeedbackRecord(id, source)
      return true
    } catch (error) {
      set({ error: errorTextOf(error, 'Не удалось удалить запись.') })
      return false
    }
  },
}))
