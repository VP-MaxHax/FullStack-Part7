import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    message: ''
  },
  reducers: {
    setNotificationMessage: (state, action) => {
      state.message = action.payload;
    },
    clearNotificationMessage: (state) => {
      state.message = '';
    }
  }
});

export const { setNotificationMessage, clearNotificationMessage } = notificationSlice.actions;
export default notificationSlice.reducer;