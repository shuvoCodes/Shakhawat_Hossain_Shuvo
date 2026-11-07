# Shuvo — Full-Stack Developer Portfolio

A React portfolio website built with Vite and Tailwind CSS. The frontend includes the portfolio homepage, project archive, and admin panel, and connects to the FastAPI backend.

## Routes

| Route | Description |
|---|---|
| `/` | Portfolio homepage |
| `/projects` | Project archive |
| `/admin` | Admin sign-in and project management |

## Run locally

Requirements: Node.js 18 or later and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually <http://localhost:5173>. During development, Vite proxies `/api` requests and `/uploads` to `http://127.0.0.1:8000`; start the backend separately.

The homepage and project archive load data from `GET /projects/all`. Project details are available from `GET /projects/{project_id}`. The archive can be filtered by project category and recognized technology names.

## Admin panel

Sign in at `/admin` with an admin username and password. The frontend sends credentials to `POST /auth/login` and uses the returned bearer token for protected requests. The admin panel can create, edit, and delete projects and upload, replace, or delete project images. Only accounts with the `admin` role can modify projects; hiding the admin page is not access control.

See the [Admin panel guide](./AdminReadmi.md) for the interface overview and the [Backend API reference](../Backend/APIsReadme.md) for endpoint details.

## Configure the API URL

For local development, the API base URL defaults to `/api` and Vite proxies requests to the local backend. To use a different backend origin, set `VITE_API_BASE_URL` before starting or building the frontend:

```powershell
$env:VITE_API_BASE_URL = "https://your-api.example.com"
npm run dev
```

## Build for production

```bash
npm run build
```

The production files are written to `dist/`. Deploy the frontend to a static hosting provider and deploy the backend API separately.

## Dark mode

Tailwind uses the custom selector `darkMode: ['selector', '[data-theme="dark"]']`. The inline script in `index.html` sets the theme before the page renders, using the saved preference or the operating system preference. The theme toggle saves the selection in browser storage.

## Personalize the portfolio

- **Contact information:** Update the contact details in the relevant files under `src/`.
- **LinkedIn and GitHub links:** Update the profile links in the source files.
- **Resume:** Replace `public/resume.pdf` with your own resume.
- **Projects:** Manage project content through the admin panel and backend API. The homepage shows up to three projects; `/projects` lists the full catalog.
