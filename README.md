# Webapp - API REST & Servidor TCP Socket con Pipeline CI/CD

Este proyecto expone una API REST para la gestión de usuarios y noticias, junto con un servidor TCP (sockets) integrado y está empaquetado en un contenedor Docker y se despliega automáticamente en una instancia AWS EC2 mediante GitHub Actions.

---

## Arquitectura del Sistema

El pipeline de CI/CD se activa con cada `push` o `pull_request` sobre la rama `main`. Las pruebas corren en ambos eventos; la construcción de la imagen y el despliegue solo se ejecutan en `push`.

```text
[ Desarrollador hace ]
       │  (git push)
       ▼
[ Repositorio GitHub ] ──► [ GitHub Actions Workflow ]
                                  │
                                  ├─► 1. Test: pruebas unitarias y cobertura realizadas con Jest
                                  ├─► 2. Build & Push: construcción e imagen en Docker Hub
                                  └─► 3. Deploy: conexión SSH a AWS EC2 y despliegue
                                                │
                                                ▼
                                   [ Servidor AWS EC2 (Docker) ]
                                     ├── Puerto 80:   API REST
                                     └── Puerto 6061: Sockets TCP
```

### Jobs del workflow (`.github/workflows/deploy.yml`)

|   | Job | Descripción |
|---|-----|-------------|
| 1 | `test` | Instala dependencias con `npm ci` y ejecuta `npm test` (Jest con cobertura). |
| 2 | `build-and-push` | Construye la imagen Docker y la publica en Docker Hub con los tags `latest`. |
| 3 | `deploy` | Se conecta por SSH a EC2, descarga la imagen y recrea el contenedor `webapp`. |

---

## Tecnologías Utilizadas

- Backend: Node.js, Express.js
- Base de datos: SQLite con Sequelize ORM
- Pruebas: Jest y Supertest para pruebas unitarias e integración
- Contenedorización: Docker y Docker Hub
- CI/CD: GitHub Actions
- Infraestructura: AWS EC2 (Ubuntu Server 24.04 LTS)

---

## Configuración y Ejecución Local

### Prerrequisitos

- Node.js v20 o superior
- Docker Desktop (opcional, para probar en contenedor)

### 1. Clonar el repositorio e instalar dependencias

```bash
git clone https://github.com/Jonathancraxker/Webapp.git
cd Webapp
npm install
```

### 2. Iniciar el servidor

```bash
npm start
```

El servidor HTTP inicia en el puerto 80 (o el definido en `process.env.PORT`) y el servidor TCP escucha en el puerto 6061.

### 3. Probar el cliente TCP localmente

```bash
node test-client.js
```

### 4. (Opcional) Ejecutar con Docker

```bash
docker build -t webapp .
docker run -d -p 80:80 -p 6061:6061 --name webapp-container webapp
```

---

## Pruebas Unitarias y Cobertura de Código

El proyecto incluye una batería automatizada de pruebas con Jest que cubre casos exitosos y simulación de errores (prueba de endpoints)

```bash
npm test
```

---

## ⚙️ Pasos de Configuración para el Despliegue CI/CD

### 1. Configurar la instancia en AWS EC2

1. Crear una instancia **Ubuntu Server** en AWS EC2.
2. Configurar el **Security Group** (reglas de entrada) con estos puertos abiertos:

   | Puerto | Protocolo | Uso |
   |--------|-----------|-----|
   | 22 | SSH | Administración y despliegue automático |
   | 80 | HTTP | Tráfico público de la API |
   | 6061 | TCP | Servidor de sockets personalizado |

3. Instalar Docker en el servidor:

   ```bash
   sudo apt update && sudo apt install -y docker.io
   sudo systemctl start docker
   sudo usermod -aG docker ubuntu
   ```

### 2. Configurar los secretos en GitHub

En el repositorio ve a **Settings > Secrets and variables > Actions** y registra:

| Secreto | Descripción |
|---------|-------------|
| `DOCKERHUB_USERNAME` | Usuario de Docker Hub |
| `DOCKERHUB_TOKEN` | Personal Access Token (PAT) de Docker Hub |
| `EC2_HOST` | IP pública de la instancia EC2 |
| `EC2_USERNAME` | `ubuntu` |
| `EC2_SSH_KEY` | Contenido completo de la clave privada (`.pem`) |

Con esto, cada `push` a `main` ejecuta las pruebas, publica la imagen y despliega en EC2 automáticamente.

---

## Endpoints de la API REST

### API REST (`http://<IP_DEL_SERVIDOR>/, ej. http://18.191.218.236/api/noticias`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Health check / estado del servidor |
| GET | `/api/usuarios` | Obtener catálogo de usuarios |
| POST | `/api/usuarios` | Crear un nuevo usuario |
| PUT | `/api/usuarios/:id` | Actualizar un usuario por ID |
| DELETE | `/api/usuarios/:id` | Eliminar un usuario por ID |
| GET | `/api/noticias` | Obtener lista de noticias |
| GET | `/api/noticias/:id` | Obtener una noticia por ID |
| POST | `/api/noticias` | Publicar una nueva noticia |
| PUT | `/api/noticias/:id` | Actualizar una noticia |
| DELETE | `/api/noticias/:id` | Eliminar una noticia |
| GET | `/api/respaldo` | Descargar copia de seguridad de la base de datos |