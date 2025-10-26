# Docker Deployment Guide

This guide explains how to deploy the NT Search application using Docker.

## Prerequisites

- Docker and Docker Compose installed
- Basic knowledge of Docker commands

## Quick Start

### Development Environment

1. **Build and run the application:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend (if enabled): http://localhost:3001

### Production Environment

1. **Build and run with production configuration:**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

2. **Access the application:**
   - Frontend: http://localhost (port 80)
   - HTTPS: https://your-domain.com (if SSL configured)

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Frontend
NODE_ENV=production
REACT_APP_API_BASE_URL=http://localhost:3001/api/v1

# Backend (if using)
BACKEND_PORT=3001
DATABASE_URL=postgresql://ntsearch:ntsearch123@database:5432/ntsearch
REDIS_URL=redis://redis:6379

# SSL (for production)
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

### SSL Configuration

For production with HTTPS:

1. **Obtain SSL certificates** (Let's Encrypt recommended)
2. **Place certificates in `./ssl/` directory:**
   ```
   ssl/
   ├── cert.pem
   └── key.pem
   ```

3. **Update `nginx-prod.conf`** with your domain name

## Docker Commands

### Basic Commands

```bash
# Build the image
docker build -t nt-search .

# Run the container
docker run -p 3000:3000 nt-search

# View logs
docker-compose logs -f frontend

# Stop services
docker-compose down

# Remove volumes (careful!)
docker-compose down -v
```

### Development Commands

```bash
# Run with backend
docker-compose --profile backend up --build

# Run with database
docker-compose --profile database up --build

# Run with all services
docker-compose --profile backend --profile database --profile redis up --build
```

### Production Commands

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up --build -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Update production
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up --build -d
```

## Monitoring

### Health Checks

- **Frontend health:** http://localhost:3000/health
- **Container health:** `docker ps` (check STATUS column)

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs frontend
docker-compose logs nginx

# Follow logs in real-time
docker-compose logs -f frontend
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Kill the process or change port in docker-compose.yml
   ```

2. **Build failures:**
   ```bash
   # Clean build
   docker-compose down
   docker system prune -f
   docker-compose up --build
   ```

3. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Debugging

```bash
# Enter container shell
docker exec -it nt-search-frontend sh

# Check container resources
docker stats

# Inspect container
docker inspect nt-search-frontend
```

## Security Considerations

1. **Change default passwords** in docker-compose.yml
2. **Use secrets management** for production
3. **Enable firewall** rules
4. **Regular updates** of base images
5. **SSL/TLS** for production deployments

## Scaling

### Horizontal Scaling

```bash
# Scale frontend service
docker-compose up --scale frontend=3
```

### Load Balancing

Use nginx or traefik for load balancing multiple frontend instances.

## Backup and Recovery

### Database Backup

```bash
# Backup database
docker exec nt-search-database pg_dump -U ntsearch ntsearch > backup.sql

# Restore database
docker exec -i nt-search-database psql -U ntsearch ntsearch < backup.sql
```

### Volume Backup

```bash
# Backup volumes
docker run --rm -v nt-search_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

## Performance Optimization

1. **Enable gzip compression** (already configured)
2. **Use CDN** for static assets
3. **Implement caching** strategies
4. **Monitor resource usage**
5. **Optimize images** and assets

## Support

For issues and questions:
- Check Docker logs: `docker-compose logs`
- Review nginx logs: `docker-compose logs nginx`
- Verify health endpoints: http://localhost:3000/health
