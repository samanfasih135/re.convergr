const AUTH_KEY = "convergr_portal_auth";
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
    const auth = getAuth();
    if (!auth || auth.portal !== portal) {
        const next = encodeURIComponent(location.pathname.replace(/^\//, ""));
        location.href = `/portal/login.html?portal=${portal}&next=${next}`;
        return null;
    }
    return auth;
}

function logoutToHome() {
    clearAuth();
    location.href = "/index.html";
}

function attachLogout(selector = "[data-logout]") {
    document.querySelectorAll(selector).forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            logoutToHome();
        });
    });
}
