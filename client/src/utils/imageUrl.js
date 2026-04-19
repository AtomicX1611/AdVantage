const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

let LOCALHOST_PREFIX_REGEX;
try {
  const parsed = new URL(BACKEND_URL);
  LOCALHOST_PREFIX_REGEX = new RegExp(`^${parsed.origin.replace(/[-\\/\\^$*+?.()|[\\]{}]/g, "\\\\$&")}\\/?`, 'i');
} catch (e) {
  LOCALHOST_PREFIX_REGEX = new RegExp(`^${String(BACKEND_URL).replace(/[-\\/\\^$*+?.()|[\\]{}]/g, "\\\\$&")}\\/?`, 'i');
}

export const resolveImageUrl = (imagePath, fallback = "/Assets/placeholder.png") => {
  if (!imagePath) {
    return fallback;
  }

  let normalizedPath = String(imagePath).trim().replace(/\\/g, "/");
  normalizedPath = normalizedPath.replace(LOCALHOST_PREFIX_REGEX, "/");

  if (
    normalizedPath.startsWith("http://") ||
    normalizedPath.startsWith("https://") ||
    normalizedPath.startsWith("data:") ||
    normalizedPath.startsWith("blob:")
  ) {
    return normalizedPath;
  }

  return normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
};
