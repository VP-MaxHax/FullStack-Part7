import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import loginService from '../services/login';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const user = await loginService.login(credentials);
    window.localStorage.setItem('loggedNoteappUser', JSON.stringify(user));
    return user;
  } catch (error) {
    return rejectWithValue(error.response.data.error);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    error: null,
  },
  reducers: {
    logout(state) {
      window.localStorage.removeItem('loggedNoteappUser');
      state.user = null;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;