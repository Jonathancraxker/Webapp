import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './NoticiasPage.css';

export default function NoticiasPage({ user }) {
  const [noticias, setNoticias] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [notice, setNotice] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice({ type: '', text: '' }), 3500);
  };

  const fetchNoticias = async () => {
    try {
      const res = await api.getNoticias();
      setNoticias(res.data || []);
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  useEffect(() => {
    fetchNoticias();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateNoticia(editingId, {
          titulo,
          contenido,
          usuarioId: user.id
        });
        showMessage('success', 'Nota actualizada en portada');
      } else {
        await api.createNoticia({
          titulo,
          contenido,
          usuarioId: user.id
        });
        showMessage('success', 'Noticia publicada exitosamente');
      }
      resetForm();
      fetchNoticias();
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleEdit = (noticia) => {
    setEditingId(noticia.id);
    setTitulo(noticia.titulo);
    setContenido(noticia.contenido);
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteNoticia(id);
      showMessage('success', 'Noticia retirada del portal');
      fetchNoticias();
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitulo('');
    setContenido('');
  };

  return (
    <main className="noticias-container">
      {notice.text && (
        <div className={`alert-banner ${notice.type}`} data-testid="feedback-alert">
          {notice.text}
        </div>
      )}

      <div className="noticias-grid">
        <aside className="editor-panel">
          <h2 className="section-heading">
            {editingId ? 'Editar Nota' : 'Redactar Noticia'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="noticia-titulo">Titular</label>
              <input
                id="noticia-titulo"
                data-testid="noticia-titulo"
                type="text"
                placeholder="Escribe el encabezado principal..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="noticia-contenido">Cuerpo de la nota</label>
              <textarea
                id="noticia-contenido"
                data-testid="noticia-contenido"
                rows="6"
                placeholder="Redacta los detalles de la noticia..."
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-publish" data-testid="noticia-submit">
              {editingId ? 'Guardar Cambios' : 'Publicar en Portada'}
            </button>

            {editingId && (
              <button type="button" className="btn-cancel" onClick={resetForm}>
                Cancelar Edición
              </button>
            )}
          </form>
        </aside>

        <section>
          <h2 className="section-heading">
            <span>Últimas Noticias ({noticias.length})</span>
          </h2>

          <div className="feed-panel" data-testid="noticias-list">
            {noticias.length === 0 ? (
              <p>No hay notas publicadas todavía.</p>
            ) : (
              noticias.map((n) => (
                <article key={n.id} className="article-card" data-testid={`noticia-card-${n.id}`}>
                  <div className="article-kicker">Actualidad · Edición #{n.id}</div>
                  <h3 className="article-headline">{n.titulo}</h3>
                  <p className="article-body">{n.contenido}</p>

                  <div className="article-footer">
                    <span>
                      Por <strong>{n.Usuario?.nombre || `Redactor #${n.usuarioId}`}</strong>
                    </span>
                    <div className="article-actions">
                      <button
                        type="button"
                        className="btn-edit-sm"
                        data-testid={`edit-noticia-${n.id}`}
                        onClick={() => handleEdit(n)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn-del-sm"
                        data-testid={`delete-noticia-${n.id}`}
                        onClick={() => handleDelete(n.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}