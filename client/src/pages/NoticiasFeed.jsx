import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api, sendFrontendLog } from '../services/api';
import './NoticiasFeed.css';

export default function NoticiasFeed({ user, health }) {
  const [noticias, setNoticias] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [authorFilter, setAuthorFilter] = useState('ALL');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const res = await api.getNoticias();
        setNoticias(res.data || []);
        await sendFrontendLog({
          level: 'INFO',
          action: 'VIEW_PUBLIC_FEED',
          page: '/noticias-feed',
          details: { totalNoticias: (res.data || []).length }
        });
      } catch (err) {
        setError(err.message);
      }
    };
    loadFeed();
  }, []);

  const autoresDisponibles = useMemo(() => {
    const map = new Map();
    noticias.forEach((n) => {
      if (n.Usuario) {
        map.set(String(n.Usuario.id), n.Usuario.nombre);
      }
    });
    return Array.from(map.entries());
  }, [noticias]);

  const noticiasFiltradas = useMemo(() => {
    return noticias.filter((n) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesText =
        !term ||
        n.titulo.toLowerCase().includes(term) ||
        n.contenido.toLowerCase().includes(term);
      const matchesAuthor =
        authorFilter === 'ALL' || String(n.usuarioId) === authorFilter;
      return matchesText && matchesAuthor;
    });
  }, [noticias, searchTerm, authorFilter]);

  const handleOpenArticle = async (noticia) => {
    setSelectedArticle(noticia);
    await sendFrontendLog({
      level: 'INFO',
      action: 'READ_ARTICLE',
      page: '/noticias-feed',
      details: { noticiaId: noticia.id, titulo: noticia.titulo }
    });
  };

  const formatFecha = (isoString) => {
    if (!isoString) return 'Edición de hoy';
    return new Date(isoString).toLocaleString('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const notaPrincipal = noticiasFiltradas[0] || null;
  const notasSecundarias = noticiasFiltradas.slice(1);

  return (
    <div>
      {/* Encabezado público si el visitante aún no inicia sesión */}
      {!user && (
        <header className="public-masthead">
          <div>
            <Link to="/noticias-feed" className="public-masthead-brand">
              DORIGA<span>NEWS</span>
            </Link>
            <div style={{ fontSize: '0.78rem', color: 'var(--news-muted)' }}>
              Portal Público de Noticias · v{health?.version || '1.1.1'}
            </div>
          </div>
          <Link to="/login" className="btn-staff-login" data-testid="public-login-link">
            Acceso Redacción
          </Link>
        </header>
      )}

      <main className="feed-wrapper">
        {error && (
          <div className="alert-banner error" data-testid="feed-error">
            {error}
          </div>
        )}

        {/* Barra de búsqueda y filtro por redactor */}
        <section className="feed-toolbar">
          <div className="feed-search-group">
            <input
              type="text"
              className="feed-search-input"
              data-testid="feed-search"
              placeholder="Buscar noticias por titular o palabra clave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className="feed-filter-select"
              data-testid="feed-author-filter"
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
            >
              <option value="ALL">Todos los redactores</option>
              {autoresDisponibles.map(([id, nombre]) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>

          <span className="feed-counter" data-testid="feed-count">
            {noticiasFiltradas.length} {noticiasFiltradas.length === 1 ? 'publicación' : 'publicaciones'}
          </span>
        </section>

        {noticiasFiltradas.length === 0 ? (
          <div className="empty-feed-box" data-testid="empty-feed">
            No se encontraron noticias que coincidan con tu búsqueda.
          </div>
        ) : (
          <>
            {/* NOTA DE PRIMERA PLANA (DESTACADA) */}
            {notaPrincipal && (
              <article className="hero-article" data-testid="hero-noticia">
                <span className="hero-badge">Primera Plana · Nota Destacada</span>
                <h1 className="hero-headline">{notaPrincipal.titulo}</h1>
                <p className="hero-excerpt">{notaPrincipal.contenido}</p>

                <div className="hero-footer">
                  <div className="article-byline">
                    Por <strong>{notaPrincipal.Usuario?.nombre || `Redactor #${notaPrincipal.usuarioId}`}</strong> ·{' '}
                    {formatFecha(notaPrincipal.createdAt)}
                  </div>
                  <button
                    type="button"
                    className="btn-read-more"
                    data-testid={`read-noticia-btn-${notaPrincipal.id}`}
                    onClick={() => handleOpenArticle(notaPrincipal)}
                  >
                    Leer nota completa
                  </button>
                </div>
              </article>
            )}

            {/* CUADRÍCULA DE NOTICIAS SECUNDARIAS */}
            {notasSecundarias.length > 0 && (
              <section>
                <h2 className="section-divider">Más Noticias de la Edición</h2>
                <div className="editorial-grid" data-testid="feed-grid">
                  {notasSecundarias.map((n) => (
                    <article key={n.id} className="editorial-card" data-testid={`feed-card-${n.id}`}>
                      <div>
                        <div className="card-kicker">Actualidad · Edición #{n.id}</div>
                        <h3 className="card-headline">{n.titulo}</h3>
                        <p className="card-summary">{n.contenido}</p>
                      </div>

                      <div className="card-bottom">
                        <span className="article-byline">
                          <strong>{n.Usuario?.nombre || `Redactor #${n.usuarioId}`}</strong>
                        </span>
                        <button
                          type="button"
                          className="btn-link-read"
                          data-testid={`read-noticia-btn-${n.id}`}
                          onClick={() => handleOpenArticle(n)}
                        >
                          Leer más →
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* MODAL DE LECTURA COMPLETA */}
      {selectedArticle && (
        <div
          className="reader-overlay"
          data-testid="article-modal"
          onClick={() => setSelectedArticle(null)}
        >
          <div className="reader-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reader-header">
              <span className="hero-badge" style={{ marginBottom: 0 }}>
                Edición #{selectedArticle.id}
              </span>
              <button
                type="button"
                className="btn-close-modal"
                data-testid="close-modal-btn"
                onClick={() => setSelectedArticle(null)}
              >
                Cerrar ✕
              </button>
            </div>

            <h2 className="reader-title">{selectedArticle.titulo}</h2>
            <div className="reader-meta">
              Publicado por{' '}
              <strong>
                {selectedArticle.Usuario?.nombre || `Redactor #${selectedArticle.usuarioId}`}
              </strong>{' '}
              · {formatFecha(selectedArticle.createdAt)}
            </div>

            <div className="reader-content">{selectedArticle.contenido}</div>
          </div>
        </div>
      )}
    </div>
  );
}