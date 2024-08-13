import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { likeBlog, removeBlog } from '../slices/blogsSlice';
import { Link } from 'react-router-dom';
import blogsService from '../services/blogs';

const Blog = ({ blog, refreshBlogs }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    marginBottom: 5,
  };

  const [show, setShow] = useState(false);
  const [blogData, setBlogData] = useState(blog);
  const dispatch = useDispatch();

  useEffect(() => {
    setBlogData(blog);
  }, [blog]);

  const toggleShow = () => {
    setShow(!show);
  };

  const addLike = async () => {
    await dispatch(likeBlog(blogData)).unwrap();
    await refreshBlogs();
  };

  const drawRemoveButton = () => {
    const userString = window.localStorage.getItem('loggedNoteappUser');
    if (userString) {
      const user = JSON.parse(userString);
      if (blogData.user.id === user.id) {
        return (
          <div>
            <button onClick={removeBlogHandler}>remove</button>
          </div>
        );
      }
    }
  };

  const removeBlogHandler = async () => {
    if (window.confirm(`Remove blog ${blogData.title} by ${blogData.author}`)) {
      await dispatch(removeBlog(blogData.id)).unwrap();
      await refreshBlogs();
    }
  };

  return (
    <div style={blogStyle} data-testid="blog">
      <Link to={`/blogs/${blogData.id}`}>
        {blogData.title} {blogData.author}
      </Link>{' '}
    </div>
  );
};

export default Blog;