# API Guide

Practical, example-driven reference for authenticating against the TaxDibo backend and calling each endpoint. For architecture/internals see `CLAUDE.md`; for setup see `README.md`.

Base URL used below: `http://localhost:8080`

## 1. Authentication model

- The API is **stateless**: every request that isn't under `/api/auth/**` must carry a JWT in the `Authorization` header.
- You get a JWT from one of three endpoints: register, login, or Google sign-in. All three return the token in the same shape.
- Tokens expire after `jwt.expiration-ms` (default 24h, see `application.properties`). There is no refresh-token endpoint yet — the client re-authenticates when the token expires (401).
- Roles: every new account is `USER`. `ADMIN` unlocks the "see everything" views (`GET /api/users`, all appointments, all documents). There's no self-service way to become ADMIN — it's set directly on the `users.role` column in the database.

Once you have a token, send it on every subsequent request:

```
Authorization: Bearer <accessToken>
```

## 2. Register (email/password)

```
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Rafsun Jani",
  "email": "rafsun@example.com",
  "password": "SuperSecret123",
  "phone": "+8801711000000",
  "company": "QuestionPro",
  "address": "Dhaka, Bangladesh"
}
```

`company` and `address` are optional; everything else is required. Password must be 8+ characters.

**201 Created**

```json
{
  "tokenType": "Bearer",
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "Rafsun Jani",
    "email": "rafsun@example.com",
    "phone": "+8801711000000",
    "TIN": null
  }
}
```

**409 Conflict** — email already registered:

```json
{
  "timestamp": "2026-07-26T10:15:00",
  "status": 409,
  "message": "An account with this email already exists"
}
```

## 3. Login (email/password)

```
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "rafsun@example.com",
  "password": "SuperSecret123"
}
```

**200 OK** — same shape as register's response.

**401 Unauthorized** — wrong email/password, or the account was created via Google only (no password set):

```json
{
  "timestamp": "2026-07-26T10:16:00",
  "status": 401,
  "message": "Invalid email or password"
}
```

## 4. Google Sign-In

The frontend runs the Google Sign-In flow itself (e.g. Google Identity Services JS) and obtains a Google **ID token** — the backend never talks to Google except to verify that token.

```
POST /api/auth/google
Content-Type: application/json
```

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

Behavior:

- Token is verified against Google's `tokeninfo` endpoint; the `aud` claim must match `google.oauth.client-id` in `application.properties`, and the email must be Google-verified.
- If no user exists with that email, one is created automatically (`provider=GOOGLE`, no password — so that account can only ever log in via Google, not `/api/auth/login`).
- If a user already exists with that email (e.g. registered locally first), Google sign-in just links to that same account and logs them in.

**200 OK** — same `{ tokenType, accessToken, user }` shape as register/login.

**401 Unauthorized** — invalid/expired token, wrong audience, or unverified email:

```json
{
  "timestamp": "2026-07-26T10:17:00",
  "status": 401,
  "message": "Google ID token was not issued for this application"
}
```

## 5. Users — `GET /api/users` (ADMIN only)

```
GET /api/users?page=0&size=20
Authorization: Bearer <admin token>
```

**200 OK**

```json
[
  {
    "id": 1,
    "name": "Rafsun Jani",
    "email": "rafsun@example.com",
    "phone": "+8801711000000",
    "TIN": null
  },
  {
    "id": 2,
    "name": "Another User",
    "email": "another@example.com",
    "phone": "+8801711000001",
    "TIN": "1234567890"
  }
]
```

**403 Forbidden** if called with a non-ADMIN token:

```json
{
  "timestamp": "2026-07-26T10:18:00",
  "status": 403,
  "message": "You do not have permission to perform this action"
}
```

## 6. Book an appointment — `POST /api/appointments`

```
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "Rafsun Jani",
  "email": "rafsun@example.com",
  "phone": "+8801711000000",
  "tin": "123456789012",
  "purpose": "TAX_SUBMISSION",
  "appointmentDate": "2026-08-10"
}
```

- `tin` must be exactly 10 digits (old format) or 12 digits (e-TIN).
- `purpose` is one of `TAX_SUBMISSION` (default), `TAX_CONSULTATION`, `DOCUMENT_REVIEW`, `OTHER`.
- `appointmentDate` is an ISO date (`yyyy-MM-dd`) and cannot be in the past.
- A user can hold multiple appointments (e.g. one `TAX_SUBMISSION` + one `TAX_CONSULTATION`); there's no one-active-appointment restriction.

