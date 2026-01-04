/**
 * Expense Type Codes for Cuentica API
 *
 * IMPORTANT: The official documentation shows generic codes (628, 629),
 * but the API only accepts specific codes (6280006, 6290001, etc.)
 *
 * This is the complete list of valid expense type codes extracted from
 * actual API error responses.
 */

/**
 * All valid expense type codes accepted by the Cuentica API
 */
export const EXPENSE_TYPE_CODES = [
  // Compras (600-607)
  '600',
  '601',
  '602',
  '607',

  // Alquileres (621)
  '6210001',
  '6210002',
  '6210003',

  // Reparaciones (622)
  '622',

  // Servicios profesionales (623)
  '6230001',
  '6230002',
  '6230005',

  // Transportes (624)
  '624',

  // Primas de seguros (625)
  '625',

  // Servicios bancarios (626)
  '626',

  // Publicidad (627)
  '627',

  // Suministros (628)
  '6280003',
  '6280004',
  '6280005',
  '6280006',
  '6280007',

  // Otros servicios (629)
  '6290001',
  '6290002',
  '6290003',
  '6290004',
  '6290005',
  '6290006',

  // Impuestos (631)
  '6310001',
  '6310002',

  // Sueldos y salarios (640)
  '6400000',
  '6400001',

  // Seguridad social (642)
  '6420000',
  '6420001',

  // Otros códigos aceptados por la API
  '475',
  '4720099',
  '520',
  '545',
  '662',
  '669',
  '678',
  '680',
  '681',
  '699',
] as const;

export type ExpenseTypeCode = (typeof EXPENSE_TYPE_CODES)[number];

/**
 * Human-readable descriptions for common expense types
 */
export const EXPENSE_TYPES: Record<string, string> = {
  // Compras
  '600': 'Compras de productos para vender',
  '601': 'Compras de materias primas',
  '602': 'Compras de otros aprovisionamientos',
  '607': 'Trabajos realizados por otras empresas',

  // Alquileres
  '6210001': 'Alquileres de locales',
  '6210002': 'Alquileres de equipos',
  '6210003': 'Otros alquileres',

  // Reparaciones
  '622': 'Reparaciones y conservación',

  // Servicios profesionales
  '6230001': 'Asesoría fiscal y contable',
  '6230002': 'Asesoría laboral',
  '6230005': 'Otros servicios profesionales',

  // Transportes
  '624': 'Transportes',

  // Seguros
  '625': 'Primas de seguros',

  // Servicios bancarios
  '626': 'Servicios bancarios y similares',

  // Publicidad
  '627': 'Publicidad, propaganda y relaciones públicas',

  // Suministros
  '6280003': 'Combustible',
  '6280004': 'Electricidad',
  '6280005': 'Agua',
  '6280006': 'Teléfono y comunicaciones',
  '6280007': 'Otros suministros',

  // Otros servicios
  '6290001': 'Material de oficina',
  '6290002': 'Restauración y hostelería',
  '6290003': 'Viajes y desplazamientos',
  '6290004': 'Hosting y servicios web',
  '6290005': 'Formación y cursos',
  '6290006': 'Otros servicios externos',

  // Impuestos
  '6310001': 'Impuestos municipales (IBI, tasas...)',
  '6310002': 'Impuestos autonómicos',

  // Sueldos
  '6400000': 'Sueldos de socios/administradores',
  '6400001': 'Sueldos de empleados',

  // Seguridad social
  '6420000': 'Seguridad social autónomos (RETA)',
  '6420001': 'Seguridad social régimen general',

  // Otros
  '678': 'Gastos extraordinarios',
  '680': 'Amortización del inmovilizado intangible',
  '681': 'Amortización del inmovilizado material',
  '699': 'Otros gastos financieros',
};

/**
 * Get the description for an expense type code
 */
export function getExpenseTypeDescription(code: string): string | undefined {
  return EXPENSE_TYPES[code];
}

/**
 * Check if a code is a valid expense type
 */
export function isValidExpenseType(code: string): code is ExpenseTypeCode {
  return EXPENSE_TYPE_CODES.includes(code as ExpenseTypeCode);
}

/**
 * Expense type categories for easier selection
 */
export const EXPENSE_CATEGORIES = {
  purchases: {
    name: 'Compras',
    codes: ['600', '601', '602', '607'],
  },
  rentals: {
    name: 'Alquileres',
    codes: ['6210001', '6210002', '6210003'],
  },
  repairs: {
    name: 'Reparaciones',
    codes: ['622'],
  },
  professional_services: {
    name: 'Servicios profesionales',
    codes: ['6230001', '6230002', '6230005'],
  },
  transport: {
    name: 'Transportes',
    codes: ['624'],
  },
  insurance: {
    name: 'Seguros',
    codes: ['625'],
  },
  banking: {
    name: 'Servicios bancarios',
    codes: ['626'],
  },
  advertising: {
    name: 'Publicidad',
    codes: ['627'],
  },
  utilities: {
    name: 'Suministros',
    codes: ['6280003', '6280004', '6280005', '6280006', '6280007'],
  },
  other_services: {
    name: 'Otros servicios',
    codes: ['6290001', '6290002', '6290003', '6290004', '6290005', '6290006'],
  },
  taxes: {
    name: 'Impuestos',
    codes: ['6310001', '6310002'],
  },
  payroll: {
    name: 'Nóminas',
    codes: ['6400000', '6400001', '6420000', '6420001'],
  },
} as const;
