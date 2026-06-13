import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
}

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem('access_token'),
  user: null,
  token: localStorage.getItem('access_token'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: any }>) => {
      state.isAuthenticated = true
      state.token = action.payload.token
      state.user = action.payload.user
      localStorage.setItem('access_token', action.payload.token)
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.token = null
      state.user = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
