// pages/AdminPanel.jsx
import React, { useState } from 'react'
import {
  Box,
  Tabs,
  Tab,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack
} from '@mui/material'

import { useNavigate } from 'react-router-dom'




import { setAdminAuth } from '../../utils/adminAuth'
import { useContent } from '../../components/admin-auth-page-context'
import HeroEditor from '../../components/editors/HeroEditor'
import NavbarEditor from '../../components/editors/NavBarEditor'
import DynamicSectionEditor from '../../components/editors/DynamicSectionEditor'
import HeaderEditor from '../../components/editors/HeaderEditor'
import AddSectionEditor from '../../components/editors/AddSectionEditor'
import { useDragDrop } from '../../drag-drop-context/DragDropContext'


const TabPanel = ({ children, value, index, ...other }) => (
  <div hidden={value !== index} {...other}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
)

const AdminPanel = () => {
     const { addSection } = useContent()
  const { updateSectionsOrder } = useDragDrop()
  const [currentTab, setCurrentTab] = useState(0)
  const navigate = useNavigate()
  const { content } = useContent()

  const handleLogout = () => {
    setAdminAuth(false)
    navigate('/')
  }

  // Получаем все секции кроме основных
  const dynamicSections = Object.keys(content).filter(
    section => !['hero', 'header', 'navbar'].includes(section)
  )

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Панель управления сайтом
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Выйти
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
          <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
            <Tab label="Hero секция" />
            <Tab label="Шапка сайта" />
            <Tab label="Навигация" />
            <Tab label="Дополнительные секции" />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <HeroEditor />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <HeaderEditor/>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <NavbarEditor />
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <Stack spacing={3}>
            <Typography variant="h5">Управление дополнительными секциями</Typography>
            
            <AddSectionEditor />

            {dynamicSections.length > 0 ? (
              dynamicSections.map(section => (
                <DynamicSectionEditor
                  key={section} 
                  sectionName={section} 
                  sectionData={content[section]} 
                />
              ))
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Нет дополнительных секций. Добавьте первую секцию с помощью формы выше.
              </Typography>
            )}
          </Stack>
        </TabPanel>
      </Container>
    </Box>
  )
}

export default AdminPanel