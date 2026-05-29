/** Date locale AAAA-MM-JJ (évite le décalage de `toISOString()` en UTC). */
export function toLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateFr(iso: string): string {
  const normalized = iso.length <= 10 ? `${iso}T12:00:00` : iso;
  return new Date(normalized).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function fullName(prenom: string, nom: string): string {
  return `${prenom} ${nom}`;
}
