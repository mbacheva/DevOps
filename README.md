# DevOps Final Project - Task Management API

##  Project Overview

This project was developed as my final assignment for the DevOps course.
The goal was to apply the main DevOps concepts covered during the semester
by building an automated software delivery pipeline around a small but realistic application.

I chose to implement a simple Task Management API in order to focus on the DevOps workflow itself,
rather than on complex application logic. This allowed me to experiment with CI/CD automation,
security scanning, containerization, and deployment in a controlled environment.

The project covers the following DevOps topics from the course curriculum:

- **Source Control** – Git with GitHub for version management  
- **Branching Strategy** – GitFlow approach using `main`, `develop`, and feature branches  
- **Continuous Integration** – Automated testing, linting, and security scans  
- **Continuous Delivery** – Automated deployment pipeline targeting Kubernetes  
- **Security** – SAST scanning with SonarQube and Semgrep, along with container vulnerability checks  
- **Docker** – Application containerization  
- **Kubernetes** – Container orchestration and deployment (mandatory course requirement)  
- **Infrastructure as Code** – Terraform configurations for provisioning cloud resources  
- **Database Changes** – Automated SQL migrations with basic validation and testing  

###  Deep Dive Topic: SAST (Static Application Security Testing)

For the deep dive component of this project, I focused on Static Application Security Testing (SAST).
The goal was to better understand how SAST tools are integrated into modern CI/CD pipelines
and what types of vulnerabilities can realistically be detected at this stage.

I chose to work with both Semgrep and SonarQube in order to compare different approaches to static analysis.
Using two tools made it easier to observe their strengths and limitations,
as well as the differences in configuration, rule sets, and reporting. This comparison helped me better understand which types of issues are better suited for static analysis
and which would require additional security measures at later stages of the pipeline.

---

##  High-Level Solution Design

The overall architecture follows a standard CI/CD pattern. When code is pushed to the repository, GitHub Actions automatically triggers a series of validation and deployment steps:

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

**Note**: In a production environment, additional steps like manual approval gates and more comprehensive testing would be necessary. For this academic project, I focused on demonstrating the core automated workflow.

---

##  Low-Level Solution Design

For the implementation, I selected technologies that are commonly used in industry and that we covered during the course. The choices were also influenced by available documentation and community support.

### Application Stack
- **Runtime**: Node.js 20 LTS - chosen for its stability and widespread use in REST APIs
- **Framework**: Express.js - relatively straightforward for building REST endpoints
- **Database**: PostgreSQL 15 - a robust relational database suitable for structured data
- **ORM**: Sequelize - provides migration support and abstraction over raw SQL
- **Testing**: Jest + Supertest - standard testing tools for Node.js applications
- **Linting**: ESLint + Prettier - helps maintain code consistency

### Infrastructure
- **Container Registry**: GitHub Container Registry - convenient integration with GitHub Actions
- **Orchestration**: Kubernetes - using minikube for local development and testing
  - *Limitation*: Full cloud deployment (EKS/AKS/GKE) would require additional setup and costs
- **IaC**: Terraform - configuration provided for AWS, though not fully deployed due to cost constraints
- **Monitoring**: Basic kubectl commands and Kubernetes Dashboard
  - *Limitation*: More comprehensive monitoring (Prometheus/Grafana) would be beneficial but added complexity

### Security Tools
- **SAST**: Semgrep (primary tool, open-source), SonarQube (for code quality metrics)
- **Container Scanning**: Trivy - scans Docker images for known vulnerabilities
- **Secrets Management**: Kubernetes Secrets for deployment, dotenv for local development

---

##  Project Structure

```
DevOps/
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

##  Getting Started

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
cd DevOps

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

##  CI/CD Pipeline Workflow

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

##  Deep Dive: SAST Implementation

### What is SAST?

Static Application Security Testing is a security testing methodology that analyzes source code without executing the program. It's considered a "white-box" testing approach since it has full access to the codebase. During my research, I learned that integrating SAST early in the development lifecycle is more cost-effective than finding security issues later in production.

### Tools Implemented

I chose to implement two SAST tools to understand their different approaches:

#### 1. **Semgrep** (Primary)
- **Purpose**: Pattern-based code scanning that's relatively fast
- **Configuration**: Custom rules in `.semgrep.yml` plus predefined rulesets
- **What it detects**: 
  - SQL Injection vulnerabilities
  - Cross-site scripting (XSS) patterns
  - Hardcoded secrets
  - Insecure dependencies
  - Authentication issues

**Rationale**: Semgrep was selected because it's open-source, well-documented, and integrates easily with GitHub Actions. It also has a lower false-positive rate compared to some alternatives.

#### 2. **SonarQube** (Secondary)
- **Purpose**: Comprehensive code quality and security analysis
- **Configuration**: `sonar-project.properties`
- **Features**:
  - Security hotspots requiring manual review
  - Code smells and maintainability metrics
  - Technical debt estimation
  - Test coverage tracking

**Rationale**: SonarQube provides broader code quality insights beyond just security, which helps understand overall code health.

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

### Observations and Learnings
- **Early Detection** - Finding issues during development is significantly easier to fix
- **Learning Tool** - The scanner feedback helped me understand common security pitfalls
- **Limitations** - SAST cannot detect all vulnerabilities (e.g., business logic flaws, runtime issues)
- **False Positives** - Some warnings required manual review to determine if they were actual issues

### Example Findings During Development
- Identified a potential SQL injection risk in an early version of the query builder
- Detected test credentials that were temporarily hardcoded during development
- Flagged insecure random number generation that I replaced with crypto.randomBytes()

---

##  Kubernetes Deployment

### Deployment Strategy

I configured Kubernetes to use a rolling update strategy, which allows updates without downtime. The setup includes:

- **Type**: Rolling Update
- **Replicas**: 3 pods (for high availability and load distribution)
- **Health Checks**: Liveness and Readiness probes to ensure pods are functioning correctly
- **Resource Limits**: CPU/Memory constraints to prevent resource exhaustion

**Note**: While three replicas provide redundancy, a production environment might require more sophisticated traffic management and geographic distribution.

### Deploy to Local Cluster

For local testing and development, I used minikube:

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

**Limitation**: The automated deployment assumes a pre-configured Kubernetes cluster. Setting up the initial cluster infrastructure would require additional steps documented in the Terraform configuration.

---

##  Database Migrations

Database schema changes are managed through Sequelize migrations, which provide version control for the database structure:

```bash
# Create new migration
npm run migration:create -- --name add-priority-to-tasks

