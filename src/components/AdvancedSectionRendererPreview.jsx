// components/AdvancedSectionRendererPreview.jsx
import React, { useState } from 'react'
import { 
  Box, 
  Container, 
  Typography, 
  Button,
  Stack,
  Grid,
  Card,
  CardContent
} from '@mui/material'

import AdvancedSectionRenderer from './AdvancedSectionRenderer'
import { useContent } from './admin-auth-page-context'

const AdvancedSectionRendererPreview = () => {
  const { content } = useContent()
  const [isEditMode, setIsEditMode] = useState(false)

  // Проверяем, авторизован ли админ
  const isAdmin = localStorage.getItem('adminAuth') === 'true'

  if (!isAdmin) {
    return <AdvancedSectionRenderer />
  }

  const renderSectionContent = (sectionName, sectionData) => {
    const hasImage = !!sectionData.imageUrl
    const hasText = !!sectionData.title || !!sectionData.content
    const hasList = !!sectionData.items && sectionData.items.length > 0

    // Секция только с изображением
    if (hasImage && !hasText && !hasList) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <img 
            src={sectionData.imageUrl} 
            alt={sectionData.altText || sectionName} 
            style={{ 
              width: '100%', 
              maxHeight: '400px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
        </Box>
      )
    }

    // Текстовая секция
    if (hasText && !hasImage && !hasList) {
      return (
        <Stack spacing={3} alignItems="center" textAlign="center">
          {sectionData.title && (
            <Typography variant="h3" component="h2" fontWeight="bold">
              {sectionData.title}
            </Typography>
          )}
          {sectionData.content && (
            <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {sectionData.content}
            </Typography>
          )}
        </Stack>
      )
    }

    // Секция с изображением и текстом
    if (hasImage && hasText) {
      return (
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {sectionData.title && (
                <Typography variant="h4" component="h2" fontWeight="bold">
                  {sectionData.title}
                </Typography>
              )}
              {sectionData.content && (
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                  {sectionData.content}
                </Typography>
              )}
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center' }}>
              <img 
                src={sectionData.imageUrl} 
                alt={sectionData.altText || sectionName} 
                style={{ 
                  width: '100%', 
                  maxWidth: '400px',
                  borderRadius: '12px'
                }}
              />
            </Box>
          </Grid>
        </Grid>
      )
    }

    // Секция со списком
    if (hasList) {
      return (
        <Stack spacing={4} alignItems="center">
          {sectionData.title && (
            <Typography variant="h3" component="h2" textAlign="center">
              {sectionData.title}
            </Typography>
          )}
          <Grid container spacing={2}>
            {sectionData.items.map((item, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="body1">
                      {item}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      )
    }

    // Запасной вариант для неизвестных форматов
    return (
      <Box>
        <Typography variant="h6">{sectionName}</Typography>
        <Typography variant="body2" color="text.secondary">
          Тип секции не распознан
        </Typography>
        {sectionData.title && (
          <Typography variant="h6" sx={{ mt: 1 }}>
            {sectionData.title}
          </Typography>
        )}
        {sectionData.content && (
          <Typography variant="body1" sx={{ mt: 1 }}>
            {sectionData.content}
          </Typography>
        )}
        {sectionData.imageUrl && (
          <Box sx={{ mt: 2 }}>
            <img 
              src={sectionData.imageUrl} 
              alt="Изображение" 
              style={{ 
                maxWidth: '200px',
                borderRadius: '8px'
              }}
            />
          </Box>
        )}
      </Box>
    )
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Кнопка переключения режима */}
      {isAdmin && (
        <Box sx={{ 
          position: 'absolute', 
          top: 16, 
          right: 16, 
          zIndex: 1000 
        }}>
          <Button
            variant="contained"
            color={isEditMode ? "secondary" : "primary"}
            onClick={() => setIsEditMode(!isEditMode)}
            size="small"
            sx={{
              backgroundColor: isEditMode ? '#ff6b6b' : '#1976d2',
              '&:hover': {
                backgroundColor: isEditMode ? '#ff5252' : '#1565c0'
              }
            }}
          >
            {isEditMode ? '📝 Завершить редактирование' : '✏️ Редактировать порядок'}
          </Button>
        </Box>
      )}

      {isEditMode ? (
        // Режим редактирования с Drag & Drop
        <AdvancedSectionRenderer />
      ) : (
        // Обычный режим просмотра без DnD
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Stack spacing={6}>
            {Object.keys(content || {})
              .filter(section => !['hero', 'header', 'navbar'].includes(section))
              .map(sectionName => (
                <Box 
                  key={sectionName} 
                  sx={{ 
                    mb: 4,
                    p: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    boxShadow: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {renderSectionContent(sectionName, content[sectionName])}
                  
                  {/* Подпись секции для админа */}
                  {isAdmin && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        display: 'block', 
                        mt: 2, 
                        textAlign: 'center',
                        fontStyle: 'italic'
                      }}
                    >
                      Секция: "{sectionName}" • Для изменения порядка нажмите "Редактировать порядок"
                    </Typography>
                  )}
                </Box>
              ))
            }

            {/* Сообщение если нет секций */}
            {Object.keys(content || {}).filter(section => !['hero', 'header', 'navbar'].includes(section)).length === 0 && (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Нет дополнительных секций
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Добавьте секции через панель управления
                </Typography>
                {isAdmin && (
                  <Button 
                    variant="outlined" 
                    sx={{ mt: 2 }}
                    onClick={() => window.open('/admin', '_blank')}
                  >
                    Перейти в панель управления
                  </Button>
                )}
              </Box>
            )}
          </Stack>
        </Container>
      )}

      {/* Инструкция для админа в режиме редактирования */}
      {isEditMode && isAdmin && (
        <Box 
          sx={{ 
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(25, 118, 210, 0.9)',
            color: 'white',
            px: 3,
            py: 1,
            borderRadius: 2,
            zIndex: 1000,
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography variant="body2" align="center">
            🎯 Перетаскивайте секции для изменения порядка • Изменения сохраняются автоматически
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default AdvancedSectionRendererPreview