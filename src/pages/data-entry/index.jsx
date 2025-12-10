import {
  Box,
  Container,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Dialog,
  DialogContent,
  IconButton,
  Divider,
  CircularProgress, Autocomplete,
  Pagination,
  Checkbox,
  InputAdornment,
  Tooltip,
  Chip,
  FormControlLabel,

  
} from '@mui/material'
import React from 'react';
import CloseIcon from '@mui/icons-material/Close'
import { useState, useEffect, useRef } from 'react'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import DeleteIcon from '@mui/icons-material/Delete'
import { useAuth } from '../../components/auth-context'
import SearchIcon from '@mui/icons-material/Search'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
const users = ['Иванов И.И.', 'Петров П.П.', 'Сидоров С.С.', 'Смирнов А.А.']

const imgbbKey = 'dfc6fdfece532c32d930e5d0a1561fbd'

const DataEntryPage = () => {
  const [page, setPage] = useState(0)
const [rowsPerPage, setRowsPerPage] = useState(50)
  const [formData, setFormData] = useState({
    date: '',
    customer: '',
    verifier: '',
    model: '',
    serial: '',
    year: '',
    maxD: '',
    registry: '',
    mp: '',
    location: '',
    certificate: '',
    photo1: null,
    photo2: null,
    photo1Url: '',
    photo2Url: '',
  })
  const [isUploadingImage, setIsUploadingImage] = useState(false)
const [photoDialog, setPhotoDialog] = useState({
url: null,
entryId: null,
field: null, // photo1Url или photo2Url
})
  const [entries, setEntries] = useState([])
  const [uploading, setUploading] = useState({ photo1: false, photo2: false })
  const [previewImage, setPreviewImage] = useState(null)
const [exporting, setExporting] = useState(false)
const isExportingRef = useRef(false)
  const fileInputs = {
    photo1: useRef(null),
    photo2: useRef(null),
  }
  const [searchQuery, setSearchQuery] = useState('')
const [searchSuggestions, setSearchSuggestions] = useState([])
const [searchResults, setSearchResults] = useState([])
const [isSearchActive, setIsSearchActive] = useState(false)
const [selectedRow, setSelectedRow] = useState(null)
const [selectedRows, setSelectedRows] = useState([]) // Для множественного выбора
const [showSelectedOnly, setShowSelectedOnly] = useState(false)
const [originalEntries, setOriginalEntries] = useState([]) // Для сохранения порядка
  
const [editingCell, setEditingCell] = useState({ id: null, field: null })
const [editedValue, setEditedValue] = useState('')

useEffect(() => {
fetchEntries()
fetchVerifiers()
}, [])
const { user } = useAuth()
const [verifiers, setVerifiers] = useState([])
const fetchVerifiers = async () => {
const res = await fetch('https://mern-vizitka.vercel.app/api/created-users')
const users = await res.json()
const usernames = users.map(u => u.username).slice(0, 4)
setVerifiers(usernames)
}

 const fetchEntries = async () => {
  const res = await fetch('https://mern-vizitka.vercel.app/api/entries')
  const data = await res.json()
  setEntries(data)
  setOriginalEntries(data) // Сохраняем оригинальный порядок
}
const handleSearch = (query) => {
  const trimmedQuery = query.trim()
  setSearchQuery(trimmedQuery)
  
  if (!trimmedQuery) {
    // Если запрос пустой, сразу сбрасываем все
    setSearchSuggestions([])
    setSearchResults([])
    setIsSearchActive(false)
    setEntries(originalEntries)
    setSelectedRows([])
    setShowSelectedOnly(false)
    return
  }

  const lowerQuery = trimmedQuery.toLowerCase()
  
  // Автодополнение по 3 полям
  const suggestions = []
  const fieldsToSearch = ['serial', 'model', 'customer']
  
  entries.forEach(entry => {
    fieldsToSearch.forEach(field => {
      const value = entry[field] || ''
      if (value.toLowerCase().includes(lowerQuery) && 
          !suggestions.some(s => s.value === value)) {
        suggestions.push({
          value,
          field,
          entryId: entry._id
        })
      }
    })
  })

  setSearchSuggestions(suggestions.slice(0, 10))

  // Поиск результатов
  const results = entries.filter(entry => {
    return fieldsToSearch.some(field => {
      const value = entry[field] || ''
      return value.toLowerCase().includes(lowerQuery)
    })
  })

  setSearchResults(results)
  setIsSearchActive(true)
}
const handleRowSelect = (entryId) => {
  setSelectedRows(prev => {
    if (prev.includes(entryId)) {
      // Снимаем выбор
      const newRows = prev.filter(id => id !== entryId);
      // Если сняли последний или текущий selectedRow, очищаем selectedRow
      if (newRows.length === 0 || selectedRow === entryId) {
        setSelectedRow(null);
      }
      return newRows;
    } else {
      // Добавляем выбор
      setSelectedRow(entryId);
      return [...prev, entryId];
    }
  });
};

// Выделить все на странице
const handleSelectAllOnPage = () => {
  const currentPageIds = entries
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .map(entry => entry._id)
  
  const allSelected = currentPageIds.every(id => selectedRows.includes(id))
  
  if (allSelected) {
    setSelectedRows(prev => prev.filter(id => !currentPageIds.includes(id)))
  } else {
    setSelectedRows(prev => [...new Set([...prev, ...currentPageIds])])
  }
}

// Показать только выбранные
const handleShowSelectedOnly = () => {
  if (showSelectedOnly) {
    if (isSearchActive) {
      setEditingCell({ id: null, field: null });
      setEntries(searchResults)
    } else {
      setEditingCell({ id: null, field: null });
      setEntries(originalEntries)
    }
  } else {
    const filtered = entries.filter(entry => selectedRows.includes(entry._id))
    setEditingCell({ id: null, field: null });
    setEntries(filtered)
  }
  setShowSelectedOnly(!showSelectedOnly)
  setPage(0)
}

// Клонирование выбранной записи
// Новый аргумент entryId
const handleCloneSelected = () => {
  if (!selectedRow) {
    alert('Выберите запись для клонирования');
    return;
  }

  // Отключить активное редактирование для предотвращения DOM-ошибок
  setEditingCell({ id: null, field: null });

  const entryToClone = entries.find(e => e._id === selectedRow);
  if (!entryToClone) return;

  setFormData({
    date: new Date().toISOString().split('T')[0],
    customer: entryToClone.customer,
    verifier: entryToClone.verifier,
    model: entryToClone.model,
    serial: entryToClone.serial,
    year: entryToClone.year,
    maxD: entryToClone.maxD,
    registry: entryToClone.registry,
    mp: entryToClone.mp,
    location: entryToClone.location,
    certificate: entryToClone.certificate,
    photo1: null,
    photo2: null,
    photo1Url: entryToClone.photo1Url,
    photo2Url: entryToClone.photo2Url,
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // ❗ УДАЛЯЕМ ПРОБЛЕМНЫЕ СТРОКИ
  // setSelectedRow(null);
  // setSelectedRows([]);
}


// Клонирование нескольких
// В handleCloneMultiple:
const handleCloneMultiple = () => {
  if (selectedRows.length === 0) {
    alert('Выберите записи для клонирования')
    return
  }
  
  // Берем ID первой выбранной записи
  const firstEntryId = selectedRows[0]; 

  if (selectedRows.length > 1) {
    const confirmClone = window.confirm(
      `Вы выбрали ${selectedRows.length} записей. Будет клонирована только первая. Продолжить?`
    )
    if (!confirmClone) return
  }

  // Вызываем обновленную функцию
  handleCloneSelected(firstEntryId); 
}

// Применить поиск
const applySearch = () => {
  if (searchQuery.trim()) {
    setEditingCell({ id: null, field: null });
    setEntries(searchResults)
    setPage(0)
  }
}

// Сбросить поиск
const resetSearch = () => {
  setIsSearchActive(false);
  setSearchSuggestions([]);
  setSearchResults([]);
  
  setEntries(originalEntries);
  setSelectedRows([]);
  setSelectedRow(null);
  setPage(0);
  setTimeout(() => {
    setSearchQuery('');
  }, 100);
};
const handleEditSave = async (id, field, value) => {
try {
const res = await fetch(`https://mern-vizitka.vercel.app/api/entries/${id}`, {
method: 'PATCH',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ [field]: value }),
})
if (!res.ok) throw new Error('Ошибка при сохранении')
const updated = await res.json()
setEntries((prev) =>
prev.map((e) => (e._id === id ? { ...e, [field]: value } : e))
)
} catch (err) {
alert('Ошибка при обновлении: ' + err.message)
} finally {
setEditingCell({ id: null, field: null })
setEditedValue('')
}
}
  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (files && files.length > 0) {
      const file = files[0]
      handlePhotoUpload(name, file)
      // сброс input после выбора
      if (fileInputs[name]?.current) fileInputs[name].current.value = null
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

const role = user?.role
const username = user?.username

const canEdit = (entry) => {
if (role === 'admin' || role === 'full') return true
if (role === 'limited') return entry.createdBy === username
return false
}
const canDelete = (entry) => {
if (role === 'admin' || role === 'full') return true
if (role === 'limited') return entry.createdBy === username
return false
}
const canAdd = role !== 'viewer'
const uploadToImageBan = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    // Используем только CLIENT_ID для гостевой загрузки
    const CLIENT_ID = 'up8cocz7bjwfMfsRdp8x';
    
    console.log('Отправка файла в ImageBan:', file.name, file.size);
    
    const response = await fetch('https://api.imageban.ru/v1', {
      method: 'POST',
      headers: {
        'Authorization': `TOKEN ${CLIENT_ID}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    console.log('Полный ответ ImageBan:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      // Пробуем получить больше информации об ошибке
      const errorMessages = {
        '100': 'Неверный Client Key',
        '101': 'Размер файла превышает 10MB',
        '102': 'Нет данных изображения',
        '103': 'Файл не является изображением',
        '104': 'Ошибка загрузки изображения',
        '105': 'Неверный Secret key',
        '106': 'Неверный URL изображения',
        '107': 'Ошибка при загрузке файла с URL',
        '108': 'Превышен суточный лимит для IP',
        '109': 'Превышен суточный лимит для аккаунта',
        '110': 'Нет данных для авторизации',
      };
      
      const errorCode = data?.error?.code || data?.code;
      const errorMessage = errorMessages[errorCode] || 
                          data?.error?.message || 
                          data?.message || 
                          'Неизвестная ошибка ImageBan';
      throw new Error(`ImageBan: ${errorMessage} (код: ${errorCode})`);
    }

    // Пробуем разные возможные пути к ссылке
    let imageUrl = null;
    
    // Вариант 1: data.data[0].link (старый формат)
    if (data.data && Array.isArray(data.data) && data.data[0]?.link) {
      imageUrl = data.data[0].link;
    }
    // Вариант 2: data.link (новый формат)
    else if (data.link) {
      imageUrl = data.link;
    }
    // Вариант 3: data.data.link
    else if (data.data?.link) {
      imageUrl = data.data.link;
    }
    // Вариант 4: data.image?.url
    else if (data.image?.url) {
      imageUrl = data.image.url;
    }
    // Вариант 5: data.url
    else if (data.url) {
      imageUrl = data.url;
    }

    if (!imageUrl) {
      console.error('ImageBan не вернул ссылку. Структура ответа:', data);
      throw new Error('ImageBan не вернул ссылку на изображение');
    }

    console.log('Успешная загрузка. Ссылка:', imageUrl);
    return imageUrl;
    
  } catch (error) {
    console.error('Ошибка загрузки в ImageBan:', error);
    throw error;
  }
};

const handlePhotoUpload = async (name, file) => {
  setUploading((prev) => ({ ...prev, [name]: true }));

  try {
    const url = await uploadToImageBan(file);
    const urlField = name === "photo1" ? "photo1Url" : "photo2Url";

    setFormData((prev) => ({
      ...prev,
      [name]: file,
      [urlField]: url,
    }));
  } catch (err) {
    alert("Ошибка загрузки фото: " + err.message);
  } finally {
    setUploading((prev) => ({ ...prev, [name]: false }));
  }
};

 const isFormValid = () => {
const required = [
'date', // Дата
'customer', // Заказчик/Владелец
'verifier', // Поверитель
'model', // Модель весов
'serial', // Зав. №
'year', // Год выпуска
'maxD', // Темп/влажность
'location' // Место поверки
]
return required.every((key) => formData[key])
}



 const handleSubmit = async () => {
try {
const payload = {
...formData,
createdBy: username
}


const res = await fetch('https://mern-vizitka.vercel.app/api/entries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})

if (!res.ok) throw new Error('Ошибка при сохранении')
const newEntry = await res.json()

// Обновление записей и проверка лимита
const updatedEntries = [newEntry, ...entries]
setEditingCell({ id: null, field: null });
setEntries(updatedEntries)

// Если больше 1500 — вызываем очистку старых
if (updatedEntries.length > 1500) {
  const cleanRes = await fetch('https://mern-vizitka.vercel.app/api/entries/old', {
    method: 'DELETE',
  })
  if (!cleanRes.ok) throw new Error('Ошибка при удалении старых записей')

  // После удаления — обновляем данные
  await fetchEntries()
}

// Сброс формы
setFormData({
  date: '',
  customer: '',
  verifier: '',
  model: '',
  serial: '',
  year: '',
  maxD: '',
  registry: '',
  mp: '',
  location: '',
  certificate: '',
  photo1: null,
  photo2: null,
  photo1Url: '',
  photo2Url: '',
})
} catch (err) {
alert('Ошибка при сохранении: ' + err.message)
}
}
const exportExcel=async()=>{
 const workbook = new ExcelJS.Workbook()
const sheet = workbook.addWorksheet('Поверки')

const headers = [
  '№', 'Дата', 'Заказчик/Владелец', 'Поверитель', 'Модель', 'Зав. №',
  'Год', 'Темп/Влажность', 'Реестр', 'МП', 'Место',
  'Свидетельство', 'Ссылка на фото1', 'Ссылка на фото2', 'Кто внес',
]

// Устанавливаем колонки
sheet.columns = headers.map(() => ({
  width: 15, // базовая ширина
  style: {
    alignment: { vertical: 'middle', horizontal: 'left', wrapText: true },
    font: { size: 11 }
  }
}))

// Заголовки
const headerRow = sheet.getRow(1)
headerRow.values = headers
headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } }
headerRow.height = 30
headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

// Цветной фон для заголовков
headerRow.eachCell((cell) => {
  cell.border = {
    top: { style: 'medium' },
    left: { style: 'medium' },
    right: { style: 'medium' },
    bottom: { style: 'medium' },
  }
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }, // Синий цвет как в Excel
  }
})

// Данные
entries.forEach((entry, i) => {
  const row = sheet.addRow([
    entries.length - i,
    entry.date,
    entry.customer,
    entry.verifier,
    entry.model,
    entry.serial,
    entry.year,
    entry.maxD,
    entry.registry,
    entry.mp,
    entry.location,
    entry.certificate,
    entry.photo1Url ? '📷 Фото1' : '',
    entry.photo2Url ? '📷 Фото2' : '',
    entry.createdBy
  ])

  row.height = 25

  row.eachCell((cell, colNumber) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' },
    }
    
    // Чередующийся фон строк
    if (i % 2 === 0) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' },
      }
    }
  })

  // Гиперссылки
  if (entry.photo1Url) {
    const cell = row.getCell(13)
    cell.value = {
      text: '📷 Открыть фото1',
      hyperlink: entry.photo1Url
    }
    cell.font = { color: { argb: 'FF0563C1' }, underline: true }
  }

  if (entry.photo2Url) {
    const cell = row.getCell(14)
    cell.value = {
      text: '📷 Открыть фото2',
      hyperlink: entry.photo2Url
    }
    cell.font = { color: { argb: 'FF0563C1' }, underline: true }
  }
})

// Автоподгонка ширины всех колонок
sheet.columns.forEach(column => {
  let maxLength = 0
  column.eachCell({ includeEmpty: true }, cell => {
    const cellValue = cell.value
    let cellLength = 0
    
    if (cellValue) {
      if (typeof cellValue === 'object' && cellValue.text) {
        cellLength = cellValue.text.length
      } else {
        cellLength = cellValue.toString().length
      }
    }
    
    if (cellLength > maxLength) {
      maxLength = cellLength
    }
  })
  
  // Устанавливаем ширину с небольшим запасом
  column.width = Math.min(Math.max(maxLength + 3, 10), 50)
})

// Фиксируем заголовки
sheet.views = [{ state: 'frozen', ySplit: 1 }]

const buffer = await workbook.xlsx.writeBuffer()
saveAs(new Blob([buffer]), `Поверки_${new Date().toLocaleDateString('ru-RU')}_${entries.length}_записей.xlsx`)


    
}
const handleExportWithImages = async () => {
  // Защита от повторных нажатий
  if (isExportingRef.current) return

  setExporting(true)
  isExportingRef.current = true

  try {
    // Даем React закончить все коммиты и отрендерить индикатор загрузки:
    // 1) сначала очередь микротасков, 2) затем frame (чтобы браузер успел применить DOM).
    await new Promise((res) => queueMicrotask(res))
    await new Promise((res) => requestAnimationFrame(() => res()))

    // Теперь запускаем экспорт и ЖДЕМ его полного завершения
    await exportExcel()
  } catch (err) {
    console.error('Ошибка экспорта:', err)
    // показываем понятное сообщение пользователю
    alert('Ошибка экспорта: ' + (err?.message || err))
  } finally {
    // снимаем блокировку только после полного завершения
    isExportingRef.current = false
    setExporting(false)
  }
}

const getUniqueOptions = (field) => {
  const values = entries.map((e) => e[field]).filter(Boolean)
  return [...new Set(values)]
}


  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 1, sm: 2, md: 4 } }}>
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
  <Typography variant="h5" fontWeight="bold">
    Ввод данных поверки
  </Typography>
  
  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
<Box sx={{ position: "relative", display: "inline-flex" }}>
  <Button
    variant="outlined"
    color="primary"
    onClick={handleExportWithImages}
    disabled={exporting}
  >
    {exporting ? 'Экспорт...' : 'Экспорт в Excel'}
  </Button>

  {exporting && (
    <CircularProgress
      size={24}
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: "-12px",
        marginLeft: "-12px",
      }}
    />
  )}
</Box>
    {selectedRows.length > 0 && (
      <div>
        <Tooltip title={`Клонировать выбранные (${selectedRows.length})`}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleCloneMultiple}
            startIcon={<ContentCopyIcon/>}
          >
            Клонировать ({selectedRows.length})
          </Button>
        </Tooltip>
        
        <FormControlLabel
          control={
            <Checkbox
              checked={showSelectedOnly}
              onChange={handleShowSelectedOnly}
            />
          }
          label="Только выбранные"
        />
      </div>
    )}
  </Box>
</Box>
<Box sx={{ mb: 3 }}>
 <Autocomplete
 
  freeSolo
  options={searchSuggestions}
  getOptionLabel={(option) => 
    typeof option === 'string' ? option : `${option.value}`
  }
  inputValue={searchQuery}
  onInputChange={(_, newValue) => {
    // Защита от слишком частых обновлений
    if (newValue !== searchQuery) {
      handleSearch(newValue)
    }
  }}
 onChange={(_, newValue) => {
    if (!newValue) return
    
    const searchValue = typeof newValue === 'string' ? newValue : newValue.value
    const lowerValue = searchValue.toLowerCase()
    
    const fieldsToSearch = ['serial', 'model', 'customer']
    const results = entries.filter(entry => {
      return fieldsToSearch.some(field => {
        const value = entry[field] || ''
        return value.toLowerCase().includes(lowerValue)
      })
    })
    
    // ИСПОЛЬЗУЙТЕ ОДИН ВЫЗОВ set state
    setSearchQuery(searchValue)
    setSearchResults(results)
    setIsSearchActive(true)
    // setEntries(results) // <--- Оставьте здесь, но помните о конфликте с originalEntries
    setPage(0)
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      placeholder="Поиск по Зав. №, Модели, Заказчику..."
      variant="outlined"
      fullWidth
      error={false}
      helperText=""
      InputProps={{
        ...params.InputProps,
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon/>
          </InputAdornment>
        ),
        endAdornment: (
          <div>
            {isSearchActive && (
              <InputAdornment position="end">
                <Chip
                  label={`Найдено: ${searchResults.length}`}
                  color="primary"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Tooltip title="Сбросить поиск">
                  <IconButton 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      resetSearch()
                    }} 
                    size="small"
                  >
                    <RestartAltIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            )}
            {params.InputProps.endAdornment}
          </div>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          transition: 'all 0.2s ease',
        }
      }}
    />
  )}
  renderOption={(props, option) => (
    <li {...props} key={`${option.value}-${option.field}`}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body2">{option.value}</Typography>
        <Typography variant="caption" color="text.secondary">
          {option.field === 'serial' ? 'Зав. №' : 
           option.field === 'model' ? 'Модель' : 'Заказчик'}
        </Typography>
      </Box>
    </li>
  )}
/>
  {isSearchActive && (
    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
      <Button
        variant="contained"
        size="small"
        onClick={applySearch}
      >
        Применить поиск
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={resetSearch}
        startIcon={<div>Рестарт</div>}
      >
        Сбросить
      </Button>
      <Typography variant="caption" color="text.secondary">
        {searchResults.length} записей найдено
      </Typography>
    </Box>
  )}
</Box>


      {/* === Форма === */}
      {canAdd && (<Box component="form" sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          {[
  { name: 'date', label: 'Дата', type: 'date', md: 2 },
  {
  name: 'customer',
  label: 'Заказчик/Владелец',
  md: 3,

  
},
  { name: 'verifier', label: 'Поверитель', md: 3, options: verifiers },
  {
    name: 'model',
    label: 'Модель весов',
    md: 3,
 
    
  },
  {
    name: 'serial',
    label: 'Зав. №',
    md: 2,
  
  
  },
  { name: 'year', label: 'Год выпуска', md: 2 },
  { name: 'maxD', label: 'Темп/Влажность', md: 3 },
  {
    name: 'registry',
    label: 'Реестр',
    md: 3,

 
  },
  {
    name: 'mp',
    label: 'МП',
    md: 3,

  
  },
  {
    name: 'location',
    label: 'Место поверки',
    md: 3,
  
  
  },
  { name: 'certificate', label: 'Свидетельство', md: 4 },
].map((field) => (
  <Grid key={field.name} item xs={12} minWidth={200} md={field.md}>
    {field.name === 'date' ? (
      <TextField
name="date"
label="Дата *"
type="date"
value={formData.date}
onChange={handleChange}
fullWidth
InputLabelProps={{ shrink: true }}
error={!formData.date}
helperText={!formData.date ? 'Обязательное поле' : ''}
sx={{
'& .MuiOutlinedInput-root': !formData.date
? {
'& fieldset': { borderColor: 'red !important' },
'&:hover fieldset': { borderColor: 'red' },
'&.Mui-focused fieldset': { borderColor: 'red' },
}
: {},
}}
/>
    ) : (
     <Autocomplete
   
  freeSolo={!field.options}
  options={field.options || getUniqueOptions(field.name)}
  value={formData[field.name] || ''}
  onInputChange={(_, newInput) => {
    const isValid = !field.pattern || field.pattern.test(newInput)
    setFormData((prev) => ({ ...prev, [field.name]: newInput }))
    if (!isValid) console.warn(`Валидация не прошла для ${field.name}: ${newInput}`)
  }}
  renderInput={(params) => {
const required = ['date', 'customer', 'verifier', 'model', 'serial', 'year', 'maxD', 'location']
const isRequired = required.includes(field.name)
const value = formData[field.name] || ''
const isEmpty = isRequired && value.trim() === ''
const showError = isEmpty

return (
<TextField
{...params}
label={isRequired ? `${field.label} *`: field.label}
fullWidth
error={showError}
helperText={showError ? 'Обязательное поле' : ''}
sx={{
'& .MuiOutlinedInput-root': showError
? {
'& fieldset': { borderColor: 'red !important' },
'&:hover fieldset': { borderColor: 'red' },
'&.Mui-focused fieldset': { borderColor: 'red' },
}
: {},
}}
/>
)
}
}

      />
    )}
  </Grid>
))}

          {['photo1', 'photo2'].map((name, i) => (
            <Grid key={name} item xs={12} md={4}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                disabled={uploading[name]}
              >
                {uploading[name]
                  ? `Фото ${i + 1} — Загрузка...`
                  : formData[`${name}Url`]
                    ? `Фото ${i + 1} — Загружено ✅`
                    : `Фото ${i + 1} (${i === 0 ? 'шильдик' : 'общий вид'})`}
                <input
                  ref={fileInputs[name]}
                  name={name}
                  type="file"
                  hidden
                  onChange={handleChange}
                />
              </Button>
            </Grid>
          ))}
        </Grid>

        <Box mt={3}>
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            disabled={!isFormValid()}
          >
            Сохранить запись
          </Button>
            {selectedRow && (
  <Button
    variant="outlined"
    color="info"
    onClick={handleCloneSelected}
    startIcon={<ContentCopyIcon/>}
    sx={{ ml: 2 }}
  >
    Редактировать клон
  </Button>
)}
        </Box>
      
      </Box>)}
      {selectedRows.length > 0 && (
  <Box sx={{ mb: 2, p: 1, bgcolor: 'info.light', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
    <Typography variant="body2">
      Выбрано записей: <strong>{selectedRows.length}</strong>
    </Typography>
    <Button
      size="small"
      onClick={() => setSelectedRows([])}
    >
      Снять выделение
    </Button>
  </Box>
)}

      {/* === Таблица === */}
      <Box sx={{ overflowX: 'auto', maxHeight: '80vh' }}>
        <Paper elevation={2} sx={{ minWidth: 1000 }}>
          <Table
            size="small"
            stickyHeader
            sx={{
              tableLayout: 'fixed',
              '& th, & td': {
                padding: '6px',
                fontSize: '0.85rem',
                wordBreak: 'break-word',
                whiteSpace: 'pre-line',
                textAlign: 'center',
                verticalAlign: 'middle',
              },
            }}
          >
            <TableHead sx={{ bgcolor: '#f9f9f9', position: 'sticky', top: 0, zIndex: 1 }}>
  <TableRow>
    <TableCell padding="checkbox" sx={{ borderRight: '1px solid #ddd' }}>
      <Checkbox
        checked={entries
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .every(entry => selectedRows.includes(entry._id))}
        indeterminate={
          entries
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .some(entry => selectedRows.includes(entry._id)) &&
          !entries
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .every(entry => selectedRows.includes(entry._id))
        }
        onChange={handleSelectAllOnPage}
      />
    </TableCell>
    
    {/* Заголовки таблицы */}
    {[
      '№', 'Дата','Заказчик/Владелец', 'Поверитель', 'Модель', 'Зав. №',
      'Год', 'Темп/Влажность', 'Реестр', 'МП', 'Место',
      'Свидетельство', 'Фото1', 'Фото2', 'Кто внес'
    ].map((head, idx) => (
      <TableCell key={`header-${idx}`} sx={{ fontWeight: 'bold', borderRight: '1px solid #ddd' }}>
        {head}
      </TableCell>
    ))}
    
    {/* Ячейка для иконки удаления */}
    <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #ddd' }}>
      🗑
    </TableCell>
  </TableRow>
</TableHead>
        <TableBody>
  {entries
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .map((entry, index) => (
      <TableRow 
        key={entry._id}
        hover
        selected={selectedRows.includes(entry._id)}
        sx={{
          backgroundColor: selectedRows.includes(entry._id) ? '#e3f2fd' : 'inherit',
          '&:hover': {
            backgroundColor: selectedRows.includes(entry._id) ? '#bbdefb' : '#f5f5f5',
          },
        }}
      >
        {/* Колонка с чекбоксом для выбора */}
        <TableCell padding="checkbox">
          <Checkbox
          key={entry._id}
            checked={selectedRows.includes(entry._id)}
            onChange={() => handleRowSelect(entry._id)}
          />
        </TableCell>
        
        <TableCell>{entries.length - index}</TableCell>

        {[
          'date',
          'customer',
          'verifier',
          'model',
          'serial',
          'year',
          'maxD',
          'registry',
          'mp',
          'location',
          'certificate',
        ].map((field, index) => (
          <TableCell
            key={field}
           onClick={() => {
  if (isExportingRef.current) return
  if (!canEdit(entry)) return
  setEditingCell({ id: entry._id, field })
  setEditedValue(entry[field] ?? '')
}}
            sx={{
              cursor: canEdit(entry) ? 'pointer' : 'default',
              backgroundColor:
                editingCell.id === entry._id && editingCell.field === field 
                  ? '#e6f2ff' 
                  : 'inherit',
            }}
          >
            {editingCell.id === entry._id && editingCell.field === field ? (
              <TextField
                value={editedValue}
                variant="standard"
                autoFocus
                fullWidth
                onChange={(e) => setEditedValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleEditSave(entry._id, field, editedValue)
                  } else if (e.key === 'Escape') {
                    setEditingCell({ id: null, field: null })
                    setEditedValue('')
                  }
                }}
                onBlur={() => {
                  setEditingCell({ id: null, field: null })
                  setEditedValue('')
                }}
              />
            ) : (
              entry[field]
            )}
          </TableCell>
        ))}

        {[entry.photo1Url, entry.photo2Url].map((url, i) => {
          const field = i === 0 ? 'photo1Url' : 'photo2Url'
          return (
            <TableCell key={field}>
              {url && (
                <img
                  src={url}
                  alt={`Фото ${i + 1}`}
                  style={{ 
                    width: 60, 
                    cursor: 'pointer', 
                    borderRadius: 4,
                    backgroundColor: '#f5f5f5'
                  }}
                  loading="lazy"
                  onClick={() => {
                    setPhotoDialog({ url, entryId: entry._id, field })
                  }}
                />
              )}
            </TableCell>
          )
        })}
        
        <TableCell>{entry.createdBy}</TableCell>
        
        <TableCell>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Кнопка клонирования */}
            <Tooltip title="Клонировать запись">
            
<IconButton
  size="small"
  color="primary"
  onClick={() => {
    if (isExportingRef.current) return
    
    // ❌ УДАЛИТЬ: handleRowSelect(entry._id) 
    // ❌ УДАЛИТЬ: setSelectedRow(entry._id)

    // Вызываем клонирование напрямую с ID
    queueMicrotask(() => {
      if (!isExportingRef.current) handleCloneSelected(entry._id) // Передаем ID
    })
  }}
>
  <ContentCopyIcon/>
</IconButton>
            </Tooltip>
            
            {/* Кнопка удаления */}
            {canDelete(entry) && (
              <Tooltip title="Удалить запись">
                <IconButton
                  size="small"
                  color="error"
                  onClick={async () => {
                    const confirmed = window.confirm('Вы уверены, что хотите удалить эту запись?')
                    if (!confirmed) return

                    try {
                      const res = await fetch(`https://mern-vizitka.vercel.app/api/entries/${entry._id}`, {
                        method: 'DELETE',
                      })

                      if (!res.ok) throw new Error('Ошибка удаления')
                      setEntries((prev) => prev.filter((e) => e._id !== entry._id))
                      setOriginalEntries((prev) => prev.filter((e) => e._id !== entry._id))
                    } catch (err) {
                      alert('Ошибка при удалении: ' + err.message)
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </TableCell>
      </TableRow>
    ))}
