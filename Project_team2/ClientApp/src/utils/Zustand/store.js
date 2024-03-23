import { create } from 'zustand'

const store = create((set) => ({
  user:{},
  isLoggined:false,
  token:"",
  isBlocked: false,
  setData: (data) => set((state) => ({ ...data})),
}))

export default store;