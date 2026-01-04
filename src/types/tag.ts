/**
 * Tag (Etiqueta) types
 *
 * Tags are used to categorize expenses, incomes, invoices, and documents.
 */

/**
 * Full tag as returned by the API
 */
export interface Tag {
  id: number;
  /** Tag name */
  name: string;
  /** Tag color (hex code) */
  color?: string;
  /** Number of items tagged */
  count?: number;
}

/**
 * Parameters for listing tags
 */
export interface TagListParams {
  page?: number;
  page_size?: number;
}
