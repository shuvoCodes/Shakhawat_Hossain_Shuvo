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
    ├── main.jsx           ← mounts <Portfolio />
    ├── Portfolio.jsx        ← the whole page, plain React (no framework-specific bits)
    └── index.css            ← Tailwind directives + component classes
```

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

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
- **More projects**: the two dashed "Next project" cards in the Projects
  section are ready to be filled in with real project details.
