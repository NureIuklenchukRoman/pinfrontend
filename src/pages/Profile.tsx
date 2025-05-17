import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Avatar,
  Tabs,
  Tab,
  Divider,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Favorite as FavoriteIcon, Share as ShareIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Pin {
  id: number;
  title: string;
  description: string;
  image_url: string;
  owner_id: number;
  is_saved: boolean;
  owner: {
    username: string;
    email: string;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function Profile() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [savedPins, setSavedPins] = useState<Pin[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchUserPins = async () => {
    try {
      const response = await axios.get('http://mypythonwebapp-edcjb3e3a0f5apg6.polandcentral-01.azurewebsites.net:8000/api/users/me/pins', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPins(response.data);
    } catch (error) {
      console.error('Error fetching user pins:', error);
      setSnackbar({
        open: true,
        message: 'Error loading pins',
        severity: 'error'
      });
    }
  };

  const fetchSavedPins = async () => {
    try {
      const response = await axios.get('http://mypythonwebapp-edcjb3e3a0f5apg6.polandcentral-01.azurewebsites.net:8000/api/pins/saved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedPins(response.data);
    } catch (error) {
      console.error('Error fetching saved pins:', error);
      setSnackbar({
        open: true,
        message: 'Error loading saved pins',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserPins();
      fetchSavedPins();
    } else {
      setSnackbar({
        open: true,
        message: 'Please login to view profile',
        severity: 'error'
      });
      navigate('/login');
    }
  }, [token, navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePinClick = (pinId: number) => {
    navigate(`/pin/${pinId}`);
  };

  const handleSave = async (e: React.MouseEvent, pinId: number) => {
    e.stopPropagation();
    
    try {
      if (savedPins.some(pin => pin.id === pinId)) {
        await axios.delete(`http://mypythonwebapp-edcjb3e3a0f5apg6.polandcentral-01.azurewebsites.net:8000/api/pins/${pinId}/save`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSnackbar({
          open: true,
          message: 'Pin unsaved',
          severity: 'success'
        });
      } else {
        await axios.post(`http://mypythonwebapp-edcjb3e3a0f5apg6.polandcentral-01.azurewebsites.net:8000/api/pins/${pinId}/save`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSnackbar({
          open: true,
          message: 'Pin saved',
          severity: 'success'
        });
      }
      fetchSavedPins();
    } catch (error) {
      console.error('Error saving/unsaving pin:', error);
      setSnackbar({
        open: true,
        message: 'Error saving/unsaving pin',
        severity: 'error'
      });
    }
  };

  const handleShare = async (e: React.MouseEvent, pin: Pin) => {
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: pin.title,
          text: pin.description,
          url: window.location.origin + `/pin/${pin.id}`,
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
    } else {
      setSnackbar({
        open: true,
        message: 'Sharing is not supported on this browser',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!token || !user) {
    return null;
  }

  const renderPinGrid = (pins: Pin[]) => (
    <Grid container spacing={2} sx={{ width: '100%', margin: 0 }}>
      {pins.map((pin) => (
        <Grid 
          item 
          xs={12} 
          sm={6} 
          md={4} 
          lg={3} 
          key={pin.id}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            p: 1,
          }}
        >
          <Card
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                transform: 'scale(1.02)',
                transition: 'transform 0.2s ease-in-out',
                '& .pin-overlay': {
                  opacity: 1,
                },
              },
            }}
            onClick={() => handlePinClick(pin.id)}
          >
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                sx={{
                  width: '100%',
                  height: 'auto',
                  aspectRatio: '1',
                  objectFit: 'cover',
                }}
                image={`http://mypythonwebapp-edcjb3e3a0f5apg6.polandcentral-01.azurewebsites.net:8000${pin.image_url}`}
                alt={pin.title}
              />
              <Box
                className="pin-overlay"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  opacity: 0,
                  transition: 'opacity 0.2s ease-in-out',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: 2,
                  gap: 1,
                }}
              >
                <IconButton
                  sx={{
                    color: savedPins.some(p => p.id === pin.id) ? '#e60023' : 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                  onClick={(e) => handleSave(e, pin.id)}
                >
                  <FavoriteIcon />
                </IconButton>
                <IconButton
                  sx={{
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                  onClick={(e) => handleShare(e, pin)}
                >
                  <ShareIcon />
                </IconButton>
              </Box>
            </Box>
            <CardContent sx={{ 
              p: 2,
              '&:last-child': { pb: 2 },
              backgroundColor: 'white',
            }}>
              <Typography 
                gutterBottom 
                variant="subtitle1" 
                component="div"
                sx={{
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {pin.title}
              </Typography>
              {pin.description && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {pin.description}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#f0f0f0',
      py: 4,
      px: { xs: 2, sm: 4, md: 6 },
    }}>
      <Box sx={{ 
        maxWidth: '1200px',
        mx: 'auto',
        mb: 4,
      }}>
        <Box sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'center', sm: 'flex-start' },
          gap: 3,
          mb: 4,
        }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              bgcolor: '#e60023',
              fontSize: '3rem',
            }}
          >
            {user.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              {user.username}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                minWidth: 100,
              },
            }}
          >
            <Tab label={`Created (${pins.length})`} />
            <Tab label={`Saved (${savedPins.length})`} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {pins.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              backgroundColor: 'white',
              borderRadius: '16px',
            }}>
              <Typography variant="h6" color="text.secondary">
                No pins created yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Create your first pin to see it here
              </Typography>
            </Box>
          ) : (
            renderPinGrid(pins)
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {savedPins.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              backgroundColor: 'white',
              borderRadius: '16px',
            }}>
              <Typography variant="h6" color="text.secondary">
                No saved pins yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Save pins you like to see them here
              </Typography>
            </Box>
          ) : (
            renderPinGrid(savedPins)
          )}
        </TabPanel>
      </Box>

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

export default Profile; 