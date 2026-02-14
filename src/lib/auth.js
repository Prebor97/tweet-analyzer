import Cookies from "js-cookie";

const TOKEN_KEY = "tweet_analyzer_token";

export const saveToken = (token) => {
  // save in cookie (7 days)
  Cookies.set(TOKEN_KEY, token, { expires: 7 });
  // save in localStorage fallback
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  // try cookie first
  const cookieToken = Cookies.get(TOKEN_KEY);
  if (cookieToken) return cookieToken;

  // fallback to localStorage
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  Cookies.remove(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

export function parseJwt(token) {
  try {
    const base64Payload = token.split(".")[1];
    const payload = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(payload);
  } catch (err) {
    console.error("Failed to parse JWT", err);
    return null;
  }
}
