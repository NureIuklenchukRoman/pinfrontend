import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  Avatar,
  Divider,
  TextField,
  Grid,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Pin {
  id: number;
  title: string;
  description: string;
  image_url: string;
  owner_id: number;
  is_saved: boolean;
  tags: { id: number; name: string }[];
  owner: {
    username: string;
    email: string;
  };
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

function PinDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [pin, setPin] = useState<Pin | null>(null);
  const [comment, setComment] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const { user } = useAuth();

  const fetchPin = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/pins/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPin(response.data);
    } catch (error) {
      console.error('Error fetching pin:', error);
      setSnackbar({
        open: true,
        message: 'Error loading pin',
        severity: 'error'
      });
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/pins/${id}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(response.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error loading comments',
        severity: 'error',
      });
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchPin();
    fetchComments();
    // eslint-disable-next-line
  }, [id, token]);

  const handleSave = async () => {
    if (!token) {
      setSnackbar({
        open: true,
        message: 'Please login to save pins',
        severity: 'error'
      });
      return;
    }

    try {
      if (pin?.is_saved) {
        await axios.delete(`http://localhost:8000/api/pins/${id}/save`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSnackbar({
          open: true,
          message: 'Pin unsaved',
          severity: 'success'
        });
      } else {
        await axios.post(`http://localhost:8000/api/pins/${id}/save`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSnackbar({
          open: true,
          message: 'Pin saved',
          severity: 'success'
        });
      }
      fetchPin(); // Refresh pin data
    } catch (error) {
      console.error('Error saving pin:', error);
      setSnackbar({
        open: true,
        message: 'Error saving pin',
        severity: 'error'
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: pin?.title,
        text: pin?.description,
        url: window.location.href,
      });
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        setSnackbar({
          open: true,
          message: 'Error sharing pin',
          severity: 'error'
        });
      }
    }
  };

  const handlePostComment = async () => {
    if (!token) {
      setSnackbar({
        open: true,
        message: 'Please login to comment',
        severity: 'error',
      });
      return;
    }
    try {
      await axios.post(
        `http://localhost:8000/api/pins/${id}/comments`,
        { content: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment('');
      fetchComments();
      setSnackbar({
        open: true,
        message: 'Comment posted',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error posting comment',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!pin) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f0f0f0',
      }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f0f0f0',
      py: 4,
      px: { xs: 2, sm: 4, md: 6 },
    }}>
      <Box sx={{ mb: 3 }}>
        <IconButton 
          onClick={() => navigate(-1)}
          sx={{ 
            backgroundColor: 'white',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: '32px',
          overflow: 'hidden',
          backgroundColor: 'white',
          width: '100%',
          mx: 'auto',
        }}
      >
        <Grid container>
          {/* Image Section */}
          <Grid item xs={12} md={8}>
            <Box sx={{ 
              position: 'relative',
              width: '100%',
              height: isMobile ? 'auto' : 'calc(100vh - 100px)',
              minHeight: isMobile ? '300px' : '600px',
            }}>
              <img
                src={`http://localhost:8000${pin.image_url}`}
                alt={pin.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
          </Grid>

          {/* Content Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Header */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {pin.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {pin.description}
                </Typography>
              </Box>

              {/* Owner Info */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                p: 2,
                backgroundColor: '#f8f8f8',
                borderRadius: '16px',
              }}>
                <Avatar sx={{ mr: 2 }}>
                  {pin.owner.username[0].toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {pin.owner.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pin.owner.email}
                  </Typography>
                </Box>
              </Box>

              {/* Tags */}
              {pin.tags && pin.tags.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {pin.tags.map((tag) => (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        onClick={() => navigate(`/tag/${tag.name}`)}
                        sx={{
                          backgroundColor: '#f0f0f0',
                          '&:hover': {
                            backgroundColor: '#e0e0e0',
                            cursor: 'pointer',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Action Buttons */}
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                mb: 3,
                flexWrap: 'wrap',
              }}>
                <Button
                  variant="contained"
                  startIcon={<FavoriteIcon />}
                  onClick={handleSave}
                  sx={{ 
                    flex: 1,
                    minWidth: '120px',
                    backgroundColor: pin.is_saved ? '#111111' : '#e60023',
                    '&:hover': { 
                      backgroundColor: pin.is_saved ? '#333333' : '#ad081b' 
                    },
                  }}
                >
                  {pin.is_saved ? 'Saved' : 'Save'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={handleShare}
                  sx={{ 
                    flex: 1,
                    minWidth: '120px',
                    borderColor: '#e60023',
                    color: '#e60023',
                    '&:hover': { 
                      borderColor: '#ad081b',
                      backgroundColor: 'rgba(230, 0, 35, 0.04)',
                    },
                  }}
                >
                  Share
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Comments Section */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Comments
                </Typography>
                {/* Comment Form */}
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder={token ? "Add a comment..." : "Login to comment"}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={!token}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                      variant="contained"
                      endIcon={<SendIcon />}
                      disabled={!comment.trim() || !token}
                      sx={{ 
                        backgroundColor: '#e60023',
                        '&:hover': { backgroundColor: '#ad081b' },
                      }}
                      onClick={handlePostComment}
                    >
                      Post
                    </Button>
                  </Box>
                </Box>
                {/* Comments List */}
                {loadingComments ? (
                  <Typography>Loading comments...</Typography>
                ) : comments.length === 0 ? (
                  <Typography color="text.secondary">No comments yet.</Typography>
                ) : (
                  <Box>
                    {comments.map((c) => (
                      <Box key={c.id} sx={{ mb: 2, p: 2, backgroundColor: '#f8f8f8', borderRadius: '12px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 1, width: 28, height: 28 }}>
                            {c.user.username[0].toUpperCase()}
                          </Avatar>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {c.user.username}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            {new Date(c.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="body1">{c.content}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default PinDetail; 