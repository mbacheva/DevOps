# DevOPS Final Project - Task Management API

## 📋 Project Overview

This project demonstrates a complete automated software delivery pipeline implementing **9 core DevOps topics**:

1. ✅ **Source Control** - Git with GitHub
2. ✅ **Branching Strategies** - GitFlow (main, develop, feature branches)
3. ✅ **Continuous Integration** - Automated testing, linting, SAST
4. ✅ **Continuous Delivery** - Automated deployment to Kubernetes
5. ✅ **Security** - SAST scanning with SonarQube/Semgrep, container vulnerability scanning
6. ✅ **Docker** - Containerization of application
7. ✅ **Kubernetes** - Orchestration and deployment
8. ✅ **Infrastructure as Code** - Terraform for cloud resources
9. ✅ **Database Changes** - Automated SQL migrations

### 🎯 Deep Dive Topic: SAST (Static Application Security Testing)

Detailed analysis of security scanning implementation using multiple tools in the pipeline.

---

## 🏗️ High-Level Solution Design

```
Developer → Git Push → GitHub Actions Pipeline
                              ↓
    ┌─────────────────────────┴──────────────────────────┐
    │  CI/CD Pipeline (GitHub Actions)                   │
    ├────────────────────────────────────────────────────┤
    │  1. Checkout Code                                  │
    │  2. Run Unit Tests (Jest)                          │
    │  3. Linter (ESLint)                                │
    │  4. Style Check (Prettier)                         │
    │  5. SAST - Semgrep + SonarQube                     │
    │  6. Build Docker Image                             │
    │  7. Scan Container (Trivy)                         │
    │  8. Test SQL Migrations                            │
    │  9. Push to Container Registry                     │
    │ 10. Deploy to Kubernetes (Rolling Update)          │
    └────────────────────────────────────────────────────┘
                              ↓
                    Production Environment
```

---

## 🔧 Low-Level Solution Design

### Application Stack
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js REST API
- **Database**: PostgreSQL 15
- **ORM**: Sequelize with migrations
- **Testing**: Jest + Supertest
- **Linting**: ESLint + Prettier

### Infrastructure
- **Container Registry**: Docker Hub / GitHub Container Registry
- **Orchestration**: Kubernetes (minikube/kind for local, EKS/AKS/GKE for production)
- **IaC**: Terraform for cloud resources
- **Monitoring**: Kubernetes Dashboard, kubectl

### Security Tools
- **SAST**: Semgrep (open-source), SonarQube
- **Container Scanning**: Trivy
- **Secrets Management**: Kubernetes Secrets, dotenv for local

---

## 📁 Project Structure

```
DevOPS/
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # Main CI/CD pipeline
├── src/
│   ├── app.js                  # Express application
│   ├── controllers/            # API controllers
│   ├── models/                 # Database models
│   ├── routes/                 # API routes
│   └── config/                 # Configuration
├── tests/
│   ├── unit/                   # Unit tests
│   └── integration/            # Integration tests
├── migrations/                 # SQL migration scripts
├── k8s/
│   ├── deployment.yaml         # Kubernetes deployment
│   ├── service.yaml            # Kubernetes service
│   ├── configmap.yaml          # Configuration
│   └── secrets.yaml            # Secrets template
├── terraform/
│   ├── main.tf                 # Main infrastructure
│   ├── variables.tf            # Variables
│   └── outputs.tf              # Outputs
├── docker/
│   └── Dockerfile              # Multi-stage build
├── .eslintrc.json              # ESLint config
├── .prettierrc                 # Prettier config
├── sonar-project.properties    # SonarQube config
├── .semgrepignore              # Semgrep ignore
├── docker-compose.yml          # Local development
└── package.json                # Dependencies

```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- kubectl & minikube/kind
- Terraform (optional)
- Git

### Local Development

```bash
# Clone repository
git clone <repository-url>
cd DevOPS

# Install dependencies
npm install

# Start local database
docker-compose up -d postgres

# Run migrations
npm run migrate

# Run tests
npm test

# Start development server
npm run dev
```

