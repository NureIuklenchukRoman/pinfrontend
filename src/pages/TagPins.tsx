import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Paper,
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

function TagPins() {
  const { tagName } = useParams<{ tagName: string }>();
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchPins = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://mypythonwebapp-edcjb3e3a0f5apg6.polandcentral-01.azurewebsites.net/api/pins/tag/${tagName}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPins(response.data);
        setError(null);
      } catch (err) {
        setError('Error loading pins');
        console.error('Error fetching pins:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPins();
  }, [tagName, token]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Pins tagged with "{tagName}"
      </Typography>
      
      {pins.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No pins found with this tag.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {pins.map((pin) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={pin.id}>
              <PinCard pin={pin} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default TagPins; 