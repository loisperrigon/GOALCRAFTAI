// Types for translation dictionaries

export interface AuthTranslations {
  title?: string
  description?: string
  tabs?: {
    login?: string
    signup?: string
  }
  fields?: {
    name?: {
      label?: string
      placeholder?: string
    }
    email?: {
      label?: string
      placeholder?: string
    }
    password?: {
      label?: string
      placeholder?: string
    }
  }
  social?: {
    google?: string
    github?: string
  }
  separator?: string
  remember?: string
  forgot?: string
  loading?: string
  submit?: {
    login?: string
    signup?: string
  }
  terms?: {
    prefix?: string
    conditions?: string
    and?: string
    privacy?: string
  }
  errors?: {
    invalidCredentials?: string
    signupError?: string
    general?: string
    unexpected?: string
    socialAuth?: string
  }
  benefits?: {
    title?: string
    item1?: string
    item2?: string
    item3?: string
  }
}

export interface PricingTranslations {
  title?: string
  subtitle?: string
  banner?: {
    offer?: string
    expiresIn?: string
  }
  socialProof?: string
  highlights?: {
    ai?: string
    coaching?: string
    objectives?: string
  }
  billing?: {
    monthly?: string
    yearly?: string
  }
  free?: {
    name?: string
    description?: string
    cta?: string
    includes?: string
    features?: string[]
    limitations?: string[]
  }
  pro?: {
    name?: string
    description?: string
    cta?: string
    includes?: string
    features?: string[]
    savings?: string
    perYear?: string
    secure?: string
    yearlyBonus?: string
  }
  comparison?: {
    title?: string
    coach?: string
    competitors?: string
    cheaper?: string
  }
  trust?: {
    secure?: string
    guarantee?: string
  }
  faq?: {
    title?: string
    items?: Array<{
      question: string
      answer: string
    }>
  }
}

export interface ObjectivesTranslations {
  title?: string
  description?: string
  chat?: {
    placeholder?: string
    send?: string
  }
  tree?: {
    title?: string
  }
}

export interface DashboardTranslations {
  title?: string
  subtitle?: string
  stats?: {
    totalXp?: string
    level?: string
    objectives?: string
    streak?: string
  }
}

export interface ProfileTranslations {
  title?: string
  tabs?: {
    account?: string
    preferences?: string
    security?: string
  }
}

export interface Dictionary {
  auth?: AuthTranslations
  pricing?: PricingTranslations
  objectives?: ObjectivesTranslations
  dashboard?: DashboardTranslations
  profile?: ProfileTranslations
  common?: {
    loading?: string
    error?: string
    success?: string
    cancel?: string
    save?: string
    delete?: string
  }
}