# API Integration Guide

This document provides the exact data structures and API contracts needed to integrate PassItOn frontend with a backend.

## 🔐 Authentication

### POST /api/auth/signup

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@college.edu",
  "password": "securepass123",
  "collegeCode": "DBIT",
  "branch": "Computer Engineering",
  "year": "3rd Year"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": "DBIT.2026001",
    "name": "John Doe",
    "email": "john@college.edu",
    "collegeCode": "DBIT",
    "collegeName": "Don Bosco Institute of Technology",
    "isVerified": false,
    "role": "student",
    "branch": "Computer Engineering",
    "year": "3rd Year",
    "avatar": "https://..."
  },
  "token": "jwt_token_here"
}
```

### POST /api/auth/login

**Request Body:**
```json
{
  "email": "john@college.edu",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": "DBIT.2026001",
    "name": "John Doe",
    "email": "john@college.edu",
    "collegeCode": "DBIT",
    "collegeName": "Don Bosco Institute of Technology",
    "isVerified": true,
    "role": "student",
    "branch": "Computer Engineering",
    "year": "3rd Year",
    "avatar": "https://..."
  },
  "token": "jwt_token_here"
}
```

### POST /api/auth/verify-email

**Request Body:**
```json
{
  "email": "john@dbit.in",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "isVerified": true
}
```

---

## 📦 Items/Listings

### GET /api/items

**Query Parameters:**
- `collegeCode` (auto from user session)
- `category` (optional)
- `semester` (optional)
- `minPrice` (optional)
- `maxPrice` (optional)
- `search` (optional)
- `page` (default: 1)
- `limit` (default: 20)

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "id": "uuid-here",
      "title": "Engineering Mathematics III Textbook",
      "description": "Well-maintained textbook...",
      "price": 250,
      "category": "Textbooks",
      "condition": "Good",
      "images": ["https://...", "https://..."],
      "sellerId": "DBIT.2023001",
      "sellerName": "Priya Sharma",
      "sellerBranch": "Computer Engineering",
      "sellerYear": "3rd Year",
      "sellerVerified": true,
      "sellerAvatar": "https://...",
      "collegeCode": "DBIT",
      "collegeName": "Don Bosco Institute of Technology",
      "semester": "Sem 3",
      "createdAt": "2026-01-15T10:30:00Z",
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### GET /api/items/:id

**Response:**
```json
{
  "success": true,
  "item": {
    "id": "uuid-here",
    "title": "Engineering Mathematics III Textbook",
    "description": "Well-maintained textbook...",
    "price": 250,
    "category": "Textbooks",
    "condition": "Good",
    "images": ["https://...", "https://..."],
    "sellerId": "DBIT.2023001",
    "sellerName": "Priya Sharma",
    "sellerBranch": "Computer Engineering",
    "sellerYear": "3rd Year",
    "sellerVerified": true,
    "sellerAvatar": "https://...",
    "collegeCode": "DBIT",
    "collegeName": "Don Bosco Institute of Technology",
    "semester": "Sem 3",
    "views": 42,
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-01-15T10:30:00Z",
    "status": "active"
  }
}
```

### POST /api/items

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request Body (multipart/form-data):**
```json
{
  "title": "Engineering Mathematics III Textbook",
  "description": "Well-maintained textbook...",
  "price": 250,
  "category": "Textbooks",
  "condition": "Good",
  "semester": "Sem 3",
  "images": [File, File] // Actual file uploads
}
```

**Response:**
```json
{
  "success": true,
  "item": {
    "id": "new-uuid",
    "title": "Engineering Mathematics III Textbook",
    "description": "Well-maintained textbook...",
    "price": 250,
    "category": "Textbooks",
    "condition": "Good",
    "images": ["https://uploaded-url-1", "https://uploaded-url-2"],
    "sellerId": "DBIT.2026001",
    "sellerName": "John Doe",
    "sellerBranch": "Computer Engineering",
    "sellerYear": "3rd Year",
    "sellerVerified": true,
    "sellerAvatar": "https://...",
    "collegeCode": "DBIT",
    "collegeName": "Don Bosco Institute of Technology",
    "semester": "Sem 3",
    "createdAt": "2026-01-20T14:30:00Z",
    "status": "active"
  }
}
```

**Validation Rules:**
- User must be verified (`isVerified: true`)
- Title: 5-200 characters
- Description: 20-2000 characters
- Price: > 0
- Category: must be from allowed list
- Condition: "Like New" | "Good" | "Fair" | "Used"
- Images: 1-5 images, max 5MB each

### PUT /api/items/:id

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "price": 300,
  "status": "sold"
}
```

**Response:**
```json
{
  "success": true,
  "item": { /* updated item object */ }
}
```

**Authorization:**
- Only item owner can update
- Cannot change collegeCode

### DELETE /api/items/:id

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

**Authorization:**
- Only item owner can delete

### GET /api/items/my-listings

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "items": [ /* array of user's items */ ],
  "stats": {
    "active": 4,
    "sold": 2,
    "total_views": 156
  }
}
```

---

## 💬 Chat/Messages

### GET /api/chats

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "chats": [
    {
      "id": "chat-uuid",
      "itemId": "item-uuid",
      "itemTitle": "Engineering Mathematics III Textbook",
      "itemImage": "https://...",
      "itemPrice": 250,
      "participantId": "DBIT.2023001",
      "participantName": "Priya Sharma",
      "participantAvatar": "https://...",
      "participantVerified": true,
      "lastMessage": "Yes, it's still available.",
      "lastMessageTime": "2026-01-18T14:30:00Z",
      "unreadCount": 2
    }
  ]
}
```

