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
python -m pip install -r requirements.txt
```

Set up Firebase email OTP locally. In the Firebase console, enable Firestore, then install the **Trigger Email** extension and configure its SMTP/email provider. Copy the example environment file and edit it:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

Set `FIREBASE_PROJECT_ID` to your Firebase project ID. Create a Firebase service account with Firestore access, download its JSON key as `Backend/firebase-service-account.json`, and keep the file private (it is Git-ignored). The extension's Firestore collection must match `FIREBASE_EMAIL_COLLECTION` (default: `mail`).

The backend writes OTP email jobs into Firestore; the Trigger Email extension delivers them. If Gmail is the extension's sender, configure the Gmail App Password in the extension's settings, not in the backend `.env`. The OTP recipient defaults to `shuvo.hossain.dev@gmail.com`.

Generate a persistent signing secret and add its output as `AUTH_SECRET=...` in `.env`:

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

After starting the API and frontend, open `/admin`, choose **Create the first admin account**, request the OTP, and enter it with your desired username and a password of at least 12 characters. The same configured email supports **Forgot username or password?** recovery.

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

For production, configure the same variable before running `npm run build`. The generated static site is placed in `Frontend/dist/`. Deploy the backend separately; deploying only the frontend does not start the API or database. Set `CORS_ORIGINS` to the deployed frontend origin (or a comma-separated list), use HTTPS, and configure persistent `AUTH_SECRET`, `ADMIN_EMAIL`, and SMTP settings in the backend host's environment. Never commit credentials.

The backend reads `DATABASE_URL`; it defaults to local SQLite and also accepts PostgreSQL URLs, including Supabase connection strings. For Supabase, set `DATABASE_URL` to the database connection string and keep its required SSL parameters. PostgreSQL support is included; the application does not create the Supabase project or obtain its connection string automatically.

For a future Render deployment, use `Backend` as the service root, `pip install -r requirements.txt` as the build command, and `uvicorn main:app --host 0.0.0.0 --port $PORT` as the start command. Set `DATABASE_URL`, a persistent `AUTH_SECRET`, `ADMIN_EMAIL`, `FIREBASE_PROJECT_ID`, `FIREBASE_EMAIL_COLLECTION`, `FIREBASE_SERVICE_ACCOUNT_JSON`, and `CORS_ORIGINS` in Render's environment settings. Put the full service-account JSON in Render's secret environment variable; do not commit it. The Firebase Trigger Email extension still needs its own sender/provider configuration. Render reads those environment variables; it does not read the local `.env`. For a separately hosted frontend, set `VITE_API_BASE_URL` to the Render API URL when building the frontend and allow that frontend origin in `CORS_ORIGINS`.

## Data and deployment notes

- The backend creates its database tables at startup and migrates missing project columns in existing databases.
- The SQLite database is created at `Backend/personal.db`. Back it up as needed.
- Uploaded images are stored in `Backend/Uploads/`. Keep both the database and upload directory on persistent storage; ephemeral hosts may remove them during redeployment.
- `/projects/all` returns an empty array when there are no projects.
- Hiding the admin page is not access control; write endpoints are protected by backend authorization.
- Never commit `AUTH_SECRET`, passwords, or other credentials.

## More documentation

- [Frontend README](Frontend/README.md)
- [Admin panel guide](Frontend/AdminReadmi.md)
- [Backend API reference](Backend/APIsReadme.md)
