# 🐝 Beeyond Tech Ecommerce Backend

## 📦 Project Overview

A real-time quick commerce backend system that supports:

- 🛒 Customers placing and tracking orders live.
- 🚚 Delivery partners accepting and updating orders with real-time communication.
- 🛠️ Admins monitoring all order and delivery activities.

Built using Node.js (ESM), Express, MongoDB, JWT-based authentication, and Socket.io for real-time updates. The app is containerized with Docker and built to be hosted on a cloud VM with reverse proxy setup using Nginx.

---

## 🧱 Tech Stack Used

- **Node.js + Express (ESM)** for API and WebSocket server
- **MongoDB** for document-based order and user management
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Docker** for containerization
- **Winston** for logging
- **Nginx** (for deployment) as reverse proxy (setup during VM hosting)

---

## 🗂️ Folder Structure

```
nansmatty-beeyond_tech_ecommerce_backend/
├── docker-compose.yml
├── Dockerfile
├── eslint.config.mjs
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── @types/
│   │   └── express/
│   │       └── index.d.ts
│   ├── config/
│   │   ├── corsOptions.ts
│   │   ├── db.ts
│   │   ├── index.ts
│   │   └── logger.ts
│   ├── controllers/
│   │   ├── orderControllers.ts
│   │   ├── productControllers.ts
│   │   └── userControllers.ts
│   ├── middlewares/
│   │   ├── authMiddleware.ts
│   │   └── errorMiddleware.ts
│   ├── models/
│   │   ├── OrderModel.ts
│   │   ├── ProductModel.ts
│   │   └── UserModel.ts
│   ├── routes/
│   │   ├── orderRoutes.ts
│   │   ├── productRoutes.ts
│   │   └── userRoutes.ts
│   ├── socket/
│   │   └── setupSocketHandler.ts
│   └── utils/
│       ├── catchAsyncError.ts
│       ├── errorHandler.ts
│       └── generateAuthToken.ts
└── .husky/
    └── pre-commit
```

---

## 📥 Setup Instructions

### 🔐 Environment Variables

Create a `.env` file and add:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret
MONGODB_URI=mongodb://localhost:27017/beeyond_ecommerce
ACCESS_TOKEN_EXPIRY=10
```

### 🔧 Local Development

```bash
git clone https://github.com/nansmatty/beeyond_tech_ecommerce_backend.git
cd beeyond_tech_ecommerce_backend
docker-compose up --build
```

- API available at: `http://localhost:5000/api`
- Health check: `http://localhost:5000/api/health-check`

---

## 📡 WebSocket Flow Explanation

- Socket server runs on the same port as the API (`/socket.io` endpoint).
- Events:
  - **Customer:** `join_order:<orderId>`, `receive_order_update`
  - **Delivery Partner:** `join_partner:<partnerId>`, `accept_order`, `update_order_status`
  - **Broadcasts:** Socket.io emits order updates to customer and admin when:
    - Order is accepted (locked)
    - Status is updated (Picked up → On the Way → Delivered)

---

## 🚀 Hosting & Deployment

- Use **AWS EC2 / GCP / Azure / DigitalOcean VM**.
- Install **Docker, Docker Compose**, and **Nginx** on the VM.
- Backend runs with Docker Compose.
- Nginx configured on the server as a reverse proxy to:
  - Forward `/api` to Node.js backend container
  - Forward `/socket.io` WebSocket connections
  - Serve frontend (when added)

> 🔒 Ensure firewall allows ports 80 (HTTP), 443 (HTTPS), and 5000 (API if exposed directly).

---

## 🔗 GitHub Repo

[https://github.com/nansmatty/beeyond_tech_ecommerce_backend](https://github.com/nansmatty/beeyond_tech_ecommerce_backend)

---

## ✨ Future Improvements

- Adding more features related to monitoring, reviewing, payment gateway integration, rate-limiting, Redis for faster query results, message brokers like RabbitMQ/Kafka for task queuing, admin analytics dashboard, socket reconnection handling, unit testing with Jest, role-based permission refinements, and container health monitoring.
