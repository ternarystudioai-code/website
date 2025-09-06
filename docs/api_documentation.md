# Ternary Website API Documentation

## Overview

This documentation covers all API endpoints available in the Ternary website, organized by functionality. All endpoints are implemented as Next.js serverless functions in the `app/api/` directory.

## Authentication

Most API endpoints require authentication. Authentication is handled through Supabase Auth with Bearer tokens.

### Headers

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Release Management API

### Get Releases

Fetch all releases from the configured GitHub repository.

**Endpoint**: `GET /api/releases`

**Response**:
```json
{
  "stable": [
    {
      "id": 123456,
      "tag_name": "v1.0.0",
      "name": "Version 1.0.0",
      "body": "Release notes...",
      "published_at": "2023-01-01T00:00:00Z",
      "html_url": "https://github.com/owner/repo/releases/tag/v1.0.0",
      "prerelease": false,
      "assets": [
        {
          "id": 789012,
          "name": "ternary-windows.exe",
          "size": 123456789,
          "content_type": "application/octet-stream",
          "download_url": "/api/download?asset_id=789012"
        }
      ]
    }
  ],
  "beta": [
    {
      "id": 123457,
      "tag_name": "v1.0.1-beta",
      "name": "Version 1.0.1 Beta",
      "body": "Beta release notes...",
      "published_at": "2023-01-02T00:00:00Z",
      "html_url": "https://github.com/owner/repo/releases/tag/v1.0.1-beta",
      "prerelease": true,
      "assets": [
        {
          "id": 789013,
          "name": "ternary-windows-beta.exe",
          "size": 123456790,
          "content_type": "application/octet-stream",
          "download_url": "/api/download?asset_id=789013"
        }
      ]
    }
  ]
}
```

**Errors**:
- 500: Server not configured with GitHub credentials
- 401/404: GitHub API authentication or repository not found

### Download Asset

Stream a release asset from GitHub through a secure proxy.

**Endpoint**: `GET /api/download?asset_id=<id>`

**Parameters**:
- `asset_id` (required): The GitHub asset ID

**Response**:
- Binary stream of the asset file
- Headers from the original GitHub response (Content-Type, Content-Disposition, etc.)

**Errors**:
- 400: Missing asset_id parameter
- 500: Server not configured with GitHub credentials
- 502: Missing redirect location from GitHub
- Various GitHub API errors

## Device Linking API

### Initialize Link

Create a new device linking request.

**Endpoint**: `POST /api/link/init`

**Request Body**:
```json
{
  "device_name": "John's Laptop",
  "platform": "windows",
  "app_version": "1.0.0"
}
```

**Response**:
```json
{
  "code": "A1B2C3",
  "polling_token": "abc123...xyz789",
  "verify_url": "https://example.com/link/verify?code=A1B2C3",
  "expires_at": "2023-01-01T00:10:00Z"
}
```

**Errors**:
- 500: Database error or internal server error

### Confirm Link

Confirm a device linking request (called by the website verification page).

**Endpoint**: `POST /api/link/confirm`

**Request Body**:
```json
{
  "code": "A1B2C3",
  "user_id": "uuid-of-authenticated-user"
}
```

**Response**:
```json
{
  "success": true
}
```

**Errors**:
- 400: Missing code or user_id
- 404: Link code not found or expired
- 500: Database error

### Approve Link

Approve a confirmed link and return device information (called by desktop app).

**Endpoint**: `POST /api/link/approve`

**Request Body**:
```json
{
  "polling_token": "abc123...xyz789"
}
```

**Response**:
```json
{
  "device_id": "uuid-of-device",
  "token": "device-auth-token"
}
```

**Errors**:
- 400: Missing polling_token
- 404: Token not found or not approved
- 500: Database error

### Check Link Status

Check the status of a device linking request (polled by desktop app).

**Endpoint**: `GET /api/link/status?polling_token=<token>`

**Parameters**:
- `polling_token` (required): The polling token

**Response**:
```json
{
  "status": "pending|confirmed|expired|revoked",
  "device_id": "uuid-of-device", // only if confirmed
  "token": "device-auth-token"   // only if confirmed
}
```

**Errors**:
- 400: Missing polling_token
- 404: Token not found
- 500: Database error

## Device Management API

### List Devices

List all devices linked to the authenticated user.

**Endpoint**: `GET /api/devices/list`

**Response**:
```json
{
  "devices": [
    {
      "id": "uuid-of-device",
      "name": "John's Laptop",
      "platform": "windows",
      "last_seen_at": "2023-01-01T00:00:00Z",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z",
      "token": {
        "revoked_at": null,
        "last_used_at": "2023-01-01T00:00:00Z",
        "created_at": "2023-01-01T00:00:00Z"
      }
    }
  ]
}
```

