import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFormValidation } from '../../hooks/useFormValidation';
import { updateApiBaseUrl } from '../../services/http-client';
import { LoginCredentials } from '../../types';
import { Container, Box, Typography, TextField, Button, Link } from '@mui/material';

const validationRules = {
  apiBaseUrl: {
    required: true,
    pattern: /^https?:\/\/.+/,
    message: 'Valid API Base URL is required (e.g., http://localhost:3000/api/v1)',
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    message: 'Username is required',
  },
  password: {
    required: true,
    minLength: 3,
    message: 'Password is required',
  },
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, error: authError, isLoading } = useAuth();
  const { errors, isValid, validateForm } = useFormValidation(validationRules);
  const [formData, setFormData] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'apiBaseUrl') {
      setApiBaseUrl(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Validate on change
    const validationData = name === 'apiBaseUrl' 
      ? { ...formData, apiBaseUrl: value }
      : { ...formData, [name]: value };
    validateForm(validationData);
  };

  useEffect(() => {
    // Load saved API base URL from localStorage
    const savedApiUrl = localStorage.getItem('api_base_url');
    if (savedApiUrl) {
      setApiBaseUrl(savedApiUrl);
    } else {
      setApiBaseUrl('http://localhost:3000/api/v1');
    }
  }, []);

  useEffect(() => {
    // Log validation state whenever it changes
    console.log('Form validation state:', { isValid, errors, formData });
  }, [isValid, errors, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields including API base URL
    const validationData = { ...formData, apiBaseUrl };
    if (!validateForm(validationData)) {
      return;
    }

    // Save API base URL before login
    updateApiBaseUrl(apiBaseUrl.trim());

    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Welcome Back
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="apiBaseUrl"
            label="API Base URL"
            name="apiBaseUrl"
            placeholder="http://localhost:3000/api/v1"
            value={apiBaseUrl}
            onChange={handleChange}
            error={!!errors.apiBaseUrl}
            helperText={errors.apiBaseUrl || "Enter the base URL for the API server"}
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
          />
          {authError && (
            <Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>
              {authError}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading || !isValid}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          <Link href="#" variant="body2">
            Forgot password?
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;