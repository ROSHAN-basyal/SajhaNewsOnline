# Sajha News Online

A modern Nepali news portal built with Next.js (App Router) + Supabase (Postgres), including a hidden admin portal for managing posts and advertisements.

## Features

### Public site
- Responsive news feed with category navigation and search
- Dedicated article pages (`/posts/[id]`) with share actions
- Ad slots (header/sidebar/in-content/footer)

### Admin portal
- URL: `/secret-admin-portal`
- Login sessions with persistence
- Posts: create, edit, delete, and clean expired posts
- Ads: create, edit, delete, placement selector, analytics

## Requirements

- Node.js + npm
- A Supabase project (or compatible backend already provisioned)

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Set up the database

This repo assumes the database schema already exists (tables, policies, and storage bucket if you use uploads).
The SQL setup scripts are intentionally not included in the repo anymore.

### 3) Configure environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:443
```

## Run locally

```bash
npm run dev
```

- Public site: `http://localhost:443`
- Admin portal: `http://localhost:443/secret-admin-portal`

Alternate port:

```bash
npm run dev-alt
```

## Images (uploads)

News images are stored in Supabase Storage bucket `news-images`.
Create the bucket and policies in Supabase Dashboard if they’re not already present.

## Maintenance

- Clean expired posts (older than 30 days): available via the Admin UI
- Manual cleanup API: `POST /api/cleanup` (used by the admin UI)

## Troubleshooting

### Clear Next.js cache

If you see stale UI/TS errors:

```bash
rmdir /s .next
npm run dev
```

### Can’t log in as admin

Reset the admin password hash:

```sql
UPDATE admin_users
SET password_hash = '$2a$12$wJgYKJzTKG88a.MG.qLJ.eQKitDNGTJIfos.42J67mEdLXdCqRQ5S'
WHERE username = 'admin';
```

## Docker

This repo includes a production `Dockerfile`. The container listens on port `3000`.

Build (needs Supabase/site envs at build-time):

```bash
docker build -t sajhanewsonline:local \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=... \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  .
```

Run:

```bash
docker run --rm -p 3000:3000 --env-file .env.local sajhanewsonline:local
```

## CI/CD (GitHub Actions → ECR → EC2)

Workflows:
- `/.github/workflows/ci.yml`: install/lint/build
- `/.github/workflows/deploy-ec2.yml`: build Docker image, push to ECR, SSH to EC2 and restart the container

Repository variables (Settings → Secrets and variables → Actions → Variables):
- `AWS_REGION` (example: `ap-south-1`)
- `ECR_REPOSITORY` (example: `sajhanewsonline`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SITE_URL`

Repository secrets:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `AWS_ROLE_TO_ASSUME` (GitHub OIDC role ARN)
- `EC2_HOST` (example: `1.2.3.4`)
- `EC2_USER` (example: `ubuntu`)
- `EC2_SSH_PRIVATE_KEY` (private key that can SSH into the instance)
- `EC2_ENV_FILE` (optional, default: `/opt/sajhanewsonline/app.env`)

EC2 prerequisites:
- Docker installed and running
- AWS CLI installed
- An EC2 instance role with permission to pull from ECR
- An env file on the instance (example `/opt/sajhanewsonline/app.env`) containing at least:
  - `NEXT_PUBLIC_SUPABASE_URL=...`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
  - `NEXT_PUBLIC_SITE_URL=https://your-domain`
  - `CLEANUP_SECRET=...` (required to protect `POST /api/cleanup`)

Network:
- Open port `80` on the EC2 security group (or put a reverse proxy / ALB in front for HTTPS on `443`)
