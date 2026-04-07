# CVMaster - Planning Técnico y Funcional

## 1. Visión del Producto

**CVMaster** es una plataforma SaaS que permite a profesionales optimizar sus CVs para superar sistemas ATS (Applicant Tracking Systems). Los usuarios suben su CV en PDF, la IA lo analiza considerando el puesto objetivo y regulaciones ATS específicas, y genera una versión mejorada. Adicionalmente, la comunidad puede compartir CVs exitosos y votar los mejores.

### Value Proposition
- Aterrizar en entrevistas (no en la papelera del ATS)
- Aprender de CVs que realmente funcionan
- Feedback objetivo e instantáneo de la IA

---

## 2. Stack Tecnológico

### Frontend
| Tecnología | Propósito |
|------------|-----------|
| **Next.js 14** (App Router) | Framework (SEO friendly, SSR) |
| **React 18** | UI library |
| **shadcn/ui** | Componentes accesibles y customizables |
| **Tailwind CSS** | Styling |
| **TanStack Query** | Server state management |
| **Zustand** | Client state (auth, UI) |
| **React Hook Form + Zod** | Formularios con validación |

### Backend
| Tecnología | Propósito |
|------------|-----------|
| **Node.js 20 LTS** | Runtime |
| **Express.js** | API framework |
| **Prisma ORM** | DB interaction |
| **PostgreSQL 16** | Base de datos |
| **Zod** | Validación runtime |
| **JWT (access + refresh)** | Autenticación |
| **bcrypt** | Hashing de passwords |

### AI & Document Processing
| Tecnología | Propósito |
|------------|-----------|
| **LangChain** | Orquestación de prompts |
| **OpenAI GPT-4** | Análisis y mejora de CVs |
| **pdf-parse** | Extracción de texto de PDFs |
| **pdf-lib** | Generación de PDFs |

### Infrastructure & Storage
| Tecnología | Propósito |
|------------|-----------|
| **Cloudinary** | Almacenamiento de PDFs e imágenes |
| **Redis** | Cache, rate limiting, queues |
| **BullMQ** | Cola de jobs (procesamiento async) |
| **Resend** | Envío de emails transaccionales |

### DevOps
| Tecnología | Propósito |
|------------|-----------|
| **Docker + Docker Compose** | Contenerización |
| **GitHub Actions** | CI/CD |
| **Vercel** | Deploy frontend |
| **Railway / Render** | Deploy backend |

---

## 3. Modelo de Datos (Prisma Schema)

```prisma
// User
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String
  avatarUrl     String?
  role          Role      @default(USER)
  isPremium     Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  cvs           CV[]
  votes         Vote[]
  sessions      Session[]
}

enum Role {
  USER
  ADMIN
}

// Session (for JWT refresh tokens)
model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  refreshToken String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())
}

// CV
model CV {
  id            String      @id @default(cuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  title         String
  originalPdfUrl String     // PDF original
  improvedPdfUrl String?    // PDF mejorado por IA
  improvedJson  Json?       // CV estructurado (JSON)
  targetJob     String?     // Puesto objetivo
  targetIndustry String?    // Industria
  analysisResult Json?      // Feedback de la IA
  isPublic      Boolean     @default(false)  // Compartido con comunidad
  upvotes       Int         @default(0)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  votes         Vote[]
}

// Vote
model Vote {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  cvId      String
  cv        CV       @relation(fields: [cvId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, cvId])  // Un usuario solo puede votar una vez por CV
}
```

---

## 4. Arquitectura de la Aplicación

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│   Landing → Auth → Dashboard → CV Upload → AI Analysis → Result │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND (Express)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │  Auth    │  │   CVs    │  │   AI     │  │  Community   │    │
│  │  Routes  │  │  Routes  │  │  Routes  │  │   Routes     │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘    │
│        │            │            │               │              │
│        └────────────┴────────────┴───────────────┘              │
│                              │                                   │
│                    ┌─────────┴─────────┐                        │
│                    │    Middlewares     │                        │
│                    │  (Auth, Zod, Rate) │                        │
│                    └───────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
          │              │              │              │
          ▼              ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐  ┌──────────┐   ┌──────────┐
    │  Postgres │   │  Redis   │  │Cloudinary│   │  BullMQ   │
    │  (Prisma) │   │  (Cache) │  │ (Files)  │   │  (Jobs)   │
    └──────────┘   └──────────┘  └──────────┘   └──────────┘
