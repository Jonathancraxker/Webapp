import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './UsuariosPage.css';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('editor');
  const [notice, setNotice] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice({ type: '', text: '' }), 3500);
  };

  const fetchUsuarios = async () => {
    try {
      const res = await api.getUsuarios();
      setUsuarios(res.data || []);
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateUsuario(editingId, {
          nombre,
          correo,
          ...(password ? { password } : {}),
          rol
        });
        showMessage('success', 'Datos del redactor actualizados');
      } else {
        await api.createUsuario({
          nombre,
          correo,
          password: password || '123456',
          rol
        });
        showMessage('success', 'Nuevo usuario agregado al equipo');
      }
      resetForm();
      fetchUsuarios();
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleEdit = (u) => {
    setEditingId(u.id);
    setNombre(u.nombre);
    setCorreo(u.correo);
    setPassword('');
    setRol(u.rol || 'editor');
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteUsuario(id);
      showMessage('success', 'Usuario dado de baja');
      fetchUsuarios();
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setNombre('');
    setCorreo('');
    setPassword('');
    setRol('editor');
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
            {editingId ? 'Editar Redactor' : 'Alta de Usuario'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="u-nombre">Nombre completo</label>
              <input
                id="u-nombre"
                data-testid="usuario-nombre"
                type="text"
                placeholder="Ej. María López"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="u-correo">Correo institucional</label>
              <input
                id="u-correo"
                data-testid="usuario-correo"
                type="email"
                placeholder="maria@uteq.edu.mx"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="u-pass">
                Contraseña {editingId ? '(dejar vacío para mantener)' : ''}
              </label>
              <input
                id="u-pass"
                data-testid="usuario-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!editingId}
              />
            </div>

            <div className="form-field">
              <label htmlFor="u-rol">Rol Editorial</label>
              <select
                id="u-rol"
                data-testid="usuario-rol"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--news-border)' }}
              >
                <option value="editor">Editor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <button type="submit" className="btn-publish" data-testid="usuario-submit">
              {editingId ? 'Actualizar Usuario' : 'Registrar Usuario'}
            </button>

            {editingId && (
              <button type="button" className="btn-cancel" onClick={resetForm}>
                Cancelar Edición
              </button>
            )}
          </form>
        </aside>

        <section>
          <h2 className="section-heading">Directorio de Redacción ({usuarios.length})</h2>
          <div className="staff-table-wrapper">
            <table className="staff-table" data-testid="usuarios-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} data-testid={`usuario-row-${u.id}`}>
                    <td>#{u.id}</td>
                    <td><strong>{u.nombre}</strong></td>
                    <td>{u.correo}</td>
                    <td>
                      <span className={`role-tag ${u.rol}`}>{u.rol}</span>
                    </td>
                    <td>
                      <div className="article-actions">
                        <button
                          type="button"
                          className="btn-edit-sm"
                          data-testid={`edit-usuario-${u.id}`}
                          onClick={() => handleEdit(u)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn-del-sm"
                          data-testid={`delete-usuario-${u.id}`}
                          onClick={() => handleDelete(u.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}