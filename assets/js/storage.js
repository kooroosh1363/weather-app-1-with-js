const RECENT_KEY = "cirrus.recent-places";
const MAX_RECENT = 5;

function safeParse(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadRecentPlaces(storage = window.localStorage) {
  try {
    return safeParse(storage.getItem(RECENT_KEY))
      .filter((place) => place && typeof place === "object" && place.name)
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function saveRecentPlace(place, storage = window.localStorage) {
  if (!place?.name || !Number.isFinite(Number(place.latitude)) || !Number.isFinite(Number(place.longitude))) {
    return [];
  }

  const current = loadRecentPlaces(storage);
  const key = `${place.name}|${place.country ?? ""}|${place.latitude}|${place.longitude}`;
  const next = [
    place,
    ...current.filter(
      (item) =>
        `${item.name}|${item.country ?? ""}|${item.latitude}|${item.longitude}` !== key,
    ),
  ].slice(0, MAX_RECENT);

  try {
    storage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // Storage can be blocked. The weather app remains usable without persistence.
  }

  return next;
}