```

---

## 5. Flujos de Usuario

### 5.1 Registro y Login
```
[Register] → Email/Password → Hash → Create User → JWT (access + refresh)
[Login]   → Email/Password  → Compare Hash → JWT (access + refresh)
```

### 5.2 Análisis de CV (Flujo Principal)
```
1. Usuario sube PDF del CV
2. Frontend → POST /api/cvs/upload (multipart/form-data)
3. Backend:
   a. Valida archivo (tipo, tamaño < 10MB)
   b. Sube a Cloudinary → obtiene URL
   c. Crea registro CV en DB (status: "processing")
   d. Encola job en BullMQ → AI Worker
4. AI Worker (async):
   a. Descarga PDF de Cloudinary
   b. Extrae texto con pdf-parse
   c. Envia a OpenAI con prompt específico
   d. Genera CV mejorado + análisis
   e. Crea PDF mejorado con pdf-lib
   f. Sube PDF mejorado a Cloudinary
   g. Actualiza CV en DB (status: "completed")
5. Frontend polling/websocket → muestra resultado
```

### 5.3 Comunidad y Votación
```
1. Usuario marca CV como público
2. Otros usuarios ven CVs públicos en /community
3. Pueden filtrar por industria/puesto
4. Votan (upvote) si les gusta
5. Top CVs aparecen en ranking
```

---

## 6. API Endpoints

### Authentication
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Login, retorna tokens |
| POST | `/api/auth/refresh` | Refrescar access token |
| POST | `/api/auth/logout` | Invalidar sesión |
| GET | `/api/auth/me` | Perfil del usuario actual |

### CVs
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/cvs/upload` | Subir PDF y crear CV |
| GET | `/api/cvs` | Listar CVs del usuario |
| GET | `/api/cvs/:id` | Detalle de un CV |
| PATCH | `/api/cvs/:id` | Actualizar (título, target job, público) |
| DELETE | `/api/cvs/:id` | Eliminar CV |

### AI Analysis
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/ai/analyze` | Análisis rápido (sin mejorar) |
| POST | `/api/ai/improve` | Mejorar CV con IA |
| GET | `/api/ai/jobs/:id` | Estado del job de mejora |

### Community
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/community/cvs` | Listar CVs públicos (paginados, filtrables) |
| GET | `/api/community/top` | Top CVs más votados |
| POST | `/api/community/cvs/:id/vote` | Votar un CV |
| DELETE | `/api/community/cvs/:id/vote` | Quitar voto |

---

## 7. Frontend - Estructura de Páginas

```
/                           → Landing page (marketing)
/auth/login                 → Login
/auth/register               → Registro
/auth/forgot-password        → Recuperar contraseña

/dashboard                   → Panel principal
/dashboard/cvs               → Lista de CVs del usuario
/dashboard/cvs/new           → Subir nuevo CV
/dashboard/cvs/[id]          → Ver detalle y resultado de IA
/dashboard/settings          → Configuración de cuenta

/community                   → Galería de CVs públicos
/community/[id]              → Ver CV público en detalle
```

### Componentes Clave (shadcn)
- `Button`, `Input`, `Label`, `Card`
- `Dialog` (modals)
- `Tabs` (secciones en dashboard)
- `Progress` (upload progress, job status)
- `Avatar` (perfiles)
- `Badge` (estado del CV, roles)
- `DropdownMenu` (acciones)
- `Toast` (notificaciones)
- `Skeleton` (loading states)
- `Alert` (errores)

---

## 8. Prompts de IA (Ejemplos)

### Análisis de ATS
```
Analiza el siguiente CV considerando:
1. Keywords relevantes para {targetJob} en {targetIndustry}
2. Formato ATS-friendly (sin tablas complejas, headers claros)
3. Longitud óptima (1-2 páginas)
4. Skills cuantificables vs genéricos
5. Impacto medible en achievements

CV INPUT:
{extractedText}

OUTPUT (JSON):
{
  "score": 0-100,
  "issues": ["..."],
  "missingKeywords": ["..."],
  "suggestions": ["..."]
}
```

### Mejora de CV
```
Mejora el siguiente CV para {targetJob} en {targetIndustry}.
Mantén toda la información real, solo optimiza:
1. Lenguaje más impactante
2. Keywords ATS optimizados
3. Formato limpio
4. Mejor estructura

CV INPUT:
{extractedText}

OUTPUT: Texto mejorado + JSON con CV estructurado
```

---

## 9. Rate Limits y Security

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| Auth (login/register) | 10 req | 15 min |
| CV Upload | 5 req | 1 hora |
| AI Analysis | 3 req | 1 hora |
| Community votes | 50 req | 1 día |

**Middleware de seguridad:**
- Helmet.js (headers HTTP)
- CORS configurado
- Input sanitization con Zod
- SQL injection prevention (Prisma)
- XSS prevention

---

