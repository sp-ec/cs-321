const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

async function parseResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || "Request failed");
    error.status = response.status;
    error.code = data?.code || "REQUEST_FAILED";
    error.data = data;
    throw error;
  }

  return data;
}

export async function createGroup(payload) {
  const response = await fetch(`${API_BASE_URL}/groups/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function joinGroup(payload) {
  const response = await fetch(`${API_BASE_URL}/groups/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function fetchGroup(groupId) {
  const response = await fetch(
    `${API_BASE_URL}/groups/fetch?groupId=${encodeURIComponent(groupId)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return parseResponse(response);
}

export async function updateGroup(payload) {
  const response = await fetch(`${API_BASE_URL}/groups/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function updateAvailability(payload) {
  const response = await fetch(`${API_BASE_URL}/user/availability`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}
