# Propuesta Comercial

**Proyecto:** Implementación de Feature Discounts para POS  
**Fecha:** 24 de marzo de 2026  
**Cliente:** Casa Martinez de Kendall  
**Proveedor:** Bincrafters LLC

## 1. Resumen Ejecutivo

Se propone la implementación del feature **Discounts** dentro del sistema POS, con el objetivo de habilitar descuentos controlados, configurables y auditables directamente en la operación de caja.

Esta funcionalidad permitirá al cliente ejecutar promociones, descuentos manuales y reglas de aprobación con mayor control operativo, reduciendo errores en caja y mejorando la trazabilidad de cada ajuste de precio aplicado durante la venta.

## 2. Objetivo del Feature

El feature **Discounts** busca incorporar al POS una capa de control comercial para:

1. Aplicar descuentos a nivel de orden o de producto.
2. Habilitar promociones por código promocional.
3. Restringir quién puede aplicar descuentos y bajo qué límites.
4. Registrar reglas de aprobación cuando un descuento exceda parámetros definidos.
5. Mantener visibilidad operativa y trazabilidad sobre el impacto de descuentos en ventas.

## 3. Alcance Incluido

La propuesta contempla la implementación de los siguientes componentes:

### 3.1 Configuración de descuentos

1. Creación y edición de definiciones de descuentos.
2. Soporte para descuentos manuales, automáticos y por promo code.
3. Aplicación por porcentaje, monto fijo o precio final.
4. Aplicación a nivel de orden completa o por línea/producto.
5. Activación y desactivación de descuentos.

### 3.2 Reglas de aplicación

1. Configuración de subtotal mínimo y cantidad mínima cuando aplique.
2. Restricciones por categoría o producto.
3. Exclusiones de productos o categorías específicas.
4. Soporte para vigencia por fecha, día y horario.
5. Alcance por tienda o estación, cuando sea requerido.

### 3.3 Promo Codes

1. Creación y administración de códigos promocionales.
2. Aplicación del código directamente desde el flujo de venta.
3. Validación del descuento asociado al código.
4. Registro del promo code aplicado dentro de la orden.

### 3.4 Políticas y control por empleado/rol

1. Políticas de descuento por empleado o por rol.
2. Límite máximo de descuento manual en porcentaje.
3. Límite máximo de descuento manual en monto.
4. Límite máximo para price override.
5. Reglas para requerir razón o aprobación según el tipo de ajuste.
6. Habilitación o bloqueo del uso de promo codes según perfil.

### 3.5 Integración con la venta y reporting

1. Reflejo inmediato del descuento en el carrito y totales de la orden.
2. Persistencia del resumen de descuentos aplicados en la venta.
3. Trazabilidad del uso de descuentos dentro del historial de órdenes.
4. Visibilidad del impacto de descuentos en reportes operativos.

## 4. Beneficios para el Cliente

1. Mayor control sobre promociones y descuentos aplicados en caja.
2. Reducción de descuentos no autorizados.
3. Protección de márgenes mediante límites y aprobaciones.
4. Mejor experiencia operativa para cajeros y gerencia.
5. Mayor visibilidad para auditoría y revisión de ventas.

## 5. Entregables

Como resultado de este trabajo se entregará:

1. Feature `Discounts` implementado en el repositorio del POS.
2. Flujo de administración de descuentos y promo codes.
3. Reglas de políticas por empleado/rol integradas al flujo de venta.
4. Integración de descuentos en cálculo de orden, resumen y persistencia.
5. Validación técnica del feature dentro del alcance definido.

## 6. Exclusiones

Esta propuesta no incluye:

1. Integraciones con plataformas externas de cupones o loyalty.
2. Motores promocionales avanzados tipo BOGO o campañas complejas de marketing.
3. Rediseño integral de Back Office o POS fuera de lo requerido para este feature.
4. Nuevos requerimientos no descritos en este documento.

## 7. Inversión

**Monto fijo por implementación del feature Discounts:** **USD 1,200.00**

Este monto incluye el desarrollo, integración funcional y validación técnica dentro del alcance descrito.

## 8. Condiciones Comerciales

1. Moneda: dólares estadounidenses (USD).
2. Modalidad: precio fijo por alcance definido.
3. Vigencia de la propuesta: 15 días calendario desde la fecha de emisión.
4. Cualquier ajuste o ampliación de alcance será cotizado por separado.

## 9. Esquema de Pago Sugerido

1. 50% al aprobar la propuesta e iniciar el trabajo.
2. 50% contra entrega del feature y validación final.

## 10. Criterios de Aceptación

El feature se considerará entregado cuando:

1. Se puedan crear y administrar descuentos según el alcance descrito.
2. Se puedan aplicar descuentos y promo codes en el flujo de venta.
3. Las políticas por rol o empleado se reflejen correctamente en la operación.
4. Los descuentos se vean reflejados en los totales y datos de la orden.
5. El comportamiento haya sido validado técnicamente en el entorno acordado.

## 11. Cierre

La implementación de **Discounts** agrega una capacidad comercial importante al POS, permitiendo ejecutar promociones con control, flexibilidad y trazabilidad operativa.

En caso de aprobación, el siguiente paso sería confirmar por escrito el visto bueno sobre alcance, monto y prioridad de implementación.
