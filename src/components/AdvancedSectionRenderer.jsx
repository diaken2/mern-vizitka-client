// components/AdvancedSectionRenderer.jsx
import React, { useState, useEffect, useRef } from 'react'
import { 
  Box, 
  Typography, 
  Stack, 
  Container,
  Button,
  Snackbar,
  Alert
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { useContent } from './admin-auth-page-context'
import { useDragDrop } from '../drag-drop-context/DragDropContext'
import DraggableSection from './dnd/DraggableSection'

// Встроенный хук авторизации
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAdmin(parsedUser.role === 'admin');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setLoading(false);
  }, []);

  return { user, isAdmin, loading };
};

const AdvancedSectionRenderer = () => {
  const { content } = useContent()
  const { sectionsOrder, moveSection, updateSectionsOrder } = useDragDrop()
  const [saveStatus, setSaveStatus] = useState({ open: false, message: '', severity: 'success' })
  const { isAdmin, loading } = useAuth()
  const initializedRef = useRef(false)

  // ПРОСТАЯ инициализация
  useEffect(() => {
    if (content && Object.keys(content).length > 0) {
      const dynamicSections = Object.keys(content).filter(
        section => !['hero', 'header', 'navbar'].includes(section)
      );
      
      // Всегда обновляем когда content меняется
      updateSectionsOrder(dynamicSections);
    }
  }, [content]);

  // Функция для сохранения порядка на бэкенде
  const saveOrderToBackend = async (orderToSave) => {
    try {
      console.log('💾 Saving order to backend:', orderToSave);
      
      const response = await fetch('/api/reorder-sections/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionsOrder: orderToSave }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Save error:', error);
      throw error;
    }
  }

  const showSaveStatus = (message, severity = 'success') => {
    setSaveStatus({ open: true, message, severity });
  }

  const handleMoveSection = (dragIndex, hoverIndex) => {
    if (!isAdmin) return;
    
    const newOrder = moveSection(dragIndex, hoverIndex);
    
    // Сохраняем на бэкенде
    saveOrderToBackend(newOrder)
      .then((result) => {
        showSaveStatus('Порядок секций сохранен!', 'success');
      })
      .catch((error) => {
        showSaveStatus('Ошибка при сохранении порядка', 'error');
      });
  }

  const handleSaveOrder = async () => {
    if (!isAdmin) return;
    
    try {
      const result = await saveOrderToBackend(sectionsOrder);
      showSaveStatus('Порядок секций сохранен!', 'success');
    } catch (error) {
      showSaveStatus('Ошибка при сохранении порядка', 'error');
    }
  }

  // Функция рендеринга контента секции в стиле Hero
  const renderSectionContent = (sectionName, sectionData) => {
    return (
      <Box
        sx={{
          position: 'relative',
          bgcolor: '#fff',
          pt: { xs: 6, md: 8 },
          pb: { xs: 6, md: 8 },
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          minHeight: { xs: 'auto', md: '60vh' },
        }}
      >
        {/* Фон для мобильных */}
        {sectionData?.imageUrl && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.8)), url(${sectionData.imageUrl})`,
              backgroundSize: 'contain',
              backgroundPosition: 'bottom center',
              backgroundRepeat: 'no-repeat',
              opacity: 1,
              zIndex: 1,
              display: { xs: 'block', md: 'none' },
            }}
          />
        )}

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems="center"
          spacing={{ xs: 4, md: 8 }}
          sx={{ 
            px: { xs: 2, sm: 4, md: 10 }, 
            position: 'relative', 
            zIndex: 2,
            width: '100%'
          }}
        >
          {/* Текстовая часть */}
          <Box
            flex={1}
            zIndex={2}
            sx={{
              maxWidth: { xs: '100%', md: '600px' },
              backgroundColor: { xs: 'rgba(255,255,255,0.15)', md: 'transparent' },
              p: { xs: 2, md: 0 },
              borderRadius: { xs: 2, md: 0 },
            }}
          >
            {sectionData?.title && (
              <Typography
                variant="h3"
                fontWeight={700}
                sx={{
                  fontFamily: 'Roboto, sans-serif',
                  lineHeight: 1.1,
                  fontSize: { xs: '2rem', sm: '2.3rem', md: '2.8rem' },
                  textAlign: 'left',
                  width: { xs: '100%', md: '100%' },
                }}
                gutterBottom
              >
                {sectionData.title}
              </Typography>
            )}

            {sectionData?.subtitle && (
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{
                  mt: 2,
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  textAlign: 'left',
                  width: { xs: '100%', md: '100%' },
                  fontWeight: 400,
                }}
                gutterBottom
              >
                {sectionData.subtitle}
              </Typography>
            )}

            {sectionData?.content && (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  mt: 2,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  textAlign: 'left',
                  width: { xs: '100%', md: '100%' },
                  lineHeight: 1.6,
                }}
                paragraph
              >
                {sectionData.content}
              </Typography>
            )}

            {sectionData?.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 1,
                  textAlign: 'left',
                  width: { xs: '100%', md: '100%' },
                  lineHeight: 1.5,
                }}
              >
                {sectionData.description}
              </Typography>
            )}
          </Box>

          {/* Картинка для десктопа */}
          {sectionData?.imageUrl && (
            <Box
              sx={{
                flex: 1.2,
                display: { xs: 'none', md: 'flex' },
                justifyContent: { xs: 'center', md: 'flex-end' },
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <Box
                component="img"
                src={sectionData.imageUrl}
                alt={sectionData.title || sectionName}
                sx={{
                  width: '100%',
                  maxWidth: { md: '500px', lg: '600px' },
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              />
            </Box>
          )}
        </Stack>
      </Box>
    );
  }

  if (loading) {
    return (
      <Container>
        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
          Загрузка...
        </Typography>
      </Container>
    );
  }

  // ЕСЛИ НЕТ СЕКЦИЙ
  if (!sectionsOrder || sectionsOrder.length === 0) {
    return (
      <Container>
        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
          Нет дополнительных секций для отображения.
        </Typography>
      </Container>
    );
  }

  // ЕСЛИ НЕ АДМИН - рендерим просто как часть страницы
  if (!isAdmin) {
    return (
      <>
        {sectionsOrder.map((sectionName) => (
          <Box key={sectionName}>
            {renderSectionContent(sectionName, content[sectionName])}
          </Box>
        ))}
      </>
    );
  }

  // ЕСЛИ АДМИН - рендерим с возможностью перетаскивания
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Панель управления для админа */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Управление секциями
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Режим администратора: перетаскивайте секции чтобы изменить порядок
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flexWrap: 'wrap' 
        }}>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={handleSaveOrder}
            size="large"
          >
            Сохранить порядок
          </Button>
          
          <Box sx={{ 
            p: 1.5, 
            backgroundColor: 'grey.50', 
            borderRadius: 1,
            flexGrow: 1
          }}>
            <Typography variant="body2" fontFamily="monospace">
              Текущий порядок: [{sectionsOrder.join(', ')}]
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Список секций с возможностью перетаскивания */}
      <Stack spacing={0}>
        {sectionsOrder.map((sectionName, index) => (
          <DraggableSection
            key={`${sectionName}-${index}`}
            id={sectionName}
            index={index}
            moveSection={handleMoveSection}
          >
            {renderSectionContent(sectionName, content[sectionName])}
          </DraggableSection>
        ))}
      </Stack>

      {/* Сообщения о сохранении */}
      <Snackbar 
        open={saveStatus.open} 
        autoHideDuration={4000} 
        onClose={() => setSaveStatus({ ...saveStatus, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={saveStatus.severity}
          onClose={() => setSaveStatus({ ...saveStatus, open: false })}
          sx={{ width: '100%' }}
        >
          {saveStatus.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdvancedSectionRenderer;