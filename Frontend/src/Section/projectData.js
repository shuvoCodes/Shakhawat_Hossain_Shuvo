import API_BASE_URL from "../Base/baseUrl";

const API_BASE = API_BASE_URL;
const PROJECT_STATUS_LABELS = {
    completed: "Completed",
    in_progress: "In Progress",
    on_hold: "On Hold",
    planned: "Planned",
};

const normalizeStatus = (status) =>
    String(status || "").trim().toLowerCase().replace(/[\s-]+/g, "_");

const formatTimelineDate = (value) => {
    if (!value) return "";
    const date = new Date(`${String(value).slice(0, 10)}T12:00:00Z`);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
        year: "numeric",
    }).format(date);
};

const getTimelineLabel = (project, status) => {
    const startDate = formatTimelineDate(project?.start_date);
    const endDate = formatTimelineDate(project?.end_date);
    const lastUpdated = formatTimelineDate(project?.last_updated);
    const expectedStartDate = formatTimelineDate(project?.expected_start_date);

    if (status === "completed" && startDate && endDate) {
        return `${startDate} – ${endDate}`;
    }
    if (status === "in_progress" && startDate) {
        return `${startDate} – Present`;
    }
    if (status === "on_hold" && startDate && lastUpdated) {
        return `${startDate} – Last updated ${lastUpdated}`;
    }
    if (status === "planned" && expectedStartDate) {
        return `Expected start ${expectedStartDate}`;
    }
    return "";
};

const getItems = (data) => {
    if (Array.isArray(data)) return data;
    for (const key of ["items", "results", "projects", "technologies", "images", "features"]) {
        if (Array.isArray(data?.[key])) return data[key];
    }
    return null;
};

const getTechnologyName = (technology) =>
    typeof technology === "string"
        ? technology
        : technology?.name || technology?.title || "";

const getProjectFeatures = (project) => {
    const features = project?.features ?? project?.feature_list ?? project?.key_features;
    if (typeof features === "string") {
        return features
            .split(/\r?\n|,/)
            .map((feature) => feature.trim())
            .filter(Boolean)
            .map((title) => ({ title, description: "" }));
    }

    return (getItems(features) || [])
        .map((feature) => {
            if (typeof feature === "string") return { title: feature, description: "" };
            return {
                title: feature?.title || feature?.name || feature?.feature || "",
                description: feature?.description || "",
            };
        })
        .filter((feature) => feature.title);
};

const getImageUrl = (image) => {
    const url =
        typeof image === "string"
            ? image
            : image?.image_url || image?.imageUrl || image?.url || image?.path;
    if (!url) return "";
    return /^https?:\/\//i.test(url)
        ? url
        : `${API_BASE}/${url.replace(/^\/+/, "")}`;
};

const getProjectUrl = (project, ...candidates) => {
    for (const candidate of candidates) {
        if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
        if (candidate && typeof candidate === "object") {
            const value = candidate.url || candidate.href || candidate.link || "";
            if (typeof value === "string" && value.trim()) return value.trim();
        }
    }
    return "";
};

const normalizeCategories = (project, technologies) => {
    const explicitCategory = String(
        project.category || project.project_type || project.type || "",
    ).toLowerCase();
    const categories = new Set();

    if (/front|client|mobile|android|ios/.test(explicitCategory)) categories.add("frontend");
    if (/back|server|api/.test(explicitCategory)) categories.add("backend");
    if (/^app$/.test(explicitCategory)) categories.add("app");
    if (/full[\s_-]?stack/.test(explicitCategory)) {
        categories.add("frontend");
        categories.add("backend");
    }

    const searchableText = [
        project.title,
        project.description,
        ...technologies,
    ]
        .join(" ")
        .toLowerCase();

    if (/\b(react|react native|vue|angular|svelte|next\.?js|html|css|javascript|typescript|tailwind|bootstrap|flutter)\b/.test(searchableText)) {
        categories.add("frontend");
    }
    if (/\b(fastapi|django|flask|express|node\.?js|spring|laravel|php|postgres(?:ql)?|mysql|mongodb|redis|sqlite|rest api|graphql)\b/.test(searchableText)) {
        categories.add("backend");
    }

    return [...categories];
};

