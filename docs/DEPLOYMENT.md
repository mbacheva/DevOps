# Deployment Guide

## Prerequisites

### Required Software
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Kubernetes (minikube, kind, or cloud provider)
- Node.js 20+
- PostgreSQL 15+
- Git

### Optional
- Terraform (for cloud infrastructure)
- kubectl (for Kubernetes management)

---

## Local Development Setup

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd DevOps
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=taskdb
# DB_USER=postgres
# DB_PASSWORD=postgres
```

### 4. Start Database
```bash
# Using Docker Compose
docker-compose up -d postgres

# Or install PostgreSQL locally
```

### 5. Run Migrations
```bash
npm run migrate
```

### 6. Start Application
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 7. Verify Installation
```bash
# Check health
curl http://localhost:3000/health/live

# List tasks
curl http://localhost:3000/api/tasks
```

---

## Docker Deployment

### Build Image
```bash
docker build -t task-api:latest .
```

### Run with Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Access Application
- API: http://localhost:3000
- Health: http://localhost:3000/health/live

---

## Kubernetes Deployment

### Local Kubernetes (minikube)

#### 1. Start Minikube
```bash
minikube start --cpus=2 --memory=4096
```

#### 2. Create Namespace
```bash
kubectl apply -f k8s/namespace.yaml
```

#### 3. Create Secrets
```bash
kubectl create secret generic task-api-secrets \
  --from-literal=db_name=taskdb \
  --from-literal=db_user=postgres \
  --from-literal=db_password=your-secure-password \
  --namespace=production
```

#### 4. Deploy Database
```bash
kubectl apply -f k8s/postgres.yaml
```

#### 5. Deploy Application
```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
```

#### 6. Check Status
```bash
kubectl get pods -n production
kubectl get services -n production
```

#### 7. Access Application
```bash
# Get service URL
minikube service task-api-service -n production

# Or port-forward
kubectl port-forward service/task-api-service 3000:80 -n production
```

### Cloud Kubernetes (EKS/AKS/GKE)

See [Cloud Deployment Guide](#cloud-deployment-aws)

---

## Cloud Deployment (AWS)

### Using Terraform

#### 1. Configure AWS Credentials
```bash
aws configure
```

#### 2. Initialize Terraform
```bash
cd terraform
terraform init
```

#### 3. Review Plan
```bash
terraform plan
```

#### 4. Apply Infrastructure
```bash
terraform apply
```

#### 5. Configure kubectl
```bash
# Use output from Terraform
aws eks update-kubeconfig --region us-east-1 --name devops-task-api-cluster
```

#### 6. Deploy Application
```bash
# Update image in deployment.yaml to use ECR
kubectl apply -f ../k8s/
```

---

## CI/CD Pipeline Setup

### GitHub Actions

#### 1. Required Secrets

Add to GitHub Repository Settings → Secrets:

```
SONAR_TOKEN          # SonarQube token
SONAR_HOST_URL       # SonarQube server URL
SEMGREP_APP_TOKEN    # Semgrep token (optional)
KUBE_CONFIG          # Kubernetes config file
```

#### 2. Container Registry

Choose one:

**GitHub Container Registry** (ghcr.io):
- Automatically configured
- Uses GITHUB_TOKEN

**Docker Hub**:
```yaml
# Add to secrets
DOCKER_USERNAME
DOCKER_PASSWORD
```

**AWS ECR**:
```yaml
# Add to secrets
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
```

#### 3. Trigger Pipeline

```bash
git checkout -b feature/my-feature
# Make changes
git commit -m "Add new feature"
git push origin feature/my-feature

# Pipeline runs automatically
```

---

## Testing

### Run All Tests
```bash
npm test
```

### Run Specific Tests
```bash
# Unit tests only
npm test tests/unit

# Integration tests
npm test tests/integration

# With coverage
npm test -- --coverage
```

### Linting
```bash
# Check for errors
npm run lint

# Auto-fix
npm run lint:fix
```

### Format Check
```bash
# Check formatting
npm run format:check

# Auto-format
npm run format
```

---

## Monitoring & Debugging

### View Logs

**Docker Compose:**
```bash
docker-compose logs -f api
```

**Kubernetes:**
```bash
kubectl logs -f deployment/task-api -n production

# Tail logs from all pods
kubectl logs -f -l app=task-api -n production
```

### Shell Access

**Docker:**
```bash
docker exec -it task_api sh
```

**Kubernetes:**
```bash
kubectl exec -it deployment/task-api -n production -- sh
```

### Database Access

**Docker Compose:**
```bash
docker exec -it taskdb_postgres psql -U postgres -d taskdb
```

**Kubernetes:**
```bash
kubectl exec -it postgres-0 -n production -- psql -U postgres -d taskdb
```

---

## Troubleshooting

### Database Connection Failed

**Check connection:**
```bash
# Test from container
docker exec -it task_api node -e "
const { sequelize } = require('./src/models');
sequelize.authenticate().then(() => console.log('OK')).catch(e => console.error(e));
"
```

**Verify environment variables:**
```bash
kubectl get configmap task-api-config -n production -o yaml
kubectl get secret task-api-secrets -n production -o yaml
```

### Pod Not Starting

```bash
# Describe pod for events
kubectl describe pod <pod-name> -n production

# Check pod logs
kubectl logs <pod-name> -n production

# Check previous logs if crashed
kubectl logs <pod-name> -n production --previous
```

### Image Pull Failed

```bash
# Check image exists
docker pull ghcr.io/yourusername/devops-task-api:latest

# Verify image pull secret
kubectl get secret ghcr-secret -n production
```

### Migration Failed

```bash
# Run migrations manually
kubectl exec -it deployment/task-api -n production -- npm run migrate

# Rollback last migration
kubectl exec -it deployment/task-api -n production -- npm run migrate:undo
```

---

## Scaling

### Manual Scaling

**Kubernetes:**
```bash
kubectl scale deployment task-api --replicas=5 -n production
```

### Auto-scaling

HPA is configured to scale based on CPU/Memory:
```bash
# Check HPA status
kubectl get hpa -n production

# Describe HPA
kubectl describe hpa task-api-hpa -n production
```

---

## Backup & Recovery

### Database Backup

```bash
# Kubernetes
kubectl exec postgres-0 -n production -- \
  pg_dump -U postgres taskdb > backup.sql

# Restore
kubectl exec -i postgres-0 -n production -- \
  psql -U postgres taskdb < backup.sql
```

### Application State

```bash
# Export all Kubernetes manifests
kubectl get all -n production -o yaml > backup-k8s.yaml
```

---

## Security Checklist

Before production deployment:

- [ ] Change all default passwords
- [ ] Use Kubernetes secrets for sensitive data
- [ ] Enable HTTPS/TLS
- [ ] Configure network policies
- [ ] Enable pod security policies
- [ ] Run security scans (SAST, container scanning)
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy
- [ ] Review and limit service account permissions
- [ ] Enable audit logging

---

## Performance Tuning

### Node.js Optimization

```bash
# Increase memory limit
NODE_OPTIONS="--max-old-space-size=2048" npm start

# Enable production mode
NODE_ENV=production npm start
```

### Database Optimization

```sql
-- Create indexes on frequently queried columns
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
```

### Kubernetes Resource Limits

Edit deployment.yaml:
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "200m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

---

## Support

For issues or questions:
1. Check logs first
2. Review troubleshooting section
3. Check GitHub issues
4. Create new issue with logs and steps to reproduce

---

**Last Updated**: January 6, 2026
