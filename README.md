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
| Database | PostgreSQL (Supabase) |
| Image processing | Pillow |

## Repository structure

```text
.
├── Backend/
│   ├── main.py           # FastAPI app and project endpoints
│   ├── Auth.py           # Login, tokens, and admin authorization
│   ├── Upload.py         # Project image upload, update, and deletion
│   ├── models.py         # SQLAlchemy models
│   ├── database.py       # PostgreSQL connection and schema migration
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
python -m pip install -r requirements.txt
```

Copy the example environment file and configure a persistent signing secret:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

Generate a secret and replace the placeholder value for `AUTH_SECRET` in `.env`:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Then start the API:

```powershell
uvicorn main:app --reload
```

The backend is available at:

- API: <http://127.0.0.1:8000>
- Interactive API documentation: <http://127.0.0.1:8000/docs>

If `AUTH_SECRET` is not configured, the backend creates a temporary signing key. Existing tokens stop working after a restart. Production deployments must configure a persistent secret and must not commit it to source control.

### 2. Create the first admin

On a new, empty database, create the first admin account with `POST /auth/register`, using a username and a password of at least 6 characters. The endpoint returns a login token. Only one account can be created per database; after it exists, use `/auth/login`. Additional registration attempts are rejected, and password recovery is not available through the API.

For local database administration, `python create_user.py <username> <password> admin` can create the initial account on an empty database only.

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

The admin panel manages project titles, descriptions, categories, priority, featured status, live/source URLs, technologies, feature lists, and project status timelines. Completed projects use start and end dates; in-progress projects show a start date through Present; on-hold projects show a start date and last-updated date; planned projects show an expected start date. Timelines appear on project cards and in project details. Project images can be uploaded, replaced, and deleted separately.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/auth/setup/status` | Check whether first-account setup is required |
| `POST` | `/auth/register` | Create the first admin account |
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

For production, configure the same variable before running `npm run build`. The generated static site is placed in `Frontend/dist/`. Deploy the backend separately; deploying only the frontend does not start the API or database. Set `CORS_ORIGINS` to the deployed frontend origin (or a comma-separated list), use HTTPS, and configure a persistent `AUTH_SECRET` in the backend host's environment. Never commit credentials.

The backend requires `DATABASE_URL` and reads it from `Backend/.env` or the host's environment. Copy `Backend/.env.example` to `Backend/.env` for local development and replace its placeholders with your Supabase connection details. Keep `.env` private, set `sslmode=require`, and configure a long, random `AUTH_SECRET`. The application does not create the Supabase project or obtain its connection string automatically.

For a future Render deployment, use `Backend` as the service root, `pip install -r requirements.txt` as the build command, and `uvicorn main:app --host 0.0.0.0 --port $PORT` as the start command. Set `DATABASE_URL`, a persistent `AUTH_SECRET`, and `CORS_ORIGINS` in Render's environment settings. Render reads those environment variables; it does not read the local `.env`. For a separately hosted frontend, set `VITE_API_BASE_URL` to the Render API URL when building the frontend and allow that frontend origin in `CORS_ORIGINS`.

## Data and deployment notes

- The backend creates its database tables at startup and migrates missing project columns in existing databases.
- Existing data in `Backend/personal.db` is not copied to Supabase automatically; migrate it separately if you need to preserve it.
- Uploaded images are stored in `Backend/Uploads/`. Keep both the database and upload directory on persistent storage; ephemeral hosts may remove them during redeployment.
- `/projects/all` returns `404` when there are no projects.
- Hiding the admin page is not access control; write endpoints are protected by backend authorization.
- Never commit `AUTH_SECRET`, passwords, or other credentials.

## More documentation

- [Frontend README](Frontend/README.md)
- [Admin panel guide](Frontend/AdminReadmi.md)
- [Backend API reference](Backend/APIsReadme.md)
