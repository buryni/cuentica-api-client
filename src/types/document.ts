/**
 * Document (Documento) types
 *
 * Documents are files uploaded to Cuentica that can be associated
 * with expenses, incomes, or kept standalone.
 */

/**
 * Document assignment type
 */
export type DocumentAssignment = 'unassigned' | 'expense' | 'income';

/**
 * Full document as returned by the API
 */
export interface Document {
  id: number;
  /** Original filename */
  filename: string;
  /** File extension */
  extension: string;
  /** MIME type */
  mime_type: string;
  /** File size in bytes */
  size: number;
  /** Upload date (YYYY-MM-DD) */
  date: string;
  /** Creation timestamp */
  created_on: string;
  /** Assignment type */
  assignment: DocumentAssignment;
  /** Associated expense ID (if assigned to expense) */
  expense_id?: number;
  /** Associated income ID (if assigned to income) */
  income_id?: number;
  /** Document notes */
  notes?: string;
  /** Tags for categorization */
  tags?: string[];
}

/**
 * Attachment object for document creation
 */
export interface DocumentAttachmentInput {
  /** Name the file will have when sent */
  filename: string;
  /** The file encoded in Base64 */
  data: string;
}

/**
 * Data required to create a new document
 */
export interface CreateDocumentData {
  /** Document date (YYYY-MM-DD) */
  date?: string;
  /** Document notes */
  notes?: string;
  /** Tags */
  tags?: string[];
  /** Associated expense ID */
  expense_id?: number;
  /** Attachment object with file data */
  attachment: DocumentAttachmentInput;
}

/**
 * Data for updating a document
 */
export interface UpdateDocumentData {
  /** Document date (YYYY-MM-DD) */
  date?: string;
  /** Document notes */
  notes?: string;
  /** Tags */
  tags?: string[];
  /** Assignment type */
  assignment?: DocumentAssignment;
  /** Associated expense ID */
  expense_id?: number;
  /** Associated income ID */
  income_id?: number;
}

/**
 * Parameters for listing documents
 */
export interface DocumentListParams {
  /** Filter from date (YYYY-MM-DD) */
  date_from?: string;
  /** Filter to date (YYYY-MM-DD) */
  date_to?: string;
  /** Filter by file extension */
  extension?: string;
  /** Filter by assignment type */
  assignment?: DocumentAssignment;
  page?: number;
  page_size?: number;
}

/**
 * Document attachment response (base64 encoded)
 */
export interface DocumentAttachment {
  /** File content as base64 */
  content: string;
  /** MIME type */
  mime_type: string;
  /** Original filename */
  filename: string;
}
