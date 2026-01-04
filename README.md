# @nexusland/cuentica-api-client

Cliente TypeScript para la API de [Cuentica](https://www.cuentica.com/), el software de facturación y contabilidad para autónomos y pymes en España.

> **Importante:** Esta librería incluye tipos corregidos y documentación basada en pruebas reales con la API. La documentación oficial de Cuentica tiene numerosas discrepancias con el comportamiento real. Ver [Errores en la documentación oficial](#errores-en-la-documentación-oficial).

## Características

- Tipado completo con TypeScript
- Manejo automático de paginación
- Gestión de errores estructurada
- Soporte para subida/descarga de archivos
- Tipos de gasto validados
- Inferencia automática de tipo de empresa (CIF/NIF)
- Compatible con ESM (ECMAScript Modules)

## Instalación

```bash
npm install @nexusland/cuentica-api-client
# o
yarn add @nexusland/cuentica-api-client
# o
pnpm add @nexusland/cuentica-api-client
```

## Inicio rápido

```typescript
import { CuenticaAPI } from '@nexusland/cuentica-api-client';

// Crear cliente con token API
const api = new CuenticaAPI({
  apiToken: 'tu-token-api',
  debug: true, // Opcional: habilitar logs
});

// O usar variables de entorno (CUENTICA_API_TOKEN)
const api = CuenticaAPI.fromEnv();

// Obtener información de la empresa
const company = await api.company.get();
console.log(`Empresa: ${company.business_name}`);

// Listar proveedores
const providers = await api.providers.list();
console.log(`Encontrados ${providers.data.length} proveedores`);
```

## Variables de entorno

| Variable | Requerida | Default | Descripción |
|----------|-----------|---------|-------------|
| `CUENTICA_API_TOKEN` | Sí | - | Token de API de Cuentica |
| `CUENTICA_API_URL` | No | `https://api.cuentica.com` | URL base de la API |

## Configuración del cliente

```typescript
const api = new CuenticaAPI({
  apiToken: 'tu-token-api',              // Requerido
  apiUrl: 'https://api.cuentica.com',    // Opcional
  debug: true,                            // Opcional (default: false)
  timeout: 60000,                         // Opcional (default: 30000ms)
  logger: (msg, data) => console.log(msg, data), // Opcional
});
```

---

## Referencia de la API

### Empresa (Company)

```typescript
const company = await api.company.get();
// Devuelve: { id, cif, business_name, trade_name, address, city, ... }
```

### Proveedores (Providers)

```typescript
// Listar
const result = await api.providers.list({ q: 'Acme', page: 1, page_size: 25 });

// Buscar por CIF
const provider = await api.providers.searchByCIF('B12345678');

// Obtener por ID
const provider = await api.providers.get(123);

// Crear (NOTA: campos no documentados son requeridos)
const provider = await api.providers.create({
  cif: 'B12345678',
  nombre: 'Acme Corp SL',           // Requerido (no documentado)
  business_name: 'Acme Corp SL',    // Requerido (no documentado)
  business_type: 'company',         // 'company' | 'individual' (no documentado)
  pais: 'ES',
  address: 'Calle Example 123',     // Opcional
  town: 'Madrid',                   // Opcional
  postal_code: '28001',             // Opcional
  region: 'Madrid',                 // Opcional
});

// Buscar o crear (infiere business_type automáticamente)
const provider = await api.providers.findOrCreate({
  tax_id: 'B12345678',
  business_name: 'Acme Corp SL',
});

// Actualizar
await api.providers.update(123, { email: 'nuevo@email.com' });

// Eliminar
await api.providers.delete(123);
```

### Gastos (Expenses)

> **Importante:** La estructura de la API es MUY diferente a la documentación oficial.

```typescript
// Listar
const result = await api.expenses.list({
  provider_id: 123,
  date_from: '2024-01-01',
  date_to: '2024-12-31',
});

// Obtener
const expense = await api.expenses.get(123);

// Crear (estructura corregida)
const expense = await api.expenses.create({
  date: '2024-01-15',
  document_type: 'invoice',    // Requerido: 'invoice' | 'ticket'
  provider: 123,               // ID del proveedor
  draft: false,                // Requerido
  expense_lines: [{
    description: 'Servicios web',
    base: 100.00,              // Base imponible
    tax: 21,                   // PORCENTAJE de IVA (no importe!)
    retention: 0,              // Retención IRPF %
    imputation: 100,           // Requerido: usar 100 para 100%
    expense_type: '6290004',   // Código específico (ver lista abajo)
  }],
  payments: [{                 // Requerido (no documentado)
    date: '2024-01-15',
    amount: 121.00,
    payment_method: 'wire_transfer',
    origin_account: 12345,     // ID cuenta bancaria
    paid: true,
  }],
  document_number: 'FAC-2024-001', // Opcional
  annotations: 'Notas',            // Opcional
});

// Adjuntar archivo
await api.expenses.attachFile(expenseId, fileBuffer, 'factura.pdf', 'application/pdf');

// Descargar adjunto
const { content, mimeType } = await api.expenses.getAttachment(123);
```

### Clientes (Customers)

```typescript
// Listar
const result = await api.customers.list({ q: 'García' });

// Buscar por CIF
const customer = await api.customers.searchByCIF('B12345678');

// Obtener
const customer = await api.customers.get(123);

// Crear
const customer = await api.customers.create({
  cif: 'B12345678',
  business_name: 'Cliente Corp SL',
  email: 'contacto@cliente.com',
});

// Actualizar
await api.customers.update(123, { email: 'nuevo@email.com' });

// Eliminar
await api.customers.delete(123);
```

### Facturas (Invoices)

```typescript
// Listar
const result = await api.invoices.list({
  customer_id: 123,
  status: 'paid',  // 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  date_from: '2024-01-01',
});

// Obtener
const invoice = await api.invoices.get(123);

// Crear
const invoice = await api.invoices.create({
  date: '2024-01-15',
  due_date: '2024-02-15',
  customer_id: 123,
  lines: [{
    concept: 'Desarrollo web',
    quantity: 40,
    unit_price: 50.00,
    discount_percentage: 0,
    tax_rate: 21,
  }],
});

// Descargar PDF
const { content, mimeType } = await api.invoices.downloadPDF(123);
fs.writeFileSync('factura.pdf', content);

// Enviar por email
await api.invoices.sendByEmail(123, 'cliente@email.com');
```

### Cuentas bancarias (Accounts)

```typescript
// Listar
const result = await api.accounts.list({ active: true });

// Obtener
const account = await api.accounts.get(123);

// Obtener cuenta por defecto
const defaultAccount = await api.accounts.getDefault();
```

---

## Códigos de tipo de gasto

La API solo acepta códigos específicos. Los genéricos (`628`, `629`) serán rechazados.

```typescript
import { isValidExpenseType, getExpenseTypeDescription, EXPENSE_CATEGORIES } from '@nexusland/cuentica-api-client';

// Validar código
if (isValidExpenseType('6290004')) { /* válido */ }

// Obtener descripción
getExpenseTypeDescription('6290004'); // "Hosting y servicios web"

// Ver categorías
EXPENSE_CATEGORIES.utilities; // { name: 'Suministros', codes: [...] }
```

### Códigos comunes

| Código | Descripción |
|--------|-------------|
| `6210001` | Alquileres de locales |
| `6230001` | Asesoría fiscal y contable |
| `6280004` | Electricidad |
| `6280006` | Teléfono y comunicaciones |
| `6290001` | Material de oficina |
| `6290002` | Restauración y hostelería |
| `6290003` | Viajes y desplazamientos |
| `6290004` | Hosting y servicios web |
| `6290005` | Formación y cursos |
| `6290006` | Otros servicios externos |
| `6400000` | Sueldos socios/administradores |
| `6420000` | Seguridad social autónomos (RETA) |
| `622` | Reparaciones y conservación |
| `624` | Transportes |
| `625` | Primas de seguros |
| `626` | Servicios bancarios |
| `627` | Publicidad y RRPP |

---

## Manejo de errores

```typescript
import {
  CuenticaError,
  CuenticaRateLimitError,
  CuenticaNetworkError,
  CuenticaConfigError,
} from '@nexusland/cuentica-api-client';

try {
  await api.expenses.create(data);
} catch (error) {
  if (error instanceof CuenticaRateLimitError) {
    console.log(`Rate limit. Reintentar en ${error.retryAfter}s`);
  } else if (error instanceof CuenticaError) {
    console.log(`Error ${error.statusCode}: ${error.message}`);
    console.log('Detalles:', error.details);
  } else if (error instanceof CuenticaNetworkError) {
    console.log('Error de red:', error.message);
  } else if (error instanceof CuenticaConfigError) {
    console.log('Error de configuración:', error.message);
  }
}
```

---

## Paginación

Todos los métodos `list()` devuelven respuestas paginadas:

```typescript
const result = await api.providers.list({ page: 1, page_size: 50 });

result.data;       // Array de elementos
result.pagination; // { currentPage, totalPages, totalItems, itemsPerPage }

// Iterar todas las páginas
async function getAll() {
  const all = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const result = await api.providers.list({ page, page_size: 100 });
    all.push(...result.data);
    hasMore = page < result.pagination.totalPages;
    page++;
  }
  return all;
}
```

---

## Funciones de utilidad

```typescript
import { inferBusinessType, VAT_RATES, PAYMENT_METHODS } from '@nexusland/cuentica-api-client';

// Inferir tipo de empresa desde CIF/NIF
inferBusinessType('B12345678');  // 'company'
inferBusinessType('12345678Z');  // 'individual'

// Constantes disponibles
VAT_RATES;           // [0, 4, 10, 12, 21]
PAYMENT_METHODS;     // ['cash', 'wire_transfer', 'direct_debit', ...]
DOCUMENT_TYPES;      // ['invoice', 'ticket']
INVOICE_STATUSES;    // ['draft', 'sent', 'paid', 'overdue', 'cancelled']
RATE_LIMITS;         // { requestsPerFiveMinutes: 600, requestsPerDay: 7200 }
```

---

## Tipos adicionales

El paquete incluye tipos para funcionalidades avanzadas:

```typescript
import type {
  // Ingresos no facturados (intereses, subvenciones)
  Income, CreateIncomeData, IncomeListParams,

  // Traspasos entre cuentas
  Transfer, CreateTransferData, TransferListParams,

  // Documentos adjuntos
  Document, CreateDocumentData, DocumentListParams,

  // Etiquetas
  Tag, TagListParams,

  // Series de facturación
  InvoiceSerie,
} from '@nexusland/cuentica-api-client';
```

---

## Límites de la API

| Límite | Valor |
|--------|-------|
| Peticiones / 5 min | 600 |
| Peticiones / día | 7.200 |

---

## Errores en la documentación oficial

Esta librería corrige discrepancias importantes:

### 1. Creación de proveedores

| Documentación | Realidad |
|---------------|----------|
| Solo `nombre` requerido | `nombre` Y `business_name` requeridos |
| - | `business_type` requerido |
| Campos en español | Campos en inglés: `address`, `town`, `postal_code` |

### 2. Creación de gastos

| Documentación | Realidad |
|---------------|----------|
| Estructura plana | Estructura anidada con `expense_lines[]` |
| `tipo_iva` = importe | `tax` = PORCENTAJE (21, 10, 4, 0) |
| - | `document_type` requerido |
| - | `imputation` requerido (usar 100) |
| - | `payments[]` requerido |
| Códigos genéricos (`629`) | Códigos específicos (`6290006`) |

### 3. Content-Type en GET

| Documentación | Realidad |
|---------------|----------|
| No menciona | Enviar `Content-Type: application/json` en GET causa error |

### 4. Formato de respuesta

| Documentación | Realidad |
|---------------|----------|
| `{ "data": [...], "meta": {...} }` | Arrays directos, paginación en headers HTTP |

---

## Ejemplo completo

```typescript
import { CuenticaAPI } from '@nexusland/cuentica-api-client';

async function registerExpense() {
  const api = CuenticaAPI.fromEnv();

  // 1. Buscar o crear proveedor
  const provider = await api.providers.findOrCreate({
    tax_id: 'B12345678',
    business_name: 'DigitalOcean Inc',
  });

  // 2. Obtener cuenta bancaria
  const account = await api.accounts.getDefault();

  // 3. Crear gasto
  const expense = await api.expenses.create({
    date: '2024-01-15',
    document_type: 'invoice',
    document_number: 'INV-12345',
    provider: provider.id,
    draft: false,
    expense_lines: [{
      description: 'Hosting VPS',
      base: 50.00,
      tax: 21,
      imputation: 100,
      expense_type: '6290004',
    }],
    payments: [{
      date: '2024-01-15',
      amount: 60.50,
      payment_method: 'credit_card',
      origin_account: account.id,
      paid: true,
    }],
  });

  console.log(`Gasto creado: ${expense.id}`);
  console.log(`Total: ${expense.expense_details.total_expense}€`);
}
```

---

## Requisitos

- Node.js >= 18.0.0
- TypeScript >= 5.0 (recomendado)

## Licencia

MIT

## Enlaces

- [Cuentica](https://www.cuentica.com/)
- [API Docs](https://api.cuentica.com/doc)
- [GitHub](https://github.com/nexusland/cuentica-api-client)
- [Issues](https://github.com/nexusland/cuentica-api-client/issues)
