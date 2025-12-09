// components/editors/HeaderEditor.jsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  Typography,
  IconButton
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useContent } from '../admin-auth-page-context'

const HeaderEditor = () => {
  const { content, updateContent, uploadImage } = useContent()
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    address1: '',
    address2: '',
    logoUrl: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (content.header) {
      setFormData({
        phone: content.header.phone || '+7 953 8702552',
        email: content.header.email || 'grannsk@bk.ru',
        address1: content.header.address1 || 'Новосибирск п. Восход, ул. Долинная 2Г',
        address2: content.header.address2 || 'Новосибирск, Советское шоссе 12 к 1',
        logoUrl: content.header.logoUrl || ''
      })
    }
  }, [content.header])

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateContent('home', 'header', formData)
      alert('Изменения сохранены!')
    } catch (error) {
      alert('Ошибка при сохранении')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0]
    if (file) {
      try {
        setSaving(true)
        const logoUrl = await uploadImage(file)
        setFormData(prev => ({ ...prev, logoUrl }))
      } catch (error) {
        alert('Ошибка при загрузке логотипа')
      } finally {
        setSaving(false)
      }
    }
  }

  const handleDeleteLogo = async () => {
    if (!formData.logoUrl) {
      alert('Нет логотипа для удаления')
      return
    }

    if (window.confirm('Вы уверены, что хотите удалить логотип? После сохранения будет использовано лого по умолчанию.')) {
      // Очищаем поле logoUrl
      setFormData(prev => ({ ...prev, logoUrl: '' }))
      // Не сохраняем автоматически, пользователь должен сохранить изменения
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Редактирование шапки сайта</Typography>
      
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Логотип
                </Typography>
                {formData.logoUrl && (
                  <IconButton
                    color="error"
                    onClick={handleDeleteLogo}
                    title="Удалить логотип"
                    disabled={saving}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Stack>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  component="label"
                  disabled={saving}
                >
                  {formData.logoUrl ? 'Заменить логотип' : 'Загрузить логотип'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </Button>
                
                {formData.logoUrl && (
                  <Button
                    variant="text"
                    color="error"
                    onClick={handleDeleteLogo}
                    disabled={saving}
                    startIcon={<DeleteIcon />}
                  >
                    Удалить
                  </Button>
                )}
              </Stack>
              
              {formData.logoUrl && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Предпросмотр:
                  </Typography>
                  <Box sx={{ 
                    position: 'relative',
                    display: 'inline-block',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    p: 1,
                    backgroundColor: '#f5f5f5'
                  }}>
                    <img 
                      src={formData.logoUrl} 
                      alt="Logo Preview" 
                      style={{ 
                        maxHeight: '60px',
                        display: 'block'
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Ссылка: {formData.logoUrl.substring(0, 50)}...
                  </Typography>
                </Box>
              )}
              
              {!formData.logoUrl && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Логотип не загружен. Будет использовано лого по умолчанию.
                </Typography>
              )}
            </Box>

            <TextField
              label="Телефон"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              fullWidth
            />
            
            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              fullWidth
            />
            
            <TextField
              label="Адрес 1"
              value={formData.address1}
              onChange={(e) => setFormData(prev => ({ ...prev, address1: e.target.value }))}
              fullWidth
            />
            
            <TextField
              label="Адрес 2"
              value={formData.address2}
              onChange={(e) => setFormData(prev => ({ ...prev, address2: e.target.value }))}
              fullWidth
            />
          </Stack>
        </CardContent>
      </Card>

      <Button 
        variant="contained" 
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Сохранение...' : 'Сохранить изменения'}
      </Button>
    </Stack>
  )
}

export default HeaderEditor