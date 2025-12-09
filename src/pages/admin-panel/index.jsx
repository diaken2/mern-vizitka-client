import { useState, useEffect } from 'react'
import {
TextField,
Button,
MenuItem,
Typography,
Container,
Box,
Paper,
List,
ListItem,
ListItemText,
IconButton,
Divider,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

const roles = ['viewer', 'limited', 'full']

const AdminPage = () => {
const [form, setForm] = useState({ username: '', password: '', role: 'viewer' })
const [users, setUsers] = useState([])

const fetchUsers = async () => {
try {
const res = await fetch('https://mern-vizitka.vercel.app/api/created-users')
const data = await res.json()
setUsers(data)
} catch (err) {
alert('Ошибка загрузки пользователей')
}
}

useEffect(() => {
fetchUsers()
}, [])

const handleChange = (e) => {
const { name, value } = e.target
setForm(prev => ({ ...prev, [name]: value }))
}

const handleSubmit = async () => {
const res = await fetch('https://mern-vizitka.vercel.app/api/create-users', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(form),
})


const data = await res.json()
if (!res.ok) return alert('Ошибка: ' + data.error)
alert('Пользователь создан!')
setForm({ username: '', password: '', role: 'viewer' })
fetchUsers()
}

const handleDelete = async (id) => {
if (!window.confirm('Удалить пользователя?')) return


const res = await fetch(`https://mern-vizitka.vercel.app/api/created-users/${id}`, {
  method: 'DELETE'
})

const data = await res.json()
if (!res.ok) return alert('Ошибка удаления: ' + data.error)
fetchUsers()
}

return (
<Container maxWidth="sm" sx={{ mt: 4 }}>
<Typography variant="h6" gutterBottom>Создание пользователя</Typography>
<TextField name="username" label="Логин" fullWidth margin="normal" value={form.username} onChange={handleChange} />
<TextField name="password" label="Пароль" type="password" fullWidth margin="normal" value={form.password} onChange={handleChange} />
<TextField name="role" label="Роль" select fullWidth margin="normal" value={form.role} onChange={handleChange} >
{roles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
</TextField>
<Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>Создать</Button>


  <Divider sx={{ my: 4 }} />

  <Typography variant="h6" gutterBottom>Список пользователей</Typography>
  <Paper>
    <List dense>
      {users.map(user => (
        <ListItem
          key={user._id}
          secondaryAction={
            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(user._id)}>
              <DeleteIcon />
            </IconButton>
          }
        >
          <ListItemText
            primary={user.username}
            secondary={`Роль: ${user.role}`}
          />
        </ListItem>
      ))}
    </List>
  </Paper>
</Container>
)
}

export default AdminPage