# Shuvo Portfolio — Full-Stack Project

এটি Shakhawat Hossain Shuvo-এর personal portfolio website। Frontend-এ portfolio, project archive এবং admin panel আছে; Backend-এ project data, authentication এবং image upload-এর REST API আছে।

## কী কী আছে

- **Portfolio (`/`)** — পরিচিতি, দক্ষতা, project highlights, resume এবং contact section।
- **Project archive (`/projects`)** — API থেকে project দেখায়; category অনুযায়ী filter করা যায়।
- **Admin panel (`/admin`)** — admin account দিয়ে sign in করে project তৈরি, edit, delete এবং image manage করা যায়।
- **REST API** — project, feature, technology ও image data পরিচালনা করে।
- **Authentication** — admin-only write endpoint-গুলোর জন্য ২৪ ঘণ্টা মেয়াদি bearer token।
- **Dark/light theme** — browser-এ পছন্দ সংরক্ষিত থাকে।

## প্রযুক্তি

| অংশ | প্রযুক্তি |
|---|---|
| Frontend | React 18, Vite, React Router, Tailwind CSS |
| Backend | Python, FastAPI, Pydantic, SQLAlchemy |
| Database | SQLite (`Backend/personal.db`) |
| Image processing | Pillow |

## Folder structure

```text
.
├── Backend/
│   ├── main.py           # FastAPI app এবং project endpoints
│   ├── Auth.py           # Login, token ও admin authorization
│   ├── Upload.py         # Project image upload/update/delete
│   ├── models.py         # SQLAlchemy database models
│   ├── database.py       # SQLite connection এবং schema migration
│   ├── create_user.py    # User/admin account তৈরি
│   ├── personal.db       # SQLite database
│   └── Uploads/          # Uploaded image files
└── Frontend/
    ├── src/
    │   ├── Admin.jsx
    │   ├── Portfolio.jsx
    │   ├── Projects.jsx
    │   └── ...
    ├── public/           # Static images এবং resume
    └── package.json
```

## Local setup (Windows PowerShell)

Backend ও frontend আলাদা terminal-এ চালান।

প্রয়োজন: Python 3.10 বা তার পরের সংস্করণ এবং Node.js 18 বা তার পরের সংস্করণ (npm-সহ)।

### ১. Backend চালু করুন

```powershell
cd Backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install fastapi "uvicorn[standard]" sqlalchemy pillow python-multipart
```

Production-এর মতো স্থায়ী signing key দিয়ে চালাতে প্রতিটি backend terminal-এ একটি গোপন `AUTH_SECRET` সেট করুন। একই key server restart এবং worker-গুলোর মধ্যে অপরিবর্তিত রাখতে হবে:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
$env:AUTH_SECRET = "<উপরের command-এর output এখানে বসান>"
uvicorn main:app --reload
```

Backend চালু হলে:

- API: <http://127.0.0.1:8000>
- Interactive API documentation: <http://127.0.0.1:8000/docs>

`AUTH_SECRET` সেট না করলে backend অস্থায়ী key ব্যবহার করে; restart-এর পর আগের token আর বৈধ থাকবে না। Production-এ অবশ্যই স্থায়ী secret configure করুন এবং source control-এ রাখবেন না।

প্রথম command-টি একটি random secret তৈরি করে; সেটির output-কে `$env:AUTH_SECRET`-এর value হিসেবে বসান।

### ২. Admin account তৈরি করুন

Backend folder-এ আরেকটি terminal খুলে virtual environment activate করে চালান:

```powershell
cd Backend
.\.venv\Scripts\Activate.ps1
python create_user.py shuvo your-strong-password admin
```

`shuvo` ও `your-strong-password`-এর জায়গায় নিজের পছন্দের username ও password দিন। Password-এর মধ্যে space থাকলে quote ব্যবহার করুন। `admin` role না দিলে account তৈরি হবে সাধারণ `user` হিসেবে, যে admin-only project পরিবর্তন করতে পারবে না। Admin panel-এ এই username ও password দিয়েই sign in করুন।

> PowerShell-এ virtual environment activation policy-তে বাধা দিলে activation বাদ দিয়ে `.venv\Scripts\python.exe -m pip ...` এবং `.venv\Scripts\python.exe create_user.py ...` ব্যবহার করা যায়।

### ৩. Frontend চালু করুন

আরেকটি terminal-এ:

```powershell
cd Frontend
npm install
npm run dev
```

Vite যে local URL দেখায় সেটি browser-এ খুলুন (সাধারণত <http://localhost:5173>)। Development-এ `/api` request স্বয়ংক্রিয়ভাবে `http://127.0.0.1:8000` backend-এ proxy হয়; আলাদা API URL configure করা না থাকলে অতিরিক্ত কিছু সেট করার দরকার নেই।

