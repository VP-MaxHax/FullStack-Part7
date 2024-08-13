import { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { setNotificationMessage, clearNotificationMessage } from '../slices/notificationSlice';
import { createBlog } from '../slices/blogsSlice';
import Togglable from '../components/Togglable';
import { Form, Button, Row, Col } from 'react-bootstrap';

const BlogForm = ({ user, blogFormRef, refreshBlogs }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [url, setUrl] = useState('');
  const dispatch = useDispatch();

  const createNewBlog = async event => {
    event.preventDefault();
    try {
      blogFormRef.current.toggleVisibility();
      const newBlog = {
        title,
        author,
        url,
        user: user.id,
      };
      await dispatch(createBlog({ newBlog })).unwrap();
      dispatch(setNotificationMessage(`a new blog ${newBlog.title} by ${newBlog.author} added`));
      setTimeout(() => {
        dispatch(clearNotificationMessage());
      }, 5000);
      setTitle('');
      setAuthor('');
      setUrl('');
      refreshBlogs();
    } catch (exception) {
      dispatch(setNotificationMessage(exception.response.data.error));
      setTimeout(() => {
        dispatch(clearNotificationMessage());
      }, 5000);
    }
  };

  if (user === null) {
    return null;
  }
  return (
    <div>
      <Togglable buttonLabel="Create new blog" ref={blogFormRef}>
        <h2>create new</h2>
        <form onSubmit={createNewBlog}>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Title:</Form.Label>
                <Form.Control
                  type="text"
                  value={title}
                  data-testid="title"
                  name="title"
                  onChange={({ target }) => setTitle(target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Author:</Form.Label>
                <Form.Control
                  type="text"
                  value={author}
                  data-testid="author"
                  name="author"
                  onChange={({ target }) => setAuthor(target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Url:</Form.Label>
                <Form.Control
                  type="text"
                  value={url}
                  data-testid="url"
                  name="url"
                  onChange={({ target }) => setUrl(target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Button variant="success" type="submit" data-testid="create">
            Create
          </Button>
        </form>
      </Togglable>
    </div>
  );
};

BlogForm.propTypes = {
  user: PropTypes.object.isRequired,
  blogFormRef: PropTypes.object.isRequired,
};

export default BlogForm;