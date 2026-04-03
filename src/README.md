# PassItOn - College Academic Marketplace

A production-ready college-based marketplace platform where students can buy and sell used academic resources (textbooks, calculators, lab equipment, etc.) within their own campus community.

## 🎯 Core Features

### College-Based Isolation
- Users can only see and interact with items from their own college
- College selection during signup from admin-onboarded list
- Automatic college code assignment

### User Verification System
- **Verified Users** (College email): Can browse, buy, sell, and chat
- **Unverified Users** (Personal email): Can browse, buy, and chat - Cannot list items

### Complete Marketplace Flow
- Browse items with advanced filtering (category, price, semester)
- Detailed item pages with seller information
- Real-time chat tied to specific items
- Safe on-campus exchange guidance
- User profile and listing management

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS v4
- **State Management**: Context API
- **Icons**: Lucide React
- **Real-time Chat**: Socket.IO Client (UI ready)
- **Build Tool**: Vite

## 📁 Project Structure

```
/
├── App.tsx                      # Main app with routing
├── context/
│   └── AuthContext.tsx          # Authentication & user state
├── pages/
│   ├── LandingPage.tsx         # Public homepage
│   ├── LoginPage.tsx           # User login
│   ├── SignupPage.tsx          # User registration
│   ├── Dashboard.tsx           # Main dashboard
│   ├── BrowsePage.tsx          # Item marketplace with filters
│   ├── ItemDetailPage.tsx      # Individual item view
│   ├── AddListingPage.tsx      # Create new listing (verified only)
│   ├── ChatPage.tsx            # Real-time messaging
│   ├── MyListingsPage.tsx      # Manage user's listings
│   └── ProfilePage.tsx         # User profile & settings
├── utils/
│   └── mockData.ts             # Mock data for demo
└── styles/
    └── globals.css             # Global styles & tokens
```

## 🚀 Getting Started

### Demo Login
Use any email to login:
- College email (e.g., `student@dbit.in`) → Verified status
- Personal email (e.g., `user@gmail.com`) → Unverified status

### Available Colleges
- DBIT - Don Bosco Institute of Technology
- VJTI - Veermata Jijabai Technological Institute
- SPIT - Sardar Patel Institute of Technology
- TSEC - Thadomal Shahani Engineering College
- KJ - K.J. Somaiya College of Engineering

## 🔐 User Types & Permissions

### Verified Students
✅ Browse items  
✅ Buy items  
✅ List items for sale  
✅ Chat with buyers/sellers  
✅ Full marketplace access

### Unverified Users
✅ Browse items  
✅ Buy items  
✅ Chat with sellers  
❌ Cannot list items (verification required)

## 🎨 Design Principles

- **Clean & Minimal**: Professional product UI, not a presentation site
- **Mobile-First**: Fully responsive design
- **Trust & Safety**: College isolation, verification badges, campus meeting reminders
- **Sustainability Focus**: Encouraging reuse of academic resources

## 📱 Key Pages

### Landing Page
- Hero section with clear value proposition
- 3-step process visualization
- Feature highlights
- CTA to signup/browse

### Dashboard
- Quick stats and navigation
- Recent items from user's college
- Verification status display
- Quick action cards

### Browse/Marketplace
- Grid view of items
- Advanced filters (category, price, semester)
- Search functionality
- Seller verification badges

### Item Detail
- Image carousel
- Full item description
- Seller information with verification status
- Chat CTA
- Safety reminders

### Chat
- Real-time messaging UI
- Item context pinned at top
- WhatsApp-style interface
- Safety notices (no phone numbers)

### Profile
- User information
- Verification status
- Activity stats
- Logout

## 🔧 Production Notes

### Backend Integration Required
Currently using mock data. For production:

1. **Authentication API**
   - JWT-based auth
   - College email verification
   - Session management

2. **Item API**
   - CRUD operations for listings
   - Image upload (use cloud storage)
   - Search and filtering

3. **Chat Backend**
   - Socket.IO server
   - Message persistence
   - Real-time delivery

4. **Database Schema**
   - Users (with college_code)
   - Items (with college_code)
   - Messages
   - Transactions

### Security Considerations
- College isolation enforced at API level
- Image upload validation
- Rate limiting on chat
- Content moderation
- Report/block functionality

## 🎯 Future Enhancements

- Push notifications for messages
- Item bookmarking/favorites
- Transaction history
- User ratings/reviews
- Admin dashboard for college management
- Analytics dashboard
- Mobile app (React Native)

## 📝 Notes

- All components are production-ready
- Mock data simulates real backend responses
- Socket.IO client setup (server needed for real-time)
- Proper TypeScript types throughout
- Responsive design for all screen sizes
- Accessibility-friendly UI components

---

Built with ❤️ for campus communities
