# Form Management (form-management-fe)

Frontend cho hệ thống quản lý form, gọi API từ repo `form-management-api`. Xây bằng Quasar CLI (Vite) + Pinia, layout/pages/router/api theo cùng convention với các project OTA khác.

## Requirements
- Node.js 22.x
- npm

## Configuration
Create `.env` file in project root
```.env
API_URL=http://localhost:5000
```

## Setup
`npm install`

## Run
##### Dev server
`npm start`

(tương đương `npm run dev`, chạy ở `http://localhost:8080` — đổi port trong `quasar.config.js` → `devServer.port` nếu cần, nhớ sửa `CORS_ORIGINS` bên backend `.env` cho khớp)

##### Build production
`npm run build`
