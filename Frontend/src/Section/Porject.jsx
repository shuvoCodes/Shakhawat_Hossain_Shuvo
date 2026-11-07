import React, { useState } from "react";
import { Link } from "react-router-dom";
import ProjectCard from "./ProjectCard";
import ProjectDetails from "./ProjectDetails";
import useProjects from "./useProjects";

const Project = () => {
    const [selectedProject, setSelectedProject] = useState(null);
    const { projects, loading, error, reload } = useProjects();
    const featuredProjects = [...projects]
        .sort((first, second) => Number(Boolean(second.featured)) - Number(Boolean(first.featured)))
        .slice(0, 3);

    return (
        <section className="px-8 py-[70px]" id="projects">
            <div className="mx-auto max-w-[1180px]">
                <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <span className="eyebrow">Featured Projects</span>
                        <h2 className="text-[clamp(26px,3.4vw,36px)]">Selected Work</h2>
                    </div>
                    <Link className="btn-ghost btn-sm" to="/projects">
                        Show more projects <span aria-hidden="true">→</span>
                    </Link>
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
                {!loading && !error && !featuredProjects.length && (
                    <p className="text-sm text-secondary-light dark:text-secondary-dark">
                        No projects are available yet.
                    </p>
                )}
                {!loading && !error && featuredProjects.length > 0 && (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {featuredProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onClick={() => setSelectedProject(project)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {selectedProject && (
                <ProjectDetails
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                />
            )}
        </section>
    );
};

export default Project;
