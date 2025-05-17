import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import axios from 'axios';

function CreatePin() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setError('Please select an image');
      return;
    }

    if (!token) {
      setError('You must be logged in to create a pin');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    if (description) {
      formData.append('description', description);
    }
    formData.append('image', image);
    if (tags.length > 0) {
      formData.append('tags', tags.join(','));
    }

    try {
      const response = await axios.post('http://mypythonwebapp-edcjb3e3a0f5apg6.polandcentral-01.azurewebsites.net:8000/api/pins/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        transformRequest: [(data) => data],
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });
      console.log('Response:', response.data);
      navigate('/');
    } catch (error: any) {
      console.error('Error creating pin:', error.response?.data);
      if (error.response?.data?.detail) {
        setError(Array.isArray(error.response.data.detail) 
          ? error.response.data.detail.map((err: any) => err.msg).join(', ')
          : error.response.data.detail);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to create pin. Please try again.');
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Create Pin
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} encType="multipart/form-data">
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
            name="title"
          />
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={4}
            name="description"
          />
          <TextField
            fullWidth
            label="Add Tags (press Enter to add)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            margin="normal"
            helperText="Press Enter to add each tag"
          />
          {tags.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          )}
          <Box sx={{ mt: 2, mb: 2 }}>
            <input
              accept="image/*"
              type="file"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              id="image-upload"
              name="image"
              required
            />
            <label htmlFor="image-upload">
              <Button variant="contained" component="span">
                Upload Image
              </Button>
            </label>
          </Box>
          {preview && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <img
                src={preview}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: '300px' }}
              />
            </Box>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
          >
            Create Pin
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default CreatePin; 