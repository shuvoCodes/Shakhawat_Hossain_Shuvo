import React from 'react';
import { BrandMark, BrandText } from './BrandIdentity';

const Footer = () => {
    return (
        <footer className="border-t border-black/[0.07] px-8 py-10 dark:border-white/[0.09]">
            <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4">
                <div className="brand-shell flex items-center gap-3">
                    <BrandMark className="brand-mark" />
                    <BrandText compact />
                </div>
                <p className="text-[13.5px] text-secondary-light dark:text-secondary-dark">
                    © {new Date().getFullYear()} Shakhawat Hossain Shuvo. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;