# User Menu - Dropdown với Avatar và Quản lý Tài khoản

## Tính năng mới được thêm vào

### 1. **Menu Dropdown Quản lý Tài khoản**

Thay thế nút logout riêng lẻ bằng một menu dropdown tích hợp đầy đủ chức năng:

#### Hiển thị trong Navbar:
- **Số dư tiền** với icon đồng xu vàng và nút refresh
- **Avatar người dùng** (tự động tạo từ tên hoặc sử dụng hình ảnh)
- **Icon mũi tên** hiển thị dropdown

#### Các chức năng trong menu:

1. **Thông tin người dùng**
   - Tên đầy đủ
   - Email
   
2. **Số dư tài khoản**
   - Hiển thị số tiền hiện tại
   - Icon refresh để cập nhật số dư linh động
   - Animation khi đang refresh

3. **Chuyển tiền vào game**
   - Mở dialog chuyển tiền
   - Các mức tiền nhanh: 100, 500, 1,000, 5,000
   - Validation số tiền

4. **Thông tin tài khoản**
   - Menu item để xem chi tiết tài khoản (có thể mở rộng sau)

5. **Cài đặt**
   - Menu item cho các cài đặt (có thể mở rộng sau)

6. **Đăng xuất**
   - Hiển thị màu đỏ (destructive)
   - Icon LogOut

### 2. **Icon Refresh Số Dư**

Người dùng có thể làm mới số dư bất kỳ lúc nào:
- Click vào icon refresh trong phần hiển thị số dư (trên trigger button)
- Click vào item "Số dư" trong dropdown menu
- Animation quay khi đang refresh
- Toast notification khi refresh thành công

## Components Mới

### UI Components (Radix Vue)

Các component UI mới được tạo trong `src/components/ui/`:

1. **DropdownMenu.vue** - Root component cho dropdown
2. **DropdownMenuTrigger.vue** - Button để mở dropdown
3. **DropdownMenuContent.vue** - Container cho menu items
4. **DropdownMenuItem.vue** - Mỗi item trong menu
5. **DropdownMenuLabel.vue** - Label/header trong menu
6. **DropdownMenuSeparator.vue** - Đường phân cách
7. **Avatar.vue** - Avatar container
8. **AvatarImage.vue** - Hiển thị hình ảnh avatar
9. **AvatarFallback.vue** - Fallback khi không có hình (hiển thị chữ cái đầu)

### Feature Component

**UserMenu.vue** (`src/components/UserMenu.vue`)

Component chính tích hợp tất cả các chức năng:
- Hiển thị số dư với refresh button
- Avatar với fallback (chữ cái đầu của tên)
- Dropdown menu với các chức năng
- Transfer money dialog
- Logout functionality

## Cấu trúc Code

### UserMenu Component Structure

```vue
<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <!-- Balance Display with Refresh -->
      <div class="balance">
        <Coins />
        <span>Money</span>
        <button @click.stop="refresh">
          <RefreshCw />
        </button>
      </div>
      
      <!-- Avatar -->
      <Avatar>
        <AvatarImage />
        <AvatarFallback>Initials</AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>
    
    <DropdownMenuContent>
      <!-- User Info -->
      <!-- Menu Items -->
      <!-- Logout -->
    </DropdownMenuContent>
  </DropdownMenu>
</template>
```

### Avatar System

**Avatar URL Generation:**
```javascript
// Sử dụng service UI Avatars để tạo avatar từ tên
const avatarUrl = `https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff`
```

**Initials Generation:**
```javascript
// Lấy chữ cái đầu tiên và cuối cùng của tên
"Nguyen Van A" → "NA"
"John" → "JO"
```

## Styling

### Colors & Effects

- **Balance Display:** Gradient vàng (amber-500 to yellow-500)
- **Refresh Icon:** Hover effect + spin animation khi loading
- **Avatar Fallback:** Primary color với text trắng
- **Dropdown:** Shadow, border, animation fade in/out
- **Logout Item:** Destructive color (red)

### Responsive

- Ẩn trên mobile với class `hidden md:block`
- Dropdown tự động căn chỉnh phải (align="end")
- Width cố định cho dropdown: 256px (w-64)

## User Flow

### 1. Xem Số Dư

```
User nhìn navbar → Thấy số dư với icon đồng xu
```

### 2. Refresh Số Dư

```
User click icon refresh → Animation spin → API call → Update UI → Toast success
```

### 3. Mở Menu

```
User click avatar/số dư → Dropdown mở → Hiển thị thông tin và các chức năng
```

### 4. Chuyển Tiền

```
User click "Chuyển tiền vào game" → Dialog mở → Nhập số tiền → Confirm → API call → Refresh số dư → Toast success → Dialog đóng
```

### 5. Đăng Xuất

```
User click "Đăng xuất" → Confirm → Logout → Redirect to login → Clear session
```

## API Calls

### Refresh Balance
```javascript
handleRefreshBalance()
  → authStore.fetchUserInfo()
  → GET /api/Users/me
  → Update store
  → Toast notification
```

### Transfer Money
```javascript
handleTransfer()
  → authApi.transferMoney({ amount })
  → POST /api/Users/transfer-money
  → authStore.fetchUserInfo()
  → Toast notification
  → Close dialog
```

## Icons Used (lucide-vue-next)

- **Coins** - Icon đồng xu cho số dư
- **RefreshCw** - Icon refresh (quay tròn)
- **ChevronDown** - Icon mũi tên xuống
- **Wallet** - Icon ví tiền
- **ArrowLeftRight** - Icon chuyển tiền
- **User** - Icon người dùng
- **Settings** - Icon cài đặt
- **LogOut** - Icon đăng xuất
- **Loader2** - Icon loading khi xử lý

## Features Highlights

✅ **Avatar động** - Tự tạo từ tên hoặc hiển thị hình ảnh
✅ **Refresh linh động** - Cập nhật số dư mọi lúc với animation
✅ **Menu đầy đủ** - Tích hợp nhiều chức năng trong 1 dropdown
✅ **UX tốt** - Toast notifications, loading states, validations
✅ **Responsive** - Hoạt động tốt trên nhiều kích thước màn hình
✅ **Accessible** - Sử dụng Radix Vue components (WAI-ARIA compliant)

## Testing Checklist

- [ ] Click vào avatar để mở menu
- [ ] Click vào icon refresh để cập nhật số dư
- [ ] Animation spin hiển thị khi refresh
- [ ] Avatar hiển thị đúng (hình hoặc chữ cái đầu)
- [ ] Số tiền format đúng (VND)
- [ ] Thông tin user hiển thị đúng trong menu
- [ ] Click "Chuyển tiền" mở dialog
- [ ] Chuyển tiền thành công → số dư cập nhật
- [ ] Click "Đăng xuất" → logout và redirect
- [ ] Menu đóng khi click bên ngoài
- [ ] Responsive trên mobile

## Future Enhancements

1. Upload custom avatar
2. Thực thi các chức năng "Thông tin tài khoản" và "Cài đặt"
3. Thêm transaction history
4. Thêm notification badge
5. Dark mode optimization
6. Animation transitions nâng cao
