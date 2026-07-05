# Form Management (form-management-fe)

Frontend cho hệ thống quản lý form, gọi API từ repo `form-management-api`. Admin vào tạo form, thêm field, nhân viên xem form active rồi điền và nộp. Xây bằng Quasar CLI (Vite) + Pinia.

## Chuẩn bị

Cần Node.js 22.x và npm. Backend (`form-management-api`) phải chạy sẵn trước, mặc định ở `http://localhost:5000`.

## Cấu hình

Tạo file `.env` ở thư mục gốc:
```
API_URL=http://localhost:5000
```

## Cài & chạy

```
npm install
npm start
```

`npm start` với `npm run dev` là như nhau, chạy Quasar dev server ở `http://localhost:8080`.

Muốn đổi port thì sửa `devServer.port` trong `quasar.config.js`, nhớ sửa luôn `CORS_ORIGINS` bên `.env` của backend cho khớp, không thì bị chặn CORS.

Build production: `npm run build`.

## Cấu trúc

Theo convention pages/layouts/router/store quen thuộc của Quasar:

- `src/pages/` mỗi trang 1 folder, file chính là `index.vue`
- `src/layouts/MainLayout.vue` là layout chung (header, nav, nút logout)
- `src/stores/auth.js` là Pinia store giữ token với thông tin user
- `src/services/` gọi API, tách theo từng resource: `base.js` là class `Service` dùng chung (axios instance, gắn token, xử lý 401), `auth.js`/`form.js`/`field.js`/`submission.js` extend từ đó, mỗi file chỉ chứa các hàm liên quan tới resource của nó
- `src/composables/use-services.js` khởi tạo các service kèm `authStore`/`router`, component nào cần gọi API thì import composable này rồi lấy đúng service cần dùng

Login xong token lưu vào store (và localStorage), các trang khác dùng lại token đó để gọi API, hết hạn hoặc bị 401 thì tự đá về trang login.
