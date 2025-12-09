// components/NavBar.jsx
import { Box, Typography, Stack } from '@mui/material'
import { useContent } from '../admin-auth-page-context'


const NavBar = () => {
  const { content } = useContent() // Просто используем контент из контекста

  // Берем данные из контекста или используем значения по умолчанию
  const navbarContent = content.navbar
  const items = navbarContent.items

  return (
    <Box sx={{ bgcolor: '#1c7c3f', py: 1, maxWidth: 1353 }}>
      <Stack direction="row" justifyContent="center" sx={{ marginLeft: { xs: 0, md: "-489px" } }} spacing={2} flexWrap="wrap">
        {items.map((item, index) => (
          <Typography
            key={index}
            sx={{
              color: 'white',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#155f2f' }
            }}
          >
            {item}
          </Typography>
        ))}
      </Stack>
    </Box>
  )
}

export default NavBar