# Hướng dẫn cài đặt Flash Player cho Electron

## Cách 1: Sử dụng Pepper Flash Plugin (Khuyến nghị)

### Bước 1: Download Flash Plugin
1. Tải **PepperFlash** từ: https://github.com/electron/electron/releases
2. Hoặc tải từ Adobe Flash archive: https://helpx.adobe.com/flash-player/kb/archived-flash-player-versions.html

### Bước 2: Giải nén và copy file
1. Giải nén file tải về
2. Copy file `pepflashplayer.dll` (Windows) hoặc `PepperFlashPlayer.plugin` (Mac) 
3. Paste vào thư mục gốc của dự án (cùng cấp với `package.json`)

### Bước 3: Cập nhật đường dẫn trong main.js
Đã được cấu hình sẵn trong `electron/main.js`:
```javascript
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, '../pepflashplayer.dll'))
app.commandLine.appendSwitch('ppapi-flash-version', '32.0.0.465')
```

### Bước 4: Restart ứng dụng
```bash
npm run dev
```

## Cách 2: Sử dụng electron-flash-player (NPM Package)

### Bước 1: Cài đặt package
```bash
npm install electron-flash-player
```

### Bước 2: Import trong main.js
Thêm vào đầu file `electron/main.js`:
```javascript
import flash from 'electron-flash-player'

app.on('ready', () => {
  flash.init()
  // ... rest of your code
})
```

## Kiểm tra Flash đã hoạt động

1. Mở DevTools trong ứng dụng
2. Check console xem có lỗi Flash không
3. Vào trang game và kiểm tra Flash content có load không

## Lưu ý

- Flash Player đã ngừng hỗ trợ từ 31/12/2020
- Chỉ nên dùng Flash trong môi trường Electron riêng biệt
- Không nên dùng Flash trên web public vì vấn đề bảo mật
- Electron >= 12 đã loại bỏ hỗ trợ Flash, nếu dùng version mới cần downgrade hoặc dùng Ruffle

## Download Flash Player Files

### Windows
- File: `pepflashplayer.dll`
- Link: https://archive.org/details/flash-player-32.0.0.465-windows
- Hoặc: https://github.com/jindrapetrik/jpexs-decompiler/raw/dev/libsrc/flashplayerdebugger/flashplayer_32_sa_debug.exe

### Alternative: Sử dụng Flash Player Standalone
1. Download Flash Player Projector: https://www.adobe.com/support/flashplayer/debug_downloads.html
2. Chạy file `.swf` trực tiếp bằng Flash Player Projector

## Troubleshooting

### Flash không load
- Kiểm tra đường dẫn file `pepflashplayer.dll`
- Kiểm tra version Electron (cần < 12)
- Check console log xem có error

### CORS/CSP errors
- Đã disable web security trong BrowserWindow
- Nếu vẫn lỗi, thử thêm `--disable-features=OutOfBlinkCors` vào commandLine

### Plugin not found
- Đảm bảo file Flash plugin ở đúng đường dẫn
- Thử copy vào thư mục `node_modules/electron/dist/`
