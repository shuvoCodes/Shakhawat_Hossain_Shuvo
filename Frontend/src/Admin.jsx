import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiBox,
  FiCheck,
  FiChevronRight,
  FiExternalLink,
  FiGrid,
  FiImage,
  FiLogOut,
  FiMoon,
  FiPlus,
  FiSettings,
  FiSun,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { AuthContext } from "./Context/AuthProvider";

import API_BASE_URL from "./Base/baseUrl";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
const TOKEN_KEY = "shuvo-admin-token";
const TOKEN_EXPIRY_KEY = "shuvo-admin-token-expires-at";
const SESSION_EXPIRED_EVENT = "shuvo-admin-session-expired";

function getStoredToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return "";

  const expiresAt = Number(localStorage.getItem(TOKEN_EXPIRY_KEY));
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    return "";
  }

  return token;
}

function getTokenExpiry(data, token) {
  const expiresIn = Number(data?.expires_in);
  const expiresAt = Number.isFinite(expiresIn) && expiresIn > 0
    ? Date.now() + expiresIn * 1000
    : null;

  try {
    const payload = token.split(".")[1];
    if (payload) {
      const jwtExpiresAt = Number(JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))).exp) * 1000;
      if (Number.isFinite(jwtExpiresAt) && jwtExpiresAt > 0) {
        return expiresAt ? Math.min(expiresAt, jwtExpiresAt) : jwtExpiresAt;
      }
    }
  } catch {
    // Opaque tokens do not contain a decodable JWT expiration.
  }

  if (expiresAt) return expiresAt;
  throw new Error("The login response did not include a valid token expiration.");
}

const getItems = (data) => {
  if (Array.isArray(data)) return data;
  return data?.items || data?.results || data?.projects || data?.technologies || data?.images || [];
};

const getId = (project) => project.id ?? project.project_id;
const getTitle = (project) => project.title || project.name || "Untitled project";
const getDescription = (project) => project.description || project.short_description || "";
const getTechnologyName = (technology) => typeof technology === "string" ? technology : technology?.name || technology?.title || "";
const getFeatureList = (features) => (Array.isArray(features) ? features : [])
  .map((feature) => typeof feature === "string" ? { title: feature, description: "" } : {
    title: feature?.title || feature?.name || "",
    description: feature?.description || "",
  })
  .filter((feature) => feature.title);
const getImageUrl = (image) => {
  const url = typeof image === "string" ? image : image?.image_url || image?.url || image?.path;
  if (!url || /^https?:\/\//i.test(url)) return url || "";
  return `${API_BASE}/${url.replace(/^\/+/, "")}`;
};

async function request(path, { token, body, ...options } = {}) {
  const isFormData = body instanceof FormData;
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...(body ? { body: isFormData ? body : JSON.stringify(body) } : {}),
  });
  if (!response.ok) {
    const message = await response.text();
    let detail = message;
    try {
      const parsed = JSON.parse(message);
      detail = parsed.detail || parsed.message || message;
    } catch {
      // The response body is already useful as plain text.
    }
    const error = new Error(detail || `Request failed (${response.status})`);
    error.status = response.status;
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    throw error;
  }

  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json") ? response.json() : null;
}

function FormField({ label, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="field-label">{label}</span>
      {props.multiline ? (
        <textarea {...props} multiline={undefined} className="field-input min-h-32 resize-y" />
      ) : (
        <input {...props} className="field-input" />
      )}
    </label>
  );
}

function ProjectForm({ initialProject, busy, onCancel, onSubmit }) {
  const [form, setForm] = useState(() => ({
    title: initialProject?.title || "",
    description: getDescription(initialProject || {}),
    category: initialProject?.category || "frontend",
    status: initialProject?.status || "in_progress",
    priority: initialProject?.priority ?? 0,
    live_url: initialProject?.live_url || "",
    github_url: initialProject?.github_url || initialProject?.frontend_source_url || "",
    frontend_source_url: initialProject?.frontend_source_url || initialProject?.github_url || "",
    backend_source_url: initialProject?.backend_source_url || "",
    featured: Boolean(initialProject?.featured),
    features: getFeatureList(initialProject?.features),
  }));
  const [technologyText, setTechnologyText] = useState(
    (initialProject?.technologies || []).map(getTechnologyName).filter(Boolean).join(", "),
  );

  const update = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const updateFeature = (index, field, value) => {
    setForm((current) => ({
      ...current,
      features: current.features.map((feature, featureIndex) =>
        featureIndex === index ? { ...feature, [field]: value } : feature,
      ),
    }));
  };

  const submit = (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      category: form.category.trim(),
      status: form.status.trim(),
      priority: Number(form.priority),
      technologies: technologyText.split(/[,\n]/).map((technology) => technology.trim()).filter(Boolean),
      features: form.features
        .map((feature) => ({ title: feature.title.trim(), description: feature.description.trim() }))
        .filter((feature) => feature.title),
      live_url: form.live_url.trim(),
      github_url: form.github_url.trim(),
      frontend_source_url: form.frontend_source_url.trim(),
      backend_source_url: form.backend_source_url.trim(),
    };

    for (const field of ["live_url", "github_url", "frontend_source_url", "backend_source_url"]) {
      if (!payload[field]) {
        if (initialProject) payload[field] = null;
        else delete payload[field];
      }
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="solid-panel max-w-3xl rounded-3xl p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Project title" name="title" placeholder="e.g. E-commerce API" value={form.title} onChange={update} required />
        <FormField label="Category" name="category" placeholder="frontend, backend, or full_stack" value={form.category} onChange={update} required />
        <FormField label="Status" name="status" placeholder="e.g. in_progress or completed" value={form.status} onChange={update} required />
        <FormField label="Priority" name="priority" type="number" step="1" value={form.priority} onChange={update} required />
        <FormField label="Live URL" name="live_url" type="url" placeholder="https://yourproject.com" value={form.live_url} onChange={update} />
        <FormField label="GitHub URL (legacy)" name="github_url" type="url" placeholder="https://github.com/username/repo" value={form.github_url} onChange={update} />
        <FormField label="Frontend source URL" name="frontend_source_url" type="url" placeholder="https://github.com/username/frontend" value={form.frontend_source_url} onChange={update} />
        <FormField label="Backend source URL" name="backend_source_url" type="url" placeholder="https://github.com/username/backend" value={form.backend_source_url} onChange={update} />
        <FormField label="Short description" name="description" placeholder="A brief summary of what the project does" value={form.description} onChange={update} multiline required className="sm:col-span-2" />
        <FormField label="Technologies" name="technologies" placeholder="React, FastAPI, PostgreSQL" value={technologyText} onChange={(event) => setTechnologyText(event.target.value)} className="sm:col-span-2" />
      </div>
      <label className="mt-5 flex w-fit cursor-pointer items-center gap-3 text-sm font-medium">
        <input type="checkbox" name="featured" checked={form.featured} onChange={update} className="h-4 w-4 accent-[#6D5AE6]" />
        Show on homepage
      </label>
      <section className="mt-7 border-t border-black/[0.07] pt-6 dark:border-white/[0.09]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-lg font-semibold">Project features</h2><p className="text-sm text-secondary-light dark:text-secondary-dark">Add feature titles and optional descriptions.</p></div>
          <button className="btn-ghost btn-sm" type="button" onClick={() => setForm((current) => ({ ...current, features: [...current.features, { title: "", description: "" }] }))}><FiPlus /> Add Feature</button>
        </div>
        <div className="space-y-4">
          {form.features.map((feature, index) => (
            <div className="grid gap-3 rounded-2xl border border-black/[0.07] p-4 dark:border-white/[0.09] sm:grid-cols-[1fr_1.5fr_auto]" key={index}>
              <FormField label={`Feature ${index + 1}`} value={feature.title} placeholder="e.g. Parcel tracking" onChange={(event) => updateFeature(index, "title", event.target.value)} />
              <FormField label="Description" value={feature.description} placeholder="Describe this feature" onChange={(event) => updateFeature(index, "description", event.target.value)} />
              <button className="btn-ghost btn-sm self-end text-red-600 dark:text-red-400" type="button" aria-label={`Remove feature ${index + 1}`} onClick={() => setForm((current) => ({ ...current, features: current.features.filter((_, featureIndex) => featureIndex !== index) }))}><FiTrash2 /></button>
            </div>
          ))}
          {!form.features.length && <p className="text-sm text-secondary-light dark:text-secondary-dark">No features added.</p>}
        </div>
      </section>
      <div className="mt-7 flex flex-wrap gap-3">
        <button className="btn-primary" type="submit" disabled={busy}>{busy ? "Saving…" : initialProject ? "Save Changes" : "Create Project"}</button>
        <button className="btn-ghost" type="button" onClick={onCancel} disabled={busy}>Cancel</button>
      </div>
    </form>
  );
}

