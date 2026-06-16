#!/bin/bash
# ============================================================
# Twenty CRM — Setup Español México
# Uso: ./setup-es-mx.sh
# Requiere: Docker + docker compose corriendo Y workspace creado en la UI
# ============================================================

set -e

echo "⏳ Verificando que los contenedores estén saludables..."

# Esperar a que server esté healthy (máx 120s)
ATTEMPTS=0
until docker compose exec -T server curl -sf http://localhost:3000/healthz > /dev/null 2>&1; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ $ATTEMPTS -ge 24 ]; then
    echo "❌ El servidor no respondió en 120 segundos. Corre 'docker compose up -d' primero."
    exit 1
  fi
  echo "   Esperando servidor... ($((ATTEMPTS * 5))s)"
  sleep 5
done

echo "✅ Servidor listo."
echo "⏳ Verificando que exista un workspace con datos..."

# Esperar a que objectMetadata tenga filas (indica que el workspace fue creado)
ATTEMPTS=0
until [ "$(docker compose exec -T db psql -U postgres -d default -tAc 'SELECT COUNT(*) FROM core."objectMetadata";' 2>/dev/null)" -gt "0" ]; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ $ATTEMPTS -ge 24 ]; then
    echo ""
    echo "❌ No se encontró ningún workspace."
    echo ""
    echo "   Pasos requeridos antes de correr este script:"
    echo "   1. Abre http://localhost:3000"
    echo "   2. Crea una cuenta y un workspace"
    echo "   3. Vuelve a correr: ./setup-es-mx.sh"
    exit 1
  fi
  echo "   Esperando workspace... Abre http://localhost:3000 y crea una cuenta ($((ATTEMPTS * 5))s)"
  sleep 5
done

echo "✅ Workspace encontrado."
echo "🌐 Aplicando localización es-MX..."

docker compose exec -T db psql -U postgres -d default < es-mx-seed.sql | grep -v "^UPDATE 0$" || true

# Verificar que se aplicaron cambios reales
UPDATED=$(docker compose exec -T db psql -U postgres -d default -tAc \
  "SELECT COUNT(*) FROM core.\"objectMetadata\" WHERE \"labelSingular\" = 'Empresa';" 2>/dev/null)

echo ""
if [ "$UPDATED" -gt "0" ]; then
  echo "✅ Listo. Recarga el browser para ver los cambios."
  echo ""
  echo "Resumen:"
  echo "  • Objetos principales → Español"
  echo "  • Campos de Empresa, Persona, Oportunidad, Tarea, Nota → Español"
  echo "  • Vistas predeterminadas → Español"
else
  echo "⚠️  El SQL se ejecutó pero no actualizó registros."
  echo "   Verifica que el workspace esté completamente configurado e intenta de nuevo."
  exit 1
fi
