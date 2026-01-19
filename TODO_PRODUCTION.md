# Production TODO

## Security

### Firestore Security Rules
**CRITICAL: Update before deploying to production**

Current rules (testing only - INSECURE):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Production rules (secure):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only read/write their own default resumes
    match /defaultResumes/{userId}/{resumeId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only read/write their own curated resumes
    match /curatedResumes/{userId}/{curatedResumeId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only read/write their own job descriptions
    match /jobDescriptions/{userId}/{jobId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Environment Variables
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Generate new `NEXTAUTH_SECRET` for production
- [ ] Verify all Firebase credentials are production values
- [ ] Add production Google OAuth redirect URI in Google Cloud Console

### Rate Limiting
- [ ] Implement rate limiting for OpenAI API calls
- [ ] Add rate limiting for resume parsing
- [ ] Limit number of API calls per user per day

### Error Handling
- [ ] Remove console.log statements
- [ ] Implement proper error logging (Sentry, LogRocket, etc.)
- [ ] Add user-friendly error messages

### Performance
- [ ] Enable caching for parsed resumes
- [ ] Optimize images and assets
- [ ] Implement lazy loading where appropriate

### Testing
- [ ] Test authentication flow end-to-end
- [ ] Test resume creation with max limit (5)
- [ ] Test curated resume generation
- [ ] Test PDF generation and download
- [ ] Test on mobile devices

### Deployment
- [ ] Setup CI/CD pipeline
- [ ] Configure custom domain
- [ ] Enable HTTPS
- [ ] Setup monitoring and alerts
