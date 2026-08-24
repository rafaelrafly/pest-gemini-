# Field Operations Management Platform — Pest Control

Production-ready, enterprise-grade Field Operations Management Platform built specifically for Pest Control companies. Designed with Clean Architecture, Secure Authentication, Role + Individual Granular Permissions, Real-Time GPS Tracking, Offline Sync (Outbox Pattern), and Pixel-Perfect PDF Service Reports matching the Proteksi Pest Control template.

## Features
- **Admin Dashboard & Technician Mobile-First Interface**
- **Granular Permission Matrix** (VIEW, CREATE, UPDATE, DELETE, APPROVE, EXPORT, TRACK, MANAGE)
- **GPS Tracking & Geofencing** (100m radius check-in validation, adaptive fallback)
- **Attendance with Live Camera & Geotagging**
- **Service Reports** matching Proteksi Pest Control template (Pest findings F, M, C, R, A, O, treatments, signatures, and 6-photo documentation grid)
- **Offline Mode & Outbox Sync** (IndexedDB + Automatic Synchronization)
- **Audit & Activity Logs**
- **Database Backup & System Health Monitoring**

## Quick Start with Docker
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- PostgreSQL & Redis running internally.
