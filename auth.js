/**
 * Site-wide auth (client-side). Protected pages call ConvergrAuth.requireAuth() in <head>.
 */
(function () {
    const AUTH_KEY = "convergr_site_auth";
    const ALLOWED_USER = "guest";
    const ALLOWED_PASS = "re123";
    const LOGIN_URL = "/login/";

    function getAuth() {
        try {
            return JSON.parse(sessionStorage.getItem(AUTH_KEY) || localStorage.getItem(AUTH_KEY) || "null");
        } catch {
            return null;
        }
    }

    function setAuth(data, persist) {
        const value = JSON.stringify(data);
        sessionStorage.setItem(AUTH_KEY, value);
        if (persist) localStorage.setItem(AUTH_KEY, value);
    }

    function clearAuth() {
        sessionStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(AUTH_KEY);
    }

    function isAuthenticated() {
        const auth = getAuth();
        return !!(auth && auth.username === ALLOWED_USER && typeof auth.at === "number");
    }

    function safeNextParam(raw) {
        if (!raw || typeof raw !== "string") return "/";
        const decoded = decodeURIComponent(raw);
        if (decoded.startsWith("/") && !decoded.startsWith("//")) return decoded;
        return "/";
    }

    function requireAuth() {
        if (isAuthenticated()) return;
        const next = encodeURIComponent(location.pathname + location.search + location.hash);
        location.replace(LOGIN_URL + "?next=" + next);
    }

    /**
     * @returns {boolean}
     */
    function login(username, password, persist) {
        if (username !== ALLOWED_USER || password !== ALLOWED_PASS) return false;
        setAuth({ username, at: Date.now() }, persist);
        return true;
    }

    function logout() {
        clearAuth();
        location.href = LOGIN_URL;
    }

    window.ConvergrAuth = {
        getAuth,
        isAuthenticated,
        requireAuth,
        login,
        logout,
        clearAuth,
        safeNextParam,
        LOGIN_URL,
    };
})();