</TableBody>
          </Table>
        </Paper>
       
      </Box>
 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
  <Typography variant="body2" color="text.secondary">
    Всего записей: {entries.length}
    {isSearchActive && ` (найдено: ${searchResults.length})`}
    {selectedRows.length > 0 && ` (выбрано: ${selectedRows.length})`}
  </Typography>
  
  <Pagination 
    count={Math.ceil(entries.length / rowsPerPage)}
    page={page + 1}
    onChange={(e, value) => setPage(value - 1)}
  />
</Box>
      {/* Просмотр фото */}
      <Dialog open={!!photoDialog.url} onClose={() => setPhotoDialog({ url: null, entryId: null, field: null })} maxWidth="md" > <DialogContent sx={{ position: 'relative' }}> <IconButton onClick={() => setPhotoDialog({ url: null, entryId: null, field: null })} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }} > <CloseIcon /> </IconButton>

<Box sx={{ minHeight: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 2 }}>
  {isUploadingImage ? (
    <CircularProgress />
  ) : (
    photoDialog.url && (
      <img
        src={photoDialog.url}
        alt="Фото"
        style={{ width: '100%', height: 'auto' }}
      />
    )
  )}
</Box>

<Button
  variant="contained"
  component="label"
  fullWidth
  color="primary"
  disabled={isUploadingImage}
