// components/editors/HeroEditor.jsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  Typography,
  Divider
} from '@mui/material'
import { useContent } from '../admin-auth-page-context'
import DeleteIcon from '@mui/icons-material/Delete'



const HeroEditor = () => {
  const { content, updateContent, uploadImage } = useContent()
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (content.hero) {
      setFormData({
        title: content.hero.title || 'Поверка, калибровка, настройка, ремонт, обслуживание весов',
        subtitle: content.hero.subtitle || 'Проведем поверку весов от 2 кг до 150 тонн с выездом на место',
        imageUrl: content.hero.imageUrl || ''
      })
    }
  }, [content.hero])

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateContent('home', 'hero', formData)
      alert('Изменения сохранены!')
    } catch (error) {
      alert('Ошибка при сохранении')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (file) {
      try {
        setSaving(true)
        const imageUrl = await uploadImage(file)
        setFormData(prev => ({ ...prev, imageUrl }))
      } catch (error) {
        alert('Ошибка при загрузке изображения')
      } finally {
        setSaving(false)
      }
    }
  }
  
  const handleDeleteImageUrl = async () => {
    if (!formData.imageUrl) {
      alert('Нет логотипа для удаления')
      return
    }

    if (window.confirm('Вы уверены, что хотите удалить логотип? После сохранения будет использовано лого по умолчанию.')) {
      // Очищаем поле logoUrl
      setFormData(prev => ({ ...prev, imageUrl: '' }))
      // Не сохраняем автоматически, пользователь должен сохранить изменения
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Редактирование Hero секции</Typography>
      
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <TextField
              label="Заголовок"
              multiline
              rows={3}
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              helperText="Основной заголовок страницы"
            />
            
            <TextField
              label="Подзаголовок"
              multiline
              rows={2}
              value={formData.subtitle}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
              fullWidth
              helperText="Дополнительный текст под заголовком"
            />
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Изображение
              </Typography>
              <Button
                variant="outlined"
                component="label"
                disabled={saving}
                sx={{ mb: 2 }}
              >
                Загрузить новое изображение
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
               {formData.imageUrl && (
                  <Button
                    variant="text"
                    color="error"
                    onClick={handleDeleteImageUrl}
                    disabled={saving}
                    startIcon={<DeleteIcon />}
                  >
                    Удалить
                  </Button>
                )}
              
              {formData.imageUrl && (
                <Box sx={{ mt: 2 }}>
                  <img 
                    src={formData.imageUrl} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '300px', 
                      maxHeight: '200px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </Box>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>
        
        <Button 
          variant="outlined"
          onClick={() => window.location.reload()}
        >
          Посмотреть на сайте
        </Button>
      </Box>

      <Divider />

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Предпросмотр
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="h4" gutterBottom>
              {formData.title}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {formData.subtitle}
            </Typography>
            {formData.imageUrl && (
              <Box sx={{ mt: 2 }}>
                <img 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  style={{ maxWidth: '200px' }}
                />
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default HeroEditor