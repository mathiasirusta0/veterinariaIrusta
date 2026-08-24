# PROTOCOLO DE PRUEBAS DE FACTURACIÓN ELECTRÓNICA ARCA (AFIP)

## 1. Parámetros de Homologación (Testing)
- **Ambiente:** Testing / Homologación (WSFE v1).
- **Puntos de Venta:** PV 1 (Electrónico WebServices), PV 2 (Mostrador / Guardia).
- **Tipos de Comprobante:** Factura B (Consumidor Final), Factura A (Responsable Inscripto), Factura C (Monotributo), Recibo X (Ticket no fiscal).

## 2. Casos de Prueba Validados
1. Cálculo de IVA Débito Fiscal (21% y 10.5%).
2. Generación de número de comprobante formal (`B-0001-00000001`).
3. Validación de CAE de 14 dígitos y fecha de vencimiento.
4. Generación de código QR oficial con payload JSON de AFIP.
5. Cierre Z y arqueo de caja chica con desglose de billetes físicos.
