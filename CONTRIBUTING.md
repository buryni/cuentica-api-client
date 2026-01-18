# Contribuir a @nexusland/cuentica-api-client

¡Gracias por tu interés en contribuir! Este documento explica cómo puedes ayudar a mejorar este proyecto.

## Código de conducta

Este proyecto sigue un código de conducta basado en el respeto mutuo. Por favor, sé amable y constructivo en todas las interacciones.

## Cómo contribuir

### Reportar bugs

Si encuentras un bug, abre un [issue en GitHub](https://github.com/nexusland/cuentica-api-client/issues) con:

1. **Título descriptivo** del problema
2. **Pasos para reproducir** el error
3. **Comportamiento esperado** vs **comportamiento actual**
4. **Versión** del paquete y Node.js
5. **Código de ejemplo** que demuestre el problema (si es posible)

### Sugerir mejoras

Para sugerir nuevas funcionalidades o mejoras:

1. Revisa los [issues existentes](https://github.com/nexusland/cuentica-api-client/issues) para evitar duplicados
2. Abre un nuevo issue describiendo:
   - Qué problema resuelve la mejora
   - Cómo debería funcionar
   - Ejemplos de uso propuestos

### Enviar cambios (Pull Requests)

1. **Fork** el repositorio
2. **Crea una rama** desde `master`:
   ```bash
   git checkout -b feature/mi-mejora
   ```
3. **Haz tus cambios** siguiendo las guías de estilo
4. **Ejecuta los tests**:
   ```bash
   npm test
   npm run lint
   ```
5. **Commitea** siguiendo [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: añadir soporte para X"
   git commit -m "fix: corregir error en Y"
   git commit -m "docs: actualizar documentación de Z"
   ```
6. **Push** a tu fork y abre un **Pull Request**

## Guías de desarrollo

### Requisitos

- Node.js >= 18.0.0
- npm, yarn o pnpm

### Configuración del entorno

```bash
# Clonar repositorio
git clone https://github.com/nexusland/cuentica-api-client.git
cd cuentica-api-client

# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# Ejecutar tests
npm test

# Ejecutar linter
npm run lint
```

### Estructura del proyecto

```
src/
├── api.ts          # Clase principal CuenticaAPI
├── client.ts       # Cliente HTTP
├── errors.ts       # Clases de error
├── index.ts        # Exports públicos
├── constants/      # Constantes y códigos
├── endpoints/      # Implementación de endpoints
└── types/          # Definiciones TypeScript
```

### Estilo de código

- **TypeScript estricto**: Todos los tipos deben estar definidos
- **ESM**: Usamos módulos ES (no CommonJS)
- **Prettier**: Para formateo automático
- **ESLint**: Para calidad de código

Antes de commitear:
```bash
npm run format
npm run lint
```

### Tests

- Los tests unitarios van en `tests/unit/`
- Los tests de integración van en `tests/integration/`
- Usamos **Vitest** como framework de testing

Para ejecutar tests:
```bash
# Todos los tests
npm test

# Con cobertura
npm run test:coverage

# Solo un archivo
npx vitest run tests/unit/expenses.test.ts
```

### Documentación

- Mantén el README actualizado si añades funcionalidades
- Documenta funciones públicas con JSDoc
- Incluye ejemplos de uso cuando sea posible

## Discrepancias con la API oficial

Este proyecto documenta y corrige discrepancias entre la documentación oficial de Cuentica y el comportamiento real de la API. Si encuentras nuevas discrepancias:

1. Verifica el comportamiento real con tests
2. Documenta la discrepancia en el código con comentarios
3. Añádela al README en la sección correspondiente
4. Considera reportarla también a Cuentica

## Preguntas

Si tienes preguntas, abre un [issue con la etiqueta "question"](https://github.com/nexusland/cuentica-api-client/issues/new?labels=question).

---

¡Gracias por contribuir!
