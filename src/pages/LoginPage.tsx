import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFormValidation } from '../hooks/useFormValidation';
import { LoginCredentials } from '../types';
import { Container, Box, Typography, TextField, Button, Link } from '@mui/material';

const validationRules = {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Validate on change
    validateForm({ ...formData, [name]: value });
  };

  useEffect(() => {
    // Log validation state whenever it changes
    console.log('Form validation state:', { isValid, errors, formData });
  }, [isValid, errors, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      return;
    }

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
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
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