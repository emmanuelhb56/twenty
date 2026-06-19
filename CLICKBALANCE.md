# Twenty CRM — Fork ClickBalance

Fork de [Twenty CRM](https://github.com/twentyhq/twenty) adaptado para ClickBalance México.
Rama activa: `clickbalance/stage-sync`.

---

## Arquitectura

```
twenty-fork/          ← este repositorio (código fuente)
twenty-local/         ← instancia Docker (docker-compose, .env, seeds)
```

El servidor corre en Docker usando la imagen `twenty-fork:local` construida desde este repo.
El frontend se despliega copiando el build directamente al contenedor (sin reconstruir imagen).

---

## Instalación desde cero

### 1. Requisitos

- Docker Desktop ≥ 4.x con **≥ 5 GB RAM** y **≥ 4 GB swap** asignados
- Node.js 20, Yarn 4
- `nx` disponible en `./node_modules/.bin/nx`

### 2. Clonar y preparar

```bash
git clone https://github.com/emmanuelhb56/twenty-private.git twenty-fork
cd twenty-fork
git checkout clickbalance/stage-sync
yarn install
```

### 3. Configurar variables de entorno

En `twenty-local/.env` (copiar desde `.env.example` y completar):

| Variable | Descripción |
|---|---|
| `SERVER_URL` | URL pública del servidor (ej. `http://localhost:3000`) |
| `PG_DATABASE_PASSWORD` | Contraseña de PostgreSQL |
| `APP_SECRET` | Secret JWT (generar con `openssl rand -base64 32`) |
| `ENCRYPTION_KEY` | Clave de cifrado de datos |
| `STAGES_SYNC_WEBHOOK_URL` | URL del webhook n8n que devuelve las etapas del ERP |
| `AUTH_GOOGLE_CLIENT_ID` | Client ID de Google OAuth |
| `AUTH_GOOGLE_CLIENT_SECRET` | Client Secret de Google OAuth |

### 4. Construir imagen Docker

```bash
# Compilar lingui (solo si se modificaron archivos .po)
cd packages/twenty-front && npx lingui compile && cd ../..

# Build del frontend
NODE_OPTIONS="--max-old-space-size=8192" ./node_modules/.bin/nx build twenty-front --skip-nx-cache

# Build del backend
./node_modules/.bin/nx build twenty-server --skip-nx-cache

# Construir imagen
docker build -f packages/twenty-docker/twenty/Dockerfile --target twenty -t twenty-fork:local .
```

> **Nota:** El Dockerfile de producción omite `lingui:extract` (el worker SWC hace timeout).
> Si necesitas extraer strings nuevos, hazlo manualmente con `npx nx run twenty-front:lingui:extract`
> antes de construir.

### 5. Levantar servicios

```bash
cd twenty-local
docker compose up -d
```

### 6. Seed de roles y configuración inicial

```bash
# Crear los 5 roles ClickBalance (idempotente)
docker exec -i twenty-db-1 psql -U postgres -d default < seed-roles.sql
```

Las etapas de Oportunidad se sincronizan automáticamente al arrancar si
`STAGES_SYNC_WEBHOOK_URL` está configurado y el campo está vacío.
Si el webhook no está disponible, se puede sincronizar manualmente desde
**Settings → Modelo de datos → Opportunity → campo Etapa → Sincronizar etapas**.

---

## Desarrollo iterativo (sin reconstruir imagen)

### Cambios en el frontend

```bash
# 1. Build del frontend
cd ~/Desktop/twenty-fork
NODE_OPTIONS="--max-old-space-size=8192" ./node_modules/.bin/nx build twenty-front --skip-nx-cache

# 2. Copiar build al contenedor
docker cp packages/twenty-front/build/. twenty-server-1:/app/packages/twenty-server/dist/front/
```

### Cambios en el backend

```bash
# IMPORTANTE: parar el contenedor antes de compilar
# (el volume-mount del dist está activo y rimraf falla con EACCES)
docker stop twenty-server-1 twenty-worker-1

cd ~/Desktop/twenty-fork
./node_modules/.bin/nx build twenty-server --skip-nx-cache

docker start twenty-server-1 twenty-worker-1
```

### Traducciones (strings nuevos)

```bash
# Solo cuando se agregan strings nuevos con t`...` o msg`...`
cd packages/twenty-front
npx nx run twenty-front:lingui:extract    # extrae a es-ES.po
# → editar src/locales/es-ES.po y rellenar msgstr
npx lingui compile --typescript          # genera .ts
cd ../..
# → rebuild frontend
```

---

## Roles y permisos

Configurados en **Settings → Miembros → Roles**.

| Rol           | Ver | Editar | Eliminar | Destruir | Configuración          |
|--------------|-----|--------|----------|----------|------------------------|
| Member        | ✅  | ❌     | ❌       | ❌       | Solo lectura           |
| Gerente       | ✅  | ✅     | ✅       | ✅       | Usuarios + Roles       |
| Vendedor      | ✅  | ✅     | ✅       | ❌       | Ninguna                |
| Marketing     | ✅  | ✅     | ✅       | ❌       | Automatizaciones       |
| Desarrollador | ✅  | ✅     | ✅       | ✅       | Acceso total           |

- **Member** es el rol por defecto de Twenty; el seed lo modifica a solo lectura.
- **Gerente** puede agregar usuarios y asignarles roles (`WORKSPACE_MEMBERS + ROLES`).
- **Desarrollador** equivale a Admin para operaciones (sin el lock del rol Admin built-in).

---

## Funcionalidades agregadas al fork

### Sincronización de etapas de Oportunidad

Mantiene sincronizado el campo `Etapa` de Oportunidades con el catálogo del ERP ClickBalance.

- **Automático al arrancar:** si `STAGES_SYNC_WEBHOOK_URL` está configurado y el campo `stage` aún tiene las etapas de ejemplo de Twenty (NEW, SCREENING, MEETING, PROPOSAL, CUSTOMER), las reemplaza con los datos del ERP. Si ya fueron sincronizadas o personalizadas, no las toca.
- **Manual:** Settings → Modelo de datos → Opportunity → campo Etapa → botón "Sincronizar etapas".
- **Contrato del webhook:** `GET STAGES_SYNC_WEBHOOK_URL` debe devolver:
  ```json
  { "stages": [{ "id": 1, "nombre": "Contactar cliente", "descripcion": "", "es_etapa_cierre": false }] }
  ```
- **Código:**
  - `packages/twenty-server/src/engine/metadata-modules/stage-sync/services/stage-sync.service.ts` — lógica de sync + `syncOpportunityStagesIfDefaulted()`
  - `packages/twenty-server/src/engine/metadata-modules/stage-sync/services/stage-sync-bootstrap.service.ts` — hook `OnApplicationBootstrap`

### Sin datos de ejemplo en instalación nueva

Por defecto, Twenty crea empresas, personas y oportunidades de demostración al activar un workspace (Airbnb, Anthropic, Stripe, etc.). En este fork esos datos **no se insertan**; el workspace arranca limpio.

Lo único que sí se pre-carga son los **workflows template** (plantillas de automatización), porque aportan valor sin ensuciar el modelo de datos.

- **Archivo modificado:** `packages/twenty-server/src/engine/core-modules/workspace/services/workspace.service.ts` → método `prefillCreatedWorkspaceRecords()`
- **Eliminado:** llamadas a `prefillCompanies`, `prefillPeople`, `prefillOpportunities`, `prefillDashboards`
- **Conservado:** `prefillWorkflows`, `prefillWorkflowCommandMenuItems`, `prefillLogicFunctionService.ensureSeeded`

### Webhook n8n al ganar oportunidad

Cuando una oportunidad cambia a la etapa de cierre (`STAGE_5`), n8n recibe un POST con los datos
completos del cliente/empresa y los mapea al schema ERP (`clientes`).

### UI / Branding ClickBalance

- Botones primarios en verde ClickBalance (`#22C55E`)
- Tipografía Plus Jakarta Sans
- Botón X para cerrar el panel lateral (solo desktop)
- Botón "Cancelar" en el editor de código de workflows
- Handle del panel redimensionable siempre visible con color brand

### Traducciones al español (ES-MX)

- Estados de workflow: Archivado, Borrador, Activo
- Strings de UI: Recientes, Sin conversaciones, Cronología, etc.

---

## Rama y repositorios

| Remoto | URL |
|---|---|
| `origin` | `https://github.com/emmanuelhb56/twenty.git` (público) |
| `private` | `https://github.com/emmanuelhb56/twenty-private.git` (privado) |
| `upstream` | `https://github.com/twentyhq/twenty.git` |

```bash
# Pushear a ambos
git push origin clickbalance/stage-sync --force-with-lease
git push private clickbalance/stage-sync --force-with-lease

# Sincronizar con upstream
git fetch upstream
git log HEAD..upstream/main --oneline   # ver qué hay nuevo
git rebase upstream/main                # rebasear
```

Conflictos esperados en futuros rebases: `SidePanelTopBar.tsx`, `es-ES.po`.
La migración masiva de `twenty-ui-deprecated` ya está resuelta.

---

## Pendientes

- [ ] Automatizar sync de etapas vía webhook inverso (ERP → n8n → Twenty) o cron en n8n
      — pendiente verificar si el ERP soporta webhooks salientes
- [ ] Cloudflare tunnel en docker-compose (actualmente se levanta manualmente)
- [ ] Actualizar `.env.example` con variables del fork (`STAGES_SYNC_WEBHOOK_URL`)
- [ ] Verificar strings "Recientes"/"Sin conversaciones" en panel IA
