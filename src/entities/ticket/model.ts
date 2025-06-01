import axios from 'axios'
import { create } from 'zustand'

import { getTicketList } from './api.ts'
import {DataItem} from "../types.ts";

export type TicketListStore = {
  list: DataItem[] | null,
  listError: null,
  listLoading: boolean,

  getList: (search: URLSearchParams) => Promise<void>
}

export const useTicketListStore = create<TicketListStore>((set) => ({
  list: null,
  listError: null,
  listLoading: false,

  getList: async (search) => {
    try {
      set({ list: null })
      set({ listError: null })
      set({ listLoading: true })

      const response = await getTicketList(search)

      if (!axios.isAxiosError(response)) {
        set({ list: response.data })
      }
    } catch (error) {
      let errorText = "Unknown error"

      if (axios.isAxiosError(error)) {
        set({ listError: error.response?.data.detail || errorText })
        errorText = error.response?.data.detail
      }

      throw errorText
    } finally {
      set({ listLoading: false })
    }
  },
}))
