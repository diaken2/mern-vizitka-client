// hooks/useSectionsOrder.js
import { useEffect } from 'react'
import { useContent } from '../components/admin-auth-page-context'
import { useDragDrop } from '../drag-drop-context/DragDropContext'


export const useSectionsOrder = () => {
  const { content } = useContent()
  const { sectionsOrder, updateSectionsOrder } = useDragDrop()

  useEffect(() => {
    if (content && Object.keys(content).length > 0) {
      const dynamicSections = Object.keys(content).filter(
        section => !['hero', 'header', 'navbar'].includes(section)
      )
      
      // Всегда обновляем порядок при изменении контента
      if (dynamicSections.length > 0) {
        console.log('Initializing sections order:', dynamicSections)
        updateSectionsOrder(dynamicSections)
      }
    }
  }, [content, updateSectionsOrder])

  return { sectionsOrder }
}