## 10. Fases de Desarrollo

### Fase 1: MVP (4-6 semanas)
- [ ] Auth (register, login, JWT)
- [ ] Upload de PDF a Cloudinary
- [ ] Extracción de texto del PDF
- [ ] Análisis básico con OpenAI
- [ ] Dashboard con lista de CVs
- [ ] Landing page básica

### Fase 2: Comunidad (2-3 semanas)
- [ ] Marcar CVs como públicos
- [ ] Galería /explore de CVs públicos
- [ ] Sistema de votos
- [ ] Rankings/top CVs

### Fase 3: Premium Features (Futuro)
- [ ] Planes de suscripción (Stripe)
- [ ] Análisis ilimitados
- [ ] Plantillas de CV premium
- [ ] Exportar en múltiples formatos
- [ ] Integración con LinkedIn

### Fase 4: Experiencia (1-2 semanas)
- [ ] Onboarding con tutorial
- [ ] Notificaciones por email
- [ ] Estadísticas personales
- [ ] Dark mode

---

## 11. Estructura de Carpetas

```
/CVMaster
├── /frontend                 # Next.js app
│   ├── /app
│   │   ├── /(auth)          # Grupo de rutas auth
│   │   ├── /(dashboard)     # Grupo de rutas privadas
│   │   ├── /community
│   │   └── /api              # API routes (opcional, o proxy)
│   ├── /components
│   │   ├── /ui              # Componentes shadcn
│   │   └── /features        # Componentes de dominio
│   ├── /hooks
│   ├── /lib
│   │   ├── api.ts          # Cliente API
│   │   ├── auth.ts         # Utils auth
│   │   └── utils.ts
│   ├── /stores              # Zustand stores
│   └── /types               # Types compartidos
│
├── /backend                  # Express API
│   ├── /src
│   │   ├── /config          # Configuración env
│   │   ├── /controllers     # Controladores
│   │   ├── /middleware      # Auth, validation, error handling
│   │   ├── /routes          # Rutas API
│   │   ├── /services        # Lógica de negocio
│   │   ├── /workers         # BullMQ workers (AI)
│   │   ├── /utils           # Helpers
│   │   └── index.ts         # Entry point
│   ├── /prisma
│   │   └── schema.prisma
│   └── package.json
│
├── /shared                  # Types compartidos frontend/backend
│   └── /types
│
├── docker-compose.yml
├── README.md
└── .env.example
```

---

## 12. Comandos de Desarrollo

```bash
# Frontend
cd frontend
npm run dev          # Desarrollo
npm run build        # Producción
npm run lint         # ESLint
npm run typecheck    # TypeScript

# Backend
cd backend
npm run dev          # Desarrollo (tsx watch)
npm run build        # Compilar TypeScript
npm run db:push      # Push Prisma schema
npm run db:studio    # Prisma Studio (GUI DB)
npm run db:seed      # Seed data

# Docker
docker-compose up -d # Levantar todo
docker-compose logs  # Ver logs
```

---

## 13. Variables de Entorno

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cvmaster"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# OpenAI
OPENAI_API_KEY="sk-..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Frontend URL
FRONTEND_URL="http://localhost:3000"
```

---

## 14. MVP Checklist Técnico

```markdown
### Backend
- [ ] Setup Express + TypeScript
- [ ] Config Prisma + PostgreSQL
- [ ] Auth con JWT (register, login, refresh, logout)
- [ ] CRUD de CVs
- [ ] Upload a Cloudinary (multer)
- [ ] Extracción de texto (pdf-parse)
- [ ] Integración OpenAI (análisis + mejora)
- [ ] BullMQ worker para jobs async
- [ ] Rate limiting con Redis
- [ ] Validación con Zod
- [ ] Manejo de errores centralizado
- [ ] Tests unitarios básicos

### Frontend
- [ ] Setup Next.js 14
- [ ] Instalar y configurar shadcn/ui
- [ ] Auth pages (login, register)
- [ ] Dashboard layout
- [ ] Upload CV (drag & drop, progress)
- [ ] Mostrar resultados de IA
- [ ] Community gallery
- [ ] Sistema de votos
- [ ] Estados de carga y errores
- [ ] Responsive design
```

---

## 15. Recursos Recomendados para Aprender

### Documentación Clave
- [Next.js 14 App Router](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma Docs](https://prisma.io/docs)
- [LangChain.js](https://js.langchain.com/)
- [BullMQ](https://docs.bullmq.io/)

### Cursos
- Next.js Full Course (Build an App)
- Prisma + PostgreSQL Ultimate Course
- LangChain & OpenAI Bootcamp

---

*Última actualización: Planning v1.0*
