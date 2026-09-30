import React from 'react';

const Footer = () => {
    return (
        <footer className="border-t border-black/[0.07] px-8 py-10 dark:border-white/[0.09]">
            <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-light to-accent2-light font-display text-sm font-bold text-white dark:from-accent-dark dark:to-accent2-dark">
                        S
                    </div>
                    <p className="text-sm font-semibold">Shuvo</p>
                </div>
                <p className="text-[13.5px] text-secondary-light dark:text-secondary-dark">
                    © {new Date().getFullYear()} Shuvo. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;