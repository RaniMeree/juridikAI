# Anna Legal AI - Frontend

Cross-platform app built with Expo (React Native + Web)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run web      # Web browser
npm run android  # Android emulator
npm run ios      # iOS simulator (Mac only)
```

## 📁 Project Structure

```
frontend/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Auth screens (login, signup, etc.)
│   ├── (tabs)/            # Main app tabs (chat, documents, profile)
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry redirect
├── src/
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom hooks
│   ├── i18n/              # Translations (en, sv)
│   ├── services/          # API services
│   ├── store/             # Zustand state stores
│   └── styles/            # Global CSS (Tailwind)
├── assets/                # Images, icons, fonts
├── app.json               # Expo config
├── tailwind.config.js     # Tailwind styling
└── package.json
```

## 🎨 Styling

Uses **NativeWind** (Tailwind CSS for React Native):

```tsx
<View className="bg-dark-900 p-4 rounded-xl">
  <Text className="text-white text-lg font-bold">Hello</Text>
</View>
```

## 🌐 Translations

Translations are in `src/i18n/locales/`:
- `en.ts` - English
- `sv.ts` - Swedish

Usage:
```tsx
import { useTranslation } from "@/hooks/useTranslation";

function MyComponent() {
  const { t } = useTranslation();
  return <Text>{t("auth.login")}</Text>;
}
```

### Adding a New Language

1. Create `src/i18n/locales/de.ts` (copy from `en.ts`)
2. Translate all strings
3. Add to `src/i18n/index.ts`:
   ```ts
   import de from './locales/de';
   
   export const resources = {
     en: { translation: en },
     sv: { translation: sv },
     de: { translation: de }, // Add this
   };
   
   export const supportedLanguages = [
     { code: 'en', name: 'English', nativeName: 'English' },
     { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
     { code: 'de', name: 'German', nativeName: 'Deutsch' }, // Add this
   ];
   ```

## 🔐 Authentication

Uses Expo SecureStore for token storage:
- Tokens stored securely on device
- Auto-refresh on 401 errors
- Managed by `authStore.ts`

## 📱 Building for Production

### Web
```bash
npm run build:web
# Output in dist/ folder
```

### iOS / Android
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build
eas build --platform ios
eas build --platform android
```

## 🎯 Key Features

- ✅ Cross-platform (Web, iOS, Android)
- ✅ Dark theme with modern design
- ✅ i18n ready (English + Swedish)
- ✅ Tailwind CSS styling
- ✅ Secure token storage
- ✅ Chat with AI assistant
- ✅ Document upload
- ✅ Subscription management

## 🔧 Environment Variables

Create `.env` from `.env.example`:
```bash
cp .env.example .env
```

Edit API URL for your backend.
