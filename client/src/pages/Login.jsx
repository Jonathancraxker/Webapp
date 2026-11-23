import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, sendFrontendLog } from '../services/api';
import './Login.css';

export default function Login({ health, onLoginSuccess }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.login(correo, password);
      const userData = res.data.usuario;
      onLoginSuccess(userData);
      await sendFrontendLog({
        level: 'INFO',
        action: 'LOGIN_SUCCESS',
        page: '/login',
        details: { correo: userData.correo }
      });
      navigate('/noticias-feed');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-masthead">
          <h1>
            <span>DORIGA-NEWS</span>
          </h1>
          <p>Sala de Redacción · Versión {health?.version || '1.1.1'}</p>
        </div>

        <h2 className="auth-title">Iniciar Sesión</h2>

        {error && (
          <div className="alert-banner error" data-testid="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="login-email">Correo institucional</label>
            <input
              id="login-email"
              data-testid="login-email"
              type="email"
              placeholder="admin@uteq.edu.mx"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              data-testid="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn" data-testid="login-submit">
            Iniciar sesión
          </button>
        </form>

        <div className="auth-footer">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/register" data-testid="go-to-register">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}