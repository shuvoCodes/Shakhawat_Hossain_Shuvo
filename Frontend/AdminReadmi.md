# Admin Page Content: Portfolio Project Manager

Based on the portfolio's style (dark/light toggle, purple accent, "SHUVO / Full Stack Developer" branding) and the API endpoints.

---

## 1. Layout

**Sidebar:** Dashboard · Projects · Add Project · Settings · Back to Site

**Top bar:** "Admin Panel", theme toggle (sun/moon), and a "Logout" button. The admin session automatically logs out when its access token expires (24 hours).

The admin page includes project management only; workshop management is not shown because the documented backend does not provide workshop endpoints.

---

## 2. Dashboard (Overview)

**Heading:** Welcome back, Shuvo 👋
**Subtext:** Manage your portfolio projects, technologies, and images from one place.

| Card | Value |
|---|---|
| Total Projects | Loaded from the API |
| Technologies Used | Counted from the API response |
| Images Uploaded | Counted from the API response |
| Last Updated | Latest project update |

**Quick actions:** + New Project · View Portfolio

---

## 3. Projects List Page

**Heading:** Projects
**Subtext:** All projects shown on your portfolio.
**Button:** + Create Project

**Table columns:** ID · Title · Category · Technologies · Images · Status · Priority · Actions
**Row actions:** View · Add Tech · Upload Image

**Empty state:** "No projects yet. Create your first project to showcase your work."

---

## 4. Create Project Form (`POST /projects`)

**Heading:** Create New Project
**Subtext:** Fill in the details to add a project to your portfolio.

| Field | Type | Placeholder |
|---|---|---|
| Project Title | Text | e.g. E-commerce API |
| Short Description | Textarea | A brief summary of what the project does |
| Category | Text | frontend, backend, or full_stack |
| Status | Text | e.g. in_progress or completed |
| Priority | Number | 0 |
| Live URL | URL | https://yourproject.com |
| GitHub URL | URL | https://github.com/username/repo |
| Featured | Toggle | Show on homepage |
| Technologies | Text | Comma-separated names, e.g. React, FastAPI |
| Features | Repeatable title and description fields | e.g. Parcel tracking |

**Buttons:** Create Project · Cancel
**Success message:** "Project created successfully."
**Error message:** "Could not create project. Please check the fields and try again."

Create and edit requests send `category`, `status`, `featured`, `priority`, `features` (objects with `title` and `description`) and `technologies` (string array) in the project JSON body. Images are managed separately through the upload endpoint.

---

## 5. Project Details Page (`GET /projects/{project_id}`)

**Heading:** Project: {title}
**Tabs:** Overview · Technologies · Images

**Overview tab** shows the title, description, links, and created date.

### Technologies Tab

Technologies are included in `GET /projects/{project_id}`. Add one by sending the updated technology list to `PATCH /projects/{project_id}`; the endpoint does not require separate technology routes.

**Heading:** Technologies
**Subtext:** Tools and frameworks used in this project.

**Add form:**
- Field: Technology Name (e.g. FastAPI, React, PostgreSQL)
- Button: + Add Technology

**Display:** purple chips like the hero card (`FastAPI` `React` `PostgreSQL`)
**Empty state:** "No technologies added yet."

### Images Tab

Endpoints: `POST /projects/{project_id}/images` and `GET /projects/{project_id}/images`

**Heading:** Project Images
**Subtext:** Upload screenshots or previews (PNG, JPG, WEBP; max 5 MB).

**Upload area:** Choose an image file
**Button:** Upload Image
**Gallery:** thumbnail grid
**Success message:** "Image uploaded successfully."
**Empty state:** "No images uploaded yet."
**Supported formats:** JPG/JPEG, PNG, WEBP, GIF; maximum 5 MB.
Each existing image can be replaced using `PUT /projects/{project_id}/images/{image_id}` with the replacement file sent as `multipart/form-data` in the `file` field.
Use `DELETE /projects/{project_id}/images/{image_id}` to remove an image after confirming the action.

---

## 6. Settings Page (Optional)

- Display name: Shakhawat Hossain Shuvo
- Title: Full Stack Developer
- Availability toggle: "Open to work" (Full-time · Freelance · Collabs)
- Resume upload: Download Resume file
- Change password

---

## 7. Common UI Text

- Confirm dialog: "Are you sure you want to continue?" → Confirm / Cancel
- Loading: "Saving…"
- Footer: "© 2026 Shakhawat Hossain Shuvo. Admin Panel"

---

## API Endpoint Summary

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/login` | Sign in and receive an admin token |
| GET | `/projects/all` | List portfolio projects |
| POST | `/projects` | Create Project |
| GET | `/projects/{project_id}` | Get Project |
| PATCH | `/projects/{project_id}` | Update Project |
| DELETE | `/projects/{project_id}` | Delete Project |
| PATCH | `/projects/{project_id}` | Update project technologies |
| POST | `/projects/{project_id}/images` | Upload Image |
| GET | `/projects/{project_id}/images` | Get Project Images |
| PUT | `/projects/{project_id}/images/{image_id}` | Replace Project Image |
| DELETE | `/projects/{project_id}/images/{image_id}` | Delete Project Image |
