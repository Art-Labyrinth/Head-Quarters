import axios from 'axios'
import { create } from 'zustand'

import { getMasterList } from './api.ts'
import {DataItem} from "../volunteer/types.ts";

export type MasterListStore = {
  list: DataItem[] | null,
  listError: null,
  listLoading: boolean,

  getList: (search: URLSearchParams) => Promise<void>
}

export const useMasterListStore = create<MasterListStore>((set) => ({
  list: null,
  listError: null,
  listLoading: false,

  getList: async (search) => {
    try {
      set({ list: null })
      set({ listError: null })
      set({ listLoading: true })

      const response = await getMasterList(search)

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
