# Copilot Instructions for Fixpoint Project (Frontend + Backend)

## 🧠 Descripción general del sistema

Fixpoint es un sistema de gestión de reparaciones pensado para talleres de electrónica y electrodomésticos. Permite llevar el control de:
- Tickets de reparación
- Clientes
- Inventario de piezas y herramientas
- Historial técnico y uso de componentes
- Contratos, documentos y archivos adjuntos

Actualmente se encuentra en desarrollo activo y está compuesto por dos proyectos separados:
- **Frontend**: Angular 20 (SPA), ubicado en `Fixpoint-Frontend/`
- **Backend**: Spring Boot 3.5.4 + PostgreSQL, ubicado en `Fixpoint-Backend/`

---

## 🌐 Frontend: Angular 20 (SPA)

### 🧱 Estructura general

- Código en `src/app/`, dividido por dominios: `clients/`, `inventory/`, `tickets/`, `dashboard/`, etc.
- Los formularios viven en subcarpetas `*-form/` con componentes como `client-form.component.ts`.
- Modelos de datos están en `src/app/models/` y usan interfaces TypeScript (`.model.ts`).
- Las rutas están definidas en `app.routes.ts`.

### ✅ Convenciones

- El código debe estar en inglés.
- El contenido visible de la app (HTML, labels, formularios) debe estar en español.
- Cada componente tiene su propio archivo `.html`, `.ts` y `.scss`.
- Usar siempre la sintaxis moderna de Angular 20 (Signal-based inputs, Standalone Components, @if() y @for()).
- Evitar `ngOnInit()` innecesarios si se puede usar `constructor()` o signals.
- Al crear nuevos formularios, respetar la estructura de `<dominio>-form/` y nombrar como `xxx-form.component.ts`.
- No repetir clases scss si es posible, buscar un archivo mejor donde ubicarlos.
- Este proyecto fue generado sin el antiguo `zone.js`.

### 🚀 Flujo de desarrollo

- `npm start` o `ng serve` para entorno local.
- `ng build` para compilar en producción.
- `ng test` para tests unitarios (Karma + Jasmine).

---

## 🛠️ Backend: Spring Boot 3.5 + PostgreSQL

### 📦 Estructura modular

El código está dividido en paquetes por dominio:
´´´
com.fixpoint.dominio/
├── controller/
├── dto/
├── entity/
├── repository/
├── service/
´´´

Entre los dominios se incluyen unos como: `clients`, `tickets`, `inventory`, `ticketlogs`, `ticketparts`, `attachments`.

### 📌 Lógica de negocio implementada

- Cada ticket está asociado a un cliente.
- Un ticket puede tener:
  - Logs técnicos (`ticketlogs`)
  - Partes usadas (`ticketparts`)
  - Archivos adjuntos (`attachments`)
- El inventario gestiona piezas físicas, que se pueden asociar a reparaciones.
- El sistema debe permitir ver el historial técnico completo de un aparato.
- Todos los endpoints son REST y devuelven DTOs, no entidades directas.

### ⚠️ Consideraciones técnicas

- Usar DTOs para exponer datos. No exponer entidades JPA crudas.
- Validar entradas con `jakarta.validation`.
- Usar anotaciones como `@Service`, `@RestController`, `@Builder`, `@Repository`.
- Si el servicio es trivial, podés omitir la interfaz, pero preferimos mantener `ServiceImpl`.

---

## 🧠 Instrucciones específicas para agentes AI

- ⚠️ Angular 20 usa **Standalone Components**. Evitar ejemplos con `@NgModule`.
- Evitar `FormBuilder` si se puede tipar explícitamente los formularios.
- Evitar los antiguos `*ngIf`/`*ngFor`, ahora se usan @if() y @for().
- Usar `ReactiveFormsModule` para todos los formularios.
- Las clases deben respetar PascalCase en nombres y camelCase en propiedades.
- Los servicios deben llamarse `XService` y estar en `/service/`, implementando su interfaz si corresponde.
- Al crear un nuevo módulo, agregar carpeta por dominio con estructura completa (`controller`, `dto`, `entity`, `service`, etc.).
- Para nuevas rutas, recordar actualizar `app.routes.ts`.
- Al subir archivos, usá `FormData` y `HttpClient.post(...)`, y registrá el archivo en la entidad `Attachment`.

---

## 📂 Archivos clave

- `src/app/models/*.model.ts` → Interfaces de datos del frontend
- `src/styles.scss` → Estilos globales
- `src/app/app.routes.ts` → Enrutamiento de Angular
- `src/app/dashboard/` → Componente raíz y vista principal

---

## 📜 Idiomas y estándares

- El frontend se presenta al usuario en español.
- El código fuente (nombres de clases, variables, servicios) está en inglés.
- Se busca un código limpio, moderno y mantenible. No se requiere documentación exhaustiva inline, pero sí legibilidad.
- Las IAs deben evitar sugerir código obsoleto o basado en Angular <15 o Spring Boot <3.

---

## ⏳ Estado del desarrollo

- ✅ Clientes
- ✅ Tickets
- ✅ Ticket Logs
- ✅ Ticket Parts
- ✅ Inventory
- ✅ Attachments
- 🔜 Contratos, archivos firmados, facturación y offline sync

## Importante
- Estas instrucciones son usadas tanto en el Frontend como en el Backend, tener en cuenta que proyecto estamos trabajando para dar prioridad a las instrucciones que correspondan.
