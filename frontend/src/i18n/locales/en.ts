/**
 * English Translations
 * Default language for Anna Legal AI
 */

export default {
  // Common
  common: {
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Try Again',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    search: 'Search',
    noResults: 'No results found',
    yes: 'Yes',
    no: 'No',
  },

  // Authentication
  auth: {
    welcome: 'Welcome to Juridik AI',
    welcomeSubtitle: 'Your AI-powered legal assistant',
    login: 'Log In',
    signup: 'Sign Up',
    logout: 'Log Out',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone Number',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    termsAgree: 'By signing up, you agree to our',
    termsOfService: 'Terms of Service',
    and: 'and',
    privacyPolicy: 'Privacy Policy',
    loginSuccess: 'Welcome back!',
    signupSuccess: 'Account created successfully!',
    logoutSuccess: 'You have been logged out',
    errors: {
      invalidEmail: 'Please enter a valid email',
      passwordMinLength: 'Password must be at least 8 characters',
      passwordsDoNotMatch: 'Passwords do not match',
      invalidCredentials: 'Invalid email or password',
      emailAlreadyExists: 'An account with this email already exists',
    },
  },

  // Chat
  chat: {
    title: 'Chat',
    newChat: 'New Chat',
    placeholder: 'Ask a legal question...',
    send: 'Send',
    thinking: 'Thinking...',
    uploadFile: 'Upload Document',
    uploadingFile: 'Uploading...',
    fileUploaded: 'Document uploaded successfully',
    noChats: 'No conversations yet',
    startChat: 'Start a new conversation',
    deleteChat: 'Delete Conversation',
    deleteChatConfirm: 'Are you sure you want to delete this conversation?',
    sources: 'Sources',
    viewSources: 'View Sources',
    feedback: {
      helpful: 'Helpful',
      notHelpful: 'Not Helpful',
      thankYou: 'Thanks for your feedback!',
    },
    errors: {
      messageFailed: 'Failed to send message',
      uploadFailed: 'Failed to upload document',
      fileTooLarge: 'File is too large (max 10MB)',
      invalidFileType: 'Only PDF and Word documents are allowed',
    },
  },

  // Documents
  documents: {
    title: 'My Documents',
    upload: 'Upload Document',
    noDocuments: 'No documents uploaded',
    uploadFirst: 'Upload your first document to get started',
    processing: 'Processing...',
    ready: 'Ready',
    failed: 'Processing failed',
    delete: 'Delete Document',
    deleteConfirm: 'Are you sure you want to delete this document?',
    supportedFormats: 'Supported formats: PDF, Word (.docx)',
    maxSize: 'Maximum file size: 10MB',
  },

  // Profile
  profile: {
    title: 'Profile',
    editProfile: 'Edit Profile',
    personalInfo: 'Personal Information',
    account: 'Account',
    subscription: 'Subscription',
    settings: 'Settings',
    language: 'Language',
    notifications: 'Notifications',
    darkMode: 'Dark Mode',
    help: 'Help & Support',
    about: 'About',
    version: 'Version',
    deleteAccount: 'Delete Account',
    deleteAccountConfirm: 'Are you sure? This action cannot be undone.',
  },

  // Subscription
  subscription: {
    title: 'Subscription',
    currentPlan: 'Current Plan',
    freeTrial: 'Free Trial',
    monthly: 'Monthly',
    yearly: 'Yearly',
    perMonth: '/month',
    perYear: '/year',
    upgrade: 'Upgrade',
    downgrade: 'Downgrade',
    cancel: 'Cancel Subscription',
    renews: 'Renews on',
    expires: 'Expires on',
    queriesUsed: 'Queries Used',
    queriesRemaining: 'Queries Remaining',
    unlimited: 'Unlimited',
    features: {
      basicQueries: 'Basic legal queries',
      documentUpload: 'Document upload & analysis',
      prioritySupport: 'Priority support',
      advancedAI: 'Advanced AI responses',
      unlimitedQueries: 'Unlimited queries',
    },
    upgradePrompt: 'Upgrade to get more features',
  },

  // Errors
  errors: {
    network: 'Network error. Please check your connection.',
    server: 'Server error. Please try again later.',
    unauthorized: 'Please log in to continue.',
    forbidden: 'You do not have permission to do this.',
    notFound: 'The requested resource was not found.',
    rateLimit: 'Too many requests. Please wait a moment.',
    subscription: 'Please upgrade your subscription to continue.',
  },

  // Legal Disclaimer
  legal: {
    disclaimer:
      'Juridik AI provides general legal information only. This is not legal advice. For specific legal matters, please consult a licensed attorney.',
    disclaimerShort: 'For informational purposes only. Not legal advice.',
  },

  // Onboarding
  onboarding: {
    skip: 'Skip',
    getStarted: 'Get Started',
    slide1: {
      title: 'Your AI Legal Assistant',
      description: 'Get instant answers to your legal questions with our advanced AI',
    },
    slide2: {
      title: 'Upload Documents',
      description: 'Upload contracts and documents for AI-powered analysis',
    },
    slide3: {
      title: 'Swedish Law Expertise',
      description: 'Trained on Swedish legal documents and regulations',
    },
  },

  // Web Pages
  web: {
    home: 'Home',
    features: 'Features',
    about: 'About Us',
    contact: 'Contact',
    pricing: 'Pricing',
    privacy: 'Privacy',
    terms: 'Terms',
    allRightsReserved: 'All rights reserved',
    
    // Landing
    heroTitle: 'Your AI-Powered Legal Assistant',
    heroSubtitle: 'Get instant answers to legal questions, analyze documents, and navigate Swedish law with confidence.',
    getStarted: 'Get Started Free',
    learnMore: 'Learn More',
    whyChoose: 'Why Choose Juridik AI?',
    
    // Features
    aiPowered: 'AI-Powered',
    aiPoweredDesc: 'Advanced AI trained on Swedish legal documents and case law.',
    instantAnswers: 'Instant Answers',
    instantAnswersDesc: 'Get immediate responses to your legal questions 24/7.',
    legalDocs: 'Document Analysis',
    legalDocsDesc: 'Upload and analyze contracts, agreements, and legal documents.',
    secure: 'Secure & Private',
    secureDesc: 'Your data is encrypted and never shared with third parties.',
    
    // CTA
    readyToStart: 'Ready to Get Started?',
    joinThousands: 'Join thousands of users who trust Juridik AI for legal assistance.',
    createAccount: 'Create Free Account',
    
    // About
    aboutTitle: 'About Juridik AI',
    aboutSubtitle: 'Making legal information accessible to everyone',
    ourMission: 'Our Mission',
    missionText: 'At Juridik AI, we believe that everyone should have access to reliable legal information. Our mission is to democratize legal knowledge using cutting-edge AI technology, making it accessible, understandable, and actionable for all.',
    whatWeDo: 'What We Do',
    whatWeDoText: 'We provide an AI-powered legal assistant that helps individuals and businesses understand Swedish law, analyze legal documents, and make informed decisions. Our platform combines advanced natural language processing with comprehensive legal databases to deliver accurate and relevant information.',
    ourValues: 'Our Values',
    accuracy: 'Accuracy',
    accuracyText: 'We maintain the highest standards of accuracy by continuously updating our AI with the latest legal information.',
    accessibility: 'Accessibility',
    accessibilityText: 'Legal knowledge should be available to everyone, regardless of their background or expertise.',
    privacyText: 'Your privacy and data security are our top priorities. We never share your information.',
    ourTeam: 'Our Team',
    teamText: 'Our team consists of legal experts, AI researchers, and software engineers passionate about making legal services more accessible and affordable.',
    
    // Contact
    contactTitle: 'Contact Us',
    contactSubtitle: 'We\'d love to hear from you',
    getInTouch: 'Get In Touch',
    contactIntro: 'Have questions about Juridik AI? Our team is here to help. Reach out to us using the form or contact information below.',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    hours: 'Hours',
    sendMessage: 'Send Message',
    name: 'Name',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'your@email.com',
    subject: 'Subject',
    subjectPlaceholder: 'What is this about?',
    message: 'Message',
    messagePlaceholder: 'Tell us more...',
    messageSent: 'Thank you! Your message has been sent.',
    
    // Features Page
    featuresTitle: 'Powerful Features',
    featuresSubtitle: 'Everything you need for legal assistance',
    aiChat: 'AI Chat Assistant',
    aiChatDesc: 'Natural conversation with our AI trained on Swedish legal documents and regulations.',
    docAnalysis: 'Document Analysis',
    docAnalysisDesc: 'Upload contracts and documents for instant AI-powered analysis and insights.',
    legalSearch: 'Legal Database Search',
    legalSearchDesc: 'Search through comprehensive Swedish legal databases and case law.',
    chatHistory: 'Chat History',
    chatHistoryDesc: 'Access all your previous conversations and insights anytime.',
    multilingual: 'Multilingual Support',
    multilingualDesc: 'Available in Swedish and English with more languages coming soon.',
    crossPlatform: 'Cross-Platform',
    crossPlatformDesc: 'Access from web, iOS, or Android - your data syncs everywhere.',
    
    howItWorks: 'How It Works',
    step1Title: 'Create Account',
    step1Desc: 'Sign up in seconds with your email address.',
    step2Title: 'Ask Questions',
    step2Desc: 'Chat with our AI about any legal topic or concern.',
    step3Title: 'Get Answers',
    step3Desc: 'Receive instant, accurate responses based on Swedish law.',
    step4Title: 'Take Action',
    step4Desc: 'Use the insights to make informed legal decisions.',
    
    // Pricing
    freePlan: 'Free',
    proPlan: 'Professional',
    businessPlan: 'Business',
    choosePlan: 'Choose Plan',
    contactSales: 'Contact Sales',
    tryFree: 'Try Free',
  },
};