# Run migrations
npm run migrate

# Rollback
npm run migrate:undo
```

The pipeline includes a validation step that tests migrations against a clean test database before deployment. This helps catch migration errors early, though it doesn't guarantee that migrations will work perfectly with existing production data.

---

##  Testing Strategy

I implemented two levels of automated testing:

### Unit Tests
- Controller logic validation
- Model validations and methods
- Utility functions

### Integration Tests
- API endpoint behavior
- Database operations and transactions
- End-to-end request/response flows

### Test Coverage Goals
- Target: Minimum 80% overall coverage
- Critical paths: Aiming for 100% coverage

**Current Status**: The basic test suite is in place, though achieving high coverage on all edge cases would require additional test scenarios. In a real project, I would also consider adding end-to-end tests with tools like Cypress or Playwright.

---

##  Potential Improvements and Limitations

While working on this project, I identified several areas where the solution could be extended or improved:

1. **Monitoring & Observability**
   - Adding Prometheus and Grafana for metrics visualization
   - Implementing distributed tracing (e.g., Jaeger) to track requests across services
   - Centralized logging with the ELK Stack (Elasticsearch, Logstash, Kibana)
   - *Current limitation*: Monitoring is minimal, relying mainly on kubectl logs

2. **Advanced Security**
   - DAST (Dynamic Application Security Testing) for runtime vulnerability detection
   - Automated dependency scanning with tools like Dependabot
   - Runtime protection with Falco
   - *Current limitation*: Security focuses primarily on static analysis

3. **Performance Optimization**
   - Redis caching layer to reduce database load
   - CDN integration for static assets
   - Database connection pooling optimization
   - *Note*: Current implementation is functional but not optimized for high traffic

4. **Deployment Strategies**
   - Blue-Green deployments for zero-downtime releases
   - Canary releases for gradual rollouts
   - A/B testing framework for feature experimentation
   - *Current limitation*: Only basic rolling updates are implemented

5. **GitOps Approach**
   - ArgoCD for declarative deployments and better visualization
   - FluxCD for continuous reconciliation
   - *Justification*: These would add complexity but improve deployment consistency

6. **Geographic Distribution**
   - Multi-region deployment
   - Disaster recovery procedures
   - Data replication across regions
   - *Limitation*: Single-region deployment due to cost and complexity constraints

---

##  Demo Preparation

### Pre-Demo Environment Checklist

To ensure a smooth demonstration, I've prepared the following:

- [ ] Minikube/Kind cluster pre-started and verified
- [ ] Docker images pre-built to avoid long build times during demo
- [ ] Database seeded with sample task data for demonstration
- [ ] GitHub Actions workflows tested with recent commits
- [ ] SonarQube server accessible (if demonstrating live scanning)
- [ ] kubectl properly configured and tested

### Planned Demo Flow (12-15 minutes)

Based on the project requirements, I've organized the demonstration as follows:

1. **High-Level Architecture** (2 min) - Overview of the complete pipeline and how components interact
2. **Low-Level Implementation** (3 min) - Walkthrough of key components and configuration files
3. **Live Pipeline Demonstration** (5 min):
   - Creating a feature branch
   - Making a small code change (e.g., adding a field)
   - Triggering the automated pipeline
   - Showing Kubernetes deployment and verification
4. **Deep Dive - SAST** (3 min) - Detailed explanation of security scanning implementation and findings
5. **Potential Improvements** (1 min) - Discussion of identified limitations and future work
6. **Q&A** (2 min) - Time for questions

**Note**: The environment will be pre-configured to avoid waiting for lengthy operations during the live demo.

---

##  License

This project is released under the MIT License - see the LICENSE file for details.

---

**Acknowledgments**: This project builds upon concepts and best practices covered in the DevOps course curriculum. The implementation benefited from various open-source tools and community documentation.
