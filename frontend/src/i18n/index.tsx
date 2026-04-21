'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'es' | 'en';

interface TranslationContent {
  [key: string]: string | TranslationContent;
}

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Spanish translations
const es: TranslationContent = {
  common: {
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    back: "Volver",
    continue: "Continuar"
  },
  landing: {
    header: {
      login: "Iniciar sesión",
      register: "Crear cuenta",
      switch: "Cambiar idioma",
      community: "Comunidad",
      startFree: "Empezar gratis"
    },
    hero: {
      badge: "Optimizado con IA GPT-4",
      title1: "Tu,CV,listo,para,pasar",
      title2: "ATS,filtros",
      subtitle: "Sube tu CV, indicá el puesto y nuestra IA lo optimizará para superar los sistemas de seguimiento de candidatos que usan el 98% de las empresas.",
      ctaPrimary: "Crear cuenta gratis",
      ctaSecondary: "Cómo funciona",
      dashboard: "Ir al Dashboard"
    },
    stats: {
      title: "Números que говорят",
      cvs: "CVs analizados",
      ats: "Pass rate ATS",
      users: "Usuarios satisfechos"
    },
    howItWorks: {
      title: "Cómo funciona",
      steps: {
        upload: {
          title: "Subí tu CV",
          description: "Sube tu currículum en PDF y nuestra IA lo analizará en segundos"
        },
        target: {
          title: "Indicá el puesto",
          description: "Decinos qué puesto buscás y en qué industria"
        },
        optimize: {
          title: "La IA lo optimiza",
          description: "Tu CV será mejorado para pasar los filtros ATS y aumentar tus chances"
        }
      }
    },
    features: {
      title: "Por qué CVMaster",
      subtitle: {
        highlight: "destacar",
        desc: "Herramientas poderosas para optimizar tu CV y conseguir más entrevistas"
      },
      header: "Todo lo que necesitás para",
      items: {
        ats: {
          title: "Optimizado para ATS",
          description: "Nuestros algoritmos conocen los filtros de los principales sistemas ATS"
        },
        ai: {
          title: "Inteligencia Artificial",
          description: "GPT-4 analiza y mejora cada sección de tu currículum"
        },
        fast: {
          title: "Resultados rápidos",
          description: "En segundos tenés tu CV optimizado listo para enviar"
        },
        templates: {
          title: "Múltiples templates",
          description: "Elegí el diseño que mejor se adapte a tu industria"
        },
        community: {
          title: "Comunidad de CVs",
          description: "Explorá CVs exitosos de otros usuarios, votá los mejores y aprendé de lo que realmente funciona."
        },
        privacy: {
          title: "Privacidad Total",
          description: "Tus datos están seguros. Podés elegir si compartir tu CV con la comunidad o mantenerlo privado."
        }
      }
    },
    faq: {
      title: "Preguntas frecuentes",
      subtitle: "Todo lo que necesitás saber sobre CVMaster y los ATS",
      questions: {
        q1: "¿Qué es un ATS y por qué importa?",
        q1Desc: "Un ATS (Applicant Tracking System) es el software que usan las empresas para filtrar CVs automáticamente. Más del 75% de los CVs nunca son vistos por un humano porque el ATS los descarta. Optimizar tu CV para ATS es fundamental para llegar a una entrevista.",
        q2: "¿Cómo funciona la optimización con IA?",
        q2Desc: "Subís tu CV en PDF, indicás el puesto al que querés aplicar, y nuestra IA analiza el texto, identifica gaps de keywords, reestructura el contenido con verbos de acción, agrega métricas y optimiza el formato para que pase los filtros ATS.",
        q3: "¿Mis datos están seguros?",
        q3Desc: "Sí. Tu CV se procesa de forma segura y nunca compartimos tu información sin tu consentimiento. Podés elegir mantener tu CV privado o compartirlo anónimamente con la comunidad.",
        q4: "¿Es gratis?",
        q4Desc: "Sí, podés optimizar tu primer CV completamente gratis. No necesitas tarjeta de crédito ni compromiso."
      }
    },
    cta: {
      title: "Empezá hoy",
      subtitle: "Tu primer CV optimizado en minutos",
      subtitleAuth: "Gestioná y optimizá tus CVs desde el dashboard",
      button: "Subir mi CV gratis"
    },
    footer: {
      rights: "Todos los derechos reservados",
      tagline: "Optimizá tu CV, conseguí más entrevistas."
    }
  },
  dashboard: {
    title: "Mi Dashboard",
    myCvs: "Mis CVs",
    manageCvs: "Gestiona tus currículums",
    newCv: "Nuevo CV",
    cvList: {
      status: {
        processing: "Procesando",
        completed: "Listo",
        failed: "Fallido"
      },
      uploadDialog: {
        experienceLevels: {
          junior: "Junior / Trainee",
          mid: "Semi-Senior",
          senior: "Senior",
          lead: "Lead / Manager"
        },
        optimizationFocuses: {
          technical: "Experiencia técnica",
          soft: "Habilidades blandas",
          both: "Ambas",
          careerChange: "Cambio de carrera"
        },
        dialogTitle: {
          uploading: "Procesando tu CV...",
          step1: "Subí tu CV",
          step2: "Contexto para la IA"
        },
        description: {
          uploading: "La IA está analizando y optimizando tu CV",
          step1: "Arrastrá tu CV en PDF o seleccionalo",
          step2: "Respondé para que la IA optimice mejor"
        },
        dropzone: {
          clickToSelect: "Hacé click para",
          selectPdf: "seleccionar tu PDF",
          maxSize: "Máximo 10MB"
        },
        cvTitle: {
          label: "Título *",
          placeholder: "Ej: Mi CV — Desarrollador Full Stack"
        },
        next: "Siguiente",
        step2: {
          changeFile: "Cambiar",
          targetJob: {
            label: "¿A qué puesto querés aplicar? *",
            placeholder: "Ej: Desarrollador Full Stack"
          },
          targetCompany: {
            label: "¿A qué empresa?",
            optional: "(opcional)",
            placeholder: "Ej: Google, MercadoLibre"
          },
          industry: {
            label: "Industria",
            optional: "(opcional)",
            selectPlaceholder: "Seleccionar..."
          },
          experienceLevel: {
            label: "Nivel de experiencia *"
          },
          optimizationFocus: {
            label: "Enfoque de optimización"
          },
          additionalNotes: {
            label: "Notas adicionales",
            optional: "(opcional)",
            placeholder: "Ej: Destacar experiencia en React..."
          },
          shareCommunity: "Compartir en la comunidad"
        },
        back: "Volver",
        submit: "Analizar con IA",
        toasts: {
          invalidFile: "Solo se aceptaan archivos PDF",
          fileTooBig: "El archivo debe ser menor a 10MB",
          missingFields: "Subí un archivo PDF y poné un título",
          missingTargetJob: "Decí a qué puesto querés aplicar",
          uploadSuccess: "¡CV subido! La IA lo está analizando...",
          uploadError: "Error al subir el CV"
        },
        trigger: "Subir CV"
      },
      visibility: {
        public: "Público",
        private: "Privado"
      },
      votes: "votos",
      actions: {
        viewImproved: "Ver mejorado",
        viewDetail: "Ver detalle",
        originalPdf: "PDF original",
        improvedPdf: "PDF mejorado",
        makePrivate: "Volver privado",
        shareCommunity: "Compartir en la comunidad",
        delete: "Eliminar"
      },
      atsScore: "Score ATS",
      deleteDialog: {
        title: "Eliminar CV",
        message: "¿Estás seguro de que querés eliminar",
        messageEnd: "? Esta acción no se puede deshacer.",
        cancel: "Cancelar",
        deleting: "Eliminando...",
        confirm: "Eliminar"
      },
      empty: {
        title: "Sin CVs",
        description: "Subí tu primer CV para empezar",
        button: "Subir CV"
      },
      pagination: {
        showing: "Mostrando",
        of: "de",
        cvs: "CVs",
        page: "página",
        of2: "de",
        loading: "Cargando...",
        loadMore: "Cargar más"
      },
      error: "Error al cargar"
    },
    stats: {
      title: "Mis Estadísticas",
      subtitle: "Resumen de tu actividad en CVMaster",
      cards: {
        total: "Total CVs",
        completed: "Completados",
        processing: "En proceso",
        failed: "Fallidos",
        publicCount: "Públicos",
        privateCount: "Privados",
        avgScore: "Score promedio",
        totalVotes: "Votos recibidos",
        suffix: "pts"
      },
      latestCv: "último CV subido",
      total: "Total CVs",
      completed: "Completados",
      processing: "En proceso",
      failed: "Fallidos",
      public: "Públicos",
      private: "Privados",
      avgScore: "Score promedio",
      votes: "Votos recibidos"
    },
    notifications: {
      title: "Notificaciones",
      empty: "No tenés notificaciones"
    },
    settings: {
      title: "Configuración",
      subtitle: "Gestioná tu perfil y preferencias",
      tabs: {
        profile: "Perfil",
        workspace: "Área de trabajo",
        security: "Seguridad",
        deleted: "Eliminados"
      },
      profile: {
        personalInfo: "Información personal",
        personalInfoDesc: "Datos básicos de tu perfil público",
        fullName: "Nombre completo",
        email: "Email",
        emailChange: "No se puede cambiar",
        nationality: "Nacionalidad",
        optional: "(opcional)",
        selectPlaceholder: "Seleccionar...",
        saving: "Guardando...",
        saveChanges: "Guardar cambios",
        username: {
          title: "Username",
          titleDesc: "Tu nombre de usuario público",
          newUsername: "Nuevo username",
          shownPublic: "Se muestra en tu perfil público"
        },
        changeUsername: "Cambiar username"
      },
      workspace: {
        title: "Área de trabajo",
        titleDesc: "Tu información laboral por defecto",
        targetJob: "Puesto objetivo",
        industry: "Industria",
        optional: "(opcional)",
        placeholder: {
          targetJob: "Ej: Desarrollador Full Stack",
          industry: "Ej: Tecnología"
        },
        hintTargetJob: "Se usará como valor por defecto al subir un nuevo CV",
        saving: "Guardando...",
        saveWorkspace: "Guardar área de trabajo"
      },
      security: {
        title: "Cambiar contraseña",
        titleDesc: "Ingresá tu contraseña actual y la nueva contraseña",
        currentPassword: "Contraseña actual",
        newPassword: "Nueva contraseña",
        confirmPassword: "Confirmar contraseña",
        placeholder: {
          current: "••••••••",
          minLength: "Mínimo 8 caracteres",
          repeat: "Repetí la nueva contraseña"
        },
        changing: "Cambiando...",
        changePassword: "Cambiar contraseña",
        logout: {
          title: "Cerrar sesión",
          desc: "Salí de tu cuenta en este dispositivo",
          button: "Cerrar sesión"
        }
      },
      deleted: {
        title: "CVs eliminados",
        titleDesc: "Recuperá CVs que eliminaste recientemente",
        loading: "Cargando...",
        empty: "No tenés CVs eliminados",
        deletedOn: "Eliminado el",
        restore: "Restaurar",
        restoring: "Restaurando...",
        restoreConfirm: {
          title: "Restaurar CV",
          message: "¿Estás seguro de que querés restaurar",
          messageEnd: "? Volverá a aparecer en tu lista de CVs.",
          cancel: "Cancelar"
        }
      },
      toasts: {
        nameMinLength: "El nombre debe tener al menos 2 caracteres",
        profileUpdated: "Perfil actualizado",
        errorUpdating: "Error al actualizar",
        usernameMinLength: "El username debe tener al menos 3 caracteres",
        usernameUpdated: "Username actualizado",
        errorUpdatingUsername: "Error al actualizar username",
        workspaceUpdated: "Área de trabajo actualizada",
        enterCurrentPassword: "Ingresá tu contraseña actual",
        newPasswordMinLength: "La nueva contraseña debe tener al menos 8 caracteres",
        passwordsMismatch: "Las contraseñas no coinciden",
        passwordUpdated: "Contraseña actualizada correctamente",
        errorChangingPassword: "Error al cambiar la contraseña"
      }
    }
  },
  auth: {
    common: {
      back: "Volver",
      showPassword: "Mostrar contraseña",
      hidePassword: "Ocultar contraseña",
      emailPlaceholder: "tu@email.com",
      passwordPlaceholder: "••••••••",
      processing: "Procesando..."
    },
    login: {
      title: "Iniciar sesión",
      subtitle: "Ingresá tus credenciales",
      email: "Email",
      password: "Contraseña",
      submit: "Iniciar sesión",
      forgotPassword: "¿Olvidaste tu contraseña?",
      noAccount: "¿No tenés cuenta?",
      register: "Crear cuenta",
      loggingIn: "Ingresando...",
      welcome: "¡Bienvenido!"
    },
    register: {
      title: "Crear cuenta",
      subtitle: "Completá tus datos para empezar",
      name: "Nombre completo",
      namePlaceholder: "Juan Pérez",
      email: "Email",
      password: "Contraseña",
      confirmPassword: "Confirmar contraseña",
      submit: "Crear cuenta",
      hasAccount: "¿Ya tenés cuenta?",
      login: "Iniciar sesión",
      creating: "Creando...",
      username: "Username *",
      usernamePlaceholder: "tu_nombre",
      nationality: "Nacionalidad",
      nationalityPlaceholder: "Seleccionar...",
      optional: "(opcional)",
      targetJob: "Puesto objetivo",
      targetJobPlaceholder: "Ej: Desarrollador Full Stack",
      industry: "Industria",
      industryPlaceholder: "Ej: Tecnología",
      usernameAvailable: "Username disponible",
      usernameTaken: "El username no está disponible",
      usernameCheckError: "Error al verificar el username"
    },
    forgotPassword: {
      title: "¿Olvidaste tu contraseña?",
      subtitle: "Ingresá tu email y te enviaremos un link para resetearla",
      email: "Email",
      submit: "Enviar link de reset",
      sending: "Enviando...",
      submitted: {
        title: "Email enviado",
        message: "Si el email existe, recibirás un link para resetear tu contraseña.",
        note: "El enlace expira en 1 hora. Revisá tu bandeja de entrada y spam.",
        backToLogin: "Volver al login"
      },
      enterEmail: "Ingresá tu email",
      successMessage: "Si el email existe, recibirás un link para resetear tu contraseña"
    },
    resetPassword: {
      title: "Resetear contraseña",
      subtitle: "Ingresá tu nueva contraseña",
      newPassword: "Nueva contraseña",
      confirmPassword: "Confirmar contraseña",
      passwordMinLength: "Mínimo 8 caracteres",
      passwordPlaceholder: "Mínimo 8 caracteres",
      confirmPlaceholder: "Repetí tu nueva contraseña",
      submit: "Actualizar contraseña",
      updating: "Actualizando...",
      verifyingToken: "Verificando token...",
      success: "Contraseña actualizada exitosamente",
      mismatch: "Las contraseñas no coinciden",
      minLength: "La contraseña debe tener al menos 8 caracteres",
      invalidToken: "Token de reset inválido",
      errorReset: "Error al resetear contraseña"
    },
    verifyEmail: {
      verifying: {
        title: "Verificando tu email...",
        subtitle: "Esto tomará un momento"
      },
      success: {
        title: "¡Email verificado!",
        message: "Tu email fue verificado exitosamente. Ya podés iniciar sesión.",
        redirect: "Serás redirigido al login en unos segundos...",
        goToLogin: "Ir al login"
      },
      error: {
        title: "No se pudo verificar",
        resend: "Reenviar email de verificación",
        resending: "Reenviando...",
        backToLogin: "Volver al login"
      },
      sent: {
        title: "Revisá tu email",
        message: "Te enviamos un link de verificación. Hacé click en el link para activar tu cuenta.",
        hint: "El enlace expira en 24 horas. Revisá también tu carpeta de spam.",
        resend: "Reenviar email",
        resending: "Reenviando...",
        backToLogin: "Volver al login"
      },
      noToken: {
        message: "No se encontró un token de verificación",
        goToLogin: "Ir al login"
      },
      emailVerified: "Email verificado exitosamente!",
      verifyFailed: "No se pudo verificar el email",
      invalidToken: "Token inválido o expirado",
      resendSuccess: "Email de verificación reenviado. Revisá tu bandeja de entrada.",
      resendError: "Error al reenviar email"
    }
  },
cvDetail: {
    userProfile: {
      notFound: "Usuario no encontrado",
      notFoundDesc: "El usuario",
      notFoundDescEnd: "no existe",
      publicCvs: "CVs públicos",
      memberSince: "Desde",
      noPublicCvs: "Este usuario no tiene CVs públicos todavía."
    },
    cvActions: {
      voteRemoved: "Voto eliminado",
      votedSuccess: "¡Votado!",
      voteError: "Error al votar",
      mustLogin: "Debes iniciar sesión para votar",
      votedLabel: "Votado",
      vote: "Votar",
      viewCv: "Ver CV"
    },
    newCv: {
      step1: "Subí tu CV",
      step2: "Contexto para la IA",
      step3: "Elegí tu plantilla",
      uploadStep: "Paso 1 de 3",
      contextStep: "Paso 2 de 3",
      templateStep: "Paso 3 de 3",
      dragDrop: "Arrastrá tu CV acá o",
      browse: "buscá en tu computadora",
      maxSize: "Solo PDF — máximo 10MB",
      remove: "Quitar",
      titleLabel: "Título del CV *",
      titlePlaceholder: "Ej: Mi CV — Desarrollador Full Stack",
      continue: "Continuar",
      back: "Volver",
      contextDesc: "Respondé estas preguntas para que la IA optimice mejor tu CV",
      change: "Cambiar",
      targetJob: {
        label: "¿A qué puesto querés aplicar? *",
        placeholder: "Ej: Desarrollador Full Stack, Data Scientist, Product Manager"
      },
      targetCompany: {
        label: "¿A qué empresa va dirigido?",
        optional: "(opcional)",
        placeholder: "Ej: Google, MercadoLibre, Accenture"
      },
      targetIndustry: {
        label: "¿A qué industria/sector pertenece?",
        optional: "(opcional)",
        placeholder: "Seleccionar industria..."
      },
      experienceLevel: {
        label: "¿Cuál es tu nivel de experiencia? *"
      },
      optimizationFocus: {
        label: "¿Qué querés destacar en tu CV?"
      },
      additionalNotes: {
        label: "¿Hay algo específico que quieras mejorar?",
        optional: "(opcional)",
        placeholder: "Ej: Quiero que destaque más mi experiencia en liderazgo..."
      },
      templateStyle: "¿Qué estilo preferí?",
      analyzeWithAi: "Analizar y Mejorar con IA",
      uploading: "Subiendo tu CV...",
      uploaded: "¡CV subido!",
      uploadingDesc: "Esto puede tomar unos momentos",
      analyzingDesc: "La IA está analizando y optimizando tu CV",
      levels: {
        junior: "Junior / Trainee",
        juniorDesc: "0-2 años de experiencia",
        mid: "Semi-Senior",
        midDesc: "2-5 años de experiencia",
        senior: "Senior",
        seniorDesc: "5-10 años de experiencia",
        lead: "Lead / Manager",
        leadDesc: "10+ años o gestión de equipos"
      },
      focuses: {
        technical: "Experiencia técnica",
        technicalDesc: "Destacar habilidades técnicas y proyectos",
        soft: "Habilidades blandas",
        softDesc: "Liderazgo, comunicación, trabajo en equipo",
        both: "Ambas",
        bothDesc: "Balance entre técnica y habilidades blandas",
        careerChange: "Cambio de carrera",
        careerChangeDesc: "Transición a un nuevo rol o industria"
      },
      templates: {
        modern: "Moderno",
        modernDesc: "Diseño profesional de dos columnas",
        classic: "Clásico",
        classicDesc: "Estilo tradicional y elegante",
        minimal: "Minimalista",
        minimalDesc: "Limpio y moderno"
      },
      toasts: {
        invalidFile: "Solo se aceptan archivos PDF",
        fileTooBig: "El archivo debe ser menor a 10MB",
        uploadSuccess: "¡CV subido! La IA lo está analizando...",
        uploadError: "Error al subir el CV"
      }
    },
    notFound: "CV no encontrado",
    processing: "Procesando...",
    completed: "Completado",
    failed: "Fallido",
    analyzing: "Analizando...",
    errorProcessing: "Error al procesar",
    errorMessage: "Ocurrió un error al procesar tu CV",
    retry: "Reintentar",
    reanalizing: "Reanalizando...",
    reanalyze: "Re-analizar con IA",
    retrying: "Reintentando...",
    deleteCv: "Eliminar CV",
    deleteConfirm: "¿Estás seguro de que querés eliminar",
    deleteConfirmEnd: "? Esta acción no se puede deshacer.",
    cancel: "Cancelar",
    deleting: "Eliminando...",
    delete: "Eliminar",
    back: "Volver",
    makePrivate: "Volver privado",
    share: "Compartir",
    original: "Original",
    downloadPdf: "Descargar PDF",
    processingCv: "La IA está analizando y optimizando tu CV...",
    tabs: {
      context: "Contexto",
      analysis: "Análisis ATS",
      suggestions: "Sugerencias"
    },
    atsScore: "Puntuación ATS",
    atsScoreDesc: "Qué tan bien está optimizado tu CV para sistemas ATS",
    missingKeywords: "Keywords faltantes",
    suggestionsTitle: "Sugerencias de mejora",
    contextTitle: "Contexto de la IA",
    contextDesc: "Respuestas que usó la IA para optimizar tu CV",
    noContext: "No se proporcionó contexto adicional para este CV.",
    toasts: {
      madePrivate: "CV vuelto privado",
      shared: "CV compartido con la comunidad",
      updateError: "Error al actualizar",
      deleted: "CV eliminado",
      deleteError: "Error al eliminar el CV",
      reanalyzeStarted: "Re-análisis iniciado. La IA está trabajando en tu CV...",
      reanalyzeError: "Error al iniciar re-análisis",
      cvReady: "¡Tu CV está listo!",
      processingError: "Error al procesar el CV"
    },
    labels: {
      targetCompany: "Empresa objetivo",
      experienceLevel: "Nivel de experiencia",
      optimizationFocus: "Enfoque de optimización",
      additionalNotes: "Notas adicionales"
    },
    levels: {
      junior: "Junior / Trainee",
      mid: "Semi-Senior",
      senior: "Senior",
      lead: "Lead / Manager"
    },
    focuses: {
      technical: "Experiencia técnica",
      soft: "Habilidades blandas",
      both: "Ambas",
      careerChange: "Cambio de carrera"
    }
  },
  community: {
    title: "Comunidad",
    subtitle: "Descubre los mejores CVs",
    tabs: {
      explore: "Explorar",
      top: "Top CVs"
    },
    search: {
      placeholder: "Buscar por puesto, título o nombre..."
    },
    filters: {
      sortBy: "Ordenar por:",
      options: {
        votes: "Más votados",
        recent: "Más recientes",
        score: "Mejor score"
      },
      clearFilters: "Limpiar filtros",
      activeFilters: "Filtros activos:",
      clearAll: "Limpiar todo",
      industry: "Industria",
      scoreAts: "Score ATS",
      job: "Puesto",
      noResults: "No hay CVs que coincidan con los filtros",
      noVoted: "No hay CVs votados"
    },
    card: {
      votes: "votos",
      voted: "Votado",
      vote: "Votar",
      viewCv: "Ver CV",
      toast: {
        voteRemoved: "Voto eliminado",
        voted: "¡Votado!",
        error: "Error al votar"
      }
    },
    notAuthenticated: {
      title: "Iniciá sesión para ver la comunidad",
      description: "Descubrí los mejores CVs de otros usuarios, votá los que más te gusten y aprendé de lo que funciona.",
      login: "Iniciar sesión",
      register: "Crear cuenta"
    },
    dashboard: "Mi Dashboard"
  },
  cvUpload: {
    step1: {
      title: "Subí tu CV",
      description: "Arrastrá tu CV en PDF o seleccionálo",
      remove: "Quitar",
      dropzone: {
        dragText: "Arrastrá tu CV acá o",
        browseText: "buscá en tu computadora",
        maxSize: "Máximo 10MB"
      },
      titleLabel: "Título del CV *",
      titlePlaceholder: "Ej: Mi CV — Desarrollador Full Stack",
      continue: "Continuar"
    },
    step2: {
      title: "Contexto para la IA",
      description: "Respondé estas preguntas para que la IA optimice mejor tu CV",
      stepIndicator: "Paso 2 de 3",
      change: "Cambiar",
      targetJob: "¿A qué puesto querés aplicar?",
      targetJobPlaceholder: "Ej: Desarrollador Full Stack",
      targetCompany: "¿A qué empresa?",
      targetCompanyPlaceholder: "Ej: Google, MercadoLibre",
      industry: "Industria",
      industrySelect: "Seleccionar industria...",
      experienceLevelLabel: "¿Cuál es tu nivel de experiencia?",
      experienceLevelDesc: "Nivel de experiencia",
      experienceLevel: {
        junior: "Junior / Trainee",
        juniorDesc: "0-2 años de experiencia",
        mid: "Semi-Senior",
        midDesc: "2-5 años de experiencia",
        senior: "Senior",
        seniorDesc: "5-10 años de experiencia",
        lead: "Lead / Manager",
        leadDesc: "10+ años o gestión de equipos"
      },
      optimizationFocusLabel: "¿Qué querés destacar en tu CV?",
      optimizationFocus: {
        technical: "Experiencia técnica",
        technicalDesc: "Destacar habilidades técnicas y proyectos",
        soft: "Habilidades blandas",
        softDesc: "Liderazgo, comunicación, trabajo en equipo",
        both: "Ambas",
        bothDesc: "Balance entre técnica y habilidades blandas",
        careerChange: "Cambio de carrera",
        careerChangeDesc: "Transición a un nuevo rol o industria"
      },
      additionalNotes: "Notas adicionales",
      additionalNotesPlaceholder: "Ej: Quiero que destaque más mi experiencia en liderazgo...",
      optional: "(opcional)",
      back: "Volver",
      continue: "Continuar"
    },
    step3: {
      title: "Elegí tu plantilla",
      description: "Elegí el estilo que más te guste",
      stepIndicator: "Paso 3 de 3",
      change: "Cambiar",
      templateStyle: "¿Qué estilo preferís?",
      template: {
        modern: "Moderno",
        modernIcon: "💎",
        modernDesc: "Diseño profesional",
        classic: "Clásico",
        classicIcon: "📋",
        classicDesc: "Estilo tradicional",
        minimal: "Minimalista",
        minimalIcon: "⚪",
        minimalDesc: "Limpio y moderno"
      },
      back: "Volver",
      submit: "Analizar con IA"
    },
    uploading: {
      titleUploading: "Subiendo tu CV...",
      titleComplete: "¡CV subido!",
      subtitleUploading: "Esto puede tomar unos momentos",
      subtitleProcessing: "La IA está analizando y optimizando tu CV"
    },
    toasts: {
      invalidFile: "Solo se aceptan archivos PDF",
      fileTooBig: "El archivo debe ser menor a 10MB",
      uploadSuccess: "¡CV subido! La IA lo está analizando...",
      uploadError: "Error al subir el CV"
    }
  }
};

