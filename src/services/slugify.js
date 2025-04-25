// src/utils/slugify.js
export const slugify = (name) => {
    if (!name) return "unknown";
    return String(name)
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };
  