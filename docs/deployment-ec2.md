# Deploying `sajhanewsonline` to AWS EC2 (ECR + Docker)

This repo ships with:
- `Dockerfile` for production builds
- `/.github/workflows/deploy-ec2.yml` to build → push to ECR → SSH into EC2 and restart the container

## 1) AWS: ECR

Create an ECR repository (or let the workflow create it):
- Name should match `ECR_REPOSITORY` (GitHub Actions variable)

## 2) AWS: IAM for GitHub Actions (recommended: OIDC)

Create an IAM role that GitHub Actions can assume via OIDC, then put its ARN into the GitHub secret `AWS_ROLE_TO_ASSUME`.

Minimum permissions for pushing to ECR (plus optional `ecr:CreateRepository` if you keep the “ensure repo exists” step enabled):
- `ecr:GetAuthorizationToken`
- `ecr:BatchCheckLayerAvailability`
- `ecr:CompleteLayerUpload`
- `ecr:InitiateLayerUpload`
- `ecr:PutImage`
- `ecr:UploadLayerPart`
- `ecr:DescribeRepositories`
- `ecr:CreateRepository` (optional)

## 3) AWS: EC2 instance setup

On the instance:
- Install Docker and start the service
- Install AWS CLI (`aws`) (used for ECR login)
- Attach an instance role with ECR pull permissions:
  - `ecr:GetAuthorizationToken`
  - `ecr:BatchGetImage`
  - `ecr:GetDownloadUrlForLayer`
  - `ecr:BatchCheckLayerAvailability`

Create an env file on the instance (default path used by the workflow):
- `/opt/sajhanewsonline/app.env`

Example contents:
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=https://your-domain
CLEANUP_SECRET=...
```

Open networking:
- Allow inbound `80` (and `443` if you terminate TLS on the instance)

## 4) GitHub: required Actions variables/secrets

Variables:
- `AWS_REGION`
- `ECR_REPOSITORY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SITE_URL`

Secrets:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `AWS_ROLE_TO_ASSUME`
- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_PRIVATE_KEY`
- `EC2_ENV_FILE` (optional)

## 5) First deploy

Push to `main` (or run the workflow manually via “Run workflow”):
- Workflow: “Deploy to EC2 (Docker + ECR)”
