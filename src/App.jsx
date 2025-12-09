// App.jsx
import RouterComponent from './components/router-component';
import { AuthProvider } from './components/auth-context';
import Header from "./components/header/Header";
import { useLocation } from 'react-router-dom';
import NavBar from './components/navbar/Navbar';
import { ContentProvider } from './components/admin-auth-page-context';
import { DragDropProvider } from './drag-drop-context/DragDropContext';


function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  return (
    <ContentProvider>
    <DragDropProvider>
      
        <AuthProvider>
          {!isLoginPage && <Header />}
          <NavBar/>
          <RouterComponent />
        </AuthProvider>
      
    </DragDropProvider>
    </ContentProvider>
  );
}

export default App;