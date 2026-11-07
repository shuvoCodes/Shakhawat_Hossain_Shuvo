# Portfolio Backend API

এই ডকুমেন্টে backend-এর বর্তমান API endpoint, method, request এবং কাজের বিবরণ দেওয়া হয়েছে।

## Base URL

Local development-এ:

```text
http://localhost:8000
```

FastAPI interactive docs: `http://localhost:8000/docs`

## Authentication

Protected endpoint-এ `Authorization: Bearer <access_token>` header পাঠান। Token 24 ঘণ্টা বৈধ থাকে।

Production-এ স্থায়ী, গোপন `AUTH_SECRET` environment variable সেট করুন। এটি না থাকলে (অথবা development placeholder ব্যবহার করলে) server একটি temporary key তৈরি করে; restart-এর পর আগের token আর কাজ করবে না এবং একাধিক worker-এর মধ্যে token share হবে না।

প্রথম admin account তৈরি করতে backend directory থেকে চালান:

```bash
python create_user.py <username> <password> admin
```

`admin` বাদ দিলে account-এর role হবে `user`। শুধু `admin` role-এর account-ই protected write endpoint ব্যবহার করতে পারে।

Project create/update/delete এবং image upload করার জন্য admin access token লাগবে। প্রথমে নিচের login endpoint-গুলোর যেকোনো একটি ব্যবহার করে token নিন। Protected endpoint-এ header পাঠান:

```http
Authorization: Bearer <access_token>
```

Token 24 ঘণ্টা বৈধ থাকে।

### `POST /auth/login`

JSON body দিয়ে login করে।

**Request**

```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Response**

```json
{
  "access_token": "<token>",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### `POST /auth/token`

OAuth2 password form দিয়ে login করে। `Content-Type: application/x-www-form-urlencoded` হিসেবে `username` ও `password` পাঠান। Response `/auth/login`-এর মতোই।

### `GET /auth/me`

বর্তমান token-এর user-এর তথ্য দেয়। Bearer token প্রয়োজন।

**Response**

```json
{
  "id": 1,
  "username": "admin",
  "role": "admin"
}
```

## Projects

একটি project-এর response shape:

```json
{
  "id": 1,
  "title": "Courier Platform",
  "description": "Courier management platform...",
  "category": "frontend",
  "status": "in_progress",
  "featured": true,
  "priority": 10,
  "features": [
    {
      "title": "Parcel tracking",
      "description": "Track parcel delivery status."
    }
  ],
  "technologies": ["React", "Tailwind CSS"],
  "images": [
    {
      "image_url": "https://api.example.com/uploads/project.jpg"
    }
  ],
  "live_url": "https://example.com",
  "frontend_source_url": "https://github.com/example/courier-frontend",
  "backend_source_url": "https://github.com/example/courier-backend",
  "github_url": "https://github.com/example/courier-frontend"
}
```

`github_url`-ও পুরোনো client-এর compatibility-র জন্য frontend source URL হিসেবে গ্রহণ করা হয় এবং response-এ ফেরত দেওয়া হয়। নতুন client-এ `frontend_source_url` ব্যবহার করুন। `title` সর্বোচ্চ 200, `description` 5000, `category` 100 এবং `status` 50 character হতে পারে; URL field সর্বোচ্চ 2048 character।

### `POST /projects`

নতুন project তৈরি করে। Admin token প্রয়োজন। `title` ও `description` আবশ্যক; বাকি field ঐচ্ছিক।

**Request**

```json
{
  "title": "Courier Platform",
  "description": "Courier management platform...",
  "category": "frontend",
  "status": "in_progress",
  "featured": true,
  "priority": 10,
  "features": [
    {
      "title": "Parcel tracking",
      "description": "Track parcel delivery status."
    },
    {
      "title": "Responsive design",
      "description": "Works across mobile, tablet, and desktop."
    }
  ],
  "technologies": ["React", "Tailwind CSS"],
  "images": [
    {
      "image_url": "https://api.example.com/uploads/project.jpg"
    }
  ],
  "live_url": "https://example.com",
  "frontend_source_url": "https://github.com/example/courier-frontend",
  "backend_source_url": "https://github.com/example/courier-backend"
}
```

`features`, `technologies` এবং `images` না পাঠালে খালি list হবে। `category`-এর default `frontend`, `status`-এর default `in_progress`, `featured`-এর default `false`, `priority`-এর default `0`। সফল হলে `201 Created` দিয়ে সম্পূর্ণ project object ফেরত দেয়।

### `GET /projects/all`

সব project সম্পূর্ণ detail-সহ ফেরত দেয়। বেশি `priority`-র project আগে আসে; priority সমান হলে ছোট ID আগে আসে। Project না থাকলে `404` ফেরত দেয়।

### `GET /projects/{project_id}`

ID অনুযায়ী একটি project-এর সম্পূর্ণ detail ফেরত দেয়। না পাওয়া গেলে `404`।

### `PATCH /projects/{project_id}`

Project-এর নির্বাচিত field update করে। Admin token প্রয়োজন। শুধু পরিবর্তন করতে চাওয়া field-গুলো পাঠান; বাদ দেওয়া field অপরিবর্তিত থাকবে।

```json
{
  "status": "completed",
  "featured": true,
  "priority": 20,
  "technologies": ["React", "FastAPI"],
  "features": [
    {
      "title": "Live tracking",
      "description": "Track parcels in real time."
    }
  ]
}
```

- `priority` বাড়ালে project list-এ project উপরে দেখাবে।
- `features` পাঠালে আগের feature list সম্পূর্ণ replace হবে।
- `technologies` পাঠালে আগের technology list সম্পূর্ণ replace হবে।
- `images` পাঠালে আগের image list সম্পূর্ণ replace হবে। নতুন list-এ না থাকা পুরোনো local `/uploads/` image file-গুলো মুছে যাবে। কোনো পুরোনো local image রাখতে চাইলে সেটির `image_url` নতুন list-এ রাখুন। `"images": []` দিলে সব image সরানো হবে।
- `live_url`, `frontend_source_url` বা `backend_source_url` `null` দিলে ওই URL মুছে যাবে। `github_url`-এর মাধ্যমে frontend source URL-ও update/মুছে দেওয়া যাবে। অন্য field-এ `null` পাঠানো যাবে না।

সফল হলে সম্পূর্ণ updated project object ফেরত দেয়। Project না থাকলে `404`।

### `DELETE /projects/{project_id}`

Project ও তার feature, technology এবং image record মুছে দেয়। Project-এর local `/uploads/` image file-ও মুছে ফেলা হয়। Admin token প্রয়োজন। সফল হলে `204 No Content`; project না থাকলে `404`।

## Images

### `POST /projects/{project_id}/images`

Project-এ একটি image upload করে। Admin token প্রয়োজন। `multipart/form-data`-তে `file` নামে image পাঠান।

- JPG/JPEG, PNG, WEBP এবং GIF সমর্থিত।
- Request-এর content type এবং file-এর আসল image format মিলতে হবে।
- সর্বোচ্চ file size 5 MB।
- সফল হলে `201 Created` এবং image URL ফেরত দেয়।
- Project না থাকলে `404`; unsupported/invalid image হলে `400`; size সীমা ছাড়ালে `413`।

**Response**

```json
{
  "message": "Image uploaded successfully",
  "id": 5,
  "project_id": 1,
  "image_url": "http://localhost:8000/uploads/<generated-filename>.jpg"
}
```

**cURL**

```bash
curl -X POST "http://localhost:8000/projects/1/images" \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@project.jpg"
```

### `GET /projects/{project_id}/images`

Project-এর image list ফেরত দেয়। Project না থাকলে `404`।

প্রতিটি item-এর shape:

```json
{
  "id": 5,
  "project_id": 1,
  "image_url": "http://localhost:8000/uploads/<filename>.jpg"
}
```

### `PUT /projects/{project_id}/images/{image_id}`

Project-এর একটি image নতুন image দিয়ে replace করে। Admin token প্রয়োজন। `multipart/form-data`-তে `file` নামে নতুন image পাঠান। আগের image file অন্য কোনো image record ব্যবহার না করলে সেটিও মুছে যাবে।

```bash
curl -X PUT "http://localhost:8000/projects/1/images/5" \
  -H "Authorization: ******" \
  -F "file=@replacement.jpg"
```

সফল হলে image ID অপরিবর্তিত রেখে নতুন image URL ফেরত দেয়। Project বা ওই project-এর image না থাকলে `404`; unsupported/invalid image হলে `400`; size সীমা ছাড়ালে `413`।

### `DELETE /projects/{project_id}/images/{image_id}`

Project থেকে একটি image record মুছে দেয়। Admin token প্রয়োজন। অন্য কোনো image record একই local file ব্যবহার না করলে file-টিও disk থেকে মুছে যাবে। সফল হলে `204 No Content`; project বা ওই project-এর image না থাকলে `404`।

### `GET /uploads/{filename}`

Uploaded image file সরাসরি দেখায় বা download করে। এই route FastAPI static file serving দিয়ে সরবরাহ করা হয়।

## Common error responses

```json
{
  "detail": "Project not found"
}
```

- `401 Unauthorized`: token অনুপস্থিত, ভুল বা মেয়াদোত্তীর্ণ।
- `403 Forbidden`: valid token আছে, কিন্তু admin role নেই।
- `404 Not Found`: project/resource পাওয়া যায়নি।
- `422 Unprocessable Entity`: request field validation ব্যর্থ।
- `413 Payload Too Large`: uploaded image 5 MB-এর বেশি।
