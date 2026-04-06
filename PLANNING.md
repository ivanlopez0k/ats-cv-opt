# 📋 Planning — ATS CV Optimizer

> Stack: **Angular + SpartanUI** (Frontend) · **Node.js + Prisma + PostgreSQL** (Backend) · **QwenCoder** como asistente de desarrollo

---

## 🗂️ Índice

1. [Visión General del Proyecto](#1-visión-general-del-proyecto)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura General](#3-arquitectura-general)
4. [Modelo de Base de Datos](#4-modelo-de-base-de-datos-prisma)
5. [Módulos y Features](#5-módulos-y-features)
6. [Fases de Desarrollo](#6-fases-de-desarrollo)
7. [Estructura de Carpetas](#7-estructura-de-carpetas)
8. [Endpoints API REST](#8-endpoints-api-rest)
9. [Planes Free vs Premium](#9-planes-free-vs-premium)
10. [Consideraciones de Seguridad](#10-consideraciones-de-seguridad)
11. [Métricas ATS](#11-métricas-ats)
12. [Roadmap Visual](#12-roadmap-visual)

---

## 1. Visión General del Proyecto

**ATS CV Optimizer** es una plataforma web que permite a los usuarios subir su CV en formato PDF para que sea analizado y mejorado automáticamente según las normas ATS (Applicant Tracking System). Los usuarios pueden registrarse, acceder a un plan gratuito o premium, compartir sus CVs optimizados y participar en votaciones mensuales.

### Objetivos principales

- Subida y análisis automático de CVs en PDF
- Mejora del CV según criterios ATS
- Sistema de usuarios con autenticación (registro/login)
- Modelo freemium (3 CVs gratuitos / ilimitados en premium)
- Comunidad: compartir CVs y votación mensual

---

## 2. Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend Framework | Angular 17+ |
| UI Components | SpartanUI (Spartan/UI) |
| Estilos | Tailwind CSS (base de SpartanUI) |
| Backend Runtime | Node.js + Express (o NestJS) |
| ORM | Prisma |
| Base de datos | PostgreSQL |
| Autenticación | JWT + Refresh Tokens |
| Procesamiento PDF | pdf-parse / pdf-lib |
| IA / ATS Analysis | OpenAI API o modelo local (QwenCoder para lógica ATS) |
| Almacenamiento archivos | AWS S3 / Cloudflare R2 / local (dev) |
| Asistente de desarrollo | QwenCoder |

---

## 3. Arquitectura General

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Angular)                 │
│              UI Components: SpartanUI                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │  Auth    │ │Dashboard │ │CV Upload │ │Community│ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘  │
└────────────────────────┬────────────────────────────┘
                         │ HTTP / REST
┌────────────────────────▼────────────────────────────┐
│                BACKEND (Node.js / NestJS)            │
│  ┌────────────┐ ┌──────────────┐ ┌───────────────┐  │
│  │Auth Service│ │CV Service    │ │Community Svc  │  │
│  └────────────┘ └──────────────┘ └───────────────┘  │
│                         │                            │
│  ┌──────────────────────▼──────────────────────┐    │
│  │              Prisma ORM                      │    │
│  └──────────────────────┬──────────────────────┘    │
└────────────────────────┬────────────────────────────┘
                         │
            ┌────────────▼────────────┐
            │      PostgreSQL DB       │
            └─────────────────────────┘
```

---

## 4. Modelo de Base de Datos (Prisma)

```prisma
// schema.prisma

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  name          String
  plan          Plan      @default(FREE)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  cvs           CV[]
  votes         Vote[]
  refreshTokens RefreshToken[]
}

model CV {
  id            String    @id @default(uuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  originalUrl   String    // URL del PDF original
  optimizedUrl  String?   // URL del PDF mejorado
  atsScore      Float?    // Porcentaje ATS logrado
  isPublic      Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  votes         Vote[]
  tags          String[]  // palabras clave detectadas
  status        CVStatus  @default(PENDING)
}

model Vote {
  id        String   @id @default(uuid())
  userId    String
  cvId      String
  user      User     @relation(fields: [userId], references: [id])
  cv        CV       @relation(fields: [cvId], references: [id])
  month     Int      // ej: 4 para Abril
  year      Int      // ej: 2025
  createdAt DateTime @default(now())

  @@unique([userId, cvId, month, year])
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
  createdAt DateTime @default(now())
}

enum Plan {
  FREE
  PREMIUM
}

enum CVStatus {
  PENDING
  PROCESSING
  DONE
  ERROR
}
```

---

## 5. Módulos y Features

### 5.1 Módulo de Autenticación

- Registro con email y contraseña
- Login con JWT (access token + refresh token)
- Recuperación de contraseña por email
- Guard de rutas en Angular (`AuthGuard`)
- Interceptor HTTP para adjuntar el token

### 5.2 Módulo de CV

- Subida de PDF (validación de tipo y tamaño)
- Extracción de texto del PDF
- Análisis y puntuación ATS
- Mejora automática del CV (reescritura sugerida)
- Descarga del CV optimizado en PDF
- Historial de CVs por usuario
- Visualizador de diferencias (original vs. optimizado)

### 5.3 Módulo de Comunidad

- Feed de CVs públicos con puntaje ATS
- Filtro por porcentaje ATS (ej: mostrar solo los que superan el 80%)
- Botón para copiar estructura/template del CV compartido
- Sección de **Mejores CVs del Mes** (ranking por votos)
- Votación: 1 voto por usuario por CV por mes

### 5.4 Módulo de Dashboard

- Resumen de CVs del usuario
- Gráfico de progreso ATS
- Estado de plan (free/premium)
- Acceso directo a subir nuevo CV

### 5.5 Módulo de Planes / Billing

- Vista de comparación Free vs Premium
- Integración con pasarela de pago (Stripe recomendado)
- Activación automática del plan premium post-pago
- Historial de pagos

---

## 6. Fases de Desarrollo

### 🟦 Fase 0 — Setup inicial (Semana 1)

- [ ] Inicializar repositorio Git (monorepo o repos separados)
- [ ] Crear proyecto Angular con SpartanUI y Tailwind
- [ ] Crear proyecto backend (Node.js + Express o NestJS)
- [ ] Configurar PostgreSQL local con Docker
- [ ] Inicializar Prisma y crear schema base
- [ ] Configurar variables de entorno (`.env`)
- [ ] Definir estructura de carpetas (ver sección 7)

---

### 🟩 Fase 1 — Autenticación (Semana 2)

**Backend**
- [ ] Endpoint POST `/auth/register`
- [ ] Endpoint POST `/auth/login`
- [ ] Endpoint POST `/auth/refresh`
- [ ] Endpoint POST `/auth/logout`
- [ ] Middleware de autenticación JWT
- [ ] Hash de contraseñas con bcrypt

**Frontend**
- [ ] Página de Login (SpartanUI forms)
- [ ] Página de Registro
- [ ] Servicio `AuthService` con manejo de tokens
- [ ] `AuthGuard` para rutas protegidas
- [ ] Interceptor HTTP para headers Authorization
- [ ] Persistencia del token (localStorage)

---

### 🟨 Fase 2 — Subida y análisis de CV (Semanas 3–4)

**Backend**
- [ ] Endpoint POST `/cv/upload` (recibe PDF multipart)
- [ ] Almacenamiento del PDF (S3 o local)
- [ ] Extracción de texto con `pdf-parse`
- [ ] Lógica de análisis ATS (keywords, formato, secciones)
- [ ] Generación del CV mejorado (texto + re-generación PDF)
- [ ] Endpoint GET `/cv/:id` — detalle del CV
- [ ] Endpoint GET `/cv/my` — CVs del usuario autenticado
- [ ] Validación de límite por plan (3 CVs para FREE)

**Frontend**
- [ ] Componente de drag & drop para subir PDF
- [ ] Progress bar durante el análisis
- [ ] Vista de resultado: score ATS + sugerencias
- [ ] Comparador visual original vs. optimizado
- [ ] Botón de descarga del CV optimizado

---

### 🟧 Fase 3 — Comunidad (Semana 5)

**Backend**
- [ ] Endpoint PATCH `/cv/:id/publish` — hacer CV público
- [ ] Endpoint GET `/cv/public` — listar CVs públicos (con filtros)
- [ ] Endpoint POST `/vote/:cvId` — votar un CV
- [ ] Endpoint GET `/vote/top-month` — top CVs del mes
- [ ] Lógica anti-spam de votos (1 voto/usuario/CV/mes)

**Frontend**
- [ ] Feed de CVs públicos con puntaje ATS
- [ ] Filtro por rango de score ATS
- [ ] Card de CV con opción "Copiar estructura"
- [ ] Sección "Top CVs del Mes" con podio visual
- [ ] Botón de voto con feedback visual

---

### 🟥 Fase 4 — Planes y Pagos (Semana 6)

**Backend**
- [ ] Integración Stripe (checkout session, webhooks)
- [ ] Endpoint POST `/billing/checkout` — crear sesión de pago
- [ ] Webhook POST `/billing/webhook` — escuchar eventos Stripe
- [ ] Actualización automática de plan al recibir `payment_succeeded`

**Frontend**
- [ ] Página de pricing con comparación de planes
- [ ] Botón de upgrade hacia Stripe Checkout
- [ ] Badge de plan en el dashboard
- [ ] Mensaje de límite alcanzado con CTA a premium

---

### ⬛ Fase 5 — Pulido y Deploy (Semana 7)

- [ ] Tests unitarios y de integración (Jest / Jasmine)
- [ ] Optimización de queries Prisma
- [ ] Manejo global de errores (backend + frontend)
- [ ] Diseño responsive completo con SpartanUI
- [ ] Dark mode (si SpartanUI lo soporta)
- [ ] Deploy backend (Railway, Render, o VPS)
- [ ] Deploy frontend (Vercel, Netlify, o mismo VPS)
- [ ] Configurar dominio y SSL
- [ ] Variables de entorno de producción

---

## 7. Estructura de Carpetas

### Frontend (Angular)

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/          # AuthGuard, PremiumGuard
│   │   │   ├── interceptors/    # JWT interceptor
│   │   │   └── services/        # AuthService, CVService, etc.
│   │   ├── features/
│   │   │   ├── auth/            # login, register, forgot-password
│   │   │   ├── dashboard/       # resumen del usuario
│   │   │   ├── cv/              # upload, viewer, history
│   │   │   ├── community/       # feed, top-month, voting
│   │   │   └── billing/         # pricing, checkout
│   │   ├── shared/
│   │   │   ├── components/      # componentes reutilizables
│   │   │   ├── pipes/
│   │   │   └── models/          # interfaces TypeScript
│   │   └── app.routes.ts
│   ├── environments/
│   └── styles.css
```

### Backend (Node.js / NestJS)

```
backend/
├── src/
│   ├── auth/                # módulo de autenticación
│   ├── cv/                  # módulo de CVs
│   ├── community/           # módulo de comunidad y votos
│   ├── billing/             # módulo de pagos
│   ├── prisma/              # PrismaService
│   ├── common/
│   │   ├── guards/
│   │   ├── decorators/
│   │   └── filters/         # manejo global de errores
│   └── main.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── .env
```

---

## 8. Endpoints API REST

### Auth

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Crear cuenta | No |
| POST | `/auth/login` | Login, devuelve JWT | No |
| POST | `/auth/refresh` | Renovar access token | No |
| POST | `/auth/logout` | Invalidar refresh token | Sí |

### CV

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/cv/upload` | Subir PDF para análisis | Sí |
| GET | `/cv/my` | Listar CVs del usuario | Sí |
| GET | `/cv/:id` | Detalle de un CV | Sí |
| PATCH | `/cv/:id/publish` | Hacer CV público/privado | Sí |
| DELETE | `/cv/:id` | Eliminar CV | Sí |
| GET | `/cv/public` | Feed de CVs públicos | No |

### Community

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/vote/:cvId` | Votar un CV | Sí |
| DELETE | `/vote/:cvId` | Quitar voto | Sí |
| GET | `/vote/top-month` | Top CVs del mes | No |

### Billing

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/billing/checkout` | Crear sesión Stripe | Sí |
| POST | `/billing/webhook` | Webhook de Stripe | No* |
| GET | `/billing/status` | Estado del plan | Sí |

> *El webhook de Stripe se valida con la firma del header `Stripe-Signature`

---

## 9. Planes Free vs Premium

| Feature | Free | Premium |
|---|---|---|
| CVs subidos y mejorados | 3 total | Ilimitados |
| Descarga de CV optimizado | ✅ | ✅ |
| Publicar CV en comunidad | ✅ | ✅ |
| Votar CVs del mes | ✅ | ✅ |
| Ver top CVs del mes | ✅ | ✅ |
| Historial de versiones del CV | ❌ | ✅ |
| Análisis ATS detallado | Básico | Completo |
| Soporte prioritario | ❌ | ✅ |

---

## 10. Consideraciones de Seguridad

- **Autenticación**: JWT con expiración corta (15 min) + refresh token rotativo
- **Contraseñas**: Hash con bcrypt (salt rounds ≥ 12)
- **Subida de archivos**: Validar MIME type y tamaño máximo (ej: 5 MB), almacenar fuera del servidor web
- **Rate limiting**: Aplicar en endpoints de subida de CV y de votación
- **CORS**: Configurar orígenes permitidos explícitamente
- **Variables sensibles**: Nunca exponer en frontend (API keys, DB URL, secretos JWT)
- **Stripe Webhooks**: Validar siempre con `stripe.webhooks.constructEvent()`
- **SQL Injection**: Prisma usa queries parametrizadas por defecto ✅

---

## 11. Métricas ATS

El análisis ATS debe considerar como mínimo:

| Criterio | Peso sugerido |
|---|---|
| Palabras clave del sector/rol | 30% |
| Secciones estándar presentes (Educación, Experiencia, Habilidades) | 20% |
| Formato compatible (sin tablas, sin imágenes, sin columnas complejas) | 15% |
| Verbos de acción en experiencia laboral | 10% |
| Datos de contacto completos | 10% |
| Longitud adecuada (1–2 páginas) | 10% |
| Ausencia de caracteres especiales problemáticos | 5% |

El score final será un porcentaje del 0 al 100. Los CVs con **≥ 70%** se consideran aptos para ser compartidos en la comunidad.

---

## 12. Roadmap Visual

```
Sem 1     Sem 2     Sem 3     Sem 4     Sem 5     Sem 6     Sem 7
  │         │         │         │         │         │         │
[Setup]─[Auth]────[CV Upload]──[CV AI]──[Community]─[Billing]─[Deploy]
  │         │         │         │         │         │         │
  └─DB/ORM  └─JWT     └─PDF     └─Score   └─Feed    └─Stripe  └─Prod
            └─Guards  └─Store   └─Optim   └─Votes   └─Plans   └─Tests
```

---

## 📝 Notas para el desarrollo con QwenCoder

- Usar **signals** de Angular 17+ para el estado reactivo en lugar de RxJS donde sea posible
- Aprovechar los **componentes standalone** de Angular
- En SpartanUI, usar los primitivos de `spartan/ui` respetando los tokens de diseño de Tailwind
- En Prisma, correr `prisma migrate dev` en cada cambio de schema durante desarrollo
- Documentar cada endpoint con JSDoc o Swagger (recomendado `@nestjs/swagger` si se usa NestJS)
- Separar la lógica de negocio ATS en un servicio dedicado para facilitar el reemplazo del modelo de IA en el futuro

---

*Planning generado para desarrollo personal. Stack: Angular + SpartanUI + Node.js + Prisma + PostgreSQL. Asistente: QwenCoder.*