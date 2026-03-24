# 🛡️ Mission Control Windows Joiner
# Este script prepara cualquier PC para unirse a la flota de Antigravity.

$RepoUrl = "https://github.com/krisyiser/mission_control.git"
$DashboardUrl = "https://mission-control-krisyiser.netlify.app"

Write-Host "🚀 Iniciando conexión con Mission Control..." -ForegroundColor Cyan

# 1. Clonar el repositorio
if (Test-Path "$HOME\mission_control") {
    Write-Host "Repo ya existe, actualizando..." -ForegroundColor Gray
    cd "$HOME\mission_control"
    git pull origin main
} else {
    git clone $RepoUrl "$HOME\mission_control"
    cd "$HOME\mission_control"
}

# 2. Configurar el entorno (Inyectando secretos de la flota)
$EnvContent = "GITHUB_TOKEN=GH_TOKEN_PLACEHOLDER`n" +
              "NETLIFY_TOKEN=NF_TOKEN_PLACEHOLDER`n" +
              "NEXT_PUBLIC_SUPABASE_URL=https://duocjcqwjrnkoqrnqukw.supabase.co`n" +
              "NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_go9XJaZDTBup27HKF5YS9g_QaaFs1Lv`n" +
              "DATABASE_URL=postgresql://postgres:Q,9cX,9Smy6DK/,@db.duocjcqwjrnkoqrnqukw.supabase.co:5432/postgres`n" +
              "GITHUB_USERNAME=krisyiser"

$EnvContent | Out-File -Encoding utf8 ".env.local"

# 3. Instalar dependencias necesarias
Write-Host "📦 Instalando dependencias de flota..." -ForegroundColor Gray
npm install --silent

# 4. Registrar la máquina en el Dashboard con hardware real
Write-Host "📡 Registrando hardware de esta máquina..." -ForegroundColor Yellow
node scripts/register-machine.js $DashboardUrl

Write-Host "`n✅ [SUCCESS] Esta computadora Windows ahora es un agente de la flota." -ForegroundColor Green
Write-Host "🤖 [AUTONOMÍA] El flujo /fleet-worker está activo con // turbo-all habilitado." -ForegroundColor Green
Write-Host "💡 Inicia el agente pidiendo: 'Ejecuta el flujo /fleet-worker'" -ForegroundColor Cyan
