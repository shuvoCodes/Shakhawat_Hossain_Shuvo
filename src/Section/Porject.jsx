import React from 'react';

const Porject = () => {
    return (
        <section className="px-8 py-[70px]" id="projects">
            <div className="mx-auto max-w-[1180px]">
                <div className="mb-10">
                    <span className="eyebrow">Featured Projects</span>
                    <h2 className="text-[clamp(26px,3.4vw,36px)]">Selected Work</h2>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div className="project-card md:col-span-3 md:grid md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-[30px] md:p-8">
                        <div>
                            <span className="status-pill">
                                <span className="fc-dot" />
                                Project Successfully Completed
                            </span>
                            <h3 className="mb-2 text-xl font-semibold">
                                Courier &amp; Logistics Management Platform
                            </h3>
                            <p className="text-[14.5px] text-secondary-light dark:text-secondary-dark">
                                A full stack platform for managing courier and delivery
                                operations. The backend is being built with FastAPI, with
                                three dedicated frontends in progress: a public landing
                                page, a user dashboard, and an admin dashboard — each fully
                                responsive across mobile, tablet and desktop.
                            </p>
                            <div className="my-4 flex flex-wrap gap-1.5">
                                <span className="tag">FastAPI</span>
                                <span className="tag">React</span>
                                <span className="tag">PostgreSQL</span>
                                <span className="tag">Tailwind CSS</span>
                            </div>
                        </div>
                        <div className="project-mini-mock mt-4 md:mt-0">
                            {/* <div className="mm-bar w-3/5" />
                            <div className="mm-bar w-2/5" />
                            <div className="mm-block" />
                            <div className="mm-bar w-4/5" />
                            <div className="mm-block" /> */}
                            <a href='https://courier-management-platform.netlify.app/' target="_blank">
                                <img className='rounded-xl h-48 w-full object-cover' src="/Courier.png" alt="Courier Image" />
                            </a>
                        </div>
                    </div>


                    <div className="project-card md:col-span-3 md:grid md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-[30px] md:p-8">
                        <div>
                            <span className="status-pill">
                                <span className="fc-dot" />
                                Project Successfully Completed
                            </span>
                            <h3 className="mb-2 text-xl font-semibold">
                                Class Routine – Offline Android App
                            </h3>
                            <p className="text-[14.5px] text-secondary-light dark:text-secondary-dark">
                                An offline Android app for viewing class routines, rooms, teachers, and campus rules.
                                 It supports batch/semester selection, daily routines, room and teacher availability,
                                 Light/Dark themes, and offline routine data.
                            </p>
                            <div className="my-4 flex flex-wrap gap-1.5">
                                <span className="tag">JavaScript</span>
                                <span className="tag">React Native</span>
                                <span className="tag">Expo</span>
                                <span className="tag">AsyncStorage</span>
                            </div>
                        </div>
                        <div className="project-mini-mock mt-4 md:mt-0">
                            {/* <div className="mm-bar w-3/5" />
                            <div className="mm-bar w-2/5" />
                            <div className="mm-block" />
                            <div className="mm-bar w-4/5" />
                            <div className="mm-block" /> */}
                            <a href='https://github.com/shuvoCodes/CSE-Clab-App/releases/tag/v1.0.1' target="_blank">
                                <img className='rounded-xl h-48 w-full object-cover' src="/public/ClassRoutineApp.jpg" alt="Class Routine APP Image" />
                            </a>
                        </div>
                    </div>

                    {/* <div className="ghost-card">
                        <div className="ghost-plus">+</div>
                        <div className="text-[14.5px] font-semibold text-primary-light dark:text-primary-dark">
                            Next project
                        </div>
                        <p className="text-[13px]">
                            A Python + MySQL app with REST APIs, JWT auth and a Bootstrap
                            UI slots in nicely here.
                        </p>
                    </div> */}

                    {/* <div className="ghost-card">
                        <div className="ghost-plus">+</div>
                        <div className="text-[14.5px] font-semibold text-primary-light dark:text-primary-dark">
                            Next project
                        </div>
                        <p className="text-[13px]">
                            A systems-level C++/Java project — a CLI tool, data structure
                            library or algorithm work.
                        </p>
                    </div> */}
                </div>
            </div>
        </section>
    );
};

export default Porject;
