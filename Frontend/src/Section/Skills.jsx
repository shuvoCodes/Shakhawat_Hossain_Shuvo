import React from 'react';

const Skills = () => {
    return (
        <section className="px-8 py-[70px]" id="skills">
            <div className="mx-auto max-w-[1180px]">
                <div className="mb-10">
                    <span className="eyebrow">What I Work With</span>
                    <h2 className="text-[clamp(26px,3.4vw,36px)]">
                        Skills &amp; Technologies
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    <div className="skill-card">
                        <div className="skill-icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-5 w-5"
                            >
                                <polyline points="16 18 22 12 16 6" />
                                <polyline points="8 6 2 12 8 18" />
                            </svg>
                        </div>
                        <h3 className="mb-2.5 text-[15.5px] font-semibold">Languages</h3>
                        <div className="flex flex-wrap gap-1.5">
                            <span className="tag">C</span>
                            <span className="tag">C++</span>
                            <span className="tag">Python</span>
                            <span className="tag">Java</span>
                            <span className="tag">JavaScript</span>
                        </div>
                    </div>

                    <div className="skill-card">
                        <div className="skill-icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-5 w-5"
                            >
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <path d="M3 9h18" />
                                <path d="M9 21V9" />
                            </svg>
                        </div>
                        <h3 className="mb-2.5 text-[15.5px] font-semibold">Frontend</h3>
                        <div className="flex flex-wrap gap-1.5">
                            <span className="tag">React</span>
                            <span className="tag">HTML5</span>
                            <span className="tag">CSS3</span>
                            <span className="tag">Tailwind</span>
                            <span className="tag">Bootstrap</span>
                        </div>
                    </div>

                    <div className="skill-card">
                        <div className="skill-icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-5 w-5"
                            >
                                <rect x="2" y="2" width="20" height="8" rx="2" />
                                <rect x="2" y="14" width="20" height="8" rx="2" />
                                <line x1="6" y1="6" x2="6.01" y2="6" />
                                <line x1="6" y1="18" x2="6.01" y2="18" />
                            </svg>
                        </div>
                        <h3 className="mb-2.5 text-[15.5px] font-semibold">Backend</h3>
                        <div className="flex flex-wrap gap-1.5">
                            <span className="tag">FastAPI</span>
                            <span className="tag">REST APIs</span>
                            <span className="tag">Python</span>
                        </div>
                    </div>

                    <div className="skill-card">
                        <div className="skill-icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-5 w-5"
                            >
                                <ellipse cx="12" cy="5" rx="9" ry="3" />
                                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                            </svg>
                        </div>
                        <h3 className="mb-2.5 text-[15.5px] font-semibold">Databases</h3>
                        <div className="flex flex-wrap gap-1.5">
                            <span className="tag">PostgreSQL</span>
                            <span className="tag">MySQL</span>
                        </div>
                    </div>

                    <div className="skill-card col-span-2 md:col-span-1">
                        <div className="skill-icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-5 w-5"
                            >
                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                            </svg>
                        </div>
                        <h3 className="mb-2.5 text-[15.5px] font-semibold">
                            Tools &amp; Practices
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            <span className="tag">Git &amp; GitHub</span>
                            <span className="tag">API Design</span>
                            <span className="tag">Responsive Design</span>
                            <span className="tag">Agile/Scrum</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Skills;