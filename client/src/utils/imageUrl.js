const LOCALHOST_PREFIX_REGEX = /^https?:\/\/localhost:3000\/?/i;

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
