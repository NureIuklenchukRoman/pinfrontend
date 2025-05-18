import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
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

function Home() {
  const [pins, setPins] = useState<Pin[]>([]);
  const { token } = useAuth();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchPins = async () => {
    try {
      const response = await axios.get('https://mypythonwebapp-edcjb3e3a0f5apg6.polandcentral-01.azurewebsites.net/api/pins/', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setPins(response.data);
    } catch (error) {
      console.error('Error fetching pins:', error);
      setSnackbar({
        open: true,
        message: 'Error loading pins',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    fetchPins();
  }, [token]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#f0f0f0',
      py: 4,
      px: { xs: 2, sm: 4, md: 6 },
    }}>
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

export default Home;