### ব্যবহার

| URL | কী দেখায় |
|---|---|
| `/` | Portfolio homepage |
| `/projects` | সব portfolio project |
| `/admin` | Admin sign-in এবং project management |
| `http://127.0.0.1:8000/docs` | API পরীক্ষা করার interactive Swagger UI |

## Project পরিচালনা ও API

Admin panel project-এর title, description, category, status, priority, featured flag, live/source URL, technologies এবং feature list manage করে। Project image আলাদাভাবে upload, replace বা delete করা যায়।

প্রধান endpoint-গুলো:

| Method | Endpoint | কাজ |
|---|---|---|
| `POST` | `/auth/login` | Username/password দিয়ে login |
| `GET` | `/auth/me` | Token-এর user তথ্য |
| `GET` | `/projects/all` | Project list |
| `GET` | `/projects/{project_id}` | Project detail |
| `POST` | `/projects` | Project তৈরি (admin) |
| `PATCH` | `/projects/{project_id}` | Project update (admin) |
| `DELETE` | `/projects/{project_id}` | Project delete (admin) |
| `GET` | `/projects/{project_id}/images` | Project-এর image list |
| `POST` | `/projects/{project_id}/images` | Image upload (admin) |
| `PUT` | `/projects/{project_id}/images/{image_id}` | Image replace (admin) |
| `DELETE` | `/projects/{project_id}/images/{image_id}` | Image delete (admin) |

Protected endpoint-এ login response-এর `access_token` ব্যবহার করে bearer token পাঠাতে হয়। Image upload `multipart/form-data`-র `file` field নেয়; JPG/JPEG, PNG, WEBP ও GIF সমর্থিত, সর্বোচ্চ ৫ MB। বিস্তারিত request/response উদাহরণের জন্য [Backend API guide](Backend/APIsReadme.md) দেখুন।

## Configuration

Frontend-এর API base URL `VITE_API_BASE_URL` environment variable দিয়ে বদলানো যায়। আলাদা backend origin ব্যবহার করলে frontend command চালানোর আগে সেট করুন:

```powershell
$env:VITE_API_BASE_URL = "https://your-api.example.com"
npm run dev
```

Production build-এর জন্য build করার আগেও একই variable configure করতে হবে:

```powershell
$env:VITE_API_BASE_URL = "https://your-api.example.com"
npm run build
```

Frontend build `Frontend/dist/`-এ তৈরি হয়। Production-এ backend-এর CORS allowed origins-এ frontend domain যোগ করুন (`Backend/main.py`), HTTPS ব্যবহার করুন এবং স্থায়ী `AUTH_SECRET` configure করুন। Frontend-কে শুধু static host-এ deploy করলেই API/database চালু হয় না—Backend-ও deploy করতে হবে।

## Data ও deployment সংক্রান্ত নোট

- Backend startup-এ database table তৈরি করে এবং আগের database-এ project-এর নতুন column থাকলে migration চালায়।
- SQLite database path `Backend/personal.db`; database file backup করে রাখুন।
- Uploaded image `Backend/Uploads/`-এ থাকে। Database এবং এই folder দুটোই persistent storage-এ রাখতে হবে; ephemeral hosting-এ redeploy হলে ফাইল হারাতে পারে।
- `/projects/all`-এ কোনো project না থাকলে API `404` ফেরত দেয়।
- Admin screen লুকানো থাকাই access control নয়; write endpoint-গুলো backend-এ admin role দিয়ে সুরক্ষিত।
- `AUTH_SECRET`, password বা অন্য secret কখনো Git-এ commit করবেন না।

## আরও তথ্য

- [Frontend README](Frontend/README.md)
- [Admin/API behavior guide](Frontend/AdminReadmi.md)
- [Backend API reference](Backend/APIsReadme.md)