**201 Created**

```json
{
  "id": 10,
  "userId": 1,
  "name": "Rafsun Jani",
  "email": "rafsun@example.com",
  "phone": "+8801711000000",
  "tin": "123456789012",
  "purpose": "TAX_SUBMISSION",
  "appointmentDate": "2026-08-10",
  "status": "PENDING",
  "createdAt": "2026-07-26T10:20:00"
}
```

**400 Bad Request** — validation failure (e.g. bad TIN):

```json
{
  "timestamp": "2026-07-26T10:21:00",
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "tin": "TIN must be a 10-digit (old format) or 12-digit (e-TIN) number"
  }
}
```

## 7. List appointments — `GET /api/appointments`

```
GET /api/appointments?status=PENDING&fromDate=2026-08-01&toDate=2026-08-31&page=0&size=20&sort=appointmentDate,asc
Authorization: Bearer <token>
```

All query params are optional. As a regular `USER` you always see only your own appointments; as `ADMIN` you see everyone's.

**200 OK** (paginated — Spring Data `Page` shape)

```json
{
  "content": [
    {
      "id": 10,
      "userId": 1,
      "name": "Rafsun Jani",
      "email": "rafsun@example.com",
      "phone": "+8801711000000",
      "tin": "123456789012",
      "purpose": "TAX_SUBMISSION",
      "appointmentDate": "2026-08-10",
      "status": "PENDING",
      "createdAt": "2026-07-26T10:20:00"
    }
  ],
  "pageable": { "pageNumber": 0, "pageSize": 20 },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true
}
```

## 8. Upload a document — `POST /api/documents/upload`

```
POST /api/documents/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary>
```

curl example:

```bash
curl -X POST http://localhost:8080/api/documents/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/tax-return.pdf"
```

- Allowed content types: `application/pdf`, `image/jpeg`, `image/png`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX).
- Max size: 10MB (`spring.servlet.multipart.max-file-size`).
- Files are saved on local disk under `file.upload-dir` (per-user subfolder); only the metadata below is stored in the response/DB.

**201 Created**

```json
{
  "id": 5,
  "userId": 1,
  "originalFileName": "tax-return.pdf",
  "contentType": "application/pdf",
  "fileSize": 245678,
  "uploadedAt": "2026-07-26T10:25:00"
}
```

**400 Bad Request** — unsupported type or empty file:

```json
{
  "timestamp": "2026-07-26T10:26:00",
  "status": 400,
  "message": "Unsupported file type: text/plain. Allowed types: PDF, JPEG, PNG, DOC, DOCX"
}
```

## 9. List documents — `GET /api/documents`

```
GET /api/documents?page=0&size=20
Authorization: Bearer <token>
```

- Regular `USER`: always scoped to their own documents (any `userId` query param is ignored).
- `ADMIN`: omit `userId` to see every document, or pass `?userId=3` to see only user 3's documents.

**200 OK** — same paginated shape as appointments, `content` items shaped like the upload response above.

## 10. Download a document — `GET /api/documents/{id}/download`

```
GET /api/documents/5/download
Authorization: Bearer <token>
```

**200 OK** — raw file bytes, with `Content-Type` set to the stored content type and `Content-Disposition: attachment; filename="tax-return.pdf"`.

**403 Forbidden** if a `USER` tries to download another user's document:

```json
{
  "timestamp": "2026-07-26T10:27:00",
  "status": 403,
  "message": "You do not have permission to perform this action"
}
```

**404 Not Found** if the document ID doesn't exist:

```json
{
  "timestamp": "2026-07-26T10:28:00",
  "status": 404,
  "message": "Document not found: 5"
}
```

## 11. Error response shapes, at a glance

| Status | When         | Body                                                                                                                   |
| ------ | ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| 400    | Bad Request  | Validation errors (`{ ..., errors: { field: message } }`) or business rule violations (bad file type, malformed input) |
| 401    | Unauthorized | Missing/invalid/expired JWT, or wrong login credentials                                                                |
| 403    | Forbidden    | Authenticated, but not allowed to touch this resource (wrong role, or someone else's data)                             |
| 404    | Not Found    | Referenced resource (e.g. a document ID) doesn't exist                                                                 |
| 409    | Conflict     | Duplicate resource (e.g. registering an email that's already taken)                                                    |

Every error body is `{ "timestamp": ..., "status": ..., "message": ... }`, with an added `"errors"` map for field-level validation failures.