### Running with Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access API at http://localhost:3000
```

---

## 🔄 CI/CD Pipeline Workflow

### Feature Development Flow

1. **Create Issue** - Define feature/bug
2. **Create Feature Branch** - `git checkout -b feature/task-priority`
3. **Develop & Commit** - Make changes with meaningful commits
4. **Push** - Triggers automated pipeline
5. **Pipeline Stages**:
   - ✓ Unit Tests
   - ✓ Linter & Style Check
   - ✓ SAST Scanning
   - ✓ Build Docker Image
   - ✓ Vulnerability Scanning
   - ✓ SQL Migration Testing
   - ✓ Push to Registry
6. **Pull Request Review**
7. **Merge to Main** - Triggers deployment
8. **Rolling Deploy to Kubernetes**

---

## 🔐 Deep Dive: SAST Implementation

### What is SAST?

Static Application Security Testing analyzes source code for security vulnerabilities without executing the program. It's a "white-box" testing method integrated early in the SDLC.

### Tools Implemented

#### 1. **Semgrep** (Primary)
- **Purpose**: Lightweight, fast pattern-based code scanning
- **Configuration**: `.semgrep.yml` with custom rules
- **Detects**: 
  - SQL Injection vulnerabilities
  - XSS vulnerabilities
  - Hardcoded secrets
  - Insecure dependencies
  - Authentication flaws

#### 2. **SonarQube** (Secondary)
- **Purpose**: Comprehensive code quality & security analysis
- **Configuration**: `sonar-project.properties`
- **Features**:
  - Security hotspots
  - Code smells
  - Technical debt calculation
  - Coverage analysis

### SAST in Pipeline

```yaml
# Example from .github/workflows/ci-cd.yml
- name: Run Semgrep SAST
  uses: returntocorp/semgrep-action@v1
  with:
    config: >-
      p/security-audit
      p/owasp-top-ten
      p/nodejs
```

### Benefits
- **Shift Left Security** - Find vulnerabilities early
- **Cost Effective** - Fix issues before production
- **Compliance** - Meet security standards
- **Developer Education** - Learn secure coding patterns

### Example Findings
- Prevented SQL injection in query builder
- Detected exposed API keys in config
- Identified insecure password hashing

---

## ☸️ Kubernetes Deployment

### Deployment Strategy

- **Type**: Rolling Update
- **Replicas**: 3 (for high availability)
- **Health Checks**: Liveness & Readiness probes
- **Resource Limits**: CPU/Memory constraints

### Deploy to Local Cluster

```bash
# Start minikube
minikube start

# Apply configurations
kubectl apply -f k8s/

# Check deployment
kubectl get pods
kubectl get services

# Access application
minikube service task-api-service
```

### Deploy to Production

```bash
# Automated via GitHub Actions on merge to main
# Manual deployment:
kubectl apply -f k8s/ --namespace=production
kubectl rollout status deployment/task-api
```

---

## 🗄️ Database Migrations

Automated SQL migrations using Sequelize CLI:

```bash
# Create new migration
npm run migration:create -- --name add-priority-to-tasks

# Run migrations
npm run migrate

# Rollback
npm run migrate:undo
```

Pipeline validates migrations in test database before deployment.

---

## 🧪 Testing Strategy

### Unit Tests
- Controller logic
- Model validations
- Utility functions

### Integration Tests
- API endpoints
- Database operations
- Authentication flows

### Test Coverage Target
- Minimum: 80%
- Critical paths: 100%

---

## 🔮 Future Improvements

1. **Monitoring & Observability**
   - Prometheus & Grafana
   - Distributed tracing (Jaeger)
   - Centralized logging (ELK Stack)

2. **Advanced Security**
   - DAST (Dynamic Application Security Testing)
   - Dependency scanning (Dependabot)
   - Runtime protection (Falco)

3. **Performance**
   - Redis caching layer
   - CDN for static assets
   - Database connection pooling

4. **Deployment Strategies**
   - Blue-Green deployments
   - Canary releases
   - A/B testing framework

5. **GitOps**
   - ArgoCD for declarative deployments
   - FluxCD for continuous reconciliation

6. **Multi-Region**
   - Geographic distribution
   - Disaster recovery
   - Data replication

---

## 📊 Demo Preparation

### Pre-set Environment Checklist

- [ ] Minikube/Kind cluster running
- [ ] Docker images pre-built
- [ ] Database seeded with sample data
- [ ] GitHub Actions workflows tested
- [ ] SonarQube server accessible
- [ ] kubectl configured

### Demo Flow (12-15 minutes)

1. **High-Level Design** (2 min) - Architecture overview
2. **Low-Level Design** (3 min) - Components walkthrough
3. **Live Demo** (5 min):
   - Create feature branch
   - Make code change
   - Show pipeline execution
   - Show Kubernetes deployment
4. **Deep Dive - SAST** (3 min) - Security scanning details
5. **Future Improvements** (1 min)
6. **Q&A** (2 min)

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 👨‍💻 Author

DevOPS Final Project - January 2026
