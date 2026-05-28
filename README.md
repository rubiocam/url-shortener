# URL Shortener

A personal custom URL shortener built with:

* **Spring Boot** (Java backend)
* **Supabase Postgres** (database)
* **Next.js** (frontend dashboard)
* **301 permanent redirects**

The project is designed for personal use with:

* custom short links
* click tracking
* analytics
* dashboard management
* cross-device access

---

# Features

## Current

* Create short URLs
* Custom slugs
* 301 redirects
* Click tracking
* Link management dashboard
* Archive/delete links

## Planned

* Analytics charts
* Tags and notes
* Expiring links
* Search and filtering
* CSV export
* Authentication

---

# Tech Stack

## Backend

* Java
* Spring Boot
* Spring Data JPA
* PostgreSQL
* Flyway

## Frontend

* Next.js
* React
* Tailwind CSS

## Infrastructure

* Supabase
* GitHub
* Custom domain

---

# Project Structure

```text
url-shortener/
  backend/
  frontend/
```

---

# Backend Setup

## Requirements

* Java 21+
* Maven or Gradle
* Supabase project

## Environment Variables

Create a `.env` file or configure environment variables:

```env
SPRING_DATASOURCE_URL=
SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=
```

## Run Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

---

# Frontend Setup

## Requirements

* Node.js 20+

## Install

```bash
cd frontend
npm install
```

## Run Frontend

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

---

# API Endpoints

## Links

### Create Link

```http
POST /api/links
```

### List Links

```http
GET /api/links
```

### Update Link

```http
PUT /api/links/{id}
```

### Delete Link

```http
DELETE /api/links/{id}
```

---

# Redirects

Short links use permanent redirects:

```http
GET /{slug}
```

Returns:

* `301 Moved Permanently`
* redirects to the original URL

---

# Database

Main tables:

* `links`
* `clicks`

Managed with Flyway migrations.

---

# Development Goals

* Fast redirects
* Simple dashboard UX
* Clean backend architecture
* Self-hostable
* Minimal maintenance

---

# Licens
Personal project.
