# AI Resume Enhancer - Project Plan

## Project Overview
An AI-powered resume optimization tool that helps users create tailored resumes based on job descriptions. Users can manage multiple default resumes, get matching scores, and leverage AI to automatically enhance resume sections for better alignment with target positions.

---

## Tech Stack Overview

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Components**: React + TypeScript
- **Styling**: Tailwind CSS (already in project)
- **PDF Rendering**: `pdfjs-dist` (lightweight, for viewing)
- **PDF Editing/Export**: `html2pdf` or `jspdf` + custom JSX templates
- **Icons**: Lucide React or Heroicons
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: Zustand or React Context (lightweight)
- **HTTP Client**: Fetch API or Axios

### Backend
- **Framework**: Next.js API Routes (serverless functions)
- **Runtime**: Node.js (built-in)
- **Database**: Firestore (Google Cloud) - Free tier covers personal use
- **Authentication**: NextAuth.js v5 + Google OAuth
- **PDF Generation**: Server-side with `html2pdf` or `pdfkit`

### External APIs
- **OpenAI API**: GPT-4 or GPT-3.5-turbo for:
  - Resume parsing into structured JSON
  - Job description keyword extraction
  - Resume section enhancement/rewriting
  - Matching score calculation

### Storage & Database
- **Primary**: Google Firestore (Free tier: 1GB storage, 50K read/20K write daily)
  - User profiles
  - Default resumes
  - Curated resumes
  - Job descriptions
  - Enhancement history
- **File Storage**: Firebase Storage (Google Cloud - free: 5GB/month)
  - PDF uploads
  - Generated PDFs

### Authentication
- **NextAuth.js v5** with Google OAuth provider
- Session management via JWT
- Secure cookie-based sessions

---

## Architecture

### Database Schema (Firestore)

```
users/
├── {userId}
│   ├── email: string
│   ├── name: string
│   ├── image: string (profile picture)
│   └── createdAt: timestamp

defaultResumes/
├── {userId}
│   ├── {resumeId}
│   │   ├── title: string
│   │   ├── fullName: string
│   │   ├── email: string
│   │   ├── phone: string
│   │   ├── location: string
│   │   ├── summary: string
│   │   ├── experience: [{
│   │   │   ├── company: string
│   │   │   ├── position: string
│   │   │   ├── startDate: string
│   │   │   ├── endDate: string
│   │   │   ├── description: string
│   │   │   └── achievements: [string]
│   │   ├── education: [{
│   │   │   ├── school: string
│   │   │   ├── degree: string
│   │   │   ├── field: string
│   │   │   └── graduationDate: string
│   │   ├── skills: [string]
│   │   ├── parsedAt: timestamp
│   │   └── createdAt: timestamp

curatedResumes/
├── {userId}
│   ├── {curatedResumeId}
│   │   ├── defaultResumeId: string (reference)
│   │   ├── jobDescription: string
│   │   ├── targetJobTitle: string
│   │   ├── matchingScore: number (0-100)
│   │   ├── extractedKeywords: [string]
│   │   ├── enhancements: [{
│   │   │   ├── section: string (summary/experience/skills)
│   │   │   ├── original: string
│   │   │   ├── enhanced: string
│   │   │   └── appliedAt: timestamp
│   │   ├── enhancedResume: object (full resume data)
│   │   ├── pdfUrl: string
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp

jobDescriptions/
├── {userId}
│   ├── {jobId}
│   │   ├── title: string
│   │   ├── company: string
│   │   ├── description: string
│   │   ├── extractedKeywords: [string]
│   │   └── createdAt: timestamp
```

---

## Feature-by-Feature Implementation Plan

### Phase 1: Core Setup & Authentication
1. **Setup**
   - Install dependencies
   - Configure Next.js 14 App Router
   - Setup TypeScript configuration
   - Configure ESLint & formatting

2. **Authentication**
   - Implement NextAuth.js v5 with Google OAuth
   - Create auth callback to save user to Firestore
   - Setup protected routes middleware
   - Create login/logout pages

3. **Basic Layout**
   - Create main app layout with sidebar
   - Responsive navbar with user profile menu
   - Auth state management

### Phase 2: Resume Management (Frontend)
1. **Default Resume Management**
   - Dashboard page showing max 5 default resumes
   - Create default resume form
   - View/Edit default resume UI
   - Delete default resume
   - Upload PDF to parse (or manual entry)

2. **Resume Parser**
   - File upload handler
   - Integration with OpenAI to parse PDF/text into JSON
   - Store parsed resume in Firestore
   - Display parsed data in form

### Phase 3: Resume Curation Feature
1. **Job Description Input**
   - Form to paste job description
   - Extract keywords using OpenAI
   - Calculate initial matching score

2. **Matching Score Display**
   - Show score (0-100)
   - Highlight matching skills/keywords
   - Suggest improvements

3. **AI Enhancement**
   - Generate enhanced resume sections using OpenAI
   - Show diff/preview before applying
   - Apply individual enhancements
   - Batch enhancement option

### Phase 4: PDF Viewing & Export
1. **PDF Viewer**
   - Integrate pdfjs-dist for viewing
   - Display default resume PDFs
   - Display curated resume preview

2. **PDF Export/Generation**
   - Create JSX-based resume template
   - Convert to PDF using html2pdf or jspdf
   - Save to Firebase Storage
   - Download option

3. **Resume Templates**
   - Build professional resume template in JSX
   - Support for different layouts
   - Customizable styling

### Phase 5: Enhancement & Polish
1. **History/Versioning**
   - Track enhancement history
   - Ability to revert changes
   - Compare versions

