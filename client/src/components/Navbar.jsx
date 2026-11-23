import { NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ user, health, onLogout }) {
  const fechaHoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="news-header">
      <div className="news-topbar">
        <div>
          <span className="breaking-pill">En Vivo</span>
          <span>Edición Querétaro · {fechaHoy}</span>
        </div>
        <div className="health-pill" data-testid="api-version-badge">
          {health?.service || 'Doriga_News App'} · v{health?.version || '1.1.1'}
        </div>
      </div>

      <div className="news-masthead">
        <div>
          <h1 className="masthead-title">
            DORIGA<span>NEWS</span>
          </h1>
          <p className="masthead-sub">Sistema Editorial de Noticias & Gestión de Redacción</p>
        </div>
      </div>

      <nav className="news-nav">
        <div className="nav-links">
          <NavLink
            to="/noticias-feed"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            data-testid="nav-noticias-feed"
          >
            Ver Noticias
          </NavLink>
          <NavLink
            to="/noticias"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            data-testid="nav-noticias"
          >
            Publicación de Noticias
          </NavLink>
          <NavLink
            to="/usuarios"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            data-testid="nav-usuarios"
          >
            Equipo Editorial (Usuarios)
          </NavLink>
        </div>

        <div className="user-controls">
          <span data-testid="logged-user-info">
            Redactor: <strong>{user?.nombre}</strong> ({user?.rol})
          </span>
          <button
            type="button"
            className="btn-logout"
            data-testid="logout-button"
            onClick={onLogout}
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>
    </header>
  );
}