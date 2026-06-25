# CraftFlow

Production-grade multi-tenant SaaS platform for home-based businesses including handmade craft sellers, bakers, candle makers, jewelry creators, crochet artists, and custom gift businesses.

---

# Overview

CraftFlow enables multiple businesses to operate independently within a single platform while maintaining complete tenant-level data isolation.

The system provides:

* Multi-tenant workspace management
* Product and inventory management
* Customer relationship management
* Order lifecycle management
* Production workflow tracking
* Production scheduling and planning
* Staff collaboration
* Business analytics and dashboards
* Customer ordering experience

---

# Key Features

## Multi-Tenant SaaS

* Tenant-aware architecture
* Isolated business workspaces
* Tenant-specific authentication
* Shared infrastructure with secure segregation
* Scalable for thousands of businesses

## Authentication & Authorization

* Business registration
* Owner onboarding
* JWT authentication
* Password reset
* Role-based access control (RBAC)
* Staff invitation system

## Product Management

* Product catalog
* Categories
* Product images
* Pricing management
* Production time tracking
* Stock availability
* Product search and filtering

## Customer Management

* Customer profiles
* Contact information
* Address management
* Notes and communication history
* Order history tracking

## Inventory Management

* Raw materials
* Finished goods
* Inventory transactions
* Stock in / stock out
* Low stock monitoring
* Inventory audit trail

## Order Management

* Order creation
* Customer assignment
* Payment tracking
* Delivery scheduling
* Order timeline
* Order history

## Production Workflow

Supported workflow stages:

Received

→ Confirmed

→ Materials Ready

→ In Production

→ Quality Check

→ Ready To Ship

→ Delivered

Features:

* Workflow validation
* Stage transition enforcement
* Status tracking
* Timeline history

## Production Planning Engine

* Order prioritization
* Delivery deadline analysis
* Production queue generation
* Capacity utilization tracking
* Delay detection
* Completion estimation

## Kanban Board

* Drag-and-drop workflow management
* Real-time status updates
* Backend synchronization
* Production visibility

## Dashboard & Analytics

* Revenue tracking
* Order metrics
* Production metrics
* Inventory alerts
* Monthly sales reports
* Top-performing products
* Fulfillment analytics

## Notifications

* New orders
* Order confirmation
* Production updates
* Shipping updates
* Delivery updates
* Inventory alerts

---

# Technology Stack

## Frontend

* React Native
* TypeScript
* Redux Toolkit
* React Query

## Backend

* Java 21
* Spring Boot
* Spring Security
* JWT Authentication
* Spring Data JPA

## Database

* PostgreSQL

## Infrastructure

* Docker
* Docker Compose

---

# Architecture

## Backend Architecture

Controller

→ Service

→ Repository

→ Database

Patterns Used:

* DTO Pattern
* Service Layer Pattern
* Repository Pattern
* Global Exception Handling
* Validation Layer
* JWT Security Layer

## Multi-Tenant Design

* Tenant Context Resolution
* Tenant-Aware Security
* Tenant-Aware Queries
* Data Isolation
* Workspace Segregation

---

# Core Modules

* Tenant Management
* Business Management
* User Management
* Staff Management
* Product Management
* Category Management
* Customer Management
* Inventory Management
* Order Management
* Production Planning
* Workflow Management
* Notification Management
* Dashboard & Analytics

---

# Database Entities

* Tenants
* Users
* Roles
* Businesses
* Staff
* Customers
* Categories
* Products
* Inventory
* InventoryTransactions
* Orders
* OrderItems
* ProductionTasks
* Notifications

---

# Security

* JWT Authentication
* Role-Based Access Control
* Tenant-Aware Authorization
* Password Encryption
* Secure API Access
* Request Validation
* Global Exception Handling

---

# Scalability Goals

* 1,000+ Active Businesses
* 100,000+ Orders
* 1,000,000+ Inventory Records
* Optimized Database Indexing
* Pagination Support
* Efficient Querying
* Sub-200ms API Response Targets

---

# Deployment

## Docker

```bash
docker-compose up --build
```

## Services

* Frontend Application
* Spring Boot API
* PostgreSQL Database

---

# Future Enhancements

* Mobile Push Notifications
* Payment Gateway Integration
* AI-Based Demand Forecasting
* Automated Inventory Replenishment
* Multi-Warehouse Support
* Advanced Reporting
* Marketplace Integration

---

# Summary
CraftFlow — Multi-Tenant SaaS Platform
CraftFlow is a production-grade multi-tenant SaaS platform built for home-based businesses including craft sellers, bakers, and candle makers, where each business operates in a fully isolated workspace. Core features include a 7-stage order workflow state machine, drag-and-drop Kanban board, smart production scheduling engine that auto-prioritizes orders by deadline, inventory management with low-stock alerts, and a customer CRM with lifetime value tracking. Role-based access control enforces Owner, Staff, and Customer permissions across every endpoint, replacing scattered tools like WhatsApp and spreadsheets with one unified business platform.
Tech Stack: Java 21, Spring Boot, PostgreSQL, React 18, Redux Toolkit, Docker

---

# CraftFlow

**Manage. Produce. Deliver. Grow.**
A unified operating platform for modern home-based businesses.
