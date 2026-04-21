# Proposal: Comprehensive Testing & i18n Fixes

## Change Name
`comprehensive-test`

## Intent
Testear comprehensivamente toda la app (funcionalidad + UX/UI) y arreglar los issues de i18n encontrados durante la exploración.

## Scope

### Testing Coverage
1. **Landing page** — hero, features, FAQ, CTA, dark mode toggle, navigation
2. **Auth flow** — register → verify email → login → forgot → reset
3. **Upload CV** — 3-step form (upload → context → template)
4. **Community** — browse, search, filters, vote
5. **Dashboard** — stats, settings, deleted CVs

### Fixes to Implement
1. `FeaturesSection` → migrar arrays hardcodeados a i18n (`t()`)
2. `FAQSection` → migrar arrays hardcodeados a i18n (`t()`)
3. `CVUploadForm` → agregar todas las traducciones faltantes al i18n provider
4. `Dashboard notifications` → agregar traducciones en i18n provider
5. Backend `notifications.ts` → reemplazar `console.*` por `logger.*`

## Out of Scope
- Nuevas features
- Cambios de arquitectura
- Modificaciones al backend API (rutas ya funcionan)

## Approach
1. Manual testing (walkthrough de cada sección)
2. Fix i18n en componentes affected
3. Agregar traducciones faltantes al i18n provider
4. Fix backend console.* → logger.*
5. Commit y push

## Rollback Plan
Si algo se rompe: `git checkout` del archivo afectado. Cambios atómicos por archivo.

## Success Criteria
- Todos los textos de la app usan i18n (no hardcoded)
- Landing completa funciona en ES y EN
- Auth flow completo testeado
- CV upload completo testeado
- Community completa testeada
- Dashboard completa testeado
- Backend sin console.* logs

## Risks
- **Bajo**: cambios localizados de texto
- **Mitigación**: commit atómico por archivo, testing manual after cada fix