export function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "?";
  }

  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

export function getAvatarStyle(memberColor) {
  return {
    background: `linear-gradient(135deg, ${memberColor || "#3f3f46"} 0%, #18181b 100%)`,
    borderColor: memberColor || "#3f3f46",
  };
}
