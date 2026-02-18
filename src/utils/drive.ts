export function driveToThumbnail(input: string, bust: boolean = true): string {
  if (!input) return "";
  let fileId = "";
  if (!input.startsWith("http")) {
    fileId = input;
  } else {
    const match = input.match(/\/d\/([^/]+)/);
    if (match && match[1]) fileId = match[1];
  }
  if (!fileId) return "";
  const cb = bust ? `&cb=${Date.now()}` : "";
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000${cb}`;
}
