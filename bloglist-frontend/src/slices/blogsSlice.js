import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import blogService from '../services/blogs';

export const fetchBlogs = createAsyncThunk('blogs/fetchBlogs', async () => {
  const response = await blogService.getAll();
  return response;
});

export const createBlog = createAsyncThunk('blogs/createBlog', async ({ newBlog, user }) => {
    const response = await blogService.create({ ...newBlog });
    return response;
});

export const removeBlog = createAsyncThunk('blogs/removeBlog', async (id) => {
    await blogService.remove(id);
    return id;
  });

export const likeBlog = createAsyncThunk('blogs/likeBlog', async (blog) => {
  const updatedBlog = { ...blog, user: blog.user.id, likes: blog.likes + 1 };
  console.log(updatedBlog);
  await blogService.update(blog.id, updatedBlog);
  return updatedBlog;
});

export const postComment = createAsyncThunk('blogs/postComment', async ({ blogId, comment }) => {
  const response = await blogService.postComment(blogId, comment);
  return response;
});

const blogsSlice = createSlice({
  name: 'blogs',
  initialState: [],
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        return action.payload;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.push(action.payload);
      })
      .addCase(removeBlog.fulfilled, (state, action) => {
        return state.filter(blog => blog.id !== action.payload);
      })
      .addCase(likeBlog.fulfilled, (state, action) => {
        return state.map(blog => blog.id === action.payload.id ? action.payload : blog);
      })
      .addCase(postComment.fulfilled, (state, action) => {
        const blog = state.find((b) => b.id === action.payload.id);
        if (blog) {
          blog.comments = action.payload.comments;
        }
      });
  },
});

export default blogsSlice.reducer;