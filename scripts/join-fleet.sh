#!/bin/bash
# 🛡️ Mission Control Fleet Joiner
# Este script prepara cualquier PC para unirse a la flota de Antigravity.

echo "🚀 Iniciando conexión con Mission Control..."

# 1. Clonar el repositorio
git clone https://github.com/krisyiser/mission_control.git ~/mission_control
cd ~/mission_control

# 2. Configurar el entorno (Tus Tokens ya están aquí)
cat <<EOF > .env.local
GITHUB_TOKEN=GH_TOKEN_PLACEHOLDER
NETLIFY_TOKEN=NF_TOKEN_PLACEHOLDER
NEXT_PUBLIC_SUPABASE_URL=https://duocjcqwjrnkoqrnqukw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_go9XJaZDTBup27HKF5YS9g_QaaFs1Lv
DATABASE_URL=postgresql://postgres:Q,9cX,9Smy6DK/,@db.duocjcqwjrnkoqrnqukw.supabase.co:5432/postgres
GITHUB_USERNAME=krisyiser
EOF

# 3. Instalar dependencias necesarias
npm install --silent

# 4. Registrar la máquina en el Dashboard con hardware real
node scripts/register-machine.js https://mission-control-krisyiser.netlify.app

echo "✅ [SUCCESS] Esta máquina se ha unido a la flota."
echo "🤖 [AUTONOMÍA] El flujo /fleet-worker está activo con // turbo-all habilitado."
