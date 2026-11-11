import React from "react";

const ProjectLoadingSkeleton = ({ count = 3, label = "Loading projects" }) => (
    <div
        role="status"
        aria-label={label}
        className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
    >
        {Array.from({ length: count }, (_, index) => (
            <div
                key={index}
                aria-hidden="true"
                className="project-card animate-pulse"
            >
                <span className="mb-5 h-44 w-full rounded-2xl bg-black/[0.06] dark:bg-white/[0.08]" />
                <span className="mb-4 h-6 w-24 rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
                <span className="mb-3 h-5 w-3/4 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
                <span className="mb-2 h-4 w-full rounded bg-black/[0.06] dark:bg-white/[0.08]" />
                <span className="mb-5 h-4 w-2/3 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
                <span className="mt-auto h-6 w-1/2 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
            </div>
        ))}
    </div>
);

export default ProjectLoadingSkeleton;
