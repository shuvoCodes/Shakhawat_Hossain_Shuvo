import React, { useEffect, useRef, useState } from "react";
import { fetchProjectDetails } from "./projectData";

const ProjectDetails = ({ project, onClose, level = 0 }) => {
    const [relatedProject, setRelatedProject] = useState(null);
    const [projectDetails, setProjectDetails] = useState(project);
    const [loadingDetails, setLoadingDetails] = useState(true);
    const [detailsError, setDetailsError] = useState("");
    const dialogRef = useRef(null);
    const relatedTriggerRef = useRef(null);

    useEffect(() => {
        dialogRef.current?.focus();
    }, []);

    useEffect(() => {
        let isCurrent = true;
        setProjectDetails(project);
        setLoadingDetails(true);
        setDetailsError("");
        fetchProjectDetails(project)
            .then((details) => {
                if (isCurrent) setProjectDetails(details);
            })
            .catch((cause) => {
                if (isCurrent) setDetailsError(`Could not load project details. ${cause.message}`);
            })
            .finally(() => {
                if (isCurrent) setLoadingDetails(false);
            });

        return () => {
            isCurrent = false;
        };
    }, [project]);

    useEffect(() => {
        if (!relatedProject && relatedTriggerRef.current) {
            relatedTriggerRef.current.focus();
            relatedTriggerRef.current = null;
        }
    }, [relatedProject]);

    useEffect(() => {
        if (level !== 0) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [level]);

    const handleKeyDown = (event) => {
        if (event.key === "Escape") {
            event.stopPropagation();
            onClose();
        }
    };

    const handleBackdropClick = (event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) onClose();
    };

    return (
        <div
            className={`fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm ${level ? "z-[80]" : ""}`}
            onClick={handleBackdropClick}
        >
            <section
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={`project-title-${project.id}`}
                tabIndex={-1}
                className="solid-panel relative my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] p-6 shadow-glass sm:p-8"
                onClick={(event) => event.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                <button
                    type="button"
                    className="theme-toggle absolute right-4 top-4"
                    onClick={onClose}
                    aria-label="Close project details"
                >
                    <span aria-hidden="true">×</span>
                </button>

                {projectDetails.image ? (
                    <img
                        className="mb-6 h-52 w-full rounded-2xl object-cover sm:h-64"
                        src={projectDetails.image}
                        alt={projectDetails.imageAlt}
                    />
                ) : (
                    <div className="mb-6 flex h-52 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-accent-light/15 to-accent2-light/10 text-sm text-secondary-light dark:from-accent-dark/15 dark:to-accent2-dark/10 dark:text-secondary-dark sm:h-64">
                        No project image
                    </div>
                )}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="tag">{projectDetails.categoryLabel}</span>
                    <span className="status-pill !mb-0">
                        <span className="fc-dot" />
                        {projectDetails.status}
                    </span>
                </div>
                <h2
                    id={`project-title-${projectDetails.id}`}
                    className="mb-3 pr-10 text-2xl sm:text-3xl"
                >
                    {projectDetails.title}
                </h2>
                <p className="text-[14.5px] leading-7 text-secondary-light dark:text-secondary-dark">
                    {projectDetails.details}
                </p>

                {loadingDetails && (
                    <p role="status" className="mt-4 text-sm text-secondary-light dark:text-secondary-dark">
                        Loading project information…
                    </p>
                )}
                {detailsError && (
                    <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">
                        {detailsError}
                    </p>
                )}

                <div className="mt-6">
                    <h3 className="mb-3 text-base font-semibold">Technologies</h3>
                    {projectDetails.technologies.length ? (
                        <div className="flex flex-wrap gap-2">
                            {projectDetails.technologies.map((technology) => (
                            <span className="tag" key={technology}>
                                {technology}
                            </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-secondary-light dark:text-secondary-dark">
                            No technologies listed.
                        </p>
                    )}
                </div>

                <div className="mt-6">
                    <h3 className="mb-3 text-base font-semibold">Features</h3>
                    {projectDetails.features.length ? (
                        <ul className="grid gap-3 sm:grid-cols-2">
                            {projectDetails.features.map((feature, index) => (
                                <li
                                    className="glass-panel rounded-2xl p-4"
                                    key={`${feature.title}-${index}`}
                                >
                                    <h4 className="text-sm font-semibold">{feature.title}</h4>
                                    {feature.description && (
                                        <p className="mt-1 text-sm leading-6 text-secondary-light dark:text-secondary-dark">
                                            {feature.description}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-secondary-light dark:text-secondary-dark">
                            No features listed for this project.
                        </p>
                    )}
                </div>

                {(projectDetails.liveUrl || projectDetails.sourceUrl || projectDetails.backendSourceUrl || projectDetails.relatedProjectId) && (
                    <div className="mt-7 flex flex-wrap gap-3">
                        {projectDetails.liveUrl && (
                            <a
                                className="btn-primary btn-sm"
                                href={projectDetails.liveUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Visit live project <span aria-hidden="true">↗</span>
                            </a>
                        )}
                        {projectDetails.sourceUrl && (
                            <a
                                className="btn-ghost btn-sm"
                                href={projectDetails.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Frontend source <span aria-hidden="true">↗</span>
                            </a>
                        )}
                        {projectDetails.backendSourceUrl && (
                            <a
                                className="btn-ghost btn-sm"
                                href={projectDetails.backendSourceUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Backend source <span aria-hidden="true">↗</span>
                            </a>
                        )}
                        {projectDetails.relatedProjectId && (
                            <button
                                type="button"
                                className="btn-ghost btn-sm"
                                onClick={(event) => {
                                    relatedTriggerRef.current = event.currentTarget;
                                    setRelatedProject({
                                        id: projectDetails.relatedProjectId,
                                        title: "Related project",
                                        description: "",
                                        details: "",
                                        category: [],
                                        categoryLabel: "Project",
                                        status: "Project",
                                        image: "",
                                        imageAlt: "Related project preview",
                                        technologies: [],
                                        features: [],
                                    });
                                }}
                            >
                                {projectDetails.relatedProjectLabel}
                                <span aria-hidden="true"> →</span>
                            </button>
                        )}
                    </div>
                )}
            </section>

            {relatedProject && (
                <ProjectDetails
                    project={relatedProject}
                    onClose={() => setRelatedProject(null)}
                    level={level + 1}
                />
            )}
        </div>
    );
};

export default ProjectDetails;
