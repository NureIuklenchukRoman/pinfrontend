import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import PinCard from '../components/PinCard';

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

function SavedPins() {
  const [pins, setPins] = useState<Pin[]>([]);
  const navigate = useNavigate();
  const { token } = useAuth();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchSavedPins = async () => {
    try {
      const response = await axios.get('http://mypythonwebapp-edcjb3e3a0f5apg6.polandcentral-01.azurewebsites.net:8000/api/pins/saved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPins(response.data);
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
      fetchSavedPins();
    } else {
      setSnackbar({
        open: true,
        message: 'Please login to view saved pins',
        severity: 'error'
      });
      navigate('/login');
    }
  }, [token, navigate]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!token) {
    return null;
  }

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#f0f0f0',
      py: 4,
      px: { xs: 2, sm: 4, md: 6 },
    }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Saved Pins
      </Typography>

      {pins.length === 0 ? (
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
              <PinCard pin={pin} />
            </Grid>
          ))}
        </Grid>
      )}

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

export default SavedPins; 