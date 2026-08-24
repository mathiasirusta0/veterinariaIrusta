# PLAN DE MIGRACIÓN, DESPLIEGUE Y ROLLBACK

## 1. Estrategia de Despliegue
1. Validación completa de suite de tests en entorno local (`npm test`).
2. Verificación de tipos estricta (`npm run lint` / `tsc --noEmit`).
3. Generación de bundle de producción (`npm run build`).
4. Despliegue continuo a repositorio remoto `main` y sincronización en staging.

## 2. Procedimiento de Rollback
En caso de detectar una anomalía crítica en producción:
```bash
# 1. Revertir al commit previo estable
git revert HEAD --no-edit
git push origin main

# 2. Restaurar snapshot de base de datos desde respaldo de seguridad
```
