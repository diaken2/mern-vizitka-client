// components/editors/DynamicSectionEditor.jsx
import React, { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { Edit, Delete, Image } from '@mui/icons-material'
import { useContent } from '../admin-auth-page-context'


const DynamicSectionEditor = ({ sectionName, sectionData }) => {
  const { updateContent, deleteSection, uploadImage } = useContent()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [formData, setFormData] = useState(sectionData)

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      await updateContent('home', sectionName, formData)
      setSuccess('Изменения сохранены!')
      setEditing(false)
    } catch (error) {
      setError('Ошибка при сохранении: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await deleteSection('home', sectionName)
      setDeleteDialog(false)
    } catch (error) {
      setError('Ошибка при удалении: ' + error.message)
      setDeleting(false)
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (file) {
      try {
        const imageUrl = await uploadImage(file)
        setFormData(prev => ({ ...prev, imageUrl }))
      } catch (error) {
        setError('Ошибка при загрузке изображения: ' + error.message)
      }
    }
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{sectionName}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<Edit />}
                onClick={() => setEditing(!editing)}
                variant="outlined"
                size="small"
              >
                {editing ? 'Отмена' : 'Редактировать'}
              </Button>
              <Button
                startIcon={<Delete />}
                onClick={() => setDeleteDialog(true)}
                variant="outlined"
                color="error"
                size="small"
              >
                Удалить
              </Button>
            </Box>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          {!editing ? (
            // Просмотр
            <Box>
              {formData.title && (
                <Typography variant="subtitle1" gutterBottom>
                  {formData.title}
                </Typography>
              )}
              {formData.content && (
                <Typography variant="body2" color="text.secondary">
                  {formData.content}
                </Typography>
              )}
              {formData.items && (
                <Box component="ul" sx={{ pl: 2 }}>
                  {formData.items.map((item, index) => (
                    <Typography key={index} component="li" variant="body2">
                      {item}
                    </Typography>
                  ))}
                </Box>
              )}
              {formData.imageUrl && (
                <Box sx={{ mt: 2 }}>
                  <img 
                    src={formData.imageUrl} 
                    alt={formData.altText || 'Изображение'} 
                    style={{ maxWidth: '200px', maxHeight: '150px' }}
                  />
                </Box>
              )}
            </Box>
          ) : (
            // Редактирование
            <Stack spacing={2}>
              <TextField
                label="Заголовок"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                fullWidth
              />

              {formData.content !== undefined && (
                <TextField
                  label="Содержимое"
                  multiline
                  rows={3}
                  value={formData.content || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  fullWidth
                />
              )}

              {formData.items !== undefined && (
                <TextField
                  label="Элементы списка (каждый с новой строки)"
                  multiline
                  rows={3}
                  value={formData.items?.join('\n') || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    items: e.target.value.split('\n').filter(item => item.trim()) 
                  }))}
                  fullWidth
                />
              )}

              {(formData.imageUrl !== undefined) && (
                <Box>
                  <Button
                    component="label"
                    startIcon={<Image />}
                    variant="outlined"
                    sx={{ mb: 1 }}
                  >
                    Загрузить изображение
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                  {formData.imageUrl && (
                    <Box sx={{ mt: 1 }}>
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        style={{ maxWidth: '200px', maxHeight: '150px' }}
                      />
                    </Box>
                  )}
                </Box>
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>

      {editing && (
        <CardActions>
          <Button 
            onClick={handleSave}
            variant="contained"
            disabled={saving}
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </CardActions>
      )}

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить секцию "{sectionName}"? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Отмена</Button>
          <Button 
            onClick={handleDelete} 
            color="error"
            disabled={deleting}
          >
            {deleting ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default DynamicSectionEditor