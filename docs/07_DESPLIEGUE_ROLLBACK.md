# 07. Estrategia de Despliegue, CI/CD y Rollback

---

## 1. Flujo de Integración y Despliegue Continuo (CI/CD)
1. **Pre-commit / Verificación Local:**
   - `npx tsc --noEmit` (0 errores de tipado TypeScript).
   - `npm test` (39/39 tests aprobados en Vitest).
   - `npm run build` (Vite + esbuild production bundle).
2. **Pipeline Vercel:**
   - Push a `origin/main` dispara el build automatizado en Vercel.
   - Generación de artefactos optimizados con compresión gzip.

## 2. Procedimiento de Rollback Inmediato
- **Rollback de Código:** Reversión en Git al commit previo estable vía `git revert <commit_hash>` o selección del Instant Rollback en el dashboard de Vercel.
- **Rollback de Base de Datos:** Scripts de migración inversos (`down.sql`) respaldados en el repositorio.
