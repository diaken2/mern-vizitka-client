// contexts/ContentContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'

const ContentContext = createContext()

export const useContent = () => {
  const context = useContext(ContentContext)
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider')
  }
  return context
}

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  // Значения по умолчанию
  const defaultContent = {
    hero: {
      title: 'Поверка, калибровка, настройка, ремонт, обслуживание весов',
      subtitle: 'Проведем поверку весов от 2 кг до 150 тонн с выездом на место',
      imageUrl: ''
    },
    header: {
      phone: '+7 953 8702552',
      email: 'grannsk@bk.ru',
      address1: 'Новосибирск п. Восход, ул. Долинная 2Г',
      address2: 'Новосибирск, Советское шоссе 12 к 1',
      logoUrl: ''
    },
    navbar: {
      items: ['ПОВЕРКА', 'ВЕСОВ', 'ВСЕХ', 'ТИПОВ']
    }
  }

  const fetchContent = async (page = 'home') => {
    try {
      setLoading(true)
      console.log('Fetching content...')
      
      const response = await fetch(`/api/content/${page}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('No content found, using defaults')
          setContent(defaultContent)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Content fetched:', data)
      
      // Объединяем с дефолтными значениями
      const mergedContent = { ...defaultContent, ...data }
      setContent(mergedContent)
      
    } catch (error) {
      console.error('Error fetching content, using defaults:', error)
      setContent(defaultContent)
    } finally {
      setLoading(false)
    }
  }

  const updateContent = async (page, section, newData) => {
    try {
      console.log(`Updating ${page}/${section}:`, newData)
      
      const response = await fetch(`/api/content/${page}/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedContent = await response.json()
      console.log('Update successful:', updatedContent)
      
      // Обновляем локальное состояние
      setContent(prev => ({
        ...prev,
        [section]: newData
      }))
      
      return updatedContent
    } catch (error) {
      console.error('Error updating content:', error)
      throw error
    }
  }

  // НОВАЯ ФУНКЦИЯ: Добавление новой секции
  const addSection = async (page, section, sectionData) => {
    try {
      console.log(`Adding new section ${section} to ${page}:`, sectionData)
      
      const response = await fetch(`/api/content/${page}/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sectionData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const newContent = await response.json()
      console.log('Section added successfully:', newContent)
      
      // Добавляем новую секцию в локальное состояние
      setContent(prev => ({
        ...prev,
        [section]: sectionData
      }))
      
      return newContent
    } catch (error) {
      console.error('Error adding section:', error)
      throw error
    }
  }

  // НОВАЯ ФУНКЦИЯ: Удаление секции
  const deleteSection = async (page, section) => {
    try {
      console.log(`Deleting section ${section} from ${page}`)
      
      const response = await fetch(`/api/content/${page}/${section}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Section deleted successfully:', result)
      
      // Удаляем секцию из локального состояния
      setContent(prev => {
        const newContent = { ...prev }
        delete newContent[section]
        return newContent
      })
      
      return result
    } catch (error) {
      console.error('Error deleting section:', error)
      throw error
    }
  }

  // const uploadImage = async (file) => {
  //   try {
  //     const formData = new FormData()
  //     formData.append('image', file)

  //     const response = await fetch('/api/upload-image', {
  //       method: 'POST',
  //       body: formData,
  //     })

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`)
  //     }

  //     const data = await response.json()
  //     return data.url
  //   } catch (error) {
  //     console.error('Error uploading image:', error)
  //     throw error
  //   }
  // }
const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    // Опционально: можно добавить имя файла
    // formData.append('name', file.name || 'image');
    
    const CLIENT_ID = 'up8cocz7bjwfMfsRdp8x';
    
    const response = await fetch('https://api.imageban.ru/v1', {
      method: 'POST',
      headers: {
        'Authorization': `TOKEN ${CLIENT_ID}`,
      },
      body: formData,
    });

    const result = await response.json();
    
    console.log('ImageBan API Full Response:', result);
    
    // Проверяем наличие success поля
    if (result.success !== true) {
      throw new Error(result.error?.message || 'Upload failed');
    }
    
    // Проверяем различные возможные структуры ответа
    let imageUrl = null;
    
    // Вариант 1: data[0].link
    if (result.data && Array.isArray(result.data) && result.data[0]) {
      imageUrl = result.data[0].link || result.data[0].short_link;
    }
    // Вариант 2: прямая ссылка в корне
    else if (result.link) {
      imageUrl = result.link;
    }
    // Вариант 3: попробуем найти любую ссылку в ответе
    else {
      // Рекурсивно ищем ссылку в объекте
      const findLinkInObject = (obj) => {
        for (let key in obj) {
          if (typeof obj[key] === 'string' && obj[key].startsWith('http')) {
            return obj[key];
          }
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            const found = findLinkInObject(obj[key]);
            if (found) return found;
          }
        }
        return null;
      };
      
      imageUrl = findLinkInObject(result);
    }
    
    if (!imageUrl) {
      console.error('No image URL found in response:', result);
      throw new Error('No image URL received from server');
    }
    
    return imageUrl;
    
  } catch (error) {
    console.error('Error uploading image to ImageBan:', error);
    
    // Перебрасываем ошибку с понятным сообщением
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw error;
  }
};

  // Загружаем контент при монтировании
  useEffect(() => {
    fetchContent('home')
  }, [])

  const getContent = () => {
    return content || defaultContent
  }

  const value = {
    content: getContent(),
    loading,
    fetchContent,
    updateContent,
    addSection, // Добавляем новую функцию
    deleteSection, // Добавляем функцию удаления
    uploadImage
  }

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  )
}