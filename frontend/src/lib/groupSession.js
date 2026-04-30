const STORAGE_PREFIX = "ezcalendar.groupSession";

function getStorageKey(groupId) {
  return `${STORAGE_PREFIX}.${groupId}`;
}

export function saveGroupSession(groupId, member) {
  if (!groupId || !member?.userId) {
    return;
  }

  localStorage.setItem(
    getStorageKey(groupId),
    JSON.stringify({
      userId: member.userId,
      userName: member.userName || "",
    }),
  );
}

export function getGroupSession(groupId) {
  if (!groupId) {
    return null;
  }

  const rawValue = localStorage.getItem(getStorageKey(groupId));
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    localStorage.removeItem(getStorageKey(groupId));
    return null;
  }
}

export function clearGroupSession(groupId) {
  if (!groupId) {
    return;
  }

  localStorage.removeItem(getStorageKey(groupId));
}

export function findSessionMember(group, session) {
  if (!group?.users || !session?.userId) {
    return null;
  }

  return group.users.find((user) => user.userId === session.userId) || null;
}
