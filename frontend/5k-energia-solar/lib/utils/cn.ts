/**
 * Utility function for merging Tailwind CSS classes
 * Prevents conflicts and combines classes properly
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
