// components/dnd/DraggableSection.jsx
import React, { useRef, useState, useEffect } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { Box, Paper, Typography } from '@mui/material'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'

// Встроенный хук для DraggableSection
const useAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setIsAdmin(parsedUser.role === 'admin');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  return { isAdmin };
};

const DraggableSection = ({ id, index, moveSection, children }) => {
  const ref = useRef(null)
  const { isAdmin } = useAuth()

  const [{ isDragging }, drag] = useDrag({
    type: 'section',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isAdmin,
  })

  const [, drop] = useDrop({
    accept: 'section',
    hover: (item) => {
      if (!isAdmin || item.index === index) return
      moveSection(item.index, index)
      item.index = index
    },
  })

  drag(drop(ref))

  return (
    <Box
      ref={ref}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isAdmin ? (isDragging ? 'grabbing' : 'grab') : 'default',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.2s ease',
      }}
    >
      <Paper
        elevation={isDragging ? 8 : 2}
        sx={{
          p: 3,
          position: 'relative',
          border: isAdmin ? '2px solid' : 'none',
          borderColor: isDragging ? 'primary.main' : 'transparent',
          backgroundColor: isDragging ? 'action.hover' : 'background.paper',
        }}
      >
        {isAdmin && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'text.secondary',
            }}
          >
            <DragIndicatorIcon />
          </Box>
        )}
        {children}
        {isAdmin && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #ddd' }}>
            <Typography variant="body2" color="text.secondary">
              Позиция: {index + 1} | ID: {id}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default DraggableSection