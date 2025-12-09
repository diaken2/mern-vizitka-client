// components/editors/NavbarEditor.jsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { useContent } from '../admin-auth-page-context'



const NavbarEditor = () => {
  const { content, updateContent } = useContent()
  const [navItems, setNavItems] = useState(['ПОВЕРКА', 'ВЕСОВ', 'ВСЕХ', 'ТИПОВ'])
  const [newItem, setNewItem] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (content.navbar && content.navbar.items) {
      setNavItems(content.navbar.items)
    }
  }, [content.navbar])

  const handleAddItem = () => {
    if (newItem.trim() && !navItems.includes(newItem.trim().toUpperCase())) {
      setNavItems([...navItems, newItem.trim().toUpperCase()])
      setNewItem('')
      setError('')
    } else if (navItems.includes(newItem.trim().toUpperCase())) {
      setError('Этот пункт уже существует')
    }
  }

  const handleRemoveItem = (index) => {
    setNavItems(navItems.filter((_, i) => i !== index))
    setError('')
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      
      await updateContent('home', 'navbar', { items: navItems })
      setSuccess('Изменения успешно сохранены!')
    } catch (error) {
      console.error('Save error:', error)
      setError('Ошибка при сохранении. Проверьте консоль для подробностей.')
    } finally {
      setSaving(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddItem()
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Редактирование навигации</Typography>
      
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Пункты меню (отображаются в указанном порядке)
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {navItems.map((item, index) => (
                  <Chip
                    key={index}
                    label={item}
                    onDelete={() => handleRemoveItem(index)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
                {navItems.length === 0 && (
                  <Typography color="text.secondary">
                    Нет пунктов меню. Добавьте первый пункт.
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <TextField
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Введите новый пункт меню"
                  size="small"
                  helperText="Нажмите Enter или кнопку 'Добавить'"
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  startIcon={<Add />}
                  onClick={handleAddItem}
                  variant="outlined"
                  disabled={!newItem.trim()}
                >
                  Добавить
                </Button>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={saving || navItems.length === 0}
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

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Предпросмотр навигации
          </Typography>
          <Box sx={{ 
            p: 2, 
            bgcolor: '#1c7c3f', 
            borderRadius: 1,
            display: 'flex',
            gap: 3,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {navItems.map((item, index) => (
              <Typography 
                key={index} 
                sx={{ 
                  color: 'white', 
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 }
                }}
              >
                {item}
              </Typography>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default NavbarEditor