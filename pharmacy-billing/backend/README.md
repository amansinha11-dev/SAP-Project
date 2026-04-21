# Pharmacy Billing Backend (Supabase Migration)

## Overview
Spring Boot 3.5.0 JPA app with PostgreSQL (Supabase), H2 test.

**Features:**
- Medicines CRUD (/api/medicines)
- Bills CRUD (/api/bills)
- Health check (/api/health)

## Setup
1. **Supabase:** Use your project creds in `application.properties`.
2. **Maven:** `.\mvnw.cmd clean install`

## Run
```
.\mvnw.cmd spring-boot:run
```
Port 9090.

## API
- GET /api/health
- GET /api/medicines
- POST /api/medicines
- GET /api/bills

**Security:** /api/** public (SecurityConfig).

## Frontend
Vite proxy /api → 9090.

## Warnings
Ignore Maven model warning (minor).

## Supabase Tables
- medicine
- bill
- bill_item

Migration complete!
