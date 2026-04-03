# PassItOn - Development Guide

## 🏗️ Architecture Overview

### Frontend Architecture
```
┌─────────────────────────────────────────┐
│          React Application              │
│                                         │
│  ┌──────────┐      ┌──────────────┐   │
│  │  Router  │ ───► │ Auth Context │   │
│  └──────────┘      └──────────────┘   │
│       │                    │            │
│       ▼                    ▼            │
│  ┌──────────────────────────────────┐  │
│  │          Page Components         │  │
│  │  • Landing  • Browse  • Chat     │  │
│  │  • Dashboard • Profile • Items   │  │
│  └──────────────────────────────────┘  │
│       │                                 │
│       ▼                                 │
│  ┌──────────────────────────────────┐  │
│  │      Reusable Components         │  │
│  │  • ItemCard • SafetyNotice       │  │
│  │  • VerificationBadge • EmptyState│  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │       Utility & Mock Data        │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 📋 Core Rules Implementation

### 1. College-Based Isolation

**Rule**: Users can ONLY see items from their own college

**Implementation**:
```typescript
// In mockData.ts
export const getMockItems = (collegeCode: string): Item[] => {
  // Returns only items matching the user's collegeCode
  return items.filter(item => item.collegeCode === collegeCode);
};

// In BrowsePage.tsx
const allItems = getMockItems(user.collegeCode);
```

**Production Note**: Backend must enforce this at the database level:
```sql
-- All queries must include college_code filter
SELECT * FROM items WHERE college_code = $user_college_code;
```

### 2. User Verification System

**Rule**: Only verified users can list items

**Implementation**:
```typescript
// In AuthContext.tsx
interface User {
  isVerified: boolean; // Set based on email domain
  // ...
}

// In AddListingPage.tsx
if (!user.isVerified) {
  setShowVerificationPrompt(true);
  return; // Block submission
}
```

**Verification Logic**:
- College email (`@college.edu`) → Verified
- Personal email (`@gmail.com`) → Unverified

### 3. Chat System

**Feature**: Real-time chat tied to specific items

**Implementation**:
```typescript
// Chat UI ready with Socket.IO client setup
import { io, Socket } from 'socket.io-client';

// Backend needed for:
// - Real-time message delivery
// - Message persistence
// - Typing indicators
// - Read receipts
```

## 🔐 Security Considerations

### College Isolation
- ✅ Frontend: Filter items by collegeCode
- ⚠️ Backend Required: Enforce in API middleware
- ⚠️ Database: Index on college_code for performance

### Verification
- ✅ Frontend: UI/UX flow complete
- ⚠️ Backend Required: Email OTP verification
- ⚠️ Database: Store verification status & timestamp

### Data Privacy
- Never expose phone numbers in UI
- No cross-college data leakage
- Proper image upload validation needed
- Rate limiting on chat required

## 🎨 Component Library

### Reusable Components

#### VerificationBadge
```typescript
<VerificationBadge 
  isVerified={true} 
  size="md" 
  showText={true} 
/>
```

#### SafetyNotice
```typescript
<SafetyNotice variant="default" />
<SafetyNotice variant="compact" />
```

#### ItemCard
```typescript
<ItemCard 
  id="1"
  title="Engineering Mathematics"
  price={250}
  condition="Good"
  image="..."
  sellerName="John"
  sellerAvatar="..."
  sellerVerified={true}
/>
```

#### EmptyState
```typescript
<EmptyState
  icon={Package}
  title="No items found"
  description="Try adjusting your filters"
  actionLabel="Browse All"
  actionLink="/browse"
/>
```

## 🗄️ Backend Requirements

### Database Schema

```sql
-- Users Table
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  college_code VARCHAR(10) NOT NULL,
  college_name VARCHAR(200) NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  branch VARCHAR(100),
  year VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Items Table
CREATE TABLE items (
  id UUID PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  condition VARCHAR(20) NOT NULL,
  semester VARCHAR(10),
  seller_id VARCHAR(50) REFERENCES users(id),
  college_code VARCHAR(10) NOT NULL,
  images JSONB,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_college_code (college_code),
  INDEX idx_seller_id (seller_id),
  INDEX idx_status (status)
);

-- Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  chat_id UUID NOT NULL,
  item_id UUID REFERENCES items(id),
  sender_id VARCHAR(50) REFERENCES users(id),
  receiver_id VARCHAR(50) REFERENCES users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_chat_id (chat_id),
  INDEX idx_item_id (item_id)
);

-- Colleges Table (Admin managed)
CREATE TABLE colleges (
  code VARCHAR(10) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  domain VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true
);
```

### API Endpoints

```
Authentication
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/verify-email
GET    /api/auth/me

Items
GET    /api/items              # Filter by user's college_code
GET    /api/items/:id
POST   /api/items              # Requires verification
PUT    /api/items/:id
DELETE /api/items/:id
GET    /api/items/my-listings

Chats
GET    /api/chats              # User's chats
GET    /api/chats/:chatId/messages
POST   /api/chats              # Create chat for item

Users
GET    /api/users/profile
PUT    /api/users/profile

Colleges
GET    /api/colleges           # Public list
```

## 🔌 Socket.IO Integration

### Server Setup
```javascript
// server.js
io.on('connection', (socket) => {
  // Join room based on college
  socket.on('join', (collegeCode) => {
    socket.join(collegeCode);
  });

  // Send message (enforce college isolation)
  socket.on('sendMessage', async (data) => {
    // Validate user belongs to college
    // Save to database
    // Emit to recipient
    io.to(data.chatId).emit('receiveMessage', message);
  });
});
```

### Client (Already Implemented)
```typescript
// ChatPage.tsx
const socketRef = useRef<Socket | null>(null);

useEffect(() => {
  socketRef.current = io('YOUR_BACKEND_URL');
  
  socketRef.current.on('receiveMessage', (message) => {
    setMessages(prev => [...prev, message]);
  });
  
  return () => socketRef.current?.disconnect();
}, []);
```

## 🚀 Deployment Checklist

### Frontend
- [ ] Build production bundle: `npm run build`
- [ ] Configure environment variables
- [ ] Set up CDN for static assets
- [ ] Configure domain and SSL
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics

### Backend
- [ ] Set up production database
- [ ] Configure JWT secrets
- [ ] Set up file storage (AWS S3, Cloudinary)
- [ ] Configure email service (SendGrid, AWS SES)
- [ ] Set up Socket.IO server
- [ ] Configure CORS properly
- [ ] Set up monitoring and logging
- [ ] Implement rate limiting
- [ ] Set up backup strategy

### Security
- [ ] Enable HTTPS everywhere
- [ ] Implement CSRF protection
- [ ] Set secure cookie flags
- [ ] Configure Content Security Policy
- [ ] Implement SQL injection protection
- [ ] Set up DDoS protection
- [ ] Configure firewall rules

## 📱 Mobile Responsiveness

All pages are mobile-first and fully responsive:
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly tap targets (min 44x44px)
- Optimized for both portrait and landscape
- Bottom navigation for mobile (can be added)

## 🧪 Testing Strategy

### Unit Tests
- AuthContext state management
- Form validation logic
- Filter functions
- Date formatting utilities

### Integration Tests
- Login/Signup flow
- Item listing flow
- Chat functionality
- Search and filtering

### E2E Tests
- Complete user journey
- Cross-browser testing
- Mobile device testing
- Accessibility testing

## 🎯 Performance Optimization

### Current
- Code splitting by route (React.lazy)
- Optimized images (WebP with fallback)
- CSS in JS with Tailwind
- Minimal dependencies

### Future
- Implement virtual scrolling for long lists
- Add service worker for offline support
- Lazy load images below fold
- Implement pagination/infinite scroll
- Add caching strategy

## 📊 Analytics & Monitoring

### Recommended Tools
- **Analytics**: Google Analytics / Mixpanel
- **Error Tracking**: Sentry
- **Performance**: Lighthouse / WebPageTest
- **User Behavior**: Hotjar / FullStory

### Key Metrics to Track
- User signups (verified vs unverified)
- Items listed per day
- Chat initiations
- Time to first listing
- Search queries
- Successful transactions

---

## 🤝 Contributing Guidelines

1. Follow existing code structure
2. Use TypeScript types consistently
3. Write meaningful commit messages
4. Test on mobile and desktop
5. Maintain accessibility standards
6. Follow Tailwind CSS conventions
7. Document complex logic

---

For questions or issues, refer to the main README.md or create an issue.
