# Growcomers: Online Grocery Store

![Project Logo](frontend/src/assets/logoBig.svg)

## Table of Contents

- [Overview](#overview)
- [Deployment](#deployment)
- [Dataset](#dataset)
- [Technologies](#technologies)
- [Features](#features)
- [Architecture](#architecture)
- [Screenshots](#screenshots)

## Overview

This repository contains the source code of the web application built for final year thesis on **Implementation of Recommender System and Cryptocurrency Payments in E-commerce**. The E-commerce Web Application built using React, Tailwind CSS, and Redux in the frontend. The application consists of two backend servers: a Node.js server for data management and authentication, and a Python Flask server for handling machine learning models.

The platform provides a range of features including:

- Hybrid product recommender system incorporating neural collaborative filtering, content-based filtering, and popularity recommender algorithms.
- Chatbot for assisting users and addressing their queries.
- Fuzzy matching-based smart search for efficient product discovery.
- Support for online payments using credit cards and cryptocurrency.
- Invoice generation and automatic email delivery.

## Deployment

The application has been deployed and is accessible at the following link: [Growcomers: Online Grocery Store](https://growcomers.netlify.app). The website is a demo application and we do not fulfill any orders placed at the website.

## Dataset

We have used Grocery and Gourmet Food dataset from [Amazon Reviews Data](https://nijianmo.github.io/amazon/index.html) to train our recommender system model and the metadata from the same dataset is used in our website. We do not own the dataset.

## Technologies

The following technologies were used in the development of this project:

- React
- Tailwind CSS
- Redux
- Node.js
- Python Flask
- MongoDB
- Cloudinary
- SendGrid
- Stripe
- Ethereum
- Solidity
- Truffle
- Ganache

## Features

- **Hybrid product recommender system**: The recommender system combines neural collaborative filtering, content-based filtering, and popularity-based recommendations to provide personalized product recommendations to users.

- **Chatbot**: The built-in chatbot assists users by addressing their queries, adding product to carts, and providing relevant information about orders and services.

- **Fuzzy matching-based smart search**: The search functionality employs fuzzy matching algorithms to offer intelligent and efficient product search capabilities, ensuring users find what they're looking for quickly.

- **Online payments**: Seamless integration with credit card and cryptocurrency payment gateways enables secure and hassle-free online transactions.

- **Invoice generation**: The system generates detailed invoices for each transaction, providing users with a comprehensive breakdown of their purchase.

- **Automatic email delivery**: Users receive automated email notifications for activating their account and resetting their password.

- **Admin Panel**: The admin can manage the orders, users, products and also train the machine learning models.

## Architecture

![System Architecture](readmeImages/architecture.png)

The system architecture is a three-tier architecture with Frontend, Backend (Server) and database. The main system that the application uses are divided into modules and implemented in the respective backend servers. The frontend interacts with backend using REST APIs and the backend is connected to MongoDB using the MongoDB driver.

## Screenshots

<div align="center">
  <img src="readmeImages/growcomers.png" alt="growcomers" width="400" />
  <img src="readmeImages/login.png" alt="login" width="400" />
</div>

<div align="center">
  <img src="readmeImages/chatbot.png" alt="chatbot" width="400" />
  <img src="readmeImages/checkout.png" alt="checkout" width="400" />
</div>

## DevOps and Deployment

### Docker
The application uses Docker and Docker Compose for local containerization.

Validate the Compose configuration:
```bash
docker compose config --quiet
```

### CI/CD
GitHub Actions workflow: .github/workflows/ci.yml.
Jenkins pipeline configuration: Jenkinsfile.
The pipeline configurations include Docker builds, Python syntax checks, and Trivy vulnerability scans. Pipeline execution must be verified separately.

### Kubernetes
Kubernetes manifests are maintained in the k8s/ directory. A local kind cluster is used for practice and validation.

### Monitoring
Prometheus, Grafana, and cAdvisor are configured in docker-compose.monitoring.yml.

Start monitoring services:
```powershell
docker compose -f docker-compose.monitoring.yml up -d
```

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001
- cAdvisor: http://localhost:8080

The Grafana dashboard tracks service health, CPU usage, and memory usage.

### Local Application URLs
- Frontend: http://localhost:3000
- Node.js backend: http://localhost:4000
- Python backend: http://localhost:5000
- Ganache RPC: http://127.0.0.1:8545

## Local DevOps Monitoring

### Start monitoring

```powershell
docker compose -f .\docker-compose.monitoring.yml up -d
```

### Endpoints

- Grafana: http://localhost:3001
- Prometheus: http://localhost:9090
- cAdvisor: http://localhost:8080

### Alerts

Rules are configured in `monitoring/alert-rules.yml`.

- `PrometheusTargetDown`: target remains down for 2 minutes.
- `ContainerMemoryHigh`: container memory remains above 1 GiB for 5 minutes.

View loaded rules at http://localhost:9090/alerts.

Alert rules are evaluated by Prometheus. External notifications require Alertmanager and a configured receiver.

### Kubernetes checks

```powershell
kubectl get deployments,pods,services,ingress -n growcomers
kubectl get hpa -n growcomers
kubectl top pods -n growcomers
```

Prometheus currently scrapes Prometheus and cAdvisor; it does not directly scrape Kubernetes pod metrics.
