# GitHub Actions CI/CD Pipeline

This document describes the GitHub Actions workflows for the NT Search project.

## Workflows Overview

### 1. **Test and Lint** (`.github/workflows/test.yml`)
- **Trigger**: Push to main/master/develop branches, Pull Requests
- **Purpose**: Code quality assurance
- **Jobs**:
  - `test`: Run linting, formatting checks, and build tests
  - `docker-test`: Test Docker image builds (Alpine & Debian)
  - `security-scan`: Security vulnerability scanning
  - `quality-gate`: Overall quality assessment

### 2. **Docker Build and Push** (`.github/workflows/docker.yml`)
- **Trigger**: Push to main/master, Pull Requests, Manual dispatch
- **Purpose**: Build and deploy Docker images
- **Jobs**:
  - `build-and-push`: Build multi-arch Docker images
  - `security-scan`: Security scanning of built images
  - `deploy-staging`: Deploy to staging environment
  - `deploy-production`: Deploy to production environment

### 3. **Release** (`.github/workflows/release.yml`)
- **Trigger**: Git tags (v*), Manual dispatch
- **Purpose**: Create releases with Docker images
- **Jobs**:
  - `create-release`: Create GitHub release
  - `build-alpine`: Build Alpine-based image
  - `build-debian`: Build Debian-based image
  - `security-scan`: Security scanning
  - `notify`: Release notification

## Setup Instructions

### 1. Repository Secrets

Add the following secrets to your GitHub repository:

```bash
# Docker Hub credentials
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-token

# GitHub token (automatically provided)
GITHUB_TOKEN=automatically-provided
```

### 2. Environment Protection Rules

Set up environment protection rules for:
- **staging**: Require review for staging deployments
- **production**: Require review and approval for production deployments

### 3. Branch Protection Rules

Enable branch protection for `main` branch:
- Require status checks to pass
- Require branches to be up to date
- Require pull request reviews
- Restrict pushes to main branch

## Workflow Details

### Test Workflow

```yaml
# Triggers on every push and PR
on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]
```

**Features**:
- ✅ Linting and formatting checks
- ✅ Build verification
- ✅ Docker image testing
- ✅ Security scanning
- ✅ Quality gates

### Docker Workflow

```yaml
# Triggers on main branch pushes and manual dispatch
on:
  workflow_dispatch:
  push:
    branches: [main, master]
    paths: ['src/**', 'package.json', 'Dockerfile']
```

**Features**:
- ✅ Multi-architecture builds (AMD64, ARM64)
- ✅ Docker Hub and GitHub Container Registry
- ✅ Security scanning
- ✅ Staging and production deployments

### Release Workflow

```yaml
# Triggers on version tags and manual dispatch
on:
  workflow_dispatch:
  push:
    tags: ['v*']
```

**Features**:
- ✅ Version extraction from tags
- ✅ GitHub release creation
- ✅ Multiple image variants (Alpine, Debian)
- ✅ Security scanning
- ✅ Release notifications

## Docker Images

### Image Variants

1. **Alpine-based** (`Dockerfile`)
   - Smaller size (~50MB)
   - Better security
   - Faster startup

2. **Debian-based** (`Dockerfile.debian`)
   - Better compatibility
   - More packages available
   - Larger size (~100MB)

### Image Tags

- `latest` - Latest stable build
- `v1.0.0` - Specific version
- `alpine` - Alpine variant
- `debian` - Debian variant
- `v1.0.0-debian` - Versioned Debian variant

## Security Features

### Vulnerability Scanning
- **Trivy scanner** for container images
- **SARIF format** for GitHub Security tab
- **Multi-stage scanning** for different image variants

### Security Headers
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security

## Deployment Environments

### Staging
- Automatic deployment on main branch
- Environment protection rules
- Health checks and monitoring

### Production
- Manual approval required
- Environment protection rules
- SSL/TLS configuration
- Rate limiting and security

## Monitoring and Notifications

### Health Checks
- Container health endpoints
- Application health monitoring
- Docker health checks

### Notifications
- Release success/failure notifications
- Security scan results
- Deployment status updates

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs
   gh run list
   gh run view <run-id>
   ```

2. **Docker Login Issues**
   - Verify Docker Hub credentials
   - Check token permissions

3. **Security Scan Failures**
   - Review vulnerability reports
   - Update base images
   - Fix security issues

### Debug Commands

```bash
# View workflow runs
gh run list

# View specific run
gh run view <run-id>

# Download artifacts
gh run download <run-id>

# Rerun failed jobs
gh run rerun <run-id>
```

## Best Practices

1. **Always test locally** before pushing
2. **Use semantic versioning** for releases
3. **Review security scans** regularly
4. **Monitor deployment health**
5. **Keep dependencies updated**

## Support

For issues with the CI/CD pipeline:
1. Check workflow logs in GitHub Actions
2. Review security scan results
3. Verify environment configurations
4. Contact maintainers for assistance
