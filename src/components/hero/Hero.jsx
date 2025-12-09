// components/Hero.jsx
import { Box, Typography, Stack } from '@mui/material'
import heroImage from '../../assets/weights.png'
import { useContent } from '../admin-auth-page-context'
import AdvancedSectionRenderer from '../AdvancedSectionRenderer'


const Hero = () => {
  const { content } = useContent() // Просто используем контент из контекста

  // Берем данные из контекста или используем значения по умолчанию
  const heroContent = content.hero

  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: '#fff',
        pt: { xs: 8, md: 0 },
        pb: { xs: 6, md: 6 },
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Мобильный фон */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.8)), url(${heroContent.imageUrl || heroImage})`,
          backgroundSize: 'contain',
          backgroundPosition: 'bottom center',
          backgroundRepeat: 'no-repeat',
          opacity: 1,
          zIndex: 1,
          display: { xs: 'block', md: 'none' },
        }}
      />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems="center"
        spacing={{ xs: 4, md: 8 }}
        sx={{ px: { xs: 2, sm: 4, md: 10 }, position: 'relative', zIndex: 2 }}
      >
        {/* Текст */}
        <Box
          flex={1}
          zIndex={2}
          sx={{
            maxWidth: { xs: '100%', md: '520px' },
            backgroundColor: { xs: 'rgba(255,255,255,0.15)', md: 'transparent' },
            p: { xs: 2, md: 0 },
            borderRadius: { xs: 2, md: 0 },
          }}
        >
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{
              fontFamily: 'Roboto, sans-serif',
              lineHeight: 1.1,
              fontSize: { xs: '2.2rem', sm: '2.5rem', md: '3.2rem' },
              textAlign: 'left',
              width: { xs: 340, md: 562 },
            }}
            gutterBottom
          >
            {heroContent.title}
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              mt: 2,
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              textAlign: 'left',
              width: { xs: 300, md: 562 },
            }}
          >
            {heroContent.subtitle}
          </Typography>
        </Box>

        {/* Картинка */}
        <Box
          sx={{
            flex: 1.2,
            display: { xs: 'none', md: 'flex' },
            justifyContent: 'flex-end',
            position: 'relative',
            left: { md: 40, lg: 80 },
          }}
        >
          <Box
            component="img"
            src={heroContent.imageUrl || heroImage}
            alt="Гири"
            sx={{
              position: "relative",
              right: 192,
              width: { md: '700px', lg: '800px' },
              maxWidth: 'none',
              height: 'auto',
            }}
          />
        </Box>
      </Stack>
      
    </Box>
  )
}

export default Hero