const { test, expect } = require('@playwright/test');

const uniqueId = Date.now();
const nuevoCorreo = `redactor_${uniqueId}@uteq.edu.mx`;
const correoCrud = `crud_${uniqueId}@uteq.edu.mx`;
const tituloNoticia = `Noticia E2E Playwright ${uniqueId}`;
const tituloEditado = `Noticia Editada Playwright ${uniqueId}`;

async function loginAsAdmin(page) {
  await page.goto('/login');
  await page.getByTestId('login-email').fill('admin@uteq.edu.mx');
  await page.getByTestId('login-password').fill('Password#2026');
  await page.getByTestId('login-submit').click();
  await page.waitForURL('**/noticias');
}

// ============================================================================
// BLOQUE 1: NAVEGACIÓN PÚBLICA Y PROTECCIÓN DE RUTAS (6 PRUEBAS)
// ============================================================================
test.describe('1. Navegación Pública y Seguridad de Rutas', () => {
  test('01. Portal público /noticias-feed carga correctamente la cabecera editorial', async ({ page }) => {
    await page.goto('/noticias-feed');
    await expect(page.locator('.public-masthead-brand')).toContainText('DORIGA');
    await expect(page.getByTestId('public-login-link')).toBeVisible();
  });

  test('02. Navegación desde /noticias-feed hacia /login mediante Acceso Redacción', async ({ page }) => {
    await page.goto('/noticias-feed');
    await page.getByTestId('public-login-link').click();
    await page.waitForURL('**/login');
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

  test('03. Navegación entre /login y /register mediante enlaces de formulario', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('go-to-register').click();
    await page.waitForURL('**/register');
    await expect(page.getByTestId('register-submit')).toBeVisible();

    await page.getByTestId('go-to-login').click();
    await page.waitForURL('**/login');
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

//   test('04. Navegación de regreso desde /login hacia el portal público /noticias-feed', async ({ page }) => {
//     await page.goto('/login');
//     await page.getByTestId('go-to-public-feed').click();
//     await page.waitForURL('**/noticias-feed');
//     await expect(page.locator('.public-masthead-brand')).toContainText('DORIGA');
//   });

  test('05. Protección de ruta privada /noticias redirige a /login sin sesión', async ({ page }) => {
    await page.goto('/noticias');
    await page.waitForURL('**/login');
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

  test('06. Protección de ruta privada /usuarios redirige a /login sin sesión', async ({ page }) => {
    await page.goto('/usuarios');
    await page.waitForURL('**/login');
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });
});

// ============================================================================
// BLOQUE 2: AUTENTICACIÓN, REGISTRO Y CONTROL DE SESIÓN (5 PRUEBAS)
// ============================================================================
test.describe('2. Autenticación, Registro y Sesión', () => {
  test('07. Registro exitoso de nuevo periodista en /register', async ({ page }) => {
    await page.goto('/register');
    await page.getByTestId('register-nombre').fill('Periodista E2E');
    await page.getByTestId('register-correo').fill(nuevoCorreo);
    await page.getByTestId('register-password').fill('ClaveSegura#2026');
    await page.getByTestId('register-rol').selectOption('admin');
    await page.getByTestId('register-submit').click();

    await expect(page.getByTestId('register-success')).toBeVisible();
    await page.waitForURL('**/login');
  });

  test('08. Rechazo de registro cuando el correo electrónico ya existe', async ({ page }) => {
    await page.goto('/register');
    await page.getByTestId('register-nombre').fill('Duplicado E2E');
    await page.getByTestId('register-correo').fill(nuevoCorreo);
    await page.getByTestId('register-password').fill('ClaveSegura#2026');
    await page.getByTestId('register-submit').click();

    await expect(page.getByTestId('register-error')).toBeVisible();
  });

  test('09. Rechazo de inicio de sesión con contraseña incorrecta', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-email').fill(nuevoCorreo);
    await page.getByTestId('login-password').fill('ClaveIncorrecta');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-error')).toBeVisible();
  });

  test('10. Inicio de sesión exitoso con credenciales válidas y redirección a /noticias', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-email').fill(nuevoCorreo);
    await page.getByTestId('login-password').fill('ClaveSegura#2026');
    await page.getByTestId('login-submit').click();

    await page.waitForURL('**/noticias');
    await expect(page.getByTestId('logged-user-info')).toContainText('Periodista E2E');
  });

  test('11. Cierre de sesión (Logout) finaliza sesión y redirige a /login', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByTestId('logout-button').click();

    await page.waitForURL('**/login');
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });
});

// ============================================================================
// BLOQUE 3: NAVEGACIÓN INTERNA EN BARRA DE REDACCIÓN (3 PRUEBAS)
// ============================================================================
test.describe('3. Navegación Autenticada en Navbar', () => {
  test('12. Navegación hacia Ver Noticias (/noticias-feed) desde el menú superior', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByTestId('nav-noticias-feed').click();
    await page.waitForURL('**/noticias-feed');
    await expect(page.getByTestId('feed-search')).toBeVisible();
  });

  test('13. Navegación hacia Equipo Editorial (/usuarios) desde el menú superior', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByTestId('nav-usuarios').click();
    await page.waitForURL('**/usuarios');
    await expect(page.getByTestId('usuarios-table')).toBeVisible();
  });

  test('14. Navegación hacia Publicación de Noticias (/noticias) desde el menú superior', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByTestId('nav-usuarios').click();
    await page.waitForURL('**/usuarios');

    await page.getByTestId('nav-noticias').click();
    await page.waitForURL('**/noticias');
    await expect(page.getByTestId('noticias-list')).toBeVisible();
  });
});

