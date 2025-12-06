# Electron + Vue 3 + Vite + TailwindCSS + Flowbite

Ứng dụng desktop được xây dựng với Electron, Vue 3, Vite, TailwindCSS và Flowbite.

## Công Nghệ Sử Dụng

- **Electron** - Framework xây dựng ứng dụng desktop đa nền tảng
- **Vue 3** - Progressive JavaScript framework
- **Vite** - Build tool cực nhanh cho frontend
- **TailwindCSS** - Utility-first CSS framework
- **Flowbite** - Component library dựa trên TailwindCSS

## Cấu Trúc Thư Mục

```
LaucherGunny/
├── electron/           # Electron main & preload scripts
│   ├── main.js        # Electron main process
│   └── preload.js     # Preload script
├── src/               # Vue source code
│   ├── App.vue        # Root component
│   ├── main.js        # Vue entry point
│   └── style.css      # TailwindCSS imports
├── index.html         # HTML template
├── vite.config.js     # Vite configuration
├── tailwind.config.js # TailwindCSS configuration
├── postcss.config.js  # PostCSS configuration
└── package.json       # Dependencies & scripts
```

## Cài Đặt

```bash
npm install
```

## Chạy Ứng Dụng

### Development Mode

```bash
npm run dev
```

Lệnh này sẽ:
- Khởi động Vite dev server
- Build Electron main & preload scripts
- Mở cửa sổ Electron với hot-reload

### Build Production

```bash
npm run build
```

## Tính Năng

✅ Hot Module Replacement (HMR) với Vite  
✅ TailwindCSS với Flowbite components  
✅ Electron với context isolation  
✅ Vue 3 Composition API ready  
✅ TypeScript ready (có thể thêm sau)

## Scripts

- `npm run dev` - Chạy ứng dụng ở development mode
- `npm run build` - Build ứng dụng cho production
- `npm run preview` - Preview production build

## Customization

### Thay Đổi Giao Diện

Edit `src/App.vue` để thay đổi UI. Project đã tích hợp sẵn TailwindCSS và Flowbite components.

### Thêm Electron APIs

Edit `electron/preload.js` để expose thêm Electron APIs vào renderer process một cách an toàn.

### Cấu Hình Window

Edit `electron/main.js` để thay đổi kích thước, vị trí hoặc các thuộc tính khác của cửa sổ Electron.

## Tài Liệu Tham Khảo

- [Electron Documentation](https://www.electronjs.org/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Flowbite Components](https://flowbite.com/)

## License

MIT
