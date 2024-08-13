import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setNotificationMessage, clearNotificationMessage } from './slices/notificationSlice';
import { fetchBlogs, postComment } from './slices/blogsSlice';
import { fetchUsers } from './slices/usersSlice';
import { login, logout, setUser } from './slices/authSlice';
import { likeBlog, removeBlog } from './slices/blogsSlice';
import { Table, Form, Button, Alert, Navbar, Nav, Col } from 'react-bootstrap'
import Blog from './components/Blog';
import blogService from './services/blogs';
import BlogForm from './components/BlogForm';
import Togglable from './components/Togglable';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useMatch
} from "react-router-dom"

const AllBlogs = ({ user, blogs, refreshBlogs, blogFormRef }) => {
  return (
    <div>
      <h2>Blogs</h2>
        <BlogForm
          user={user}
          blogFormRef={blogFormRef}
          blogService={blogService}
          refreshBlogs={refreshBlogs}
        />
      <div data-testid="all-blog-div">
        <Table striped>
          <tbody>
            {[...blogs]
              .sort((a, b) => b.likes - a.likes)
              .map(blog => (
                <tr key={blog.id}>
                  <td>
                    <Blog blog={blog} user={user} refreshBlogs={refreshBlogs} />
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </div>
    </div>
  )
}

const AllUsers = ({ users }) => {
  return (
    <div>
      <h2>Users</h2>
      <Table striped>
        <thead>
          <tr>
            <th>Username</th>
            <th>blogs created</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>
                <Link to={`/users/${user.id}`}>{user.name}</Link>
              </td>
              <td>{user.blogs.length}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

const OneUser = ({ users }) => {
  const match = useMatch("/users/:id")
  const user = users.find(user => user.id === match.params.id)
  if (!user) {
    return null
  }
  return (
    <div>
      <h2>{user.name}</h2>
      <h3>added blogs</h3>
      <ul>
        {user.blogs.map(blog => (
          <li><Link to={`/blogs/${blog.id}`} key={blog.id}>{blog.title}</Link></li>
        ))}
      </ul>
    </div>
  )
}

const OneBlog = ({ blogs, user, likeBlog, deleteBlog }) => {
  const match = useMatch("/blogs/:id");
  const blog = blogs.find(blog => blog.id === match.params.id);
  const dispatch = useDispatch();
  const [comment, setComment] = useState('');
  console.log(blog)

  if (!blog) {
    return null;
  }

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    await dispatch(postComment({ blogId: blog.id, comment }));
    setComment('');
  };

  return (
    <div>
      <h2>{blog.title}</h2>
      <a href={blog.url}>{blog.url}</a>
      <p>{blog.likes} likes <Button onClick={() => likeBlog(blog)}>👍 like</Button></p>
      <p>added by {blog.user.name}</p>
      {blog.user.username === user.username && (
        <button onClick={() => deleteBlog(blog)}>remove</button>
      )}
      <h3>comments</h3>
      <form onSubmit={handleCommentSubmit}>
        <Form.Label>Add comment</Form.Label>
        <Col md={4}>
        <Form.Control
          type="text"
          value={comment}
          onChange={({ target }) => setComment(target.value)}
        />
        </Col>
        <Button type="submit">add comment</Button>
      </form>
      {(blog.comments?.length ?? 0) > 0 ? (
        <ul>
          {blog.comments.map((comment, index) => (
            <li key={index}>{comment}</li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
};

const Header = ({ user, handleLogout }) => {
  return (
    <div>
    <h1>Blog App</h1>
    <Navbar bg="light" expand="lg">
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/">Blogs</Nav.Link>
          <Nav.Link as={Link} to="/users">Users</Nav.Link>
        </Nav>
        <Navbar.Text>
          {user.name} logged in{' '}
          <Button variant="outline-danger" size="sm" onClick={handleLogout}>Logout</Button>
        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
    </div>
  );
};

const App = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const notificationMessage = useSelector((state) => state.notification.message);
  const blogs = useSelector((state) => state.blogs);
  const user = useSelector((state) => state.auth.user);
  const users = useSelector((state) => state.users.users);
  const authError = useSelector((state) => state.auth.error);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const blogFormRef = useRef();

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const refreshBlogs = async () => {
    dispatch(fetchBlogs());
  };

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser');
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      dispatch(setUser(user));
      blogService.setToken(user.token);
    }
  }, [dispatch]);

  const handleLogin = async event => {
    event.preventDefault();
    dispatch(login({ username, password }));
  };

  useEffect(() => {
    if (authError) {
      dispatch(setNotificationMessage(authError));
      setTimeout(() => {
        dispatch(clearNotificationMessage());
      }, 5000);
    }
  }, [authError, dispatch]);

  const likeBlogEvent = async (blog) => {
    try {
      await dispatch(likeBlog(blog)).unwrap();
      await refreshBlogs();
      dispatch(setNotificationMessage(`Blog ${blog.title} by ${blog.author} liked`));
      setTimeout(() => {
        dispatch(clearNotificationMessage());
      }, 5000);
    } catch (error) {
      dispatch(setNotificationMessage(`Error liking blog: ${error.message}`));
      setTimeout(() => {
        dispatch(clearNotificationMessage());
      }, 5000);
    }
  };

  const deleteBlogEvent = async (blog) => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
      try {
        await dispatch(removeBlog(blog.id)).unwrap();
        await refreshBlogs();
        dispatch(setNotificationMessage(`Blog ${blog.title} by ${blog.author} removed`));
        setTimeout(() => {
          dispatch(clearNotificationMessage());
        }, 5000);
        navigate('/');
      } catch (error) {
        dispatch(setNotificationMessage(`Error removing blog: ${error.message}`));
        setTimeout(() => {
          dispatch(clearNotificationMessage());
        }, 5000);
      }
    }
  };

  if (user === null) {
    return (
      <div className='container'>
        {(notificationMessage &&
          <Alert variant="success">
            {notificationMessage}
          </Alert>
        )}
        <h2>Log in to application</h2>
        <form onSubmit={handleLogin}>
          <Form.Group>
            <Form.Label>Username:</Form.Label>
            <Form.Control
              data-testid="username"
              type="text"
              value={username}
              name="Username"
              onChange={({ target }) => setUsername(target.value)}
            />
          </Form.Group>
          <Form.Group>
          <Form.Label>Password:</Form.Label>
            <Form.Control
              data-testid="password"
              type="password"
              value={password}
              name="Password"
              onChange={({ target }) => setPassword(target.value)}
            />
          </Form.Group>
          <Button variant="primary" type="submit">login</Button>
        </form>
      </div>
    );
  } else {
    return (
      <div className='container'>
        {(notificationMessage &&
          <Alert variant="success">
            {notificationMessage}
          </Alert>
        )}
        <Header user={user} handleLogout={() => dispatch(logout())} />
        <Routes>
          <Route path="/" element={<AllBlogs user={user} blogs={blogs} refreshBlogs={refreshBlogs} blogFormRef={blogFormRef} />}/>
          <Route path="/users" element={<AllUsers users={users} />} />
          <Route path="/users/:id" element={<OneUser users={users} />} />
          <Route path="/blogs/:id" element={<OneBlog blogs={blogs} user={user} likeBlog={likeBlogEvent} deleteBlog={deleteBlogEvent} />} />
        </Routes>
      </div>
    );
  }
};

export default App;