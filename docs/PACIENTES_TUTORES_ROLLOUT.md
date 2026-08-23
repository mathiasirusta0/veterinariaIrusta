# Estrategia de Rollout y Rollback — Pacientes & Tutores

---

## 1. Proceso de Despliegue
1. Verificación local con TypeScript (`npx tsc --noEmit`) y Vitest (`npm test`).
2. Generación de bundle de producción (`npm run build`).
3. Despliegue continuo en Vercel tras commit en rama `main`.

## 2. Plan de Rollback
- Reversión atómica mediante `git revert` del commit de despliegue.
- La compatibilidad retroactiva de los normalizadores garantiza que ningún cambio en la UI corrompa registros existentes en Supabase Cloud.
