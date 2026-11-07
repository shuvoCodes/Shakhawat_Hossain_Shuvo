import React from 'react';

const About = () => {
    return (
        <section className="px-8 py-[70px]" id="about">
            <div className="mx-auto max-w-[1180px]">
                <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
                    <div>
                        <span className="eyebrow">About Me</span>
                        <h2 className="text-[clamp(26px,3.4vw,36px)]">
                            End-to-end development,
                            <br />
                            done properly.
                        </h2>
                    </div>
                    <div className="space-y-3.5 text-[15.5px] text-secondary-light dark:text-secondary-dark">
                        <p>
                            I'm a full stack developer with hands-on experience across the
                            entire development lifecycle — from designing database schemas
                            to building responsive frontends and deploying REST APIs. I
                            work comfortably with{" "}
                            <strong className="font-semibold text-primary-light dark:text-primary-dark">
                                C, C++, Python and Java
                            </strong>{" "}
                            on the programming side, and{" "}
                            <strong className="font-semibold text-primary-light dark:text-primary-dark">
                                FastAPI
                            </strong>{" "}
                            for building high-performance backends.
                        </p>
                        <p>
                            On the frontend, I build interfaces with{" "}
                            <strong className="font-semibold text-primary-light dark:text-primary-dark">
                                React
                            </strong>
                            , styled with{" "}
                            <strong className="font-semibold text-primary-light dark:text-primary-dark">
                                Tailwind CSS
                            </strong>{" "}
                            and{" "}
                            <strong className="font-semibold text-primary-light dark:text-primary-dark">
                                Bootstrap
                            </strong>
                            , backed by solid fundamentals in HTML, CSS and JavaScript. For
                            data, I work with both{" "}
                            <strong className="font-semibold text-primary-light dark:text-primary-dark">
                                MySQL
                            </strong>{" "}
                            and{" "}
                            <strong className="font-semibold text-primary-light dark:text-primary-dark">
                                PostgreSQL
                            </strong>
                            , designing schemas that scale.
                        </p>
                        <p>
                            I care about writing clean, maintainable code and building
                            products that actually solve problems — not just tick feature
                            boxes. I'm currently open to full-time roles, freelance
                            projects and collaborations.
                        </p>
                    </div>
                </div>

                <div className="mt-9 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                    <div className="stat-card">
                        <div className="gradient-text font-display text-[26px] font-bold">
                            5
                        </div>
                        <div className="mt-1 text-[13px] text-secondary-light dark:text-secondary-dark">
                            Languages — C, C++, Python, Java, JS
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="gradient-text font-display text-[26px] font-bold">
                            2
                        </div>
                        <div className="mt-1 text-[13px] text-secondary-light dark:text-secondary-dark">
                            Databases — PostgreSQL &amp; MySQL
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="gradient-text font-display text-[26px] font-bold">
                            01
                        </div>
                        <div className="mt-1 text-[13px] text-secondary-light dark:text-secondary-dark">
                            Actively shipping a full stack platform
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;