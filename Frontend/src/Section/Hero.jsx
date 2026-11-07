import React, { useEffect, useState } from 'react';

const roles = [
    'Backend — FastAPI, Python',
    'Database — MySQL, PostgreSQL',
    'Frontend — React, Tailwind',
    'Languages — C, C++, Python, Java',
];

const Hero = () => {
    const [roleIndex, setRoleIndex] = useState(0);
    const [displayedRole, setDisplayedRole] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const role = roles[roleIndex];
        const isComplete = displayedRole === role;
        const timeout = window.setTimeout(() => {
            if (!isDeleting && !isComplete) {
                setDisplayedRole(role.slice(0, displayedRole.length + 1));
            } else if (isComplete && !isDeleting) {
                setIsDeleting(true);
            } else if (isDeleting && displayedRole.length > 0) {
                setDisplayedRole(displayedRole.slice(0, -1));
            } else {
                setRoleIndex((current) => (current + 1) % roles.length);
                setIsDeleting(false);
            }
        }, isComplete && !isDeleting ? 1500 : isDeleting ? 45 : 75);

        return () => window.clearTimeout(timeout);
    }, [displayedRole, isDeleting, roleIndex]);

    return (
        <section className="px-8 pb-[60px] pt-[76px]" id="home">
            <div className="mx-auto grid max-w-[1180px] items-center gap-10 lg:grid-cols-[1.05fr_0.85fr]">
                <div>
                    <span className="eyebrow">Hello, I'm</span>
                    <h1 className="text-[clamp(30px,5vw,45px)] leading-[1.04]">Shakhawat Hossain Shuvo</h1>
                    <div className="gradient-text mt-2.5 text-[clamp(20px,2.4vw,26px)] font-display font-semibold">
                        Full Stack Developer
                    </div>
                    <div className="gradient-text mt-2.5 text-[clamp(15px,2.4vw,20px)] font-display font-semibold">
                        <span aria-live="polite" aria-atomic="true">{displayedRole}</span>
                        <span className="ml-0.5 inline-block h-[1em] w-[2px] animate-pulse bg-current align-[-0.08em]" aria-hidden="true" />
                    </div>
                    <p className="mt-5 max-w-[46ch] text-[16.5px] text-secondary-light dark:text-secondary-dark">
                        I build fast, scalable web applications — from database schema to
                        deployed API — using Python, FastAPI, React and modern SQL
                        databases.
                    </p>
                    <div className="mt-[30px] flex flex-wrap gap-3">
                        <a href="#projects" className="btn-primary">
                            View Projects
                        </a>
                        <a href="/resume.pdf" download="Shakhawat-Hossain-Shuvo-Resume.pdf" className="btn-ghost">
                            Download Resume
                        </a>
                        <a href="#contact" className="btn-ghost">
                            Contact Me
                        </a>
                    </div>
                </div>

                <div className="relative order-first mx-auto max-w-[280px] lg:order-none lg:max-w-none">
                    <div className="portrait-frame">
                        <img
                            src="/shuvo.jpg"
                            alt="Portrait of Shuvo, full stack developer"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="float-card left-[-12%] top-[-6%] hidden md:block">
                        <div className="mb-1.5 text-[12.5px] font-semibold">Core Stack</div>
                        <div className="flex max-w-[165px] flex-wrap gap-1.5">
                            <span className="fc-chip">FastAPI</span>
                            <span className="fc-chip">React</span>
                            <span className="fc-chip">PostgreSQL</span>
                        </div>
                    </div>
                    <div className="float-card bottom-[6%] right-[-10%] hidden md:block">
                        <div className="mb-1.5 flex items-center text-[12.5px] font-semibold">
                            <span className="fc-dot" />
                            Open to work
                        </div>
                        <div className="max-w-[150px] text-xs text-secondary-light dark:text-secondary-dark">
                            Full-time · Freelance · Collabs
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
