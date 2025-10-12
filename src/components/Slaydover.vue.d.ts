import type { DefineComponent, Ref } from 'vue';

export interface SlaydoverProps {
  /**
   * Position of the slaydover. Example: 'bottom md:right'.
   * Format: side or breakpoint:side (e.g., 'top md:right').
   */
  position?: string;
  /**
   * Breakpoints for responsive behavior. Example: { xs: 360, md: 768 }
   */
  breakpoints?: Record<string, number>;
}

/**
 * v-model:open for controlling visibility
 */
declare const _default: DefineComponent<
  SlaydoverProps,
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {
    /**
     * Default slot for slaydover content
     */
    default: {};
    /**
     * Named slot for overlay customization
     */
    overlay: {};
  },
  "open",
  {},
  string,
  SlaydoverProps & { open: boolean }
>;

export default _default;
