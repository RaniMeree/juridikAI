# Juridik AI

AI-powered legal assistant for Swedish law. Get instant answers to legal questions, analyze documents, and navigate Swedish regulations with confidence.

## Features

- 🤖 **AI Chat Assistant** - Natural conversation powered by advanced AI
- 📄 **Document Analysis** - Upload and analyze legal documents
- 🔍 **Legal Database Search** - Search Swedish law and regulations
- 🌍 **Multilingual** - Available in Swedish and English
- 📱 **Cross-Platform** - Web, iOS, and Android

## Tech Stack

### Frontend
- React Native / Expo SDK 52
- TypeScript
- Zustand (State Management)
- i18next (Internationalization)
- React Query

### Backend
- FastAPI
- PostgreSQL + pgvector
- OpenAI API
- SQLAlchemy

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm start
```

- Web: `npm run web`
- Android: `npm run android`
- iOS: `npm run ios`

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Database

```bash
cd database
psql -U postgres < init.sql
psql -U postgres -d juridik_ai < schema.sql
psql -U postgres -d juridik_ai < seed.sql
```

## Project Structure

```
APP-Anna/
├── frontend/          # React Native/Expo app
│   ├── app/          # App screens and routing
│   ├── src/          # Components, services, stores
│   └── package.json
├── backend/          # FastAPI backend
│   ├── main.py
│   └── requirements.txt
└── database/         # PostgreSQL schema
    ├── schema.sql
    └── seed.sql
```

## License

All rights reserved © 2026 Juridik AI
