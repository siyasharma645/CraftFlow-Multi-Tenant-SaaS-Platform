import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthUser } from '../../types'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
}

const storedUser = localStorage.getItem('cf_user')

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!localStorage.getItem('cf_token'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload
      state.isAuthenticated = true
      localStorage.setItem('cf_token', action.payload.token)
      localStorage.setItem('cf_user', JSON.stringify(action.payload))
    },
    logout(state) {
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem('cf_token')
      localStorage.removeItem('cf_user')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
