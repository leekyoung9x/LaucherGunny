# Hướng dẫn sử dụng hệ thống quản lý tiền

## Tính năng mới

### 1. Lấy thông tin người dùng sau khi đăng nhập

Sau khi đăng nhập thành công, hệ thống sẽ tự động gọi API `/api/Users/me` để lấy thông tin đầy đủ của người dùng:

```javascript
// Response format
{
  "id": 0,
  "username": "",
  "email": "user@email.com",
  "fullName": "Tên đầy đủ",
  "money": 2000,
  "createdAt": "2026-01-01T00:00:00",
  "isActive": true
}
```

### 2. Hiển thị số tiền người dùng

Số tiền của người dùng được hiển thị trên thanh navigation với icon đồng xu và định dạng tiền tệ Việt Nam:

- **Vị trí:** Góc phải trên navbar
- **Hiển thị:** Icon đồng xu + số tiền (ví dụ: 2,000)
- **Tự động cập nhật:** Sau mỗi lần chuyển tiền

### 3. Chức năng chuyển tiền từ Web vào Game

#### Cách sử dụng:

1. Click vào button "Chuyển tiền vào game" trên navbar
2. Nhập số tiền muốn chuyển hoặc chọn từ các mức tiền nhanh (100, 500, 1000, 5000)
3. Kiểm tra số dư hiện tại
4. Click "Xác nhận chuyển tiền"

#### API Endpoint:

```javascript
POST /Users/transfer-money
{
  "amount": 1000
}
```

## Cấu trúc Code

### Auth Store (`src/stores/auth.js`)

Thêm các getter và action mới:

**Getters:**
- `userMoney`: Lấy số tiền hiện tại của user
- `userFullName`: Lấy tên đầy đủ của user
- `userName`: Lấy username của user

**Actions:**
- `fetchUserInfo()`: Gọi API lấy thông tin user từ `/api/Users/me`
- `checkAuth()`: Cập nhật để tự động fetch user info khi kiểm tra auth

### API Endpoints (`src/api/endpoints.js`)

Thêm 2 endpoint mới:

```javascript
// Get current user information
authApi.getUserMe()

// Transfer money from web to game
authApi.transferMoney({ amount: 1000 })
```

### Components

#### UserBalance Component (`src/components/UserBalance.vue`)

Component chính để hiển thị số tiền và dialog chuyển tiền:

**Features:**
- Hiển thị số tiền với format VND
- Dialog chuyển tiền với validation
- Các nút chọn số tiền nhanh
- Hiển thị số dư hiện tại
- Loading state khi xử lý
- Toast notification

#### Dialog Components (`src/components/ui/Dialog*.vue`)

Các component UI cho dialog:
- `Dialog.vue`: Root dialog component
- `DialogContent.vue`: Content wrapper với overlay
- `DialogHeader.vue`: Header section
- `DialogTitle.vue`: Title text
- `DialogDescription.vue`: Description text
- `DialogFooter.vue`: Footer với buttons

## Flow hoạt động

### 1. Login Flow

```
User login 
  → API /Users/login 
  → Lưu token 
  → API /Users/me (fetch user info)
  → Lưu user info vào store
  → Redirect to home
```

### 2. Transfer Money Flow

```
User click "Chuyển tiền vào game"
  → Mở dialog
  → Nhập số tiền
  → Click "Xác nhận"
  → API /Users/transfer-money
  → API /Users/me (refresh user info)
  → Update UI
  → Show success toast
```

### 3. Check Auth on App Mount

```
App mounted
  → Check token in localStorage
  → If token exists:
    → Set isAuthenticated = true
    → API /Users/me (fetch user info)
    → Show main window (Electron)
```

## Styling

Component sử dụng TailwindCSS với các class:
- Gradient background cho money display: `from-amber-500 to-yellow-500`
- Icons từ `lucide-vue-next`: Coins, ArrowLeftRight, Loader2
- Responsive design với mobile support

## Error Handling

- Network errors: Hiển thị toast với message "Không thể kết nối..."
- Invalid token: Auto logout và redirect về login
- Validation errors: Hiển thị inline validation
- Transfer errors: Hiển thị error message từ server

## Testing

Để test chức năng:

1. Login với tài khoản hợp lệ
2. Kiểm tra số tiền hiển thị đúng trên navbar
3. Click "Chuyển tiền vào game"
4. Test các trường hợp:
   - Nhập số tiền hợp lệ
   - Nhập số tiền > số dư
   - Nhập số tiền âm
   - Nhập số tiền = 0
   - Click các nút số tiền nhanh
5. Verify số dư cập nhật sau khi transfer

## Notes

- Số tiền được format theo locale `vi-VN`
- Dialog tự động đóng sau khi transfer thành công
- User info được refresh sau mỗi lần transfer
- Component tự động reactive với changes trong auth store
