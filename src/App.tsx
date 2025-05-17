import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePin from './pages/CreatePin';
import PinDetail from './pages/PinDetail';
import PrivateRoute from './components/PrivateRoute';
import { Box } from '@mui/material';
import SavedPins from './pages/SavedPins';
import Profile from './pages/Profile';
import TagPins from './pages/TagPins';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#e60023',
    },
    secondary: {
      main: '#111111',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ 
            width: '100%',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <Navbar />
            <Box component="main" sx={{ flex: 1, width: '100%' }}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Home />
                    </PrivateRoute>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/pin/:id"
                  element={
                    <PrivateRoute>
                      <PinDetail />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/tag/:tagName"
                  element={
                    <PrivateRoute>
                      <TagPins />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/saved"
                  element={
                    <PrivateRoute>
                      <SavedPins />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/create"
                  element={
                    <PrivateRoute>
                      <CreatePin />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 