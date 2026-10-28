export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function timeAgo(unixSeconds: number, now = Date.now()) {
  const s = Math.max(0, Math.floor(now / 1000) - unixSeconds);
  if (s < 60) return "just now";
  const units: [number, string][] = [
    [86400 * 365, "y"],
    [86400 * 30, "mo"],
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ];
  for (const [size, label] of units) if (s >= size) return `${Math.floor(s / size)}${label} ago`;
  return "just now";
}

export function memberUrl(address: string) {
  return `https://www.gnars.com/members/${address}`;
}
