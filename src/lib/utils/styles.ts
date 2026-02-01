/**
 * Common CSS class strings for consistent styling
 */

export const STYLES = {
  ERROR_MESSAGE: "mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600",
  SUCCESS_MESSAGE: "mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600",
  SECTION_HEADER: "mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]",
  JOURNAL_TEXT: "font-journal text-base leading-relaxed text-[var(--color-text)]",
  MODAL_OVERLAY: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4",
  MODAL_CONTENT: "relative w-full max-w-3xl rounded-lg bg-[var(--color-paper)] p-8 shadow-lg",
  CLOSE_BUTTON: "absolute right-4 top-4 text-2xl text-[var(--color-muted)] hover:text-[var(--color-text)]",
} as const;
