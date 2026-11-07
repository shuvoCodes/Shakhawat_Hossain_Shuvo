import { useCallback, useEffect, useState } from "react";
import { fetchProjects } from "./projectData";

export default function useProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadProjects = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setProjects(await fetchProjects());
        } catch (cause) {
            setError(`Could not load projects. ${cause.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    return { projects, loading, error, reload: loadProjects };
}