>
  {isUploadingImage ? 'Загрузка...' : 'Заменить фото'}
  <input
    type="file"
    accept="image/*"
    hidden
    onChange={async (e) => {
      const file = e.target.files[0]
      if (!file || !photoDialog.field || !photoDialog.entryId) return

      const entry = entries.find((e) => e._id === photoDialog.entryId)
      if (!canEdit(entry)) {
        alert('Недостаточно прав для замены фото.')
        return
      }

      // Проверка размера файла
      if (file.size > 10 * 1024 * 1024) {
        alert('Файл слишком большой. Максимальный размер: 10MB')
        e.target.value = null
        return
      }

      // Проверка типа файла
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Неподдерживаемый формат файла. Используйте JPG, PNG, GIF или WebP')
        e.target.value = null
        return
      }

      setIsUploadingImage(true)

      try {
        // Используем ту же функцию uploadToImageBan
        const newUrl = await uploadToImageBan(file)

        console.log('Изображение загружено в ImageBan:', newUrl)

        // Обновляем запись в базе данных
        const updateResponse = await fetch(`https://mern-vizitka.vercel.app/api/entries/${photoDialog.entryId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [photoDialog.field]: newUrl }),
        })

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json()
          throw new Error(`Ошибка обновления записи: ${errorData.message || 'Неизвестная ошибка'}`)
        }

        // Обновляем состояние в интерфейсе
        setEntries((prev) =>
          prev.map((entry) =>
            entry._id === photoDialog.entryId
              ? { ...entry, [photoDialog.field]: newUrl }
              : entry
          )
        )

        // Обновляем диалоговое окно
        setPhotoDialog((prev) => ({
          ...prev,
          url: newUrl,
        }))

        alert('Фото успешно заменено!')
        
      } catch (err) {
        console.error('Ошибка при замене фото:', err)
        
        // Более информативные сообщения об ошибках
        let errorMessage = 'Ошибка при загрузке изображения'
        
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Проблема с интернет-соединением'
        } else if (err.message.includes('101')) {
          errorMessage = 'Файл слишком большой (максимум 10MB)'
        } else if (err.message.includes('103')) {
          errorMessage = 'Файл должен быть изображением (JPG, PNG, GIF)'
        } else if (err.message.includes('108')) {
          errorMessage = 'Превышен суточный лимит загрузок'
        } else {
          errorMessage = err.message
        }
        
        alert(errorMessage)
      } finally {
        // Сбрасываем значение input, чтобы можно было выбрать тот же файл снова
        e.target.value = null
        setIsUploadingImage(false)
      }
    }}
  />
</Button>
</DialogContent> </Dialog>
    </Container>
  )
}

export default DataEntryPage
