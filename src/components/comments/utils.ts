/**
 * Format a UTC ISO string into a Vietnamese-friendly relative time string.
 * e.g.  "vừa xong", "5 phút trước", "2 giờ trước", "3 ngày trước", "12/03/2025"
 */
export function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const past = new Date(isoString).getTime();
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'vừa xong';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
  if (diffSec < 7 * 86400) return `${Math.floor(diffSec / 86400)} ngày trước`;

  return new Date(isoString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
