# Twenty CRM — Instalación ClickBalance

Fork de [Twenty CRM](https://github.com/twentyhq/twenty) con personalización para ClickBalance México:
diseño shadcn/ui verde, interfaz en español, banner de reconexión mejorado.

---

## Requisitos

- macOS / Linux
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (o Docker Engine + Compose v2)
- Node.js 20+ y Yarn (solo para compilar el frontend)
- Git

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/emmanuelhb56/twenty.git twenty-fork
cd twenty-fork
git checkout clickbalance/v2.11.2
```

### 2. Instalar dependencias

```bash
yarn install
```

> Primera vez tarda ~5 minutos. Requiere Node 20+.

### 3. Compilar el frontend

```bash
cd packages/twenty-front

# Compilar catálogos de traducción
npx lingui compile

# Compilar el frontend (requiere ~8 GB de RAM disponible)
NODE_OPTIONS="--max-old-space-size=8192" npx nx build twenty-front --skip-nx-cache

cd ../..
```

> Tarda ~8-12 minutos la primera vez. El resultado queda en `packages/twenty-front/build/`.

### 4. Configurar variables de entorno

```bash
cd deploy
cp .env.example .env
```

Editar `.env` y completar los valores requeridos:

```env
# URL pública del servidor (cambiar en producción)
SERVER_URL=http://localhost:3000

# Claves de seguridad — generar con: openssl rand -base64 32
ENCRYPTION_KEY=reemplazar_con_clave_aleatoria
APP_SECRET=reemplazar_con_clave_aleatoria
```

> Los valores de base de datos y Redis tienen defaults funcionales para desarrollo local.
> En producción definir `PG_DATABASE_PASSWORD` con una contraseña segura.

### 5. Levantar los servicios

```bash
# Desde la carpeta deploy/
docker compose up -d
```

Verificar que todo esté saludable:

```bash
docker compose ps
```

Todos los servicios deben aparecer como `healthy`. La primera vez tarda ~2 minutos mientras se ejecutan las migraciones.

### 6. Abrir el navegador y crear workspace

Ir a **http://localhost:3000**, crear una cuenta y completar el setup del workspace.

> Es importante completar este paso antes de aplicar la localización.

### 7. Aplicar localización Español México

```bash
# Desde la carpeta deploy/
./setup-es-mx.sh
```

Este script traduce al español los nombres de objetos, campos y vistas en la base de datos (Empresa, Persona, Oportunidad, etc.).

---

## Actualizar el frontend después de cambios

Si se modifica el código fuente, recompilar y reiniciar:

```bash
# Desde la raíz del repo
cd packages/twenty-front
NODE_OPTIONS="--max-old-space-size=8192" npx nx build twenty-front --skip-nx-cache
cd ../..

# Reiniciar solo el servidor (el worker no sirve el frontend)
cd deploy
docker compose restart server
```

### Si se modificó `twenty-ui-deprecated` (Banner, Button, etc.)

```bash
# Desde la raíz del repo — compilar en orden:
npx nx build twenty-ui-deprecated --skip-nx-cache
cd packages/twenty-front
npx lingui compile
NODE_OPTIONS="--max-old-space-size=8192" npx nx build twenty-front --skip-nx-cache
```

---

## Sincronizar con upstream

```bash
git fetch upstream
git log HEAD..upstream/main --oneline   # ver qué hay nuevo

# Si hay commits nuevos:
git merge upstream/main
# resolver conflictos si los hay, luego recompilar
```

---

## Estructura del repositorio

```
twenty-fork/
├── deploy/                     # Archivos de despliegue
│   ├── docker-compose.yml      # Servicios: server, worker, db, redis
│   ├── .env.example            # Plantilla de variables de entorno
│   ├── setup-es-mx.sh          # Script de localización ES-MX
│   └── es-mx-seed.sql          # SQL con traducciones de objetos/campos
│
├── packages/
│   ├── twenty-front/           # Frontend React
│   │   ├── src/
│   │   │   ├── custom-overrides.css    # Diseño ClickBalance (verde, Inter, shadcn)
│   │   │   └── locales/es-ES.po        # Traducciones de la interfaz
│   │   └── build/              # Output del build (gitignored, generado localmente)
│   │
│   └── twenty-ui-deprecated/   # Componentes UI (Banner, Button, etc.)
│       └── src/                # Requiere recompilación separada si se modifica
│
└── INSTALL.md                  # Este archivo
```

---

## Personalización aplicada

| Área | Cambio |
|------|--------|
| Colores | Verde ClickBalance (`#22c55e`) en lugar de azul |
| Tipografía | Inter font, estilos shadcn/ui |
| Idioma | Interfaz en español (ES-MX) |
| Placeholders | "Nombre" / "Apellido" en formularios |
| Banner reconexión | Color ámbar con buen contraste |
| Hotkeys | ⌘↵ visible en botones primarios verdes |
| Base de datos | Objetos y campos en español vía `setup-es-mx.sh` |

---

## Solución de problemas

**El frontend no carga / muestra la versión oficial de Twenty**
- Verificar que `packages/twenty-front/build/` existe y tiene archivos recientes
- Revisar que el volume mount en `docker-compose.yml` apunta a la ruta correcta

**El build falla por falta de memoria**
- Aumentar `--max-old-space-size=8192` a `12288` si tiene más de 16 GB de RAM
- Cerrar aplicaciones pesadas durante el build

**Los cambios de código no aparecen en el browser**
- Hacer hard refresh: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows/Linux)
- En Firefox: vaciar caché del sitio en Preferencias → Privacidad → Datos del sitio

**Error de caché NX persistente**
```bash
rm -rf .nx/cache node_modules/.vite
# Luego recompilar
```
