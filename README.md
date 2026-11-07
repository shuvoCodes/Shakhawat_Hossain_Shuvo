# Shuvo Portfolio — Full-Stack Project

This repository contains Shakhawat Hossain Shuvo's personal portfolio website. The frontend provides the portfolio, project archive, and admin panel. The backend provides a REST API for project data, authentication, and image uploads.

## Features

- **Portfolio (`/`)** — Introduction, skills, featured projects, resume, and contact section.
- **Project archive (`/projects`)** — Lists projects from the API and supports category filters.
- **Admin panel (`/admin`)** — Admin users can create, edit, and delete projects and manage project images.
- **REST API** — Manages projects, features, technologies, and images.
- **Authentication** — Bearer tokens protect admin-only write endpoints and expire after 24 hours.
- **Dark and light themes** — The selected theme is saved in the browser.

## Technology stack

| Area | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Tailwind CSS |
| Backend | Python, FastAPI, Pydantic, SQLAlchemy |
| Database | SQLite |
| Image processing | Pillow |

## Repository structure

```text
.
├── Backend/
│   ├── main.py           # FastAPI app and project endpoints
│   ├── Auth.py           # Login, tokens, and admin authorization
│   ├── Upload.py         # Project image upload, update, and deletion
│   ├── models.py         # SQLAlchemy models
│   ├── database.py       # SQLite connection and schema migration
│   ├── create_user.py    # Create user and admin accounts
│   ├── APIsReadme.md     # Backend API reference
│   └── Uploads/          # Uploaded images (created by the app)
├── Frontend/
│   ├── src/
│   │   ├── Admin.jsx
│   │   ├── Portfolio.jsx
│   │   ├── Projects.jsx
│   │   └── ...
│   ├── public/           # Static images and resume
│   └── package.json
└── README.md
```

## Requirements

- Python 3.10 or later
- Node.js 18 or later, including npm

## Run locally (Windows PowerShell)

Run the backend and frontend in separate terminals.

### 1. Set up and start the backend

```powershell
cd Backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install fastapi "uvicorn[standard]" sqlalchemy pillow python-multipart
```

Configure a persistent signing secret before starting the API. Generate one with the first command, then use its output as the value for `AUTH_SECRET`:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
$env:AUTH_SECRET = "<paste-the-generated-secret-here>"
uvicorn main:app --reload
```

The backend is available at:

- API: <http://127.0.0.1:8000>
- Interactive API documentation: <http://127.0.0.1:8000/docs>

If `AUTH_SECRET` is not configured, the backend creates a temporary signing key. Existing tokens stop working after a restart. Production deployments must configure a persistent secret and must not commit it to source control.

### 2. Create an admin account

Open another terminal, activate the backend virtual environment, and run:

```powershell
cd Backend
.\.venv\Scripts\Activate.ps1
python create_user.py shuvo your-strong-password admin
```

Replace `shuvo` and `your-strong-password` with your chosen username and password. Quote the password if it contains spaces. If you omit the `admin` role, the account is created as a regular user and cannot use admin-only endpoints. Sign in to `/admin` with the account credentials.

> If PowerShell blocks virtual environment activation, run commands with `.venv\Scripts\python.exe` instead.

### 3. Install and start the frontend

```powershell
cd Frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually <http://localhost:5173>. During development, Vite proxies `/api` requests to `http://127.0.0.1:8000` and proxies `/uploads` to the same backend.

### Application routes

| URL | Description |
|---|---|
| `/` | Portfolio homepage |
| `/projects` | Project archive |
| `/admin` | Admin sign-in and project management |
| `http://127.0.0.1:8000/docs` | Interactive API documentation |

## Project management and API

The admin panel manages project titles, descriptions, categories, statuses, priority, featured status, live/source URLs, technologies, and feature lists. Project images can be uploaded, replaced, and deleted separately.

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/auth/login` | Sign in with a username and password |
| `GET` | `/auth/me` | Get the current user's information |
| `GET` | `/projects/all` | List all projects |
| `GET` | `/projects/{project_id}` | Get project details |
| `POST` | `/projects` | Create a project (admin) |
| `PATCH` | `/projects/{project_id}` | Update a project (admin) |
| `DELETE` | `/projects/{project_id}` | Delete a project (admin) |
| `GET` | `/projects/{project_id}/images` | List project images |
| `POST` | `/projects/{project_id}/images` | Upload an image (admin) |
| `PUT` | `/projects/{project_id}/images/{image_id}` | Replace an image (admin) |
| `DELETE` | `/projects/{project_id}/images/{image_id}` | Delete an image (admin) |

Protected endpoints require a bearer token from the login response's `access_token`. Image uploads use a `file` field in `multipart/form-data`. JPG/JPEG, PNG, WEBP, and GIF images are supported up to 5 MB. See the [Backend API reference](Backend/APIsReadme.md) for request and response examples.

## Configuration and production

Set `VITE_API_BASE_URL` before starting or building the frontend when the API is hosted at a different origin:

```powershell
$env:VITE_API_BASE_URL = "https://your-api.example.com"
npm run dev
```

For production, configure the same variable before running `npm run build`. The generated static site is placed in `Frontend/dist/`. Deploy the backend separately; deploying only the frontend does not start the API or database. Add the deployed frontend origin to the backend's CORS allowlist in `Backend/main.py`, use HTTPS, and configure a persistent `AUTH_SECRET`.

## Data and deployment notes

- The backend creates its database tables at startup and migrates missing project columns in existing databases.
- The SQLite database is created at `Backend/personal.db`. Back it up as needed.
- Uploaded images are stored in `Backend/Uploads/`. Keep both the database and upload directory on persistent storage; ephemeral hosts may remove them during redeployment.
- `/projects/all` returns `404` when there are no projects.
- Hiding the admin page is not access control; write endpoints are protected by backend authorization.
- Never commit `AUTH_SECRET`, passwords, or other credentials.

## More documentation

- [Frontend README](Frontend/README.md)
- [Admin panel guide](Frontend/AdminReadmi.md)
- [Backend API reference](Backend/APIsReadme.md)
