const AUTH_KEY = "convergr_portal_auth";
const MAIN_AUTH_KEY = "convergr_main_app_authenticated";
const ALLOWED_USER = "guest";
const ALLOWED_PASS = "re123";

function getAuth() {
    try {
        return JSON.parse(sessionStorage.getItem(AUTH_KEY) || localStorage.getItem(AUTH_KEY) || "null");
    } catch {
        return null;
    }
}

function setAuth(data, persist = false) {
    const value = JSON.stringify(data);
    sessionStorage.setItem(AUTH_KEY, value);
    if (persist) localStorage.setItem(AUTH_KEY, value);
}

function clearAuth() {
    sessionStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_KEY);
}

function loginPortal({ portal, username, password, persist = false }) {
    if (username !== ALLOWED_USER || password !== ALLOWED_PASS) return false;
    setAuth({ portal, username, at: Date.now() }, persist);
    return true;
}

function requirePortal(portal) {
    const hasMainAuth = sessionStorage.getItem(MAIN_AUTH_KEY) === "1" || localStorage.getItem(MAIN_AUTH_KEY) === "1";
    if (!hasMainAuth) {
        location.href = "https://convergr.vercel.app";
        return null;
    }

    const auth = getAuth();
    if (!auth) return { portal, username: "guest", at: Date.now() };
    return auth.portal === portal ? auth : { ...auth, portal };
}

function logoutToHome() {
    clearAuth();
    sessionStorage.removeItem(MAIN_AUTH_KEY);
    localStorage.removeItem(MAIN_AUTH_KEY);
    location.href = "https://convergr.vercel.app";
}

function attachLogout(selector = "[data-logout]") {
    document.querySelectorAll(selector).forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            logoutToHome();
        });
    });
}
