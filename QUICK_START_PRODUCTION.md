# Quick Start - Production Deployment

## Environment Setup

### 1. Set Required Environment Variables
```bash
# Critical for production
export GEMINI_API_KEY="your-api-key-here"
export NODE_ENV="production"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build for Production
```bash
npm run build
```

### 4. Start Server
```bash
NODE_ENV=production node dist/server.js
```

---

## Verification

### Health Check
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-21T10:00:00.000Z",
  "uptime": 123.45,
  "environment": "production",
  "metrics": {
    "totalRequests": 42,
    "averageResponseTime": "45ms",
    "totalLogs": 156,
    "errorCount": 2,
    "warningCount": 3
  }
}
```

### View Logs
```bash
# All logs
curl http://localhost:3000/api/logs

# Only errors
curl http://localhost:3000/api/logs?level=error&limit=50

# Recent requests
curl http://localhost:3000/api/requests/recent?limit=100
```

---

## Production Features

### Enabled
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ Request logging with duration tracking
- ✅ Error handling with standardized responses
- ✅ Health monitoring endpoints
- ✅ TypeScript strict mode
- ✅ Code-splitting for vendor chunks
- ✅ Minified production build

### Disabled (For Performance)
- Console.log removal in production
- Debug logging

---

## Common Tasks

### Check Bundle Size
```bash
ls -lh dist/assets/
```

Target: Vendor chunk < 50 KB, Main chunk < 300 KB

### Monitor Production
```bash
# Watch for errors (every 5 seconds)
while true; do
  curl -s http://localhost:3000/api/logs?level=error | jq .
  sleep 5
done
```

### View Performance Metrics
```bash
curl -s http://localhost:3000/api/requests/recent | jq '.requests | map({method, path, duration: (.duration + "ms"), statusCode})'
```

### Restart Server (with logging)
```bash
NODE_ENV=production node dist/server.js 2>&1 | tee server.log
```

---

## Troubleshooting

### Server Won't Start
```bash
# Check if GEMINI_API_KEY is set
echo $GEMINI_API_KEY

# Verify build is complete
ls -la dist/server.js

# Check for port conflicts
lsof -i :3000
```

### High Memory Usage
- Check logs for memory leaks: `curl http://localhost:3000/api/logs?level=warn`
- Monitor request count: `curl http://localhost:3000/api/health`
- Consider reducing log retention or implementing pagination

### Slow Response Times
- View recent requests: `curl http://localhost:3000/api/requests/recent`
- Check for slow database queries (if applicable)
- Consider implementing caching

---

## Deployment Checklist

### Pre-Flight
- [ ] Build completes without errors: `npm run build`
- [ ] TypeScript is clean: `npx tsc --noEmit`
- [ ] GEMINI_API_KEY is set
- [ ] NODE_ENV=production
- [ ] Test health endpoint works

### Launch
- [ ] Start server with logging: `NODE_ENV=production node dist/server.js`
- [ ] Verify `/api/health` returns healthy status
- [ ] Check `/api/logs` for any startup warnings
- [ ] Monitor error count for first 5 minutes

### Post-Launch
- [ ] Monitor `/api/health` every minute
- [ ] Set up alerts on error spike
- [ ] Check average response times
- [ ] Verify all API endpoints are operational

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| LCP | < 2.5s | TBD |
| INP | < 200ms | TBD |
| CLS | < 0.1 | TBD |
| Avg Response | < 100ms | Check with `/api/requests/recent` |
| Error Rate | < 1% | Check with `/api/health` |

---

## Security Checklist

- [x] No hardcoded credentials in source
- [x] Environment variables validated
- [x] Security headers configured
- [x] Error messages don't leak sensitive info
- [x] Request logging doesn't log passwords
- [x] HTTPS configured (in reverse proxy)

---

## Support & Monitoring

### Endpoints Available
- `GET /api/health` - System status and metrics
- `GET /api/logs?level=error` - Error logs
- `GET /api/logs?level=warn` - Warning logs
- `GET /api/requests/recent` - Request analytics
- `GET /api` - All other API endpoints

### External Monitoring (Recommended)
- Sentry for error tracking
- DataDog or New Relic for APM
- Prometheus for metrics
- ELK Stack for centralized logging

### Alerting Setup
```bash
# Example: Alert if error count > 10 in 5 minutes
while true; do
  errors=$(curl -s http://localhost:3000/api/logs?level=error | jq '.logs | length')
  if [ $errors -gt 10 ]; then
    echo "ALERT: $errors errors detected!"
  fi
  sleep 300
done
```

---

## Documentation Links

- [Production Checklist](./PRODUCTION_CHECKLIST.md)
- [Performance Guide](./PERFORMANCE_GUIDE.md)
- [Audit Summary](./PRODUCTION_AUDIT_SUMMARY.md)

---

**Status**: Ready for Production ✅
