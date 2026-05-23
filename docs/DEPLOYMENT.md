# Deployment Guide

## Production Deployment

### 1. Backend Deployment (Render)

#### Setup
1. Connect GitHub repository to Render
2. Create PostgreSQL database on Supabase
3. Configure environment variables

#### Environment Variables
```
DATABASE_URL=postgresql://...@db.supabase.co:5432/postgres
OPENAI_API_KEY=sk-...
API_ENV=production
REDIS_URL=redis://...
```

#### Deploy
```bash
git push origin main
```

Render auto-deploys on push.

### 2. Frontend Deployment (Vercel)

#### Setup
1. Connect GitHub repository to Vercel
2. Configure build settings

#### Build Settings
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

#### Environment Variables
```
NEXT_PUBLIC_API_URL=https://api.macrosphere.com
```

#### Deploy
```bash
git push origin main
```

Vercel auto-deploys on push.

### 3. Database (Supabase)

#### Setup
1. Create project on Supabase
2. Initialize PostgreSQL 16
3. Enable SSL certificate

#### Connection
```
postgresql://[user]:[password]@[host]:5432/[database]
```

#### Backups
- Daily automated backups
- Point-in-time recovery
- Manual backup option

### 4. DNS & SSL

- Use Vercel-provided domain or custom domain
- SSL auto-configured by Vercel
- DNS records point to Vercel nameservers

### 5. Monitoring

#### Vercel Analytics
- Real-time usage metrics
- Performance monitoring
- Error tracking

#### Application Monitoring
```python
# Backend can integrate with Sentry
import sentry_sdk
sentry_sdk.init("your-sentry-dsn")
```

### 6. Scaling

#### Database
- Vertical scaling via Supabase dashboard
- Read replicas for high-load scenarios

#### Backend
- Render auto-scales with demand
- Configure min/max resources

#### Frontend
- Vercel edge network handles scaling
- Automatic deployment to CDN

### 7. Security Checklist

- [ ] Set production DATABASE_URL with SSL
- [ ] Generate secure OPENAI_API_KEY
- [ ] Configure CORS_ORIGINS for frontend domain
- [ ] Enable HTTPS everywhere
- [ ] Set SECRET_KEY for production
- [ ] Configure rate limiting
- [ ] Enable API authentication if needed
- [ ] Regular security audits

### 8. Performance Optimization

#### Backend
```python
# Enable caching
CACHE_TTL=600  # 10 minutes

# Redis for session/cache
REDIS_URL=redis://...
```

#### Frontend
- Image optimization
- Code splitting
- Dynamic imports
- CSS purging

### 9. Monitoring & Alerts

#### Render Alerts
- Configure email alerts for failures
- Monitor memory/CPU usage
- Track deployment status

#### Application Health
```
GET /health
```
Returns: `{"status": "ok", "version": "1.0.0"}`

### 10. Troubleshooting

#### Backend Won't Start
```bash
# Check logs
render logs --tail 100

# Verify database connection
psql $DATABASE_URL
```

#### High API Latency
1. Check database query performance
2. Enable Redis caching
3. Optimize OpenAI prompts
4. Scale backend resources

#### Frontend Build Failures
1. Check Node version compatibility
2. Verify environment variables
3. Clear build cache in Vercel

### 11. Rollback Procedure

#### Vercel
1. Go to Deployments
2. Select previous deployment
3. Click "Promote to Production"

#### Render
1. Go to Events
2. Select previous deployment
3. Click "Redeploy"

### 12. Data Backup

```bash
# Supabase backup
pg_dump postgresql://... > backup.sql

# Restore
psql postgresql://... < backup.sql
```

### 13. SSL Certificates

- Vercel: Auto-renewed by Let's Encrypt
- Supabase: Auto-configured with SSL

### 14. Environment Management

**Production (.env.production)**
```
API_ENV=production
LOG_LEVEL=WARNING
CACHE_TTL=600
```

**Staging (.env.staging)**
```
API_ENV=staging
LOG_LEVEL=INFO
```

---

**Last Updated**: 2024
**Version**: 1.0.0
