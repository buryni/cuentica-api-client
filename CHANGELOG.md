# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.0.0] - 2025-01-19

### Añadido

- **Cliente principal `CuenticaAPI`** con soporte completo para todos los endpoints
- **10 endpoints implementados:**
  - `company` - Información de la empresa
  - `providers` - Gestión de proveedores
  - `expenses` - Gestión de gastos con líneas y pagos
  - `customers` - Gestión de clientes
  - `invoices` - Gestión de facturas de venta
  - `accounts` - Cuentas bancarias
  - `incomes` - Ingresos no facturados
  - `documents` - Documentos adjuntos
  - `tags` - Etiquetas para clasificación
  - `transfers` - Traspasos entre cuentas

- **Tipado TypeScript completo** con modo estricto
- **Manejo automático de paginación** extrayendo datos de headers HTTP
- **Clases de error especializadas:**
  - `CuenticaError` - Errores de API
  - `CuenticaRateLimitError` - Límite de peticiones (429)
  - `CuenticaNetworkError` - Errores de red
  - `CuenticaConfigError` - Errores de configuración

- **Soporte para archivos:**
  - Subida de documentos adjuntos
  - Descarga de PDFs de facturas

- **Constantes y validación:**
  - Códigos de tipo de gasto validados
  - Tasas de IVA españolas
  - Métodos de pago
  - Inferencia automática de tipo de empresa desde CIF/NIF

- **Documentación completa** en español con ejemplos de uso
- **Tests unitarios e integración** con Vitest

### Corregido

- Tipos alineados con el comportamiento real de la API (no la documentación oficial)
- Estructura correcta para creación de gastos (`expense_lines[]` anidado)
- Campos requeridos no documentados en proveedores (`nombre`, `business_name`, `business_type`)
- Formato de paginación (headers HTTP, no body JSON)
- `tax` como porcentaje, no importe

### Documentado

- Discrepancias entre la documentación oficial de Cuentica y el comportamiento real
- Códigos de tipo de gasto específicos (los genéricos son rechazados)
- Límites de API (600 req/5min, 7200 req/día)

---

## Tipos de cambios

- `Añadido` para nuevas funcionalidades
- `Cambiado` para cambios en funcionalidades existentes
- `Obsoleto` para funcionalidades que serán eliminadas próximamente
- `Eliminado` para funcionalidades eliminadas
- `Corregido` para corrección de errores
- `Seguridad` para vulnerabilidades
