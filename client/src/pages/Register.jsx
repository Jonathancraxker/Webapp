import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, sendFrontendLog } from '../services/api';
import './Register.css';

export default function Register({ health }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('editor');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.register({ nombre, correo, password, rol });
      setSuccess('Cuenta creada con éxito. Redirigiendo al inicio de sesión...');
      await sendFrontendLog({
        level: 'INFO',
        action: 'REGISTER_SUCCESS',
        page: '/register',
        details: { correo, rol }
      });
      setTimeout(() => navigate('/login'), 1200);
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
          <p>Alta de Periodistas · v{health?.version || '1.1.1'}</p>
        </div>

        {error && (
          <div className="alert-banner error" data-testid="register-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert-banner success" data-testid="register-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="reg-nombre">Nombre completo</label>
            <input
              id="reg-nombre"
              data-testid="register-nombre"
              type="text"
              placeholder="Ej. Jonathan Cruz"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-correo">Correo electrónico</label>
            <input
              id="reg-correo"
              data-testid="register-correo"
              type="email"
              placeholder="redactor@uteq.edu.mx"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-password">Contraseña</label>
            <input
              id="reg-password"
              data-testid="register-password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-rol">Cargo Editorial</label>
            <select
              id="reg-rol"
              data-testid="register-rol"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option value="editor">Reportero</option>
              <option value="admin">(Admin)</option>
            </select>
          </div>

          <button type="submit" className="auth-btn" data-testid="register-submit">
            Crear Cuenta
          </button>
        </form>

        <div className="auth-footer">
          ¿Ya tienes cuenta registrada?{' '}
          <Link to="/login" data-testid="go-to-login">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}