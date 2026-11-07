import React, { useMemo, useState } from "react";
import Footer from "./Components/Footer";
import Navbar from "./Components/Navbar";
import ProjectCard from "./Section/ProjectCard";
import ProjectDetails from "./Section/ProjectDetails";
import useProjects from "./Section/useProjects";

const filters = [
    { id: "all", label: "All" },
    { id: "frontend", label: "Frontend" },
    { id: "backend", label: "Backend" },
];

const Projects = () => {
    const [activeFilter, setActiveFilter] = useState("all");
    const [selectedProject, setSelectedProject] = useState(null);
    const { projects, loading, error, reload } = useProjects();
    const visibleProjects = useMemo(
        () =>
            activeFilter === "all"
                ? projects
                : projects.filter((project) => {
                    const categories = Array.isArray(project.category)
                        ? project.category
                        : [project.category].filter(Boolean);
                    return categories.some((category) => String(category).toLowerCase().includes(activeFilter));
                }),
        [activeFilter, projects],
    );

    return (
        <>
            <Navbar />
            <main className="min-h-[70vh] px-8 py-16">
                <section className="mx-auto max-w-[1180px]" aria-labelledby="projects-heading">
                    <span className="eyebrow">Project archive</span>
                    <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
                        <div>
                            <h1 id="projects-heading" className="text-[clamp(30px,4vw,44px)]">
                                All Projects
                            </h1>
                            <p className="mt-2 text-sm text-secondary-light dark:text-secondary-dark">
                                Browse the work by project type.
                            </p>
                        </div>
                        <div
                            className="flex flex-wrap gap-2"
                            role="group"
                            aria-label="Filter projects"
                        >
                            {filters.map((filter) => (
                                <button
                                    key={filter.id}
                                    type="button"
                                    className={
                                        activeFilter === filter.id
                                            ? "btn-primary btn-sm"
                                            : "btn-ghost btn-sm"
                                    }
                                    onClick={() => setActiveFilter(filter.id)}
                                    aria-pressed={activeFilter === filter.id}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading && (
                        <p role="status" className="text-sm text-secondary-light dark:text-secondary-dark">
                            Loading projects…
                        </p>
                    )}
                    {error && (
                        <div className="flex flex-wrap items-center gap-3 text-sm text-red-600 dark:text-red-400">
                            <p role="alert">{error}</p>
                            <button className="btn-ghost btn-sm" onClick={reload}>Try again</button>
                        </div>
                    )}
                    {!loading && !error && !visibleProjects.length && (
                        <p className="text-sm text-secondary-light dark:text-secondary-dark">
                            No projects found in this category.
                        </p>
                    )}
                    {!loading && !error && visibleProjects.length > 0 && (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {visibleProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onClick={() => setSelectedProject(project)}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>
            <Footer />

            {selectedProject && (
                <ProjectDetails
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                />
            )}
        </>
    );
};

export default Projects;