export async function requestProjectApi(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const response = await fetch(url, options);
    if (!response.ok) {
        const message = await response.text();
        let detail = message;
        try {
            const parsed = JSON.parse(message);
            detail = parsed.detail || parsed.message || message;
        } catch {
            // Keep the response body when the API returns plain text.
        }
        throw new Error(detail || `Request failed (${response.status})`);
    }

    if (response.status === 204) return null;
    const contentType = response.headers.get("content-type") || "";
    return contentType.includes("application/json") ? response.json() : null;
}

export function normalizeProject(project) {
    const technologies = (getItems(project?.technologies) || [])
        .map(getTechnologyName)
        .filter(Boolean);
    const images = getItems(project?.images) || [];
    const image = getImageUrl(project?.image || images[0]);
    const categories = normalizeCategories(project || {}, technologies);
    const categoryLabel = categories
        .map((category) => ({
            frontend: "Frontend",
            backend: "Backend",
            app: "App",
        }[category]))
        .join(" · ");
    const status = project?.status || (project?.featured ? "Featured" : "Project");
    const normalizedStatus = normalizeStatus(status);

    return {
        ...project,
        id: project?.id ?? project?.project_id,
        title: project?.title || project?.name || "Untitled project",
        description: project?.description || project?.short_description || "",
        details: project?.details || project?.long_description || project?.description || project?.short_description || "",
        category: categories,
        categoryLabel: categoryLabel || "Project",
        status,
        statusLabel: PROJECT_STATUS_LABELS[normalizedStatus] || status,
        timelineLabel: getTimelineLabel(project, normalizedStatus),
        image,
        imageAlt: project?.title || project?.name || "Project preview",
        technologies,
        features: getProjectFeatures(project),
        liveUrl: project?.live_url || project?.liveUrl || "",
        sourceUrl: getProjectUrl(project, project?.frontend_source_url, project?.github_url, project?.source_url, project?.sourceUrl, project?.frontendSourceUrl),
        backendSourceUrl: getProjectUrl(project, project?.backend_source_url, project?.backendSourceUrl),
        relatedProjectId:
            project?.related_project_id ||
            project?.relatedProjectId?.id ||
            project?.relatedProjectId ||
            project?.related_project?.id ||
            null,
        relatedProjectLabel: project?.related_project_label || project?.relatedProjectLabel || "View related project",
    };
}

export async function fetchProjects() {
    const data = await requestProjectApi("/projects/all");
    const items = getItems(data);
    if (!Array.isArray(items)) {
        throw new Error("The projects API did not return a project list.");
    }

    const projects = await Promise.all(
        items.map(async (project) => {
            const id = project.id ?? project.project_id;
            if (id == null) {
                throw new Error("A project from the API is missing its ID.");
            }

            const normalized = normalizeProject(project);
            if (normalized.image || project.images) return normalized;

            try {
                const imageData = await requestProjectApi(`/projects/${encodeURIComponent(id)}/images`);
                const images = getItems(imageData) || [];
                return {
                    ...normalized,
                    image: getImageUrl(images[0]),
                };
            } catch {
                return normalized;
            }
        }),
    );

    return projects;
}

export async function fetchProjectDetails(project) {
    const id = project?.id ?? project?.project_id;
    if (id == null) {
        return normalizeProject(project);
    }

    const details = await requestProjectApi(`/projects/${encodeURIComponent(id)}`).catch(() => ({}));
    const projectData = { ...(project || {}), ...(details || {}) };
    const technologies = getItems(projectData.technologies) || [];
    const images = getItems(projectData.images) || [];

    const fallbackImages = images.length
        ? images
        : await requestProjectApi(`/projects/${encodeURIComponent(id)}/images`).then(getItems).catch(() => []);

    return normalizeProject({
        ...projectData,
        technologies,
        images: fallbackImages,
    });
}