### GET /api/chats/:chatId/messages

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "message-uuid",
      "chatId": "chat-uuid",
      "senderId": "DBIT.2026001",
      "text": "Is this still available?",
      "timestamp": "2026-01-18T10:00:00Z",
      "read": true
    }
  ],
  "pagination": {
    "page": 1,
    "hasMore": false
  }
}
```

### POST /api/chats

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
  "itemId": "item-uuid",
  "sellerId": "DBIT.2023001"
}
```

**Response:**
```json
{
  "success": true,
  "chat": {
    "id": "new-chat-uuid",
    "itemId": "item-uuid",
    "buyerId": "DBIT.2026001",
    "sellerId": "DBIT.2023001",
    "createdAt": "2026-01-20T14:30:00Z"
  }
}
```

---

## 🏫 Colleges

### GET /api/colleges

**Response:**
```json
{
  "success": true,
  "colleges": [
    {
      "code": "DBIT",
      "name": "Don Bosco Institute of Technology",
      "domain": "dbit.in",
      "isActive": true
    },
    {
      "code": "VJTI",
      "name": "Veermata Jijabai Technological Institute",
      "domain": "vjti.ac.in",
      "isActive": true
    }
  ]
}
```

---

## 👤 User Profile

### GET /api/users/profile

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": "DBIT.2026001",
    "name": "John Doe",
    "email": "john@dbit.in",
    "collegeCode": "DBIT",
    "collegeName": "Don Bosco Institute of Technology",
    "isVerified": true,
    "role": "student",
    "branch": "Computer Engineering",
    "year": "3rd Year",
    "avatar": "https://...",
    "stats": {
      "listings": 4,
      "sold": 2,
      "purchased": 3,
      "chats": 5
    },
    "createdAt": "2026-01-10T10:00:00Z"
  }
}
```

### PUT /api/users/profile

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "branch": "Computer Engineering",
  "year": "4th Year",
  "avatar": "base64_or_url"
}
```

**Response:**
```json
{
  "success": true,
  "user": { /* updated user object */ }
}
```

---

## 🌐 Socket.IO Events

### Client → Server Events

#### `join`
```javascript
socket.emit('join', {
  userId: 'DBIT.2026001',
  chatId: 'chat-uuid'
});
```

#### `sendMessage`
```javascript
socket.emit('sendMessage', {
  chatId: 'chat-uuid',
  itemId: 'item-uuid',
  senderId: 'DBIT.2026001',
  receiverId: 'DBIT.2023001',
  text: 'Is this still available?'
});
```

#### `typing`
```javascript
socket.emit('typing', {
  chatId: 'chat-uuid',
  userId: 'DBIT.2026001'
});
```

### Server → Client Events

#### `receiveMessage`
```javascript
socket.on('receiveMessage', (message) => {
  // message = {
  //   id: 'message-uuid',
  //   chatId: 'chat-uuid',
  //   senderId: 'DBIT.2023001',
  //   text: 'Yes, it is available',
  //   timestamp: '2026-01-20T14:30:00Z'
  // }
});
```

#### `userTyping`
```javascript
socket.on('userTyping', (data) => {
  // data = {
  //   chatId: 'chat-uuid',
  //   userId: 'DBIT.2023001',
  //   userName: 'Priya Sharma'
  // }
});
```

#### `messageRead`
```javascript
socket.on('messageRead', (data) => {
  // data = {
  //   chatId: 'chat-uuid',
  //   messageIds: ['uuid1', 'uuid2']
  // }
});
```

---

## 🚨 Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {} // Optional additional details
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing token |
| `FORBIDDEN` | 403 | User not verified or insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `DUPLICATE_EMAIL` | 409 | Email already exists |
| `WRONG_COLLEGE` | 403 | Attempting to access cross-college data |
| `UNVERIFIED_USER` | 403 | Action requires verified user |
| `RATE_LIMIT` | 429 | Too many requests |

---

## 🔒 Middleware Requirements

### Authentication Middleware
```javascript
// Verify JWT token
// Attach user object to request
// Check user.collegeCode for all data access
```

### College Isolation Middleware
```javascript
// For all item/message queries
// Filter by user.collegeCode automatically
// Prevent cross-college access
```

### Verification Middleware
```javascript
// For POST /api/items
// Check user.isVerified === true
// Return 403 if not verified
```

---

## 📤 File Upload

### Image Upload Endpoint
**POST /api/upload**

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data
```

**Request:**
- File field name: `image`
- Max size: 5MB per image
- Allowed formats: JPG, PNG, WebP

**Response:**
```json
{
  "success": true,
  "url": "https://cdn.example.com/images/abc123.jpg",
  "thumbnail": "https://cdn.example.com/images/abc123_thumb.jpg"
}
```

**Recommended Storage:**
- AWS S3
- Cloudinary
- Google Cloud Storage

---

## 🔄 Frontend Integration Points

### Update AuthContext.tsx
Replace mock API calls with real API calls:

```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  
  if (data.success) {
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
};
```

### Replace mockData.ts
Create a new `api/` directory with actual API calls:

```typescript
// api/items.ts
export const getItems = async (filters: ItemFilters) => {
  const response = await fetch('/api/items?' + new URLSearchParams(filters));
  return response.json();
};
```

### Update Socket.IO Connection
```typescript
// In ChatPage.tsx
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
socketRef.current = io(SOCKET_URL, {
  auth: { token: localStorage.getItem('token') }
});
```

---

For any questions about the API integration, refer to the mock data structures in `/utils/mockData.ts` which exactly match the expected API responses.