**Errors**:
- 401: Unauthorized (missing or invalid token)
- 500: Database error

### Revoke Device

Revoke a device's authentication token.

**Endpoint**: `POST /api/devices/revoke`

**Request Body**:
```json
{
  "device_id": "uuid-of-device"
}
```

**Response**:
```json
{
  "success": true
}
```

**Errors**:
- 400: Missing device_id
- 401: Unauthorized (missing or invalid token)
- 403: Device does not belong to user
- 500: Database error

## Payment API

### Create Midtrans Transaction

Create a new payment transaction with Midtrans.

**Endpoint**: `POST /api/payments/midtrans/create`

**Request Body**:
```json
{
  "amount": 290000, // in IDR
  "orderId": "order-123456", // optional
  "items": [
    {
      "id": "plan-pro",
      "price": 290000,
      "quantity": 1,
      "name": "Pro Plan Monthly"
    }
  ],
  "customer": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+628123456789"
  },
  "metadata": {
    "plan": "Pro",
    "billing_cycle": "monthly",
    "user_id": "uuid-of-user"
  },
  "redirect_url": "https://example.com/payment-success" // optional
}
```

**Response**:
```json
{
  "token": "midtrans-transaction-token",
  "redirect_url": "https://app.sandbox.midtrans.com/snap/v1/transactions/<token>",
  "order_id": "order-123456"
}
```

**Errors**:
- 400: Invalid amount or missing required fields
- 500: Missing Midtrans credentials or API error

### Midtrans Notification

Handle payment notifications from Midtrans webhook.

**Endpoint**: `POST /api/payments/midtrans/notify`

**Request Body**:
```json
{
  "transaction_time": "2023-01-01 00:00:00",
  "transaction_status": "settlement",
  "transaction_id": "midtrans-transaction-id",
  "status_message": "Success, transaction is found",
  "status_code": "200",
  "signature_key": "signature-key",
  "payment_type": "credit_card",
  "order_id": "order-123456",
  "merchant_id": "merchant-id",
  "gross_amount": "290000.00",
  "fraud_status": "accept",
  "currency": "IDR"
}
```

**Response**:
```json
{
  "success": true
}
```

**Errors**:
- 400: Invalid signature or missing fields
- 500: Database error or internal server error

## Debug API

### System Debug Info

Get system debug information (for troubleshooting).

**Endpoint**: `GET /api/debug/system`

**Response**:
```json
{
  "node_version": "18.17.0",
  "platform": "linux",
  "arch": "x64",
  "memory_usage": {
    "rss": 123456789,
    "heap_total": 98765432,
    "heap_used": 87654321,
    "external": 12345678
  },
  "uptime": 3600,
  "supabase_url": "https://project.supabase.co",
  "github_owner": "ternarystudioai-code",
  "github_repo": "ternary"
}
```

**Errors**:
- 500: Internal server error

## Supabase Integration API

### Connect Supabase Project

Connect a Supabase project to a Ternary app.

**Endpoint**: `POST /api/connect-supabase`

**Request Body**:
```json
{
  "app_id": "uuid-of-app",
  "project_id": "supabase-project-id"
}
```

**Response**:
```json
{
  "success": true
}
```

**Errors**:
- 400: Missing app_id or project_id
- 401: Unauthorized (missing or invalid token)
- 403: App does not belong to user
- 500: Database error or Supabase API error

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Human-readable error message",
  "details": "Additional technical details (optional)"
}
```

## Rate Limiting

API endpoints may be rate-limited to prevent abuse:

- **Anonymous requests**: 100 requests per hour
- **Authenticated requests**: 1000 requests per hour
- **Payment endpoints**: 10 requests per hour

Exceeding rate limits will result in a 429 (Too Many Requests) response.

## CORS Policy

API endpoints allow cross-origin requests from:

- `https://ternary.sh`
- `https://*.ternary.sh`
- `http://localhost:*`

Headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

## Security Considerations

1. **Authentication**: All sensitive endpoints require Bearer token authentication
2. **Input Validation**: All inputs are validated and sanitized
3. **Rate Limiting**: Prevents abuse and DoS attacks
4. **Secure Headers**: Sets appropriate security headers
5. **Error Handling**: Does not expose sensitive information in error messages
6. **Token Security**: GitHub tokens and Midtrans keys are never exposed to clients

## Versioning

API endpoints are versioned through the URL path when breaking changes are introduced:

```
/api/v1/endpoint  # Version 1
/api/v2/endpoint  # Version 2
```

Currently, all endpoints are unversioned and considered version 1.

This API documentation provides a comprehensive reference for all available endpoints in the Ternary website application.