// English translations
const en: TranslationContent = {
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    continue: "Continue"
  },
  landing: {
    header: {
      login: "Log in",
      register: "Sign up",
      switch: "Switch language",
      community: "Community",
      startFree: "Get started free"
    },
    hero: {
      badge: "AI-optimized with GPT-4",
      title1: "Your,CV,ready,to,pass",
      title2: "ATS,filters",
      subtitle: "Upload your CV, specify the job, and our AI will optimize it to pass the candidate tracking systems used by 98% of companies.",
      ctaPrimary: "Create free account",
      ctaSecondary: "How it works",
      dashboard: "Go to Dashboard"
    },
    stats: {
      title: "Numbers that speak",
      cvs: "CVs analyzed",
      ats: "ATS pass rate",
      users: "Happy users"
    },
    howItWorks: {
      title: "How it works",
      steps: {
        upload: {
          title: "Upload your CV",
          description: "Upload your resume in PDF and our AI will analyze it in seconds"
        },
        target: {
          title: "Choose target job",
          description: "Tell us what position you're looking for and in which industry"
        },
        optimize: {
          title: "AI optimizes",
          description: "Your CV will be improved to pass ATS filters and increase your chances"
        }
      }
    },
    features: {
      title: "Why CVMaster",
      subtitle: {
        highlight: "stand out",
        desc: "Powerful tools to optimize your CV and get more interviews"
      },
      header: "Everything you need to",
      items: {
        ats: {
          title: "ATS Optimized",
          description: "Our algorithms know the filters of major ATS systems"
        },
        ai: {
          title: "Artificial Intelligence",
          description: "GPT-4 analyzes and improves every section of your resume"
        },
        fast: {
          title: "Fast Results",
          description: "In seconds you have your optimized CV ready to send"
        },
        templates: {
          title: "Multiple Templates",
          description: "Choose the design that best fits your industry"
        },
        community: {
          title: "CV Community",
          description: "Explore successful CVs from other users, vote for the best, and learn from what really works."
        },
        privacy: {
          title: "Total Privacy",
          description: "Your data is safe. You can choose to share your CV with the community or keep it private."
        }
      }
    },
    faq: {
      title: "Frequently asked questions",
      subtitle: "Everything you need to know about CVMaster and ATS",
      questions: {
        q1: "What is an ATS and why does it matter?",
        q1Desc: "An ATS (Applicant Tracking System) is the software companies use to filter CVs automatically. More than 75% of CVs are never seen by a human because the ATS discards them. Optimizing your CV for ATS is essential to get an interview.",
        q2: "How does AI optimization work?",
        q2Desc: "You upload your CV in PDF, specify the position you're applying for, and our AI analyzes the text, identifies keyword gaps, restructures the content with action verbs, adds metrics, and optimizes the format to pass ATS filters.",
        q3: "Is my data safe?",
        q3Desc: "Yes. Your CV is processed securely and we never share your information without consent. You can choose to keep your CV private or share it anonymously with the community.",
        q4: "Is it free?",
        q4Desc: "Yes, you can optimize your first CV completely free. No credit card or commitment required."
      }
    },
    cta: {
      title: "Start today",
      subtitle: "Your first optimized CV in minutes",
      subtitleAuth: "Manage and optimize your CVs from the dashboard",
      button: "Upload my CV for free"
    },
    footer: {
      rights: "All rights reserved",
      tagline: "Optimize your CV, get more interviews."
    }
  },
  dashboard: {
    title: "My Dashboard",
    myCvs: "My CVs",
    manageCvs: "Manage your resumes",
    newCv: "New CV",
    cvList: {
      status: {
        processing: "Processing",
        completed: "Done",
        failed: "Failed"
      },
      uploadDialog: {
        experienceLevels: {
          junior: "Junior / Trainee",
          mid: "Mid-Level",
          senior: "Senior",
          lead: "Lead / Manager"
        },
        optimizationFocuses: {
          technical: "Technical experience",
          soft: "Soft skills",
          both: "Both",
          careerChange: "Career change"
        },
        dialogTitle: {
          uploading: "Processing your CV...",
          step1: "Upload your CV",
          step2: "AI Context"
        },
        description: {
          uploading: "The AI is analyzing and optimizing your CV",
          step1: "Drag and drop your PDF or select it",
          step2: "Answer so the AI can optimize better"
        },
        dropzone: {
          clickToSelect: "Click to",
          selectPdf: "select your PDF",
          maxSize: "Max 10MB"
        },
        cvTitle: {
          label: "Title *",
          placeholder: "Ex: My CV — Full Stack Developer"
        },
        next: "Next",
        step2: {
          changeFile: "Change",
          targetJob: {
            label: "What position are you applying for? *",
            placeholder: "Ex: Full Stack Developer"
          },
          targetCompany: {
            label: "What company?",
            optional: "(optional)",
            placeholder: "Ex: Google, MercadoLibre"
          },
          industry: {
            label: "Industry",
            optional: "(optional)",
            selectPlaceholder: "Select..."
          },
          experienceLevel: {
            label: "Experience level *"
          },
          optimizationFocus: {
            label: "Optimization focus"
          },
          additionalNotes: {
            label: "Additional notes",
            optional: "(optional)",
            placeholder: "Ex: Highlight React experience..."
          },
          shareCommunity: "Share with community"
        },
        back: "Back",
        submit: "Analyze with AI",
        toasts: {
          invalidFile: "Only PDF files are accepted",
          fileTooBig: "File must be less than 10MB",
          missingFields: "Upload a PDF file and add a title",
          missingTargetJob: "Tell us what position you're applying for",
          uploadSuccess: "CV uploaded! AI is analyzing it...",
          uploadError: "Error uploading CV"
        },
        trigger: "Upload CV"
      },
      visibility: {
        public: "Public",
        private: "Private"
      },
      votes: "votes",
      actions: {
        viewImproved: "View improved",
        viewDetail: "View details",
        originalPdf: "Original PDF",
        improvedPdf: "Improved PDF",
        makePrivate: "Make private",
        shareCommunity: "Share to community",
        delete: "Delete"
      },
      atsScore: "ATS Score",
      deleteDialog: {
        title: "Delete CV",
        message: "Are you sure you want to delete",
        messageEnd: "? This action cannot be undone.",
        cancel: "Cancel",
        deleting: "Deleting...",
        confirm: "Delete"
      },
      empty: {
        title: "No CVs",
        description: "Upload your first CV to get started",
        button: "Upload CV"
      },
      pagination: {
        showing: "Showing",
        of: "of",
        cvs: "CVs",
        page: "page",
        of2: "of",
        loading: "Loading...",
        loadMore: "Load more"
      },
      error: "Error loading"
    },
    stats: {
      title: "My Statistics",
      subtitle: "Summary of your activity on CVMaster",
      cards: {
        total: "Total CVs",
        completed: "Completed",
        processing: "Processing",
        failed: "Failed",
        publicCount: "Public",
        privateCount: "Private",
        avgScore: "Avg score",
        totalVotes: "Votes received",
        suffix: "pts"
      },
      latestCv: "latest CV uploaded",
      total: "Total CVs",
      completed: "Completed",
      processing: "Processing",
      failed: "Failed",
      public: "Public",
      private: "Private",
      avgScore: "Avg score",
      votes: "Votes received"
    },
    notifications: {
      title: "Notifications",
      empty: "You have no notifications"
    },
    settings: {
      title: "Settings",
      subtitle: "Manage your profile and preferences",
      tabs: {
        profile: "Profile",
        workspace: "Workspace",
        security: "Security",
        deleted: "Deleted"
      },
      profile: {
        personalInfo: "Personal information",
        personalInfoDesc: "Basic data for your public profile",
        fullName: "Full name",
        email: "Email",
        emailChange: "Cannot be changed",
        nationality: "Nationality",
        optional: "(optional)",
        selectPlaceholder: "Select...",
        saving: "Saving...",
        saveChanges: "Save changes",
        username: {
          title: "Username",
          titleDesc: "Your public username",
          newUsername: "New username",
          shownPublic: "Shown on your public profile"
        },
        changeUsername: "Change username"
      },
      workspace: {
        title: "Workspace",
        titleDesc: "Your default work information",
        targetJob: "Target job",
        industry: "Industry",
        optional: "(optional)",
        placeholder: {
          targetJob: "Ex: Full Stack Developer",
          industry: "Ex: Technology"
        },
        hintTargetJob: "Will be used as default when uploading a new CV",
        saving: "Saving...",
        saveWorkspace: "Save workspace"
      },
      security: {
        title: "Change password",
        titleDesc: "Enter your current password and new password",
        currentPassword: "Current password",
        newPassword: "New password",
        confirmPassword: "Confirm password",
        placeholder: {
          current: "••••••••",
          minLength: "Minimum 8 characters",
          repeat: "Repeat new password"
        },
        changing: "Changing...",
        changePassword: "Change password",
        logout: {
          title: "Log out",
          desc: "Sign out of your account on this device",
          button: "Log out"
        }
      },
      deleted: {
        title: "Deleted CVs",
        titleDesc: "Recover CVs you deleted recently",
        loading: "Loading...",
        empty: "You have no deleted CVs",
        deletedOn: "Deleted on",
        restore: "Restore",
        restoring: "Restoring...",
        restoreConfirm: {
          title: "Restore CV",
          message: "Are you sure you want to restore",
          messageEnd: "? It will appear again in your CV list.",
          cancel: "Cancel"
        }
      },
      toasts: {
        nameMinLength: "Name must be at least 2 characters",
        profileUpdated: "Profile updated",
        errorUpdating: "Error updating",
        usernameMinLength: "Username must be at least 3 characters",
        usernameUpdated: "Username updated",
        errorUpdatingUsername: "Error updating username",
        workspaceUpdated: "Workspace updated",
        enterCurrentPassword: "Enter your current password",
        newPasswordMinLength: "New password must be at least 8 characters",
        passwordsMismatch: "Passwords don't match",
        passwordUpdated: "Password updated successfully",
        errorChangingPassword: "Error changing password"
      }
    }
  },
  auth: {
    common: {
      back: "Back",
      showPassword: "Show password",
      hidePassword: "Hide password",
      emailPlaceholder: "your@email.com",
      passwordPlaceholder: "••••••••",
      processing: "Processing..."
    },
    login: {
      title: "Log in",
      subtitle: "Enter your credentials",
      email: "Email",
      password: "Password",
      submit: "Log in",
      forgotPassword: "Forgot your password?",
      noAccount: "Don't have an account?",
      register: "Sign up",
      loggingIn: "Logging in...",
      welcome: "Welcome!"
    },
    register: {
      title: "Create account",
      subtitle: "Fill in your details to get started",
      name: "Full name",
      namePlaceholder: "John Smith",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm password",
      submit: "Create account",
      hasAccount: "Already have an account?",
      login: "Log in",
      creating: "Creating...",
      username: "Username *",
      usernamePlaceholder: "your_name",
      nationality: "Nationality",
      nationalityPlaceholder: "Select...",
      optional: "(optional)",
      targetJob: "Target job",
      targetJobPlaceholder: "Ex: Full Stack Developer",
      industry: "Industry",
      industryPlaceholder: "Ex: Technology",
      usernameAvailable: "Username available",
      usernameTaken: "Username not available",
      usernameCheckError: "Error checking username"
    },
    forgotPassword: {
      title: "Forgot your password?",
      subtitle: "Enter your email and we'll send you a link to reset it",
      email: "Email",
      submit: "Send reset link",
      sending: "Sending...",
      submitted: {
        title: "Email sent",
        message: "If the email exists, you'll receive a link to reset your password.",
        note: "The link expires in 1 hour. Check your inbox and spam folder.",
        backToLogin: "Back to login"
      },
      enterEmail: "Enter your email",
      successMessage: "If the email exists, you'll receive a link to reset your password"
    },
    resetPassword: {
      title: "Reset password",
      subtitle: "Enter your new password",
      newPassword: "New password",
      confirmPassword: "Confirm password",
      passwordMinLength: "Minimum 8 characters",
      passwordPlaceholder: "minimum 8 characters",
      confirmPlaceholder: "Repeat your new password",
      submit: "Update password",
      updating: "Updating...",
      verifyingToken: "Verifying token...",
      success: "Password updated successfully",
      mismatch: "Passwords don't match",
      minLength: "Password must be at least 8 characters",
      invalidToken: "Invalid reset token",
      errorReset: "Error resetting password"
    },
    verifyEmail: {
      verifying: {
        title: "Verifying your email...",
        subtitle: "This will take a moment"
      },
      success: {
        title: "Email verified!",
        message: "Your email was verified successfully. You can now log in.",
        redirect: "You'll be redirected to login in a few seconds...",
        goToLogin: "Go to login"
      },
      error: {
        title: "Could not verify",
        resend: "Resend verification email",
        resending: "Resending...",
        backToLogin: "Back to login"
      },
      sent: {
        title: "Check your email",
        message: "We sent you a verification link. Click the link to activate your account.",
        hint: "The link expires in 24 hours. Check your spam folder as well.",
        resend: "Resend email",
        resending: "Resending...",
        backToLogin: "Back to login"
      },
      noToken: {
        message: "No verification token found",
        goToLogin: "Go to login"
      },
      emailVerified: "Email verified successfully!",
      verifyFailed: "Could not verify email",
      invalidToken: "Invalid or expired token",
      resendSuccess: "Verification email resent. Check your inbox.",
      resendError: "Error resending email"
    }
  },
  cvDetail: {
    userProfile: {
      notFound: "User not found",
      notFoundDesc: "User",
      notFoundDescEnd: "does not exist",
      publicCvs: "Public CVs",
      memberSince: "Since",
      noPublicCvs: "This user doesn't have any public CVs yet."
    },
    cvActions: {
      voteRemoved: "Vote removed",
      votedSuccess: "Voted!",
      voteError: "Error voting",
      mustLogin: "You must log in to vote",
      votedLabel: "Voted",
      vote: "Vote",
      viewCv: "View CV"
    },
    newCv: {
      step1: "Upload your CV",
      step2: "AI Context",
      step3: "Choose your template",
      uploadStep: "Step 1 of 3",
      contextStep: "Step 2 of 3",
      templateStep: "Step 3 of 3",
      dragDrop: "Drag your CV here or",
      browse: "browse on your computer",
      maxSize: "PDF only — max 10MB",
      remove: "Remove",
      titleLabel: "CV Title *",
      titlePlaceholder: "Ex: My CV — Full Stack Developer",
      continue: "Continue",
      back: "Back",
      contextDesc: "Answer these questions so the AI can better optimize your CV",
      change: "Change",
      targetJob: {
        label: "What position are you applying for? *",
        placeholder: "Ex: Full Stack Developer, Data Scientist, Product Manager"
      },
      targetCompany: {
        label: "What company is it for?",
        optional: "(optional)",
        placeholder: "Ex: Google, MercadoLibre, Accenture"
      },
      targetIndustry: {
        label: "What industry/sector does it belong to?",
        optional: "(optional)",
        placeholder: "Select industry..."
      },
      experienceLevel: {
        label: "What is your experience level? *"
      },
      optimizationFocus: {
        label: "What do you want to highlight in your CV?"
      },
      additionalNotes: {
        label: "Is there anything specific you want to improve?",
        optional: "(optional)",
        placeholder: "Ex: I want you to highlight my leadership experience..."
      },
      templateStyle: "What style do you prefer?",
      analyzeWithAi: "Analyze and Improve with AI",
      uploading: "Uploading your CV...",
      uploaded: "CV uploaded!",
      uploadingDesc: "This may take a few moments",
      analyzingDesc: "The AI is analyzing and optimizing your CV",
      levels: {
        junior: "Junior / Trainee",
        juniorDesc: "0-2 years of experience",
        mid: "Mid-Level",
        midDesc: "2-5 years of experience",
        senior: "Senior",
        seniorDesc: "5-10 years of experience",
        lead: "Lead / Manager",
        leadDesc: "10+ years or team management"
      },
      focuses: {
        technical: "Technical experience",
        technicalDesc: "Highlight technical skills and projects",
        soft: "Soft skills",
        softDesc: "Leadership, communication, teamwork",
        both: "Both",
        bothDesc: "Balance between technical and soft skills",
        careerChange: "Career change",
        careerChangeDesc: "Transition to a new role or industry"
      },
      templates: {
        modern: "Modern",
        modernDesc: "Professional two-column design",
        classic: "Classic",
        classicDesc: "Traditional and elegant style",
        minimal: "Minimalist",
        minimalDesc: "Clean and modern"
      },
      toasts: {
        invalidFile: "Only PDF files are accepted",
        fileTooBig: "File must be less than 10MB",
        uploadSuccess: "CV uploaded! AI is analyzing it...",
        uploadError: "Error uploading CV"
      }
    },
    notFound: "CV not found",
    processing: "Processing...",
    completed: "Completed",
    failed: "Failed",
    analyzing: "Analyzing...",
    errorProcessing: "Processing error",
    errorMessage: "An error occurred while processing your CV",
    retry: "Retry",
    reanalizing: "Reanalyzing...",
    reanalyze: "Re-analyze with AI",
    retrying: "Retrying...",
    deleteCv: "Delete CV",
    deleteConfirm: "Are you sure you want to delete",
    deleteConfirmEnd: "? This action cannot be undone.",
    cancel: "Cancel",
    deleting: "Deleting...",
    delete: "Delete",
    back: "Back",
    makePrivate: "Make private",
    share: "Share",
    original: "Original",
    downloadPdf: "Download PDF",
    processingCv: "The AI is analyzing and optimizing your CV...",
    tabs: {
      context: "Context",
      analysis: "ATS Analysis",
      suggestions: "Suggestions"
    },
    atsScore: "ATS Score",
    atsScoreDesc: "How well your CV is optimized for ATS systems",
    missingKeywords: "Missing keywords",
    suggestionsTitle: "Improvement suggestions",
    contextTitle: "AI Context",
    contextDesc: "Answers the AI used to optimize your CV",
    noContext: "No additional context was provided for this CV.",
    toasts: {
      madePrivate: "CV made private",
      shared: "CV shared with the community",
      updateError: "Error updating",
      deleted: "CV deleted",
      deleteError: "Error deleting the CV",
      reanalyzeStarted: "Re-analysis started. AI is working on your CV...",
      reanalyzeError: "Error starting re-analysis",
      cvReady: "Your CV is ready!",
      processingError: "Error processing the CV"
    },
    labels: {
      targetCompany: "Target company",
      experienceLevel: "Experience level",
      optimizationFocus: "Optimization focus",
      additionalNotes: "Additional notes"
    },
    levels: {
      junior: "Junior / Trainee",
      mid: "Mid-Level",
      senior: "Senior",
      lead: "Lead / Manager"
    },
    focuses: {
      technical: "Technical experience",
      soft: "Soft skills",
      both: "Both",
      careerChange: "Career change"
    }
  },
  community: {
    title: "Community",
    subtitle: "Discover the best CVs",
    tabs: {
      explore: "Explore",
      top: "Top CVs"
    },
    search: {
      placeholder: "Search by job, title or name..."
    },
    filters: {
      sortBy: "Sort by:",
      options: {
        votes: "Most voted",
        recent: "Most recent",
        score: "Best score"
      },
      clearFilters: "Clear filters",
      activeFilters: "Active filters:",
      clearAll: "Clear all",
      industry: "Industry",
      scoreAts: "ATS Score",
      job: "Job",
      noResults: "No CVs match the filters",
      noVoted: "No voted CVs"
    },
    card: {
      votes: "votes",
      voted: "Voted",
      vote: "Vote",
      viewCv: "View CV",
      toast: {
        voteRemoved: "Vote removed",
        voted: "Voted!",
        error: "Error voting"
      }
    },
    notAuthenticated: {
      title: "Log in to see the community",
      description: "Discover the best CVs from other users, vote for the ones you like most, and learn from what works.",
      login: "Log in",
      register: "Sign up"
    },
    dashboard: "My Dashboard"
  },
  cvUpload: {
    step1: {
      title: "Upload your CV",
      description: "Drag and drop your PDF or select it",
      remove: "Remove",
      dropzone: {
        dragText: "Drag your CV here or",
        browseText: "browse on your computer",
        maxSize: "Max 10MB"
      },
      titleLabel: "CV Title *",
      titlePlaceholder: "Ex: My CV — Full Stack Developer",
      continue: "Continue"
    },
    step2: {
      title: "AI Context",
      description: "Answer these questions so the AI can better optimize your CV",
      stepIndicator: "Step 2 of 3",
      change: "Change",
      targetJob: "What position are you applying for?",
      targetJobPlaceholder: "Ex: Full Stack Developer",
      targetCompany: "What company?",
      targetCompanyPlaceholder: "Ex: Google, MercadoLibre",
      industry: "Industry",
      industrySelect: "Select industry...",
      experienceLevelLabel: "What is your experience level?",
      experienceLevelDesc: "Experience level",
      experienceLevel: {
        junior: "Junior / Trainee",
        juniorDesc: "0-2 years of experience",
        mid: "Mid-Level",
        midDesc: "2-5 years of experience",
        senior: "Senior",
        seniorDesc: "5-10 years of experience",
        lead: "Lead / Manager",
        leadDesc: "10+ years or team management"
      },
      optimizationFocusLabel: "What do you want to highlight?",
      optimizationFocus: {
        technical: "Technical experience",
        technicalDesc: "Highlight technical skills and projects",
        soft: "Soft skills",
        softDesc: "Leadership, communication, teamwork",
        both: "Both",
        bothDesc: "Balance between technical and soft skills",
        careerChange: "Career change",
        careerChangeDesc: "Transition to a new role or industry"
      },
      additionalNotes: "Additional notes",
      additionalNotesPlaceholder: "Ex: I want you to highlight my leadership experience...",
      optional: "(optional)",
      back: "Back",
      continue: "Continue"
    },
    step3: {
      title: "Choose your template",
      description: "Choose the style you prefer",
      stepIndicator: "Step 3 of 3",
      change: "Change",
      templateStyle: "What style do you prefer?",
      template: {
        modern: "Modern",
        modernIcon: "💎",
        modernDesc: "Professional design",
        classic: "Classic",
        classicIcon: "📋",
        classicDesc: "Traditional style",
        minimal: "Minimalist",
        minimalIcon: "⚪",
        minimalDesc: "Clean and modern"
      },
      back: "Back",
      submit: "Analyze with AI"
    },
    uploading: {
      titleUploading: "Uploading your CV...",
      titleComplete: "CV uploaded!",
      subtitleUploading: "This may take a few moments",
      subtitleProcessing: "The AI is analyzing and optimizing your CV"
    },
    toasts: {
      invalidFile: "Only PDF files are accepted",
      fileTooBig: "File must be less than 10MB",
      uploadSuccess: "CV uploaded! AI is analyzing it...",
      uploadError: "Error uploading CV"
    }
  }
};

const translations: Record<Locale, TranslationContent> = { es, en };

function getNestedValue(obj: TranslationContent, path: string): string {
  const keys = path.split('.');
  let value: any = obj;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return path;
    }
  }
  
  return typeof value === 'string' ? value : path;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const cookies = document.cookie.split('; ');
    const localeCookie = cookies.find(row => row.startsWith('locale='));
    const saved = localeCookie?.split('=')[1];
    
    if (saved === 'es' || saved === 'en') {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
  };

  const t = (key: string): string => {
    if (!mounted) return key;
    
    let result = getNestedValue(translations[locale], key);
    
    if (result === key) {
      result = getNestedValue(translations.es, key);
    }
    
    return result;
  };

  if (!mounted) {
    return (
      <I18nContext.Provider value={{ locale: 'es', setLocale: () => {}, t: (key) => key }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}