/**
 * Swedish Translations
 * Anna Legal AI - Svenska
 */

export default {
  // Common
  common: {
    hello: 'Hej',
    loading: 'Laddar...',
    error: 'Något gick fel',
    retry: 'Försök igen',
    cancel: 'Avbryt',
    confirm: 'Bekräfta',
    save: 'Spara',
    delete: 'Radera',
    edit: 'Redigera',
    close: 'Stäng',
    back: 'Tillbaka',
    next: 'Nästa',
    done: 'Klar',
    search: 'Sök',
    noResults: 'Inga resultat hittades',
    yes: 'Ja',
    no: 'Nej',
  },

  // Home
  home: {
    welcomeMessage: 'Hur kan jag hjälpa dig med juridiska frågor idag?',
    quickActions: 'Snabbåtgärder',
    startChat: 'Starta ny chatt',
    startChatDescription: 'Ställ juridiska frågor och få AI-drivna svar',
    uploadDocument: 'Ladda upp dokument',
    uploadDocumentDescription: 'Analysera juridiska dokument med AI',
    viewProfile: 'Visa profil',
    viewProfileDescription: 'Hantera ditt konto och prenumeration',
    features: 'Funktioner',
    legalAdvice: 'Juridisk rådgivning',
    legalAdviceDescription: 'Få omedelbar svar på juridiska frågor',
    documentAnalysis: 'Dokumentanalys',
    documentAnalysisDescription: 'Ladda upp och analysera juridiska dokument',
    multiLanguage: 'Flera språk',
    multiLanguageDescription: 'Stöd för engelska och svenska',
    secure: 'Säker & privat',
    secureDescription: 'Din data är krypterad och skyddad',
  },

  // Authentication
  auth: {
    welcome: 'Välkommen till Juridik AI',
    welcomeSubtitle: 'Din AI-drivna juridiska assistent',
    login: 'Logga in',
    signup: 'Registrera dig',
    logout: 'Logga ut',
    email: 'E-post',
    password: 'Lösenord',
    confirmPassword: 'Bekräfta lösenord',
    forgotPassword: 'Glömt lösenord?',
    resetPassword: 'Återställ lösenord',
    firstName: 'Förnamn',
    lastName: 'Efternamn',
    phone: 'Telefonnummer',
    alreadyHaveAccount: 'Har du redan ett konto?',
    dontHaveAccount: 'Har du inget konto?',
    termsAgree: 'Genom att registrera dig godkänner du våra',
    termsOfService: 'Användarvillkor',
    and: 'och',
    privacyPolicy: 'Integritetspolicy',
    loginSuccess: 'Välkommen tillbaka!',
    signupSuccess: 'Konto skapat!',
    logoutSuccess: 'Du har loggats ut',
    errors: {
      invalidEmail: 'Ange en giltig e-postadress',
      passwordMinLength: 'Lösenordet måste vara minst 8 tecken',
      passwordsDoNotMatch: 'Lösenorden matchar inte',
      invalidCredentials: 'Ogiltig e-post eller lösenord',
      emailAlreadyExists: 'Ett konto med denna e-post finns redan',
    },
  },

  // Chat
  chat: {
    title: 'Chatt',
    newChat: 'Ny chatt',
    placeholder: 'Ställ en juridisk fråga...',
    send: 'Skicka',
    thinking: 'Tänker...',
    uploadFile: 'Ladda upp dokument',
    uploadingFile: 'Laddar upp...',
    fileUploaded: 'Dokument uppladdat',
    noChats: 'Inga konversationer ännu',
    startChat: 'Starta en ny konversation',
    deleteChat: 'Radera konversation',
    deleteChatConfirm: 'Är du säker på att du vill radera denna konversation?',
    sources: 'Källor',
    viewSources: 'Visa källor',
    feedback: {
      helpful: 'Hjälpsam',
      notHelpful: 'Inte hjälpsam',
      thankYou: 'Tack för din feedback!',
    },
    errors: {
      messageFailed: 'Kunde inte skicka meddelande',
      uploadFailed: 'Kunde inte ladda upp dokument',
      fileTooLarge: 'Filen är för stor (max 10MB)',
      invalidFileType: 'Endast PDF och Word-dokument tillåtna',
    },
  },

  // Documents
  documents: {
    title: 'Mina dokument',
    upload: 'Ladda upp dokument',
    noDocuments: 'Inga dokument uppladdade',
    uploadFirst: 'Ladda upp ditt första dokument för att komma igång',
    processing: 'Bearbetar...',
    ready: 'Klar',
    failed: 'Bearbetning misslyckades',
    delete: 'Radera dokument',
    deleteConfirm: 'Är du säker på att du vill radera detta dokument?',
    supportedFormats: 'Format som stöds: PDF, Word (.docx)',
    maxSize: 'Max filstorlek: 10MB',
  },

  // Profile
  profile: {
    title: 'Profil',
    editProfile: 'Redigera profil',
    personalInfo: 'Personlig information',
    account: 'Konto',
    subscription: 'Prenumeration',
    settings: 'Inställningar',
    language: 'Språk',
    notifications: 'Notifikationer',
    darkMode: 'Mörkt läge',
    help: 'Hjälp & support',
    about: 'Om appen',
    version: 'Version',
    deleteAccount: 'Radera konto',
    deleteAccountConfirm: 'Är du säker? Denna åtgärd kan inte ångras.',
  },

  // Subscription
  subscription: {
    title: 'Prenumeration',
    currentPlan: 'Nuvarande plan',
    freeTrial: 'Gratis provperiod',
    monthly: 'Månadsvis',
    yearly: 'Årsvis',
    perMonth: '/månad',
    perYear: '/år',
    upgrade: 'Uppgradera',
    downgrade: 'Nedgradera',
    cancel: 'Avsluta prenumeration',
    renews: 'Förnyas den',
    expires: 'Upphör den',
    queriesUsed: 'Använda frågor',
    queriesRemaining: 'Återstående frågor',
    unlimited: 'Obegränsad',
    features: {
      basicQueries: 'Grundläggande juridiska frågor',
      documentUpload: 'Dokumentuppladdning & analys',
      prioritySupport: 'Prioriterad support',
      advancedAI: 'Avancerade AI-svar',
      unlimitedQueries: 'Obegränsade frågor',
    },
    upgradePrompt: 'Uppgradera för fler funktioner',
  },

  // Errors
  errors: {
    network: 'Nätverksfel. Kontrollera din anslutning.',
    server: 'Serverfel. Försök igen senare.',
    unauthorized: 'Logga in för att fortsätta.',
    forbidden: 'Du har inte behörighet att göra detta.',
    notFound: 'Den begärda resursen hittades inte.',
    rateLimit: 'För många förfrågningar. Vänta en stund.',
    subscription: 'Uppgradera din prenumeration för att fortsätta.',
  },

  // Legal Disclaimer
  legal: {
    disclaimer:
      'Juridik AI ger endast allmän juridisk information. Detta är inte juridisk rådgivning. För specifika juridiska frågor, kontakta en licensierad advokat.',
    disclaimerShort: 'Endast i informationssyfte. Inte juridisk rådgivning.',
  },

  // Onboarding
  onboarding: {
    skip: 'Hoppa över',
    getStarted: 'Kom igång',
    slide1: {
      title: 'Din AI juridiska assistent',
      description: 'Få omedelbara svar på dina juridiska frågor med vår avancerade AI',
    },
    slide2: {
      title: 'Ladda upp dokument',
      description: 'Ladda upp kontrakt och dokument för AI-driven analys',
    },
    slide3: {
      title: 'Svensk juridisk expertis',
      description: 'Tränad på svenska juridiska dokument och regelverk',
    },
  },

  // Web Pages
  web: {
    home: 'Hem',
    features: 'Funktioner',
    about: 'Om oss',
    contact: 'Kontakt',
    pricing: 'Priser',
    privacy: 'Integritet',
    terms: 'Villkor',
    allRightsReserved: 'Alla rättigheter förbehållna',
    
    // Landing
    heroTitle: 'Din AI-drivna juridiska assistent',
    heroSubtitle: 'Få omedelbara svar på juridiska frågor, analysera dokument och navigera svensk lag med förtroende.',
    getStarted: 'Kom igång gratis',
    learnMore: 'Läs mer',
    whyChoose: 'Varför välja Juridik AI?',
    
    // Features
    aiPowered: 'AI-driven',
    aiPoweredDesc: 'Avancerad AI tränad på svenska juridiska dokument och rättsfall.',
    instantAnswers: 'Omedelbara svar',
    instantAnswersDesc: 'Få snabba svar på dina juridiska frågor dygnet runt.',
    legalDocs: 'Dokumentanalys',
    legalDocsDesc: 'Ladda upp och analysera kontrakt, avtal och juridiska dokument.',
    secure: 'Säker & privat',
    secureDesc: 'Din data är krypterad och delas aldrig med tredje part.',
    
    // CTA
    readyToStart: 'Redo att komma igång?',
    joinThousands: 'Gå med tusentals användare som litar på Juridik AI för juridisk assistans.',
    createAccount: 'Skapa gratis konto',
    
    // About
    aboutTitle: 'Om Juridik AI',
    aboutSubtitle: 'Gör juridisk information tillgänglig för alla',
    ourMission: 'Vårt uppdrag',
    missionText: 'På Juridik AI tror vi att alla bör ha tillgång till pålitlig juridisk information. Vårt uppdrag är att demokratisera juridisk kunskap med hjälp av den senaste AI-teknologin, och göra den tillgänglig, begriplig och användbar för alla.',
    whatWeDo: 'Vad vi gör',
    whatWeDoText: 'Vi tillhandahåller en AI-driven juridisk assistent som hjälper privatpersoner och företag att förstå svensk lag, analysera juridiska dokument och fatta välgrundade beslut. Vår plattform kombinerar avancerad språkbehandling med omfattande juridiska databaser för att leverera korrekt och relevant information.',
    ourValues: 'Våra värderingar',
    accuracy: 'Noggrannhet',
    accuracyText: 'Vi upprätthåller de högsta standarderna för noggrannhet genom att kontinuerligt uppdatera vår AI med den senaste juridiska informationen.',
    accessibility: 'Tillgänglighet',
    accessibilityText: 'Juridisk kunskap ska vara tillgänglig för alla, oavsett bakgrund eller expertis.',
    privacyText: 'Din integritet och datasäkerhet är våra högsta prioriteringar. Vi delar aldrig din information.',
    ourTeam: 'Vårt team',
    teamText: 'Vårt team består av juridiska experter, AI-forskare och mjukvaruingenjörer som brinner för att göra juridiska tjänster mer tillgängliga och prisvärda.',
    
    // Contact
    contactTitle: 'Kontakta oss',
    contactSubtitle: 'Vi vill gärna höra från dig',
    getInTouch: 'Hör av dig',
    contactIntro: 'Har du frågor om Juridik AI? Vårt team finns här för att hjälpa dig. Kontakta oss via formuläret eller kontaktinformationen nedan.',
    email: 'E-post',
    phone: 'Telefon',
    address: 'Adress',
    hours: 'Öppettider',
    sendMessage: 'Skicka meddelande',
    name: 'Namn',
    namePlaceholder: 'Ditt namn',
    emailPlaceholder: 'din@epost.se',
    subject: 'Ämne',
    subjectPlaceholder: 'Vad gäller det?',
    message: 'Meddelande',
    messagePlaceholder: 'Berätta mer...',
    messageSent: 'Tack! Ditt meddelande har skickats.',
    
    // Features Page
    featuresTitle: 'Kraftfulla funktioner',
    featuresSubtitle: 'Allt du behöver för juridisk assistans',
    aiChat: 'AI-chattassistent',
    aiChatDesc: 'Naturlig konversation med vår AI tränad på svenska juridiska dokument och regelverk.',
    docAnalysis: 'Dokumentanalys',
    docAnalysisDesc: 'Ladda upp kontrakt och dokument för omedelbar AI-driven analys och insikter.',
    legalSearch: 'Juridisk databassökning',
    legalSearchDesc: 'Sök igenom omfattande svenska juridiska databaser och rättsfall.',
    chatHistory: 'Chatthistorik',
    chatHistoryDesc: 'Få tillgång till alla dina tidigare konversationer och insikter när som helst.',
    multilingual: 'Flerspråkigt stöd',
    multilingualDesc: 'Tillgänglig på svenska och engelska med fler språk på gång.',
    crossPlatform: 'Multiplattform',
    crossPlatformDesc: 'Åtkomst från webb, iOS eller Android - din data synkroniseras överallt.',
    
    howItWorks: 'Hur det fungerar',
    step1Title: 'Skapa konto',
    step1Desc: 'Registrera dig på några sekunder med din e-postadress.',
    step2Title: 'Ställ frågor',
    step2Desc: 'Chatta med vår AI om vilket juridiskt ämne eller bekymmer som helst.',
    step3Title: 'Få svar',
    step3Desc: 'Ta emot omedelbara, korrekta svar baserade på svensk lag.',
    step4Title: 'Ta åtgärder',
    step4Desc: 'Använd insikterna för att fatta välgrundade juridiska beslut.',
    
    // Pricing
    freePlan: 'Gratis',
    proPlan: 'Professionell',
    businessPlan: 'Företag',
    choosePlan: 'Välj plan',
    contactSales: 'Kontakta försäljning',
    tryFree: 'Prova gratis',
  },
};