export default function Admin() {
  const { theme, toggleTheme } = useContext(AuthContext);
  const [token, setToken] = useState(getStoredToken);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loginBusy, setLoginBusy] = useState(false);
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState("dashboard");
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailTab, setDetailTab] = useState("overview");
  const [technologies, setTechnologies] = useState([]);
  const [images, setImages] = useState([]);
  const [technologyName, setTechnologyName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUpdateFiles, setImageUpdateFiles] = useState({});
  const imageInput = useRef(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const logout = useCallback(({ expired = false } = {}) => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    setToken("");
    setProjects([]);
    setSelectedProject(null);
    setPage("dashboard");
    if (expired) {
      setError("Your session has expired. Please sign in again.");
      setNotice("");
    } else {
      setError("");
      setNotice("");
    }
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => logout({ expired: true });
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [logout]);

  useEffect(() => {
    if (!token) return undefined;

    const expiresAt = Number(localStorage.getItem(TOKEN_EXPIRY_KEY));
    const remainingTime = expiresAt - Date.now();
    if (!Number.isFinite(expiresAt) || remainingTime <= 0) {
      logout({ expired: true });
      return undefined;
    }

    const timeout = window.setTimeout(() => logout({ expired: true }), remainingTime);
    return () => window.clearTimeout(timeout);
  }, [token, logout]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== TOKEN_KEY && event.key !== TOKEN_EXPIRY_KEY) return;
      const storedToken = getStoredToken();
      if (!storedToken && token) logout({ expired: true });
      else if (storedToken !== token) setToken(storedToken);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [logout, token]);

  const loadProjects = async (accessToken = token) => {
    setLoading(true);
    setError("");
    try {
      const data = await request("/projects/all", { token: accessToken });
      setProjects(getItems(data));
    } catch (cause) {
      if (cause.status === 404) {
        setProjects([]);
        return;
      }
      setError(`Could not load projects. ${cause.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadProjects(token);
  }, [token]);

  const openProject = async (project, tab = "overview") => {
    setSelectedProject(project);
    setDetailTab(tab);
    setError("");
    setPage("details");
    const id = getId(project);
    try {
      const [details, imageData] = await Promise.all([
        request(`/projects/${id}`, { token }),
        request(`/projects/${id}/images`, { token }),
      ]);
      setSelectedProject((current) => getId(current) === id ? { ...current, ...details } : current);
      setTechnologies(getItems(details?.technologies));
      setImages(getItems(imageData));
    } catch (cause) {
      setError(`Could not load project details. ${cause.message}`);
    }
  };

  const projectStats = useMemo(() => {
    const hasTechnologies = projects.some((project) => Array.isArray(project.technologies));
    const hasImages = projects.some((project) => Array.isArray(project.images));
    const technologyCount = hasTechnologies ? projects.reduce((sum, project) => sum + (project.technologies?.length || 0), 0) : null;
    const imageCount = hasImages ? projects.reduce((sum, project) => sum + (project.images?.length || 0), 0) : null;
    const dates = projects
      .map((project) => project.updated_at || project.created_at)
      .filter(Boolean)
      .map((date) => new Date(date).getTime())
      .filter(Number.isFinite);
    const latest = dates.length ? new Date(Math.max(...dates)) : null;
    return { technologyCount, imageCount, latest };
  }, [projects]);

  const login = async (event) => {
    event.preventDefault();
    setLoginBusy(true);
    setError("");
    try {
      const data = await request("/auth/login", { method: "POST", body: credentials });
      const accessToken = data?.access_token || data?.token;
      if (!accessToken) throw new Error("The login response did not include an access token.");
      localStorage.setItem(TOKEN_EXPIRY_KEY, String(getTokenExpiry(data, accessToken)));
      localStorage.setItem(TOKEN_KEY, accessToken);
      setToken(accessToken);
      setNotice("Signed in successfully.");
    } catch (cause) {
      setError(`Could not sign in. ${cause.message}`);
    } finally {
      setLoginBusy(false);
    }
  };

  const saveProject = async (form) => {
    setBusy(true);
    setError("");
    try {
      if (page === "edit") {
        await request(`/projects/${getId(selectedProject)}`, { method: "PATCH", token, body: form });
        setNotice("Project updated successfully.");
      } else {
        await request("/projects", { method: "POST", token, body: form });
        setNotice("Project created successfully.");
      }
      await loadProjects();
      setPage("projects");
    } catch (cause) {
      setError(`Could not ${page === "edit" ? "update" : "create"} project. ${cause.message}`);
    } finally {
      setBusy(false);
    }
  };

  const removeProject = async (project) => {
    if (!window.confirm("Are you sure you want to continue?")) return;
    try {
      await request(`/projects/${getId(project)}`, { method: "DELETE", token });
      setNotice("Project deleted.");
      setSelectedProject(null);
      setPage("projects");
      await loadProjects();
    } catch (cause) {
      setError(`Could not delete project. ${cause.message}`);
    }
  };

  const addTechnology = async (event) => {
    event.preventDefault();
    const value = technologyName.trim();
    if (!value) return;
    setBusy(true);
    try {
      const nextTechnologies = [...technologies.map(getTechnologyName).filter(Boolean), value];
      const updatedProject = await request(`/projects/${getId(selectedProject)}`, {
        method: "PATCH", token, body: { technologies: nextTechnologies },
      });
      const savedTechnologies = updatedProject?.technologies ?? nextTechnologies;
      setTechnologies(getItems(savedTechnologies));
      setSelectedProject((current) => ({ ...current, ...updatedProject, technologies: savedTechnologies }));
      setProjects((current) => current.map((project) => getId(project) === getId(selectedProject)
        ? { ...project, ...updatedProject, technologies: savedTechnologies }
        : project));
      setTechnologyName("");
      setNotice("Technology added.");
    } catch (cause) {
      setError(`Could not add technology. ${cause.message}`);
    } finally {
      setBusy(false);
    }
  };

  const uploadImage = async (event) => {
    event.preventDefault();
    if (!imageFile) return;
    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(imageFile.type)) {
      setError("Choose a PNG, JPG, WEBP, or GIF image.");
      return;
    }
    if (imageFile.size > 5 * 1024 * 1024) {
      setError("Image must be no larger than 5 MB.");
      return;
    }
    const payload = new FormData();
    payload.append("file", imageFile);
    setBusy(true);
    try {
      await request(`/projects/${getId(selectedProject)}/images`, { method: "POST", token, body: payload });
      const result = await request(`/projects/${getId(selectedProject)}/images`, { token });
      setImages(getItems(result));
      setImageFile(null);
      if (imageInput.current) imageInput.current.value = "";
      setNotice("Image uploaded successfully.");
    } catch (cause) {
      setError(`Could not upload image. ${cause.message}`);
    } finally {
      setBusy(false);
    }
  };

  const updateImage = async (event, image) => {
    event.preventDefault();
    const imageId = image.id ?? image.image_id;
    const file = imageUpdateFiles[imageId];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) {
      setError("Choose a PNG, JPG, WEBP, or GIF image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be no larger than 5 MB.");
      return;
    }

    const payload = new FormData();
    payload.append("file", file);
    setBusy(true);
    setError("");
    try {
      await request(`/projects/${getId(selectedProject)}/images/${imageId}`, {
        method: "PUT", token, body: payload,
      });
      const result = await request(`/projects/${getId(selectedProject)}/images`, { token });
      const updatedImages = getItems(result);
      setImages(updatedImages);
      setSelectedProject((current) => ({ ...current, images: updatedImages }));
      setProjects((current) => current.map((project) => getId(project) === getId(selectedProject)
        ? { ...project, images: updatedImages }
        : project));
      setImageUpdateFiles((current) => ({ ...current, [imageId]: null }));
      setNotice("Project image updated.");
    } catch (cause) {
      setError(`Could not update image. ${cause.message}`);
    } finally {
      setBusy(false);
    }
  };

  const deleteImage = async (image) => {
    const imageId = image.id ?? image.image_id;
    if (imageId == null || !window.confirm("Delete this project image?")) return;

    setBusy(true);
    setError("");
    try {
      await request(`/projects/${getId(selectedProject)}/images/${imageId}`, {
        method: "DELETE", token,
      });
      const updatedImages = images.filter((current) => (current.id ?? current.image_id) !== imageId);
      setImages(updatedImages);
      setSelectedProject((current) => ({ ...current, images: updatedImages }));
      setProjects((current) => current.map((project) => getId(project) === getId(selectedProject)
        ? { ...project, images: updatedImages }
        : project));
      setNotice("Project image deleted.");
    } catch (cause) {
      setError(`Could not delete image. ${cause.message}`);
    } finally {
      setBusy(false);
    }
  };

  const go = (destination) => {
    setError("");
    setNotice("");
    setPage(destination);
    if (destination !== "details") setSelectedProject(null);
  };

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-12">
        <form onSubmit={login} className="glass-panel w-full max-w-md rounded-3xl p-8">
          <a href="/" className="mb-8 inline-flex items-center gap-3">
            <span className="brand-mark">S</span>
            <span><strong className="block font-display">SHUVO</strong><small className="text-secondary-light dark:text-secondary-dark">Portfolio Admin</small></span>
          </a>
          <span className="eyebrow">Admin Panel</span>
          <h1 className="mb-2 text-3xl">Welcome back</h1>
          <p className="mb-7 text-sm text-secondary-light dark:text-secondary-dark">Sign in to manage your portfolio projects.</p>
          <div className="space-y-4">
            <FormField label="Username" type="text" autoComplete="username" value={credentials.username} onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} required />
            <FormField label="Password" type="password" autoComplete="current-password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} required />
          </div>
          {error && <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button className="btn-primary mt-6 w-full" disabled={loginBusy}>{loginBusy ? "Signing in…" : "Sign in"}</button>
          <a className="mt-5 block text-center text-sm text-secondary-light hover:text-primary-light dark:text-secondary-dark dark:hover:text-primary-dark" href="/">← Back to portfolio</a>
        </form>
      </main>
    );
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: FiGrid },
    { id: "projects", label: "Projects", icon: FiBox },
    { id: "create", label: "Add Project", icon: FiPlus },
    { id: "settings", label: "Settings", icon: FiSettings },
  ];

  return (
    <div className="min-h-screen md:flex">
      <aside className="glass-panel flex shrink-0 flex-col border-b p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r md:p-6">
        <a href="/" className="mb-5 flex items-center gap-3 md:mb-10">
          <span className="brand-mark">S</span>
          <span><strong className="block font-display">SHUVO</strong><small className="text-secondary-light dark:text-secondary-dark">Portfolio Admin</small></span>
        </a>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => go(id)} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors ${page === id ? "bg-accent-light/10 text-accent-light dark:bg-accent-dark/15 dark:text-accent-dark" : "text-secondary-light hover:bg-black/5 dark:text-secondary-dark dark:hover:bg-white/5"}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </nav>
        <a href="/" className="mt-auto hidden items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-secondary-light hover:bg-black/5 dark:text-secondary-dark dark:hover:bg-white/5 md:flex"><FiArrowLeft />Back to Site</a>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="glass-panel sticky top-0 z-20 flex items-center justify-between rounded-none border-x-0 border-t-0 px-5 py-4 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-light dark:text-accent-dark">Admin Panel</p>
            <p className="text-sm font-semibold">{page === "details" ? getTitle(selectedProject) : page === "create" ? "Create New Project" : page === "edit" ? "Edit Project" : page[0].toUpperCase() + page.slice(1)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="theme-toggle" aria-label="Toggle theme" onClick={toggleTheme}>{theme === "dark" ? <FiSun /> : <FiMoon />}</button>
            <button className="btn-ghost btn-sm" onClick={logout}><FiLogOut /> <span className="hidden sm:inline">Logout</span></button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
          {error && <div role="alert" className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError("")}><FiX /></button></div>}
          {notice && <div role="status" className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-300"><span>{notice}</span><button aria-label="Dismiss message" onClick={() => setNotice("")}><FiX /></button></div>}

          {page === "dashboard" && <>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div><span className="eyebrow">Overview</span><h1 className="text-3xl sm:text-4xl">Welcome back, Shuvo 👋</h1><p className="mt-2 text-sm text-secondary-light dark:text-secondary-dark">Manage your portfolio projects, technologies, and images from one place.</p></div>
              <button className="btn-primary" onClick={() => go("create")}><FiPlus /> New Project</button>
            </div>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Total Projects", loading ? "…" : projects.length, FiBox],
                ["Technologies Used", projectStats.technologyCount ?? "—", FiCheck],
                ["Images Uploaded", projectStats.imageCount ?? "—", FiImage],
                ["Last Updated", projectStats.latest ? projectStats.latest.toLocaleDateString() : "—", FiUpload],
              ].map(([label, value, Icon]) => <div className="stat-card" key={label}><span className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light/10 text-accent-light dark:bg-accent-dark/15 dark:text-accent-dark"><Icon /></span><p className="text-sm text-secondary-light dark:text-secondary-dark">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>)}
            </div>
            <div className="solid-panel rounded-3xl p-6">
              <div className="mb-5 flex items-center justify-between"><h2 className="text-xl">Recent projects</h2><button className="text-sm font-semibold text-accent-light dark:text-accent-dark" onClick={() => go("projects")}>View all <FiChevronRight className="inline" /></button></div>
              {projects.length ? <div className="space-y-2">{projects.slice(0, 5).map((project) => <button key={getId(project)} onClick={() => openProject(project)} className="flex w-full items-center justify-between gap-4 rounded-xl px-3 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5"><span><strong className="block text-sm">{getTitle(project)}</strong><span className="text-xs text-secondary-light dark:text-secondary-dark">{getDescription(project) || "No description"}</span></span><FiChevronRight className="shrink-0" /></button>)}</div> : <EmptyState loading={loading} text="No projects yet. Create your first project to showcase your work." />}
            </div>
          </>}

          {page === "projects" && <>
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><span className="eyebrow">Portfolio manager</span><h1 className="text-3xl">Projects</h1><p className="mt-2 text-sm text-secondary-light dark:text-secondary-dark">All projects shown on your portfolio.</p></div><button className="btn-primary" onClick={() => go("create")}><FiPlus /> Create Project</button></div>
            <div className="solid-panel overflow-hidden rounded-3xl">
              {projects.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-black/[0.07] bg-black/[0.02] text-xs uppercase tracking-wide text-secondary-light dark:border-white/[0.09] dark:bg-white/[0.02] dark:text-secondary-dark"><tr>{["ID", "Title", "Category", "Technologies", "Images", "Status", "Priority", "Actions"].map((heading) => <th className="px-5 py-4 font-semibold" key={heading}>{heading}</th>)}</tr></thead><tbody>{projects.map((project) => <tr key={getId(project)} className="border-b border-black/[0.05] last:border-0 dark:border-white/[0.06]"><td className="px-5 py-4 font-mono text-xs">{getId(project)}</td><td className="max-w-56 px-5 py-4 font-semibold">{getTitle(project)}</td><td className="px-5 py-4 capitalize">{project.category || "—"}</td><td className="px-5 py-4">{project.technologies?.length ?? "—"}</td><td className="px-5 py-4">{project.images?.length ?? "—"}</td><td className="px-5 py-4"><span className="tag">{project.status || "—"}{project.featured ? " · Featured" : ""}</span></td><td className="px-5 py-4">{project.priority ?? 0}</td><td className="px-5 py-4"><div className="flex gap-3"><button className="font-semibold text-accent-light dark:text-accent-dark" onClick={() => openProject(project)}>View</button><button className="font-semibold text-accent-light dark:text-accent-dark" onClick={() => openProject(project, "technologies")}>Add Tech</button><button className="font-semibold text-accent-light dark:text-accent-dark" onClick={() => openProject(project, "images")}>Upload Image</button></div></td></tr>)}</tbody></table></div> : <div className="p-8"><EmptyState loading={loading} text="No projects yet. Create your first project to showcase your work." action={() => go("create")} /></div>}
            </div>
          </>}

          {(page === "create" || page === "edit") && <>
            <div className="mb-7"><span className="eyebrow">Project details</span><h1 className="text-3xl">{page === "edit" ? "Edit Project" : "Create New Project"}</h1><p className="mt-2 text-sm text-secondary-light dark:text-secondary-dark">Fill in the details to add a project to your portfolio.</p></div>
            <ProjectForm initialProject={page === "edit" ? selectedProject : null} busy={busy} onCancel={() => go("projects")} onSubmit={saveProject} />
          </>}

          {page === "details" && selectedProject && <>
            <div className="mb-7 flex flex-wrap items-start justify-between gap-4"><div><button className="mb-4 inline-flex items-center gap-2 text-sm text-secondary-light hover:text-primary-light dark:text-secondary-dark dark:hover:text-primary-dark" onClick={() => go("projects")}><FiArrowLeft /> Projects</button><span className="eyebrow">Project details</span><h1 className="text-3xl">{getTitle(selectedProject)}</h1></div><div className="flex gap-2"><button className="btn-ghost btn-sm" onClick={() => { setPage("edit"); setError(""); }}><FiSettings /> Edit</button><button className="btn-ghost btn-sm text-red-600 dark:text-red-400" onClick={() => removeProject(selectedProject)}><FiTrash2 /> Delete</button></div></div>
            <div className="mb-6 flex gap-2 border-b border-black/[0.07] dark:border-white/[0.09]">{["overview", "technologies", "images"].map((tab) => <button key={tab} onClick={() => setDetailTab(tab)} className={`border-b-2 px-4 py-3 text-sm font-semibold capitalize ${detailTab === tab ? "border-accent-light text-accent-light dark:border-accent-dark dark:text-accent-dark" : "border-transparent text-secondary-light dark:text-secondary-dark"}`}>{tab}</button>)}</div>
            {detailTab === "overview" && <div className="solid-panel rounded-3xl p-6 sm:p-8"><h2 className="mb-3 text-xl">Overview</h2><p className="mb-6 whitespace-pre-wrap text-sm leading-7 text-secondary-light dark:text-secondary-dark">{getDescription(selectedProject) || "No description provided."}</p><dl className="mb-6 grid gap-4 text-sm sm:grid-cols-3"><div><dt className="text-secondary-light dark:text-secondary-dark">Category</dt><dd className="mt-1 font-medium capitalize">{selectedProject.category || "—"}</dd></div><div><dt className="text-secondary-light dark:text-secondary-dark">Status</dt><dd className="mt-1 font-medium">{selectedProject.status || "—"}</dd></div><div><dt className="text-secondary-light dark:text-secondary-dark">Priority</dt><dd className="mt-1 font-medium">{selectedProject.priority ?? 0}</dd></div></dl><div className="flex flex-wrap gap-3">{selectedProject.live_url && <a className="btn-ghost btn-sm" href={selectedProject.live_url} target="_blank" rel="noreferrer">Live project <FiExternalLink /></a>}{(selectedProject.frontend_source_url || selectedProject.github_url) && <a className="btn-ghost btn-sm" href={selectedProject.frontend_source_url || selectedProject.github_url} target="_blank" rel="noreferrer">Frontend source <FiExternalLink /></a>}{selectedProject.backend_source_url && <a className="btn-ghost btn-sm" href={selectedProject.backend_source_url} target="_blank" rel="noreferrer">Backend source <FiExternalLink /></a>}</div>{selectedProject.features?.length > 0 && <section className="mt-7 border-t border-black/[0.07] pt-6 dark:border-white/[0.09]"><h3 className="mb-4 text-lg font-semibold">Features</h3><div className="grid gap-3 sm:grid-cols-2">{getFeatureList(selectedProject.features).map((feature, index) => <article className="rounded-2xl bg-black/[0.03] p-4 dark:bg-white/[0.04]" key={`${feature.title}-${index}`}><h4 className="font-semibold">{feature.title}</h4>{feature.description && <p className="mt-1 text-sm text-secondary-light dark:text-secondary-dark">{feature.description}</p>}</article>)}</div></section>}<p className="mt-6 text-xs text-secondary-light dark:text-secondary-dark">Created {selectedProject.created_at ? new Date(selectedProject.created_at).toLocaleDateString() : "date unavailable"}</p></div>}
            {detailTab === "technologies" && <div className="solid-panel rounded-3xl p-6 sm:p-8"><h2 className="text-xl">Technologies</h2><p className="mb-5 mt-1 text-sm text-secondary-light dark:text-secondary-dark">Tools and frameworks used in this project.</p><form onSubmit={addTechnology} className="mb-7 flex flex-wrap gap-3"><input className="field-input max-w-sm flex-1" aria-label="Technology name" placeholder="e.g. FastAPI, React, PostgreSQL" value={technologyName} onChange={(event) => setTechnologyName(event.target.value)} required /><button className="btn-primary" disabled={busy}><FiPlus /> Add Technology</button></form>{technologies.length ? <div className="flex flex-wrap gap-2">{technologies.map((technology, index) => <span className="tag" key={technology.id ?? getTechnologyName(technology) ?? index}>{getTechnologyName(technology)}</span>)}</div> : <EmptyState text="No technologies added yet." />}</div>}
            {detailTab === "images" && <div className="solid-panel rounded-3xl p-6 sm:p-8"><h2 className="text-xl">Project Images</h2><p className="mb-5 mt-1 text-sm text-secondary-light dark:text-secondary-dark">Upload, replace, or delete screenshots (JPG, PNG, WEBP, or GIF; max 5 MB).</p><form onSubmit={uploadImage} className="mb-7 flex flex-wrap items-center gap-3"><input ref={imageInput} className="field-input max-w-sm flex-1" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => setImageFile(event.target.files?.[0] || null)} required /><button className="btn-primary" disabled={busy}><FiUpload /> Upload Image</button></form>{images.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{images.map((image, index) => { const url = getImageUrl(image); const imageId = image.id ?? image.image_id; return <article key={imageId ?? url ?? index} className="overflow-hidden rounded-2xl border border-black/[0.07] dark:border-white/[0.09]"><a href={url} target="_blank" rel="noreferrer" className="group block"><img className="aspect-square w-full object-cover transition-transform group-hover:scale-105" src={url} alt={image.alt || `${getTitle(selectedProject)} preview ${index + 1}`} /></a>{imageId != null && <div className="space-y-2 p-3"><form onSubmit={(event) => updateImage(event, image)} className="space-y-2"><input className="field-input text-xs" type="file" accept="image/png,image/jpeg,image/webp,image/gif" aria-label={`Choose replacement for image ${imageId}`} onChange={(event) => setImageUpdateFiles((current) => ({ ...current, [imageId]: event.target.files?.[0] || null }))} required /><button className="btn-ghost btn-sm w-full justify-center" type="submit" disabled={busy || !imageUpdateFiles[imageId]}>Replace Image</button></form><button className="btn-ghost btn-sm w-full justify-center text-red-600 dark:text-red-400" type="button" onClick={() => deleteImage(image)} disabled={busy}><FiTrash2 /> Delete Image</button></div>}</article>; })}</div> : <EmptyState text="No images uploaded yet." />}</div>}
          </>}

          {page === "settings" && <div className="solid-panel max-w-3xl rounded-3xl p-6 sm:p-8"><span className="eyebrow">Profile</span><h1 className="mb-2 text-3xl">Settings</h1><p className="mb-6 text-sm text-secondary-light dark:text-secondary-dark">Portfolio profile settings are managed in the site source. Use the resume link below to verify the public download.</p><p className="font-semibold">Shakhawat Hossain Shuvo</p><p className="mb-5 text-sm text-secondary-light dark:text-secondary-dark">Full Stack Developer</p><a className="btn-ghost btn-sm" href="/resume.pdf" download>Download Resume <FiExternalLink /></a></div>}
        </main>
        <footer className="px-5 pb-7 text-center text-xs text-secondary-light dark:text-secondary-dark">© 2026 Shakhawat Hossain Shuvo. Admin Panel</footer>
      </div>
    </div>
  );
}

function EmptyState({ text, loading: isLoading = false, action }) {
  return <div className="flex min-h-32 flex-col items-center justify-center gap-3 text-center"><p className="text-sm text-secondary-light dark:text-secondary-dark">{isLoading ? "Loading…" : text}</p>{!isLoading && action && <button className="btn-primary btn-sm" onClick={action}><FiPlus /> Create Project</button>}</div>;
}
