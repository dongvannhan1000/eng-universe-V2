# Firebase Setup Guide

## Bước 1: Enable Firebase Authentication

Lỗi `400 Bad Request` xảy ra vì Firebase Authentication chưa được kích hoạt. Làm theo các bước sau:

### 1.1. Truy cập Firebase Console
1. Mở [Firebase Console](https://console.firebase.google.com/)
2. Chọn project: **studio-2695786469-dc293**

### 1.2. Enable Authentication
1. Click vào **Authentication** trong menu bên trái
2. Click tab **Sign-in method**
3. Click **Email/Password**
4. Toggle **Enable** ON
5. Click **Save**

![Firebase Auth Enable](https://i.imgur.com/example.png)

## Bước 2: Deploy Firestore Security Rules

1. Install Firebase CLI (nếu chưa có):
```bash
npm install -g firebase-tools
```

2. Login Firebase:
```bash
firebase login
```

3. Initialize Firebase (trong thư mục root project):
```bash
firebase init firestore
```
- Chọn "Use an existing project"
- Chọn project **studio-2695786469-dc293**
- File rules: `firestore.rules` (đã có sẵn)
- File indexes: `firestore.indexes.json`

4. Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## Bước 3: (Optional) Add Test Data

Sau khi authentication hoạt động, bạn có thể thêm test data cho public decks:

1. Vào **Firestore Database** trong Firebase Console
2. Tạo collection `publicDecks`
3. Add document với cấu trúc:
```json
{
  "slug": "essential-verbs",
  "title": "Essential English Verbs",
  "description": "Common verbs for everyday use",
  "tags": ["basic", "verbs"],
  "createdAt": <Timestamp>,
  "updatedAt": <Timestamp>
}
```

4. Tạo subcollection `items` trong document vừa tạo:
```json
{
  "headword": "go",
  "pos": "verb",
  "definition": "to move or travel from one place to another",
  "tags": ["movement", "basic"],
  "createdAt": <Timestamp>,
  "updatedAt": <Timestamp>
}
```

## Bước 4: Test Application

1. Khởi động lại dev server (nếu đang chạy):
```bash
npm run dev
```

2. Thử register user mới
3. Login
4. Thêm vocabulary
5. Test review system

## Common Issues

### Issue: "Permission denied" khi write to Firestore
**Fix**: Đảm bảo đã deploy Firestore rules (Bước 2)

### Issue: "User not found" khi login
**Fix**: Đảm bảo đã register user trước khi login

### Issue: Build errors với TypeScript
**Fix**: Đã sửa trong commits gần nhất. Run `npm run build` để verify.
