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
    message: '需要有效的API基础URL（例如：http://localhost:3000/api/v1）',
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    message: '用户名是必填项',
  },
  password: {
    required: true,
    minLength: 3,
    message: '密码是必填项',
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
    // Validate on change - always include all fields including apiBaseUrl
    const validationData = name === 'apiBaseUrl' 
      ? { ...formData, apiBaseUrl: value }
      : { ...formData, apiBaseUrl, [name]: value };
    validateForm(validationData);
  };

  useEffect(() => {
    // Load saved API base URL from localStorage
    const savedApiUrl = localStorage.getItem('api_base_url');
    if (savedApiUrl) {
      setApiBaseUrl(savedApiUrl);
      // Validate initial value - validation hook will automatically trim
      const validationData = { username: '', password: '', apiBaseUrl: savedApiUrl };
      validateForm(validationData);
    } else {
      const defaultUrl = 'http://localhost:3000/api/v1';
      setApiBaseUrl(defaultUrl);
      // Validate default value
      const validationData = { username: '', password: '', apiBaseUrl: defaultUrl };
      validateForm(validationData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Log validation state whenever it changes
    console.log('Form validation state:', { isValid, errors, formData, apiBaseUrl });
  }, [isValid, errors, formData, apiBaseUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields including API base URL - trim apiBaseUrl for validation
    const trimmedApiBaseUrl = apiBaseUrl.trim();
    const validationData = { ...formData, apiBaseUrl: trimmedApiBaseUrl };
    if (!validateForm(validationData)) {
      return;
    }

    // Save API base URL before login
    updateApiBaseUrl(trimmedApiBaseUrl);

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
          欢迎回来
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="apiBaseUrl"
            label="API基础URL"
            name="apiBaseUrl"
            placeholder="http://localhost:3000/api/v1"
            value={apiBaseUrl}
            onChange={handleChange}
            error={!!errors.apiBaseUrl}
            helperText={errors.apiBaseUrl || "输入API服务器的基础URL"}
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="用户名"
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
            label="密码"
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
            {isLoading ? '登录中...' : '登录'}
          </Button>
          <Link href="#" variant="body2">
            忘记密码？
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;