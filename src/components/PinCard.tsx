import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
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

interface PinCardProps {
  pin: Pin;
}

function PinCard({ pin }: PinCardProps) {
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) {
      // Handle not logged in state
      return;
    }

    try {
      if (pin.is_saved) {
        await axios.delete(`https://mypythonwebapp-edcjb3e3a0f5apg6.polandcentral-01.azurewebsites.net:8000/api/pins/${pin.id}/save`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`https://mypythonwebapp-edcjb3e3a0f5apg6.polandcentral-01.azurewebsites.net:8000/api/pins/${pin.id}/save`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      // Refresh the page to update the save status
      window.location.reload();
    } catch (error) {
      console.error('Error saving pin:', error);
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': {
          transform: 'scale(1.02)',
          transition: 'transform 0.2s ease-in-out',
        },
      }}
      onClick={() => navigate(`/pin/${pin.id}`)}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={`https://mypythonwebapp-edcjb3e3a0f5apg6.polandcentral-01.azurewebsites.net:8000${pin.image_url}`}
          alt={pin.title}
          sx={{ objectFit: 'cover' }}
        />
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
          }}
          onClick={handleSave}
        >
          <FavoriteIcon sx={{ color: pin.is_saved ? '#e60023' : 'gray' }} />
        </IconButton>
      </Box>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {pin.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} noWrap>
          {pin.description}
        </Typography>
        {pin.tags && pin.tags.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 'auto', flexWrap: 'wrap', gap: 0.5 }}>
            {pin.tags.map((tag) => (
              <Chip
                key={tag.id}
                label={tag.name}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/tag/${tag.name}`);
                }}
                sx={{
                  backgroundColor: '#f0f0f0',
                  '&:hover': {
                    backgroundColor: '#e0e0e0',
                  },
                }}
              />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default PinCard;