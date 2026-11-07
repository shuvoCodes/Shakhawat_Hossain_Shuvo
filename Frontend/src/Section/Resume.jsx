import React from 'react';

const Resume = () => {
    return (
        <section className="px-8 py-[70px]" id="resume">
            <div className="mx-auto max-w-[1180px]">
                <div className="mb-10">
                    <span className="eyebrow">Resume</span>
                    <h2 className="text-[clamp(26px,3.4vw,36px)]">
                        Want the full picture?
                    </h2>
                </div>

                <div className="resume-panel">
                    <div>
                        <p className="mb-[22px] text-[15.5px] text-secondary-light dark:text-secondary-dark">
                            Download my resume for detailed work experience, education
                            and certifications — or get in touch directly if you'd rather
                            talk it through.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <a
                                href="/resume.pdf"
                                download="Shakhawat-Hossain-Shuvo-Resume.pdf"
                                className="btn-primary"
                            >
                                Download Resume (PDF) ⬇
                            </a>
                            <a href="#contact" className="btn-ghost">
                                Contact Me
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-3.5">
                            <div className="focus-bullet">01</div>
                            <div>
                                <h4 className="mb-0.5 text-[15px] font-semibold">Backend</h4>
                                <p className="text-[13.5px] text-secondary-light dark:text-secondary-dark">
                                    Designing REST APIs and services with FastAPI and Python.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3.5">
                            <div className="focus-bullet">02</div>
                            <div>
                                <h4 className="mb-0.5 text-[15px] font-semibold">Frontend</h4>
                                <p className="text-[13.5px] text-secondary-light dark:text-secondary-dark">
                                    Building responsive React interfaces with Tailwind CSS
                                    and Bootstrap.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3.5">
                            <div className="focus-bullet">03</div>
                            <div>
                                <h4 className="mb-0.5 text-[15px] font-semibold">Data</h4>
                                <p className="text-[13.5px] text-secondary-light dark:text-secondary-dark">
                                    Schema design and querying across PostgreSQL and MySQL.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Resume;
