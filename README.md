
## Quickstart (Development)

### 1) Install

```bash
npm install
```

### 2) Create `.env`

Copy:

```bash
cp .env.example .env
```

Set your values (DB, Redis, SECRET, etc.).

### 3) Run API + Worker

```bash
npm run dev
```

In another terminal:

```bash
npm run worker
```

### Health / Metrics

- `GET /health`
- `GET /ready`
- `GET /metrics` (Prometheus)

---

## Production (Docker)

```bash
cp .env.example .env
docker compose up -d --build
```

Services:
- API: `http://localhost:8080`
- Nginx reverse proxy: `http://localhost` (port 80)
- Prometheus: `http://localhost:9090`



## Structure

# routes استقبال apis وارسالها للمعالجة 
# function (legacy): ما زال موجود لحماية التوافق الخلفي.
# src/modules (new): نفس المحتوى لكن مع Architecture أنظف وتسمية صحيحة:
# - src/modules/chat
# - src/modules/notifications
# - src/modules/companies
# - src/modules/posts
# - src/modules/subscriptions
# firebase ربط المشروع من اجعل الاشعارات
middleware يضم بين طياتها جميع الوسائط التكاملية للتطبيق 
pdf يعمل على انشاء التقارير المالية للمشروع
sql يضم بين طياته جميع عمليات ربط قاعدة البيانات والتحكم باستخداماتها المختلفه من مدخلات وجلب وتعديل وحذف 








