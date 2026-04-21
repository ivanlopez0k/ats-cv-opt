# Spec: Comprehensive Testing & i18n Fixes

## Domain
`testing-and-i18n`

## Context
Exploración ID `comprehensive-test` reveló que `FeaturesSection`, `FAQSection` y `CVUploadForm` tienen textos hardcodeados en lugar de usar el sistema i18n. Esto causa inconsistencias en landing page y el flujo de upload.

---

## Requirements

### R1: FeaturesSection i18n
**Current:** Arrays `FEATURES_ES`/`FEATURES_EN` hardcodeados.
**Expected:** Usa `t()` para todos los textos.
**Scenarios:**

| ID | Scenario | Given | When | Then |
|----|---------|-------|------|------|
| R1-S1 | Hero badge visible | Usuario visita landing | Landing carga | Badge "Optimizado con IA GPT-4" / "AI-optimized with GPT-4" visible |
| R1-S2 | 6 features visibles | Usuario en landing | Section carga | 6 cards con título + descripción en locale correcto |
| R1-S3 | Locale switch | Usuario cambia a EN | FeaturesSection re-renderiza | Muestra versión EN de títulos y descripciones |

### R2: FAQSection i18n
**Current:** Arrays `FAQS_ES`/`FAQS_EN` hardcodeados.
**Expected:** Usa `t()` para todos los textos.
**Scenarios:**

| ID | Scenario | Given | When | Then |
|----|---------|-------|------|------|
| R2-S1 | 5 FAQs visibles | Usuario en landing | FAQ section carga | 5 items con question + answer |
| R2-S2 | Accordion expand | Usuario clickea FAQ | FAQ item clickeado | Answer se expande con animación |
| R2-S3 | Locale switch | Usuario cambia a EN | FAQSection re-renderiza | Muestra versión EN de preguntas y respuestas |

### R3: CVUploadForm i18n
**Current:** ~400 líneas en español hardcodeadas.
**Expected:** Todas las traducciones en i18n provider + uso de `t()`.
**Scenarios:**

| ID | Scenario | Given | When | Then |
|----|---------|-------|------|------|
| R3-S1 | Step 1 - dropzone | Usuario en upload | Step 1 carga | "Arrastrá tu CV..." / "Drag your CV..." visible |
| R3-S2 | Step 1 - title input | Archivo seleccionado | Input visible | Placeholder del título visible |
| R3-S3 | Step 2 - context | Usuario clickea Continuar | Step 2 carga | "¿A qué puesto querés aplicar?" / "What position?" visible |
| R3-S4 | Step 2 - experience | Experience levels visibles | Nivel clickeado | Borde cambia, label seleccionado |
| R3-S5 | Step 3 - template | Usuario clickea Continuar | Step 3 carga | "¿Qué estilo preferís?" / "What style?" visible |
| R3-S6 | Submit button | Formulario completo | Usuario submit | "Analizar con IA" / "Analyze with AI" |
| R3-S7 | Upload progress | Archivo subiendo | Upload en curso | Progress bar + porcentaje |

### R4: Notifications i18n (Dashboard)
**Current:** Traducciones existen en i18n provider pero vacías.
**Expected:** Traducciones completas.
**Scenarios:**

| ID | Scenario | Given | When | Then |
|----|---------|-------|------|------|
| R4-S1 | Empty state | Sin notificaciones | Tab carga | "No tenés notificaciones" / "No notifications" visible |
| R4-S2 | Title | En notifications tab | Tab carga | "Notificaciones" / "Notifications" visible |

### R5: Backend logging
**Current:** `notifications.ts` usa `console.*`.
**Expected:** `notifications.ts` usa `logger.*`.
**Scenarios:**

| ID | Scenario | Given | When | Then |
|----|---------|-------|------|------|
| R5-S1 | Notification list | Usuario autenticado | GET /notifications | Request logged via logger.info |
| R5-S2 | Mark read | Usuario marca notif | PATCH /notifications/:id/read | Request logged via logger.info |
| R5-S3 | Error case | DB falla | Cualquier endpoint falla | Error logged via logger.error |

### R6: Manual Testing Checklist
**Expected:** Todos los flujos principales testeados manualmente.
**Scenarios:**

| ID | Section | Checkpoint |
|----|---------|-----------|
| T1 | Landing | Hero animation carga |
| T2 | Landing | Dark mode toggle funciona |
| T3 | Landing | Language switcher funciona |
| T4 | Auth Register | Formulario carga sin errores |
| T5 | Auth Login | Login exitoso → dashboard |
| T6 | Auth Verify Email | Verificación funcional |
| T7 | Auth Forgot Password | Email enviado (logged in dev) |
| T8 | Upload Step 1 | Drag & drop funciona |
| T9 | Upload Step 2 | Context questions completan |
| T10 | Upload Step 3 | Templates seleccionables |
| T11 | Upload Submit | Redirige a dashboard |
| T12 | Community | Cards cargan |
| T13 | Community | Search filtra resultados |
| T14 | Community | Vote toggle funciona |
| T15 | Dashboard | Stats cards cargan |
| T16 | Dashboard Settings | Tabs funcionan |
| T17 | Dashboard Deleted | Soft delete visible |

---

## i18n Keys to Add

### CVUploadForm keys
```
cvUpload: {
  step1: { dropzone, title, placeholder, continue }
  step2: {
    title, targetJob, targetCompany, industry, experienceLevel,
    optimizationFocus, additionalNotes, back, continue
  }
  step3: { title, template, submit }
  uploading: { title, subtitle, progress }
  errors: { invalidFile, fileTooBig, uploadSuccess, uploadError }
  labels: { experienceLevels, optimizationFocuses, templates }
}
```

### Notifications keys
```
dashboard: {
  notifications: {
    title: "Notificaciones"
    empty: "No tenés notificaciones"
  }
}
```

---

## Implementation Notes
- i18n provider ya existe en `src/i18n/index.tsx` (~1400 líneas)
- Traducciones ES/EN ya definidas para la mayoría de secciones
- Solo agregar keys faltantes y migrar componentes
- Mantener `t()` fallback (devuelve key si no existe)
- No agregar neuevos features

## Acceptance Criteria
- [ ] FeaturesSection usa `t()` (no arrays hardcodeados)
- [ ] FAQSection usa `t()` (no arrays hardcodeados)
- [ ] CVUploadForm todas las keys en i18n provider
- [ ] Notifications dashboard keys completas
- [ ] Backend notifications.ts sin console.*
- [ ] Landing completa funcional en ES y EN
- [ ] Upload completo funcional en ES y EN
- [ ] Auth completo funcional en ES y EN
- [ ] Community completo funcional en ES y EN
- [ ] Dashboard completo funcional en ES y EN