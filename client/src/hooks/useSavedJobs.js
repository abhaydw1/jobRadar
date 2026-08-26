import { useEffect, useState } from "react";

const STORAGE_KEY = "jobradar.savedJobIds";

function readSavedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function useSavedJobs() {
  const [savedIds, setSavedIds] = useState(readSavedIds);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...savedIds]));
  }, [savedIds]);

  function toggleSave(id) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return { savedIds, toggleSave };
}
