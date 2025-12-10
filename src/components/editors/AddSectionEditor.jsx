// components/editors/AddSectionEditor.jsx
import React, { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Stack
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { useContent } from '../admin-auth-page-context'
import { useDragDrop } from '../../drag-drop-context/DragDropContext'



const AddSectionEditor = () => {

  const { updateSectionsOrder } = useDragDrop()
  const { addSection } = useContent()

  
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sectionData, setSectionData] = useState({
    sectionName: '',
    sectionType: 'text',
    title: '',
    content: '',
    imageUrl: ''
  })

  const sectionTypes = [
    { value: 'text', label: 'Текстовая секция' },
    { value: 'image', label: 'Секция с изображением' },
    { value: 'mixed', label: 'Текст + изображение' },
    { value: 'list', label: 'Список' }
  ]

  const handleOpen = () => {
    setOpen(true)
    setSectionData({
      sectionName: '',
      sectionType: 'text',
      title: '',
      content: '',
      imageUrl: ''
    })
    setError('')
    setSuccess('')
  }

  const handleAddSection = async () => {
    try {
      setAdding(true)
      setError('')

      if (!sectionData.sectionName.trim()) {
        setError('Введите название секции')
        return
      }

      // Формируем данные секции в зависимости от типа
      let sectionContent = {}
      
      switch (sectionData.sectionType) {
        case 'text':
          sectionContent = {
            title: sectionData.title,
            content: sectionData.content
          }
          break
        case 'image':
          sectionContent = {
            imageUrl: sectionData.imageUrl,
            altText: sectionData.title
          }
          break
        case 'mixed':
          sectionContent = {
            title: sectionData.title,
            content: sectionData.content,
            imageUrl: sectionData.imageUrl
          }
          break
        case 'list':
          sectionContent = {
            title: sectionData.title,
            items: sectionData.content.split('\n').filter(item => item.trim())
          }
          break
        default:
          sectionContent = {
            title: sectionData.title,
            content: sectionData.content
          }
      }

      await addSection('home', sectionData.sectionName, sectionContent)
   
      updateSectionsOrder(prev => [...prev, sectionData.sectionName])
      setSuccess(`Секция "${sectionData.sectionName}" успешно добавлена!`)
      setTimeout(() => {
        setOpen(false)
      }, 2000)

      
        
      
    } catch (error) {
      console.error('Error adding section:', error)
      setError('Ошибка при добавлении секции: ' + error.message)
    } finally {
      setAdding(false)
    }
  }

  return (
    <>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={handleOpen}
        sx={{ mb: 2 }}
      >
        Добавить новую секцию
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Добавить новую секцию</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <TextField
              label="Название секции"
              value={sectionData.sectionName}
              onChange={(e) => setSectionData(prev => ({ ...prev, sectionName: e.target.value }))}
              fullWidth
              helperText="Уникальное название для новой секции (например: about, services, contact)"
            />

            <FormControl fullWidth>
              <InputLabel>Тип секции</InputLabel>
              <Select
                value={sectionData.sectionType}
                label="Тип секции"
                onChange={(e) => setSectionData(prev => ({ ...prev, sectionType: e.target.value }))}
              >
                {sectionTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Заголовок"
              value={sectionData.title}
              onChange={(e) => setSectionData(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
            />

            {(sectionData.sectionType === 'text' || sectionData.sectionType === 'mixed' || sectionData.sectionType === 'list') && (
              <TextField
                label={sectionData.sectionType === 'list' ? 'Элементы списка (каждый с новой строки)' : 'Содержимое'}
                multiline
                rows={4}
                value={sectionData.content}
                onChange={(e) => setSectionData(prev => ({ ...prev, content: e.target.value }))}
                fullWidth
              />
            )}

            {(sectionData.sectionType === 'image' || sectionData.sectionType === 'mixed') && (
              <TextField
                label="URL изображения"
                value={sectionData.imageUrl}
                onChange={(e) => setSectionData(prev => ({ ...prev, imageUrl: e.target.value }))}
                fullWidth
                helperText="Введите URL изображения или используйте загрузчик"
              />
            )}

            <Typography variant="body2" color="text.secondary">
              После добавления секции вы сможете редактировать её содержимое на главной странице.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleAddSection}
            variant="contained"
            disabled={adding || !sectionData.sectionName.trim()}
          >
            {adding ? 'Добавление...' : 'Добавить секцию'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AddSectionEditor