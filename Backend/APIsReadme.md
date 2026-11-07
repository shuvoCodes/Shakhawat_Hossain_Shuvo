# Portfolio Backend API

This document describes the backend API endpoints, request formats, and responses.

## Base URL

For local development:

```text
http://localhost:8000
```

FastAPI interactive documentation: <http://localhost:8000/docs>

## Authentication

Protected endpoints require this header:

```http
Authorization: Bearer <access_token>
```

Tokens expire after 24 hours. Configure a persistent, private `AUTH_SECRET` environment variable in production. If it is missing or set to the development placeholder, the server creates a temporary signing key. Tokens will stop working after a restart, and multiple workers will not share the temporary key.

Create an admin account from the `Backend` directory:

```bash
python create_user.py <username> <password> admin
```

If the role is omitted, the account is created as a regular `user`. Only accounts with the `admin` role can use protected write endpoints.

Use either of the following login endpoints to obtain an access token.

### `POST /auth/login`

Sign in using a JSON request body.

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

Sign in using an OAuth2 password form. Send `username` and `password` as `application/x-www-form-urlencoded`. The response has the same shape as `/auth/login`.

### `GET /auth/me`

Return information about the user associated with the current token. A bearer token is required.

**Response**

```json
{
  "id": 1,
  "username": "admin",
  "role": "admin"
}
```

## Projects

A project response has this shape:

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

For compatibility with older clients, `github_url` is accepted as an alias for the frontend source URL and is also returned in responses. New clients should use `frontend_source_url`. Maximum lengths are 200 characters for `title`, 5,000 for `description`, 100 for `category`, 50 for `status`, and 2,048 for URL fields.

### `POST /projects`

Create a project. An admin token is required. `title` and `description` are required; all other fields are optional.

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

If omitted, `features`, `technologies`, and `images` default to empty lists. Defaults are `frontend` for `category`, `in_progress` for `status`, `false` for `featured`, and `0` for `priority`. On success, the endpoint returns the complete project with `201 Created`.

### `GET /projects/all`

Return all projects with their details. Projects are sorted by descending priority and then ascending ID. Returns `404` when no projects exist.

### `GET /projects/{project_id}`

Return a project's full details by ID. Returns `404` if the project does not exist.

### `PATCH /projects/{project_id}`

Update selected project fields. An admin token is required. Include only fields to change; omitted fields remain unchanged.

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

- Increasing `priority` moves a project higher in the project list.
- Sending `features` replaces the existing feature list.
- Sending `technologies` replaces the existing technology list.
- Sending `images` replaces the existing image list. Old local `/uploads/` files that are not included in the new list are deleted. Keep a file by including its `image_url` in the replacement list. Sending `"images": []` removes all images.
- Sending `null` for `live_url`, `frontend_source_url`, or `backend_source_url` clears that URL. `github_url` can also be used to update or clear the frontend source URL. Other fields cannot be `null`.

On success, the endpoint returns the complete updated project. Returns `404` if the project does not exist.

### `DELETE /projects/{project_id}`

Delete the project and its feature, technology, and image records. Local `/uploads/` files belonging only to this project are also deleted. An admin token is required. Returns `204 No Content` on success or `404` if the project does not exist.

## Images

### `POST /projects/{project_id}/images`

Upload an image to a project. An admin token is required. Send the image in the `file` field as `multipart/form-data`.

- Supported formats: JPG/JPEG, PNG, WEBP, and GIF.
- The request content type must match the actual image format.
- Maximum file size: 5 MB.
- On success, returns `201 Created` and the image URL.
- Returns `404` if the project does not exist, `400` for an unsupported or invalid image, and `413` if the size limit is exceeded.

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

Return a project's image list. Returns `404` if the project does not exist.

Each item has this shape:

```json
{
  "id": 5,
  "project_id": 1,
  "image_url": "http://localhost:8000/uploads/<filename>.jpg"
}
```

### `PUT /projects/{project_id}/images/{image_id}`

Replace a project image. An admin token is required. Send the replacement image in the `file` field as `multipart/form-data`. The old file is deleted if no other image record references it.

```bash
curl -X PUT "http://localhost:8000/projects/1/images/5" \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@replacement.jpg"
```

On success, the endpoint returns the new image URL and keeps the existing image ID. Returns `404` if the project or its image does not exist, `400` for an unsupported or invalid image, and `413` if the size limit is exceeded.

### `DELETE /projects/{project_id}/images/{image_id}`

Delete an image record from a project. An admin token is required. The file is also deleted from disk if no other image record references it. Returns `204 No Content` on success or `404` if the project or image does not exist.

### `GET /uploads/{filename}`

Serve or download an uploaded image file. This route is provided by FastAPI static file serving.

## Common error responses

```json
{
  "detail": "Project not found"
}
```

- `401 Unauthorized`: the token is missing, invalid, or expired.
- `403 Forbidden`: the token is valid, but the user does not have the admin role.
- `404 Not Found`: the requested project or resource does not exist.
- `422 Unprocessable Entity`: request field validation failed.
- `413 Payload Too Large`: the uploaded image exceeds 5 MB.
