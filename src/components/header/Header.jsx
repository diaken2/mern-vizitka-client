// components/Header.jsx
import { Box, Typography, Grid, Link } from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import logo from '../../assets/logo.png'
import { useAuth } from '../auth-context'
import { useNavigate } from 'react-router-dom'
import { useContent } from '../admin-auth-page-context'


const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { content } = useContent() // Просто используем контент из контекста

  const handleAuthClick = (e) => {
    e.preventDefault()
    if (user) {
      logout()
      window.location.reload()
    } else {
      navigate('/login')
    }
  }

  // Берем данные из контекста или используем значения по умолчанию
  const headerContent = content.header

  return (
    <Box sx={{ bgcolor: 'white', maxWidth: 1000, px: { xs: 2, md: 6 }, py: 2 }}>
      <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
        {/* Логотип */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={headerContent.logoUrl || logo}
              alt="Логотип ГРАН Центр Метрологии"
              style={{ height: 48, maxWidth: '100%', objectFit: 'contain' }}
            />
          </Box>
        </Grid>

        {/* Контакты */}
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon fontSize="small" />
              <Typography variant="body2">{headerContent.phone}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon fontSize="small" />
              <Typography variant="body2">{headerContent.email}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon fontSize="small" />
              <Typography variant="body2">
                {headerContent.address1}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ pl: 3 }}>
              {headerContent.address2}
            </Typography>
          </Box>
        </Grid>

        {/* ВХОД / ВЫХОД */}
        <Grid item xs={12} md={3} textAlign={{ xs: 'left', md: 'right' }}>
          <Link
            href={user ? '#' : '/login'}
            onClick={handleAuthClick}
            underline="none"
            variant="body1"
            sx={{ fontWeight: 'bold', color: '#0057a5', cursor: 'pointer' }}
          >
            {user ? 'ВЫХОД' : 'ВХОД'}
          </Link>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Header