import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import notificationReducer from './slices/notificationSlice';
import blogsReducer from './slices/blogsSlice';
import usersReducer from './slices/usersSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    notification: notificationReducer,
    blogs: blogsReducer,
    users: usersReducer,
  },
});

export default store;