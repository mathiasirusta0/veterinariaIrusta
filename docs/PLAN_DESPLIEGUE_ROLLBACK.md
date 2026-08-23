# Plan de Despliegue, CI/CD y Rollback

---

## 1. Pipeline de Producción
- **Lint & Typecheck:** `npx tsc --noEmit`
- **Tests Unitarios:** `npm test`
- **Build:** `npm run build`
- **Despliegue:** Automático en Vercel con CDN edge network.

## 2. Rollback Instantáneo
- Reversión de commit en rama `main` o selección de Instant Rollback en panel Vercel.
