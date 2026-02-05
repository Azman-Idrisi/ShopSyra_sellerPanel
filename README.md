# ShopSyra Seller Panel

A modern seller dashboard for managing products, uploads, and account details. Built with React Native (Expo Router) and a Node/Express backend.

## Features
- OTP-based seller sign in
- Product management with image uploads
- Seller profile dashboard
- Clean, modern UI

## Tech Stack
- Frontend: React Native (Expo), Tailwind (NativeWind), Axios
- Backend: Node.js, Express, MongoDB, Cloudinary

## Project Structure
```
app/              # Expo Router screens
backend/          # Express API and DB
api/              # Axios client
```

## Upload Flow
Images are selected in the app, uploaded to the backend, and stored in Cloudinary. The backend returns a secure URL which is saved in `imgUrls`.


