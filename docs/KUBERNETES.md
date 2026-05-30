# Kubernetes Deployment Guide

## Overview

Kubernetes manifests are organized using `kustomize`:

- `k8s/base`: shared resources for all environments.
- `k8s/overlays/staging`: staging overrides.
- `k8s/overlays/production`: production overlay.

## Resources Included

The base stack includes:

- Backend `Deployment` + `Service`
- Frontend `Deployment` + `Service`
- PostgreSQL `StatefulSet` + headless `Service`
- Redis `StatefulSet` + headless `Service`
- `Ingress` with TLS termination
- Backend `HorizontalPodAutoscaler`
- `ConfigMap` defaults and `Secret` template

## Secrets

Before applying manifests, create/update `stellarinsure-secrets` with real values.

Template reference: `k8s/base/secret-template.yaml`

Never commit populated secret manifests.

## Deploy Commands

```bash
kubectl apply -k k8s/overlays/staging
kubectl apply -k k8s/overlays/production
```

## Rolling Deployment Behavior

- Backend/frontend deployments use `RollingUpdate` with `maxUnavailable: 0`.
- HPA scales backend pods between 2 and 8 replicas based on CPU utilization.

## Secret Rotation

Regularly rotate all long-lived secrets to limit the blast radius of a credential leak. Below is a per-secret rotation guide for the entries in `k8s/base/secret-template.yaml`.

| Secret key | Rotation trigger | User/session impact | Recommended steps |
|---|---|---|---|
| `JWT_SECRET_KEY` | Every 90 days or on compromise | All active sessions invalidated; users must re-authenticate. | 1. Generate new key: `openssl rand -hex 64`<br>2. Update the Secret and rollout the backend.<br>3. Old tokens are rejected immediately — warn users before rotation. |
| `DATABASE_URL` | On credential leak only | Brief connection drain; in-flight queries fail and must be retried. | 1. Update `POSTGRES_PASSWORD` first (see below).<br>2. Apply new Secret; backend pods will reconnect via pooled connections.<br>3. Monitor for `FATAL: password authentication failed` during the window. |
| `STELLAR_ADMIN_SECRET` | Every 180 days or on compromise | No direct user impact; contract admin operations may fail until updated. | 1. Generate a new Stellar keypair: `stellar keys generate --fund testnet`.<br>2. Update the Secret and rollout.<br>3. Transfer contract ownership or update admin reference in the contract if the address changed. |
| `STELLAR_ADMIN_PUBLIC` | In lockstep with `STELLAR_ADMIN_SECRET` | None — derived from the secret. | Update alongside the secret above. |
| `STELLAR_CONTRACT_ID` | On contract upgrade or re-deployment | Operations targeting the old contract ID fail until clients refresh. | 1. Deploy new contract and verify.<br>2. Update the Secret and rollout backend.<br>3. Announce the new contract ID to downstream consumers. |
| `STORAGE_SECRET_KEY` | Every 90 days | Stored files remain accessible; new uploads signed with old key fail silently. | 1. Generate new key: `openssl rand -hex 32`.<br>2. Apply new Secret; backend rotates signing key at next startup.<br>3. Verify upload / download flows in staging first. |
| `WEBHOOK_SECRET_KEY` | Every 90 days or on compromise | Webhook payloads signed with the old key fail HMAC verification on the consumer side. | 1. Generate new key: `openssl rand -hex 32`.<br>2. Coordinate with webhook consumers to accept both old and new signatures during a transition window.<br>3. Apply new Secret and remove old consumer key after one week. |
| `POSTGRES_PASSWORD` | Every 180 days or on credential leak | Active connections drain; brief read/write failures while pods reconnect. | 1. Update the password in PostgreSQL first: `ALTER USER postgres PASSWORD 'new-password';`<br>2. Update the Secret and rollout backend.<br>3. **Staging → Production** — always test the rotation on staging first.<br>4. ⚠️ **WARNING** — Rotating the database password will briefly interrupt all services that depend on the database. Plan during a maintenance window. |
| `REDIS_PASSWORD` | Every 180 days or on compromise | Cache entries are lost if Redis restarts; brief increase in backend latency. | 1. Update Redis password: `CONFIG SET requirepass "new-password"`.<br>2. Apply new Secret; backend caches will reconnect transparently.<br>3. If enabled for sessions, expect all users to be logged out. |

### General rotation procedure

1. **Generate** the new secret value using a secure random source (openssl, `stellar keys`, or your vault).
2. **Apply** the updated manifest: `kubectl apply -k k8s/overlays/<environment>`.
3. **Rollout** the affected pods: `kubectl rollout restart deployment/<name>`.
4. **Verify** the deployment is healthy and the new secret is picked up.
5. **Invalidate** old secrets when the rotation window closes.

> **⚠️ HIGH IMPACT** — Database and Redis password rotations affect all connected services. Always test in staging before production and schedule outside business hours.
