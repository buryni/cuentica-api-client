# Feedback de Documentación API Cuentica

**Fecha:** 4 de Enero de 2026
**Versión API testeada:** Producción (api.cuentica.com)
**Propósito:** Ayudar a mejorar la documentación oficial para facilitar la integración de desarrolladores

---

## Resumen Ejecutivo

Durante el desarrollo de un cliente API para Cuentica, hemos identificado varias discrepancias entre el comportamiento real de la API y lo documentado en https://apidocs.cuentica.com. Este documento detalla cada diferencia encontrada con el objetivo de mejorar la experiencia de los desarrolladores que integran con vuestra plataforma.

---

## 1. Comportamiento General de Updates (PUT)

### Discrepancia Crítica

**Documentación implícita:** Los endpoints PUT permiten actualizaciones parciales (solo enviar campos a modificar).

**Comportamiento real:** Los endpoints PUT requieren **TODOS** los campos del recurso, no solo los que se desean modificar. Si se omite un campo, la API devuelve error 400.

### Endpoints afectados:
- `PUT /customer/{id}`
- `PUT /provider/{id}`
- `PUT /expense/{id}`
- `PUT /transfer/{id}`
- `PUT /income/{id}`

### Ejemplo con Customer:

```bash
# Esto FALLA (aunque solo quieras cambiar el teléfono):
curl -X PUT '/customer/123' -d '{"phone": "123456789"}'

# Error: 'business_type' is undefined on object...

# Esto FUNCIONA (hay que enviar todos los campos):
curl -X PUT '/customer/123' -d '{
  "cif": "B12345678",
  "business_name": "Empresa SL",
  "business_type": "company",
  "address": "Calle Principal 1",
  "town": "Madrid",
  "postal_code": "28001",
  "region": "Madrid",
  "country": "ES",
  "phone": "123456789"
}'
```

### Sugerencia:
Documentar explícitamente que las operaciones PUT requieren el objeto completo, o considerar implementar PATCH para actualizaciones parciales.

---

## 2. Mensajes de Error Confusos

### Discrepancia

Los mensajes de error pueden ser confusos porque indican que un campo "no está en las claves disponibles" cuando en realidad **ES requerido**.

### Ejemplo:

```json
{
  "status": 400,
  "message": "Invalid request body",
  "errors": [{
    "field": "origin_account",
    "received_value": "",
    "message": "'origin_account' is undefined on object. Available keys are 'date', 'amount', 'payment_method', 'paid', 'app', 'id'"
  }]
}
```

El mensaje sugiere que `origin_account` no es válido porque no está en "Available keys", pero en realidad **SÍ es requerido** para crear un expense payment.

### Sugerencia:
Modificar el mensaje de error para que sea más claro, por ejemplo:
- "Campo requerido: 'origin_account'"
- O incluir los campos requeridos en la lista de "Available keys"

---

## 3. Endpoint de Gastos (Expenses)

### 3.1 Campos requeridos en expense_lines

**Documentación:** No especifica todos los campos requeridos.

**Comportamiento real:** Los siguientes campos son **obligatorios**:
- `description` (string)
- `base` (number) - importe base
- `tax` (number) - **porcentaje** IVA (0, 4, 10, 21), NO el importe
- `retention` (number) - porcentaje retención (requerido, usar 0 si no aplica)
- `imputation` (number) - porcentaje imputación (usar 100 para 100%)
- `expense_type` (string) - código específico (ej: '6290006')

### 3.2 Campo `tax` en expense_lines

**Posible confusión:** El campo `tax` es el **porcentaje** de IVA, no el importe calculado.

```javascript
// Correcto:
{ "tax": 21 }  // 21% de IVA

// Incorrecto (error común):
{ "tax": 21.00 }  // Esto NO es el importe del impuesto
```

### 3.3 Campos requeridos en payments

**Campos obligatorios:**
- `date` (string, YYYY-MM-DD)
- `amount` (number)
- `payment_method` (string)
- `origin_account` (number) - **requerido aunque el error diga lo contrario**
- `paid` (boolean)

---

## 4. Endpoint de Ingresos (Incomes)

### 4.1 Campos requeridos en income_lines

**Campos obligatorios:**
- `concept` (string) - descripción
- `amount` (number)
- `tax` (number) - porcentaje IVA
- `retention` (number) - requerido, usar 0 si no aplica
- `income_type` (string) - debe ser uno de los códigos válidos
- `imputation` (number) - porcentaje imputación

### 4.2 Valores válidos para income_type

**Documentación:** No lista los valores válidos.

**Valores aceptados por la API:**
- `746`
- `754`
- `730`
- `778`
- `705`
- `766`
- `752`
- `759` (otros ingresos)
- `799`
- `700`
- `740`

### 4.3 Campos requeridos en charges

**Campos obligatorios:**
- `date` (string, YYYY-MM-DD)
- `amount` (number)
- `payment_method` (string)
- `destination_account` (number) - **requerido**
- `charged` (boolean) - NO `paid`

**Nota importante:** El campo se llama `charged`, no `paid` (a diferencia de expenses que usa `paid`).

---

## 5. Endpoint de Facturas (Invoices)

### 5.1 Campos requeridos en invoice_lines

**Campos obligatorios:**
- `concept` (string)
- `quantity` (number)
- `amount` (number) - precio unitario
- `discount` (number) - **requerido**, usar 0 si no aplica
- `retention` (number) - **requerido**, usar 0 si no aplica
- `tax` (number) - porcentaje IVA
- `sell_type` (string) - 'service' o 'product'

### 5.2 Campos requeridos en charges

**Campos obligatorios:**
- `date` (string, YYYY-MM-DD)
- `amount` (number)
- `payment_method` (string)
- `destination_account` (number) - **requerido**
- `charged` (boolean)

### 5.3 Estructura de respuesta Invoice

**Documentación:** Sugiere campo `number`.

**Respuesta real:**
```json
{
  "id": 123,
  "invoice_number": 1,        // Numérico, no string
  "invoice_serie": "generic", // Código de serie
  "date": "2026-01-04",
  "expedition_date": "2026-01-04 00:00:00",
  "issued": true,
  "recurrent": false,
  "amount_details": {
    "total_base": 100,
    "total_vat": 21,
    "total_tax": 21,
    "surcharge": 0,
    "total_retention": 0,
    "total_invoice": 121,
    "total_amount": 121,
    "total_charged": 121,
    "total_left": 0
  }
}
```

### 5.4 Eliminación de facturas

**Comportamiento:** Solo se pueden eliminar facturas con `issued: false` (borradores).

Las facturas emitidas (`issued: true`) no pueden eliminarse, lo cual es correcto desde el punto de vista fiscal pero debería documentarse.

---

## 6. Endpoint de Series (/company/serie)

### Estructura de respuesta

**Documentación esperada:** Campos como `id`, `code`, `name`, `is_default`.

**Respuesta real:**
```json
[
  {
    "name": "D",
    "default": false
  },
  {
    "name": "generic",
    "default": true
  }
]
```

Solo contiene `name` y `default`.

---

## 7. Endpoint de Transferencias (Transfers)

### Campos requeridos para creación

- `date` (string, YYYY-MM-DD)
- `amount` (number)
- `origin_account` (number)
- `destination_account` (number)
- `concept` (string) - **requerido**, no puede estar vacío
- `payment_method` (string)

### Campos requeridos para actualización

Mismos campos que creación (ver punto 1 sobre comportamiento de PUT).

---

## 8. Endpoint de Proveedores (Providers)

### Campo `region`

**Comportamiento especial:** El campo `region` debe estar en **minúsculas** y ser un nombre de región española válido.

```javascript
// Correcto:
{ "region": "madrid" }
{ "region": "barcelona" }

// Incorrecto (puede causar errores):
{ "region": "Madrid" }
{ "region": "MADRID" }
```

---

## 9. Autenticación

### Header correcto

**Documentación:** Debería especificar claramente el header.

**Header requerido:**
```
X-AUTH-TOKEN: <token>
```

**Nota:** No es `Authorization: Bearer <token>` como en muchas APIs REST modernas.

---

## 10. Content-Type en peticiones GET

### Comportamiento especial

**No enviar** `Content-Type: application/json` en peticiones GET sin body.

La API puede devolver "Invalid Json" si se envía este header en GETs.

---

## Sugerencias Generales

1. **Documentar todos los campos requeridos** para cada endpoint, distinguiendo entre creación y actualización.

2. **Incluir ejemplos completos** de request/response para cada operación.

3. **Listar valores válidos** para campos enum (income_type, expense_type, payment_method, etc.).

4. **Clarificar el comportamiento de PUT** vs actualizaciones parciales.

5. **Mejorar mensajes de error** para que indiquen claramente qué campos faltan.

6. **Documentar diferencias** entre campos similares (ej: `charged` vs `paid`).

---

*Documento generado con el objetivo de mejorar la experiencia de desarrolladores que integran con Cuentica.*
