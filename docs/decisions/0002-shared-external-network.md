---
id: adr-0002-shared-external-network
type: adr
status: current
updated: 2026-10-23
scope: [docker, compose, network, startup-order]
covers: [db/docker-compose.yml, backend/**/docker-compose.yml]
related: [spec-phase1-design]
supersedes: null
superseded_by: null
---

# ADR 0002: Services share one external Docker network created by the DB

**Date:** 2026-10-23
**Status:** Accepted

## Context

Every service has its own compose file and there is no root compose file (a deliberate, documented source of setup friction). Containers started from separate compose files land on separate default networks and cannot resolve each other by name, but Python must reach `db` and `php-service`, and PHP must reach `db`.

## Decision

`db/docker-compose.yml` creates the network `frankenstein-net`. The PHP and Python compose files declare it `external: true`. The frontend does not join it because the browser, not the container, calls the API.

## Options considered

| Option | Why it was attractive | Why it lost |
|---|---|---|
| Shared external network owned by the DB | Name resolution works; starting a service before the DB fails with a clear error naming the network | Teardown must run in reverse order |
| Publish ports and use `host.docker.internal` | No shared network | Linux needs extra host mapping; hides the dependency order |
| Single root compose file | Simplest | Contradicts the no-root-compose requirement |

## Consequences

Start order is enforced by compose itself. `down -v` on the DB stack fails to remove the network while other services are still attached, so teardown goes frontend → Python → PHP → DB.

## Revisit if

- A root compose file is ever introduced.
- Services move to different hosts.
