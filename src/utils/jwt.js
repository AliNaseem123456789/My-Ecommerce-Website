

export function createJWT(payload) {
  return btoa(JSON.stringify(payload));
}

export function decodeJWT(token) {
  try {
    return JSON.parse(atob(token));
  } catch (e) {
    return null;
  }
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function removeToken() {
  localStorage.removeItem("token");
}
