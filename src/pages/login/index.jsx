import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, Container } from '@mui/material';
import { useAuth } from '../../components/auth-context';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const roleRedirectMap = {
    admin: '/admin',
    full: '/table',
    limited: '/table',
    viewer: '/table'
  };

  const handleLogin = async () => {
    try {
      const user = await login(username, password); // ⬅️ login сам делает запрос
      navigate(roleRedirectMap[user.role] || '/');
    } catch (err) {
      alert('Ошибка входа: ' + err.message);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper sx={{ p: 3, mt: 8 }}>
        <Typography variant="h6" mb={2}>Вход</Typography>
        <TextField label="Логин" fullWidth margin="normal" value={username} onChange={e => setUsername(e.target.value)} />
        <TextField label="Пароль" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
        <Button variant="contained" color="primary" fullWidth onClick={handleLogin}>Войти</Button>
      </Paper>
    </Container>
  );
};

export default LoginPage;
