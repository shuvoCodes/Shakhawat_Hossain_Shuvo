import React from "react";

const ProjectCard = ({ project, onClick }) => (
    <button
        type="button"
        className="project-card group cursor-pointer overflow-hidden text-left transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-light dark:focus-visible:outline-accent-dark"
        onClick={onClick}
        aria-label={`View details for ${project.title}`}
    >
        {project.image ? (
            <img
                className="mb-5 h-44 w-full rounded-2xl object-cover"
                src={project.image}
                alt={project.imageAlt}
            />
        ) : (
            <span className="mb-5 flex h-44 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-accent-light/15 to-accent2-light/10 text-sm text-secondary-light dark:from-accent-dark/15 dark:to-accent2-dark/10 dark:text-secondary-dark">
                No project image
            </span>
        )}
        <span className="status-pill">
            <span className="fc-dot" />
            {project.statusLabel}
        </span>
        {project.timelineLabel && (
            <span className="mb-2 block text-xs text-secondary-light dark:text-secondary-dark">
                {project.timelineLabel}
            </span>
        )}
        <span className="mb-2 block text-lg font-semibold leading-snug">
            {project.title}
        </span>
        <span className="mb-4 block text-sm text-secondary-light dark:text-secondary-dark">
            {project.description}
        </span>
        <span className="mt-auto flex flex-wrap gap-1.5">
            {project.technologies.map((technology) => (
                <span className="tag" key={technology}>
                    {technology}
                </span>
            ))}
        </span>
        <span className="mt-5 block text-sm font-semibold text-accent-light dark:text-accent-dark">
            View project details <span aria-hidden="true">→</span>
        </span>
    </button>
);

export default ProjectCard;
