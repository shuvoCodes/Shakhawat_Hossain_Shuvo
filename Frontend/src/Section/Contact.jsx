import React, { useContext } from 'react';
import { AuthContext } from '../Context/AuthProvider';

const Contact = () => {
    const { handleContactSubmit } = useContext(AuthContext);
    return (
        <section className="px-8 py-[70px]" id="contact">
            <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.85fr_1.15fr]">
                <div>
                    <span className="eyebrow">Let's Connect</span>
                    <h2 className="mb-4 text-[clamp(26px,3.2vw,34px)]">
                        Let's work together.
                    </h2>
                    <p className="mb-7 max-w-[40ch] text-[15.5px] text-secondary-light dark:text-secondary-dark">
                        Have a project in mind or an opportunity to discuss? I'd love
                        to hear from you.
                    </p>

                    <div className="mb-3.5 flex items-center gap-3">
                        <div className="ci-icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                            >
                                <path d="m22 6-10 7L2 6" />
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                            </svg>
                        </div>
                        <a
                            href="mailto:shuvo.hossain.dev@gmail.com"
                            className="text-[14.5px] font-medium"
                        >
                            Gmail
                        </a>
                    </div>

                    <div className="mb-3.5 flex items-center gap-3">
                        <div className="ci-icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                            >
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                                <rect x="2" y="9" width="4" height="12" />
                                <circle cx="4" cy="4" r="2" />
                            </svg>
                        </div>
                        <a
                            href="https://www.linkedin.com/in/shakhawat-hossain-shuvo/"
                            className="text-[14.5px] font-medium"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Linkedin
                        </a>
                    </div>

                    <div className="mb-3.5 flex items-center gap-3">
                        <div className="ci-icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                            >
                                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                            </svg>
                        </div>
                        <a
                            href="https://github.com/shuvoCodes"
                            className="text-[14.5px] font-medium"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Github
                        </a>
                    </div>

                    <div className="mt-6 flex gap-2.5">
                        <a
                            href="https://www.linkedin.com/in/shakhawat-hossain-shuvo/"
                            className="social-pill"
                            aria-label="LinkedIn"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                            >
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                                <rect x="2" y="9" width="4" height="12" />
                                <circle cx="4" cy="4" r="2" />
                            </svg>
                        </a>
                        <a
                            href='https://github.com/shuvoCodes'
                            target='_blank'
                            rel='noreferrer'
                            className="social-pill"
                            aria-label="GitHub"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                            >
                                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                            </svg>
                        </a>
                        <a href="mailto:shuvo.hossain.dev@gmail.com" className="social-pill" aria-label="Email">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                            >
                                <path d="m22 6-10 7L2 6" />
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                            </svg>
                        </a>
                    </div>
                </div>

                <form className="contact-form" onSubmit={handleContactSubmit}>
                    <div className="mb-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                        <div>
                            <label htmlFor="cf-name" className="field-label">
                                Your Name
                            </label>
                            <input
                                type="text"
                                id="cf-name"
                                name="cf-name"
                                required
                                className="field-input"
                            />
                        </div>
                        <div>
                            <label htmlFor="cf-email" className="field-label">
                                Your Email
                            </label>
                            <input
                                type="email"
                                id="cf-email"
                                name="cf-email"
                                required
                                className="field-input"
                            />
                        </div>
                    </div>
                    <div className="mb-3.5">
                        <label htmlFor="cf-subject" className="field-label">
                            Your Project
                        </label>
                        <input
                            type="text"
                            id="cf-subject"
                            name="cf-subject"
                            placeholder="What's this about?"
                            className="field-input"
                        />
                    </div>
                    <div className="mb-3.5">
                        <label htmlFor="cf-message" className="field-label">
                            Your Message
                        </label>
                        <textarea
                            id="cf-message"
                            name="cf-message"
                            required
                            rows={4}
                            className="field-input resize-y"
                        />
                    </div>
                    <button type="submit" className="btn-primary w-full">
                        Send Message →
                    </button>
                    <p className="mt-3 text-[12.5px] text-secondary-light dark:text-secondary-dark">
                        This opens your email app with the message pre-filled — swap
                        in a form backend whenever you're ready to collect submissions
                        directly.
                    </p>
                </form>
            </div>
        </section>
    );
};

export default Contact;