// ============================================================================
// BLOQUE 4: CRUD GRANULAR DE NOTICIAS Y LECTOR PÚBLICO (6 PRUEBAS)
// ============================================================================
test.describe('4. CRUD de Noticias y Portal Público', () => {
  test('15. Crear (POST) una nueva noticia desde el panel editorial', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByTestId('noticia-titulo').fill(tituloNoticia);
    await page.getByTestId('noticia-contenido').fill('Cuerpo de prueba generado automáticamente por Playwright.');
    await page.getByTestId('noticia-submit').click();

    await expect(page.getByTestId('feedback-alert')).toBeVisible();
    await expect(page.getByTestId('noticias-list')).toContainText(tituloNoticia);
  });

  test('16. Leer (GET) la noticia publicada en Primera Plana de /noticias-feed', async ({ page }) => {
    await page.goto('/noticias-feed');
    await expect(page.getByTestId('hero-noticia')).toContainText(tituloNoticia);
  });

  test('17. Buscador en tiempo real filtra notas y muestra aviso cuando no hay coincidencias', async ({ page }) => {
    await page.goto('/noticias-feed');
    const searchInput = page.getByTestId('feed-search');

    await searchInput.fill(tituloNoticia);
    await expect(page.getByTestId('hero-noticia')).toContainText(tituloNoticia);

    await searchInput.fill('TERMINO_INEXISTENTE_XYZ_999');
    await expect(page.getByTestId('empty-feed')).toBeVisible();
  });

  test('18. Apertura y cierre del modal de lectura completa en /noticias-feed', async ({ page }) => {
    await page.goto('/noticias-feed');
    await page.getByTestId('hero-noticia').locator('button').click();

    await expect(page.getByTestId('article-modal')).toBeVisible();
    await expect(page.getByTestId('article-modal')).toContainText(tituloNoticia);

    await page.getByTestId('close-modal-btn').click();
    await expect(page.getByTestId('article-modal')).toHaveCount(0);
  });

  test('19. Actualizar (PUT) titular de noticia existente en /noticias', async ({ page }) => {
    await loginAsAdmin(page);
    const card = page.locator('article', { hasText: tituloNoticia });
    await card.locator('button', { hasText: 'Editar' }).click();

    await page.getByTestId('noticia-titulo').fill(tituloEditado);
    await page.getByTestId('noticia-submit').click();

    await expect(page.getByTestId('noticias-list')).toContainText(tituloEditado);
  });

  test('20. Eliminar (DELETE) la noticia editada del listado', async ({ page }) => {
    await loginAsAdmin(page);
    const editedCard = page.locator('article', { hasText: tituloEditado });
    await editedCard.locator('button', { hasText: 'Eliminar' }).click();

    await expect(page.getByTestId('noticias-list')).not.toContainText(tituloEditado);
  });
});

// ============================================================================
// BLOQUE 5: CRUD GRANULAR DE USUARIOS / EQUIPO EDITORIAL (4 PRUEBAS)
// ============================================================================
test.describe('5. CRUD de Usuarios (Equipo Editorial)', () => {
  test('21. Crear (POST) un nuevo redactor en /usuarios', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByTestId('nav-usuarios').click();
    await page.waitForURL('**/usuarios');

    await page.getByTestId('usuario-nombre').fill('Usuario Prueba E2E');
    await page.getByTestId('usuario-correo').fill(correoCrud);
    await page.getByTestId('usuario-password').fill('Pass1234');
    await page.getByTestId('usuario-rol').selectOption('editor');
    await page.getByTestId('usuario-submit').click();

    await expect(page.locator('tr', { hasText: correoCrud })).toBeVisible();
  });

  test('22. Leer (GET) y verificar datos del redactor en la tabla', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByTestId('nav-usuarios').click();

    const row = page.locator('tr', { hasText: correoCrud });
    await expect(row).toContainText('Usuario Prueba E2E');
    await expect(row).toContainText('editor');
  });

  test('23. Actualizar (PUT) nombre y cargo del redactor', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByTestId('nav-usuarios').click();

    const row = page.locator('tr', { hasText: correoCrud });
    await row.locator('button', { hasText: 'Editar' }).click();

    await page.getByTestId('usuario-nombre').fill('Usuario Editado E2E');
    await page.getByTestId('usuario-rol').selectOption('admin');
    await page.getByTestId('usuario-submit').click();

    await expect(page.locator('tr', { hasText: 'Usuario Editado E2E' })).toBeVisible();
  });

  test('24. Eliminar (DELETE) el redactor de prueba del directorio', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByTestId('nav-usuarios').click();

    const updatedRow = page.locator('tr', { hasText: correoCrud });
    await updatedRow.locator('button', { hasText: 'Eliminar' }).click();

    await expect(page.locator('tr', { hasText: correoCrud })).toHaveCount(0);
  });
});