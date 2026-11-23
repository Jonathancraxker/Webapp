import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api, sendFrontendLog } from './services/api';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import NoticiasPage from './pages/NoticiasPage';
import UsuariosPage from './pages/UsuariosPage';
import NoticiasFeed from './pages/NoticiasFeed';
import './App.css';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('doriga_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.getHealth()
      .then((data) => setHealth(data))
      .catch(() => setHealth(null));
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('doriga_user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    await sendFrontendLog({
      level: 'INFO',
      action: 'USER_LOGOUT',
      page: window.location.pathname,
      details: { correo: user?.correo }
    });
    localStorage.removeItem('doriga_user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      {user && <Navbar user={user} health={health} onLogout={handleLogout} />}

      <Routes>
        <Route
          path="/noticias-feed"
          element={<NoticiasFeed user={user} health={health} />}
        />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/noticias" replace />
            ) : (
              <Login health={health} onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to="/noticias" replace />
            ) : (
              <Register health={health} />
            )
          }
        />
        <Route
          path="/noticias"
          element={
            user ? <NoticiasPage user={user} /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/usuarios"
          element={
            user ? <UsuariosPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="*"
          element={<Navigate to={user ? '/noticias' : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}