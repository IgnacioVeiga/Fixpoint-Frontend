import { AttachmentType } from '../models/attachment.model';

const TYPE_COLORS: Record<AttachmentType, { primary: string; secondary: string }> = {
  image: { primary: '#2b7ea1', secondary: '#66b8d8' },
  document: { primary: '#2f6f54', secondary: '#7dc8a1' },
  spreadsheet: { primary: '#6e8a2e', secondary: '#b8d761' },
  archive: { primary: '#6a5a9e', secondary: '#b1a5e0' },
  other: { primary: '#576476', secondary: '#9ca8b7' }
};

export function createMockAttachmentThumbnailDataUrl(
  filename: string,
  fileType: AttachmentType,
  fileFormat: string,
  tag?: string | null
): string {
  const colors = TYPE_COLORS[fileType] ?? TYPE_COLORS.other;
  const extension = (fileFormat || fileType).toUpperCase();
  const safeTag = (tag ?? '').trim();
  const displayName = compactLabel(filename, 30);
  const badge = compactLabel(safeTag || extension, 14);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="288" height="180" viewBox="0 0 288 180">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colors.secondary}" />
          <stop offset="100%" stop-color="${colors.primary}" />
        </linearGradient>
      </defs>
      <rect width="288" height="180" rx="18" fill="url(#g)" />
      <rect x="18" y="18" width="252" height="144" rx="20" fill="rgba(255,255,255,0.12)" />
      <text x="144" y="78" text-anchor="middle" font-family="IBM Plex Sans, Segoe UI, sans-serif" font-size="34" font-weight="700" fill="#ffffff">${extension}</text>
      <text x="144" y="114" text-anchor="middle" font-family="IBM Plex Sans, Segoe UI, sans-serif" font-size="14" fill="rgba(255,255,255,0.92)">${escapeXml(displayName)}</text>
      <rect x="172" y="130" width="98" height="24" rx="12" fill="rgba(15,24,32,0.24)" />
      <text x="221" y="146" text-anchor="middle" font-family="IBM Plex Sans, Segoe UI, sans-serif" font-size="12" font-weight="600" fill="#ffffff">${escapeXml(badge)}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function compactLabel(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, Math.max(0, maxLength - 3))}...`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