2. **UI/UX Improvements**
   - Loading states
   - Error handling & user feedback
   - Mobile responsiveness
   - Dark mode (optional)

3. **Performance Optimization**
   - Lazy loading for PDFs
   - Optimize OpenAI API calls
   - Cache parsed resumes

---

## API Routes (Backend)

```
POST   /api/auth/[...nextauth]         # NextAuth.js authentication
GET    /api/resumes/default             # Get all default resumes
POST   /api/resumes/default             # Create new default resume
GET    /api/resumes/default/:id         # Get specific default resume
PUT    /api/resumes/default/:id         # Update default resume
DELETE /api/resumes/default/:id         # Delete default resume

POST   /api/resumes/parse               # Parse uploaded PDF/text with AI
GET    /api/resumes/curated             # Get all curated resumes
POST   /api/resumes/curated             # Create new curated resume
GET    /api/resumes/curated/:id         # Get specific curated resume
PUT    /api/resumes/curated/:id         # Update curated resume
DELETE /api/resumes/curated/:id         # Delete curated resume

POST   /api/ai/extract-keywords         # Extract keywords from JD
POST   /api/ai/enhance-section          # Enhance specific resume section
POST   /api/ai/calculate-score          # Calculate matching score

POST   /api/pdf/generate                # Generate and store PDF
GET    /api/pdf/:id                     # Get PDF from storage
DELETE /api/pdf/:id                     # Delete PDF from storage
```

---

## Dependencies to Install

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    
    "next-auth": "^5.0.0",
    "@auth/prisma-adapter": "^1.0.0",
    
    "firebase": "^10.0.0",
    "firebase-admin": "^12.0.0",
    
    "openai": "^4.0.0",
    
    "pdfjs-dist": "^3.11.174",
    "html2pdf.js": "^0.10.1",
    "jspdf": "^2.5.0",
    "html2canvas": "^1.4.1",
    
    "react-hook-form": "^7.0.0",
    "zod": "^3.22.0",
    
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    
    "tailwindcss": "^3.3.0",
    "lucide-react": "^0.292.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

---

## Cost Breakdown (Monthly)

| Service | Free Tier | Cost for Personal Use |
|---------|-----------|----------------------|
| **Firestore** | 1GB storage, 50K reads/day, 20K writes/day | $0 |
| **Firebase Storage** | 5GB/month | $0 |
| **Next.js Hosting** | Vercel free tier (Hobby) | $0 |
| **Google OAuth** | Free | $0 |
| **OpenAI API** | N/A | ~$5-15/month* |
| **Total** | | ~$5-15/month |

\* Assuming ~50-100 API calls/month for personal use. GPT-3.5-turbo costs ~$0.0005/prompt + $0.0015/completion

---

## Recommended Libraries for PDF Handling

### Option 1: `html2pdf.js` + `html2canvas` (Recommended for simplicity)
- **Pros**: Simple integration, good for JSX templates, lightweight
- **Cons**: May have rendering issues with complex layouts
- **Best for**: Quick MVP with decent PDFs

### Option 2: `jsPDF` + `html2canvas` (More control)
- **Pros**: More customization, better control over PDF generation
- **Cons**: Slightly steeper learning curve
- **Best for**: Professional-looking PDFs with custom formatting

### Option 3: React-PDF Renderer (Most professional)
- **Pros**: Designed specifically for React, best quality output
- **Cons**: More verbose, steeper learning curve
- **Best for**: Production-grade resume templates

**Recommendation**: Start with `html2pdf.js` for MVP, migrate to React-PDF Renderer if needed for production.

---

## Security Considerations

1. **Authentication**: NextAuth.js handles OAuth flow securely
2. **API Protection**: Verify user session on all protected routes
3. **Database Access**: Firestore security rules restrict data access
4. **API Keys**: Store OpenAI API key in environment variables
5. **User Data**: Encrypt sensitive information at rest
6. **Rate Limiting**: Implement rate limiting on AI API calls
7. **File Upload**: Validate uploaded files before processing

---

## Environment Variables (.env.local)

```
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generated-secret>

# Google OAuth
GOOGLE_ID=<your-google-oauth-id>
GOOGLE_SECRET=<your-google-oauth-secret>

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=<key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<bucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<id>
NEXT_PUBLIC_FIREBASE_APP_ID=<app-id>

FIREBASE_ADMIN_SDK_KEY=<admin-sdk-json>

# OpenAI
OPENAI_API_KEY=<your-api-key>

# Feature Flags
NEXT_PUBLIC_MAX_DEFAULT_RESUMES=5
AI_MODEL=gpt-3.5-turbo
```

---

## Implementation Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Phase 1** | 3-4 days | Setup, Auth, Layout |
| **Phase 2** | 5-7 days | Resume management, Parser |
| **Phase 3** | 5-7 days | Curation, AI integration |
| **Phase 4** | 4-5 days | PDF viewing & export |
| **Phase 5** | 3-4 days | Polish, optimization |
| **Total** | ~3 weeks | Full MVP |

---

## Next Steps

1. Install dependencies
2. Setup Firebase project & Firestore
3. Configure Google OAuth credentials
4. Create NextAuth.js configuration
5. Build database schema
6. Implement authentication flow
7. Create dashboard & sidebar UI
8. Build resume management features
9. Integrate OpenAI API
10. Implement PDF generation & viewing

---

## Useful Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [html2pdf.js Documentation](https://ekoopmans.github.io/html2pdf.js/)
- [pdfjs-dist Documentation](https://mozilla.github.io/pdf.js/)

