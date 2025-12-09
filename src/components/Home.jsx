// pages/Home.jsx
import React from 'react'
import { Box } from '@mui/material'
import Hero from './hero/Hero'
import AdvancedSectionRendererPreview from './AdvancedSectionRendererPreview'


const Home = () => {
  return (
    <Box>
      <Hero />
      <AdvancedSectionRendererPreview />
      {/* Здесь могут быть другие компоненты главной страницы */}
    </Box>
  )
}

export default Home