# Shuvo — Full Stack Developer Portfolio (React + Vite + Tailwind CSS)

Same portfolio, same content, styled entirely with Tailwind CSS utility
classes (plus a few repeated patterns like glass cards and buttons pulled
into reusable classes via `@layer components` in `src/index.css`).

## Project structure

```
shuvo-portfolio-react-tailwind/
├── index.html          ← fonts + theme-init script (avoids a flash of the wrong theme)
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── public/
│   └── shuvo.jpg         ← hero portrait
└── src/
    ├── main.jsx           ← mounts the portfolio, project archive, and admin routes
    ├── Portfolio.jsx        ← the whole page, plain React (no framework-specific bits)
    └── index.css            ← Tailwind directives + component classes
```

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

The portfolio is available at `/`, the project archive at `/projects`, and
the admin panel at `/admin`. Both project views load from `GET /projects/all`;
project details, technologies, and images load from the corresponding
`/projects/{id}` endpoints. Include a `features` array in the project-list and
project-detail API responses to show feature names (strings) or feature
objects with `title`/`name` and optional `description` in the project detail
card. During development, Vite proxies `/api` requests
and `/uploads` to `http://127.0.0.1:8000`. Set `VITE_API_BASE_URL` when the API
is hosted elsewhere. The archive can be filtered by All, Frontend, or Backend
using category/type fields or recognized technology names from the API.

## Portfolio admin

Open `/admin` to sign in and manage portfolio projects. The admin UI uses the
REST endpoints described in `AdminReadmi.md`. Set `VITE_API_BASE_URL` to the
backend origin (for example, `https://api.example.com`) before starting or
building the app; leave it unset when the API is served from the same origin.
The UI expects `POST /login` to accept `{ "email": "...", "password": "..." }`
and return an `access_token` or `token`. The token is sent as a Bearer token for
subsequent API requests.

The Workshops section saves workshop records in the current browser's local
storage. Those records are not sent to the backend and are not shared across
browsers or devices. Workshop fields include title, description, date, time,
venue, registration URL, attendee capacity, and draft/published status.

Project create/update requests use `title`, `description`, `live_url`,
`github_url`, and `featured`. The project list and technology/image endpoints
may return arrays or objects with `items`/`results` arrays. Image uploads use a
multipart `file` field. Protect the API endpoints on the backend; hiding the
admin UI alone is not access control.

## Build for production

```bash
npm run build
```

Output goes to `dist/` — deploy it anywhere that serves static files
(Vercel, Netlify, GitHub Pages, etc.).

## Dark mode

Tailwind is configured with a custom dark mode selector
(`darkMode: ['selector', '[data-theme="dark"]']`), so every `dark:` class
activates when `data-theme="dark"` is set on `<html>`. A small inline
script in `index.html` sets that attribute before the page paints (reading
`localStorage`, falling back to the OS preference). The toggle button in
`Portfolio.jsx` flips it and saves the choice.

## Things you'll want to personalize

- **Contact info**: swap `shuvo@example.com` in `src/Portfolio.jsx` for
  your real email.
- **LinkedIn / GitHub links**: currently placeholders that show a toast
  reminding you to fill them in — search for `linkedin.com/in/shuvo` and
  `github.com/shuvo`.
- **Resume PDF**: the "Download Resume" button currently shows a reminder
  toast. Add a real `resume.pdf` to `public/` and link the button to
  `/resume.pdf`.
- **Project display**: manage projects through the admin panel/API. The
  homepage shows up to three API projects and `/projects` lists the full catalog.
