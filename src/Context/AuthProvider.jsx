import { createContext, useState, useEffect, useRef } from "react";

const SUN_PATH = (
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </>
);

const MOON_PATH = <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />;

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [theme, setTheme] = useState("light");
    const [toastMsg, setToastMsg] = useState("");
    const [toastVisible, setToastVisible] = useState(false);
    const toastTimer = useRef(null);

    useEffect(() => {
        // The inline script in index.html already set data-theme on <html>
        // before paint (avoids a flash of the wrong theme) — read it back
        // here so React state matches what's on the page.
        const current = document.documentElement.getAttribute("data-theme");
        setTheme(current === "dark" ? "dark" : "light");
    }, []);

    const toggleTheme = () => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        document.documentElement.setAttribute("data-theme", next);
        try {
            localStorage.setItem("shuvo-portfolio-theme", next);
        } catch (e) { }
    };

    const showToast = (msg) => {
        setToastMsg(msg);
        setToastVisible(true);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToastVisible(false), 2600);
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        const name = e.target.elements["cf-name"].value;
        const email = e.target.elements["cf-email"].value;
        const subject = e.target.elements["cf-subject"].value || "Portfolio inquiry";
        const message = e.target.elements["cf-message"].value;
        const body =
            "From: " + name + " (" + email + ")%0D%0A%0D%0A" + encodeURIComponent(message);
        window.location.href =
            "mailto:shuvo.hossain.dev@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + body;
    };

    return (
        <AuthContext.Provider value={{
            theme, setTheme, toastMsg, setToastMsg, toastVisible, setToastVisible,
            toastTimer, toggleTheme, showToast, handleContactSubmit,SUN_PATH,MOON_PATH
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
