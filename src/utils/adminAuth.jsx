const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'gran2024' // заказчик сможет поменять
}

export const verifyAdmin = (username, password) => {
  return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password
}

export const isAdminAuthenticated = () => {
  return localStorage.getItem('adminAuth') === 'true'
}

export const setAdminAuth = (authenticated) => {
  if (authenticated) {
    localStorage.setItem('adminAuth', 'true')
  } else {
    localStorage.removeItem('adminAuth')
  }
}