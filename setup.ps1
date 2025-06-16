Write-Host "Configurando el proyecto Studio140..." -ForegroundColor Green

# Establecer la política de ejecución para el proceso actual
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

# Verificar si Node.js está instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js no está instalado. Por favor, instala Node.js desde https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Limpiar la caché de npm
Write-Host "Limpiando caché de npm..." -ForegroundColor Yellow
npm cache clean --force

# Instalar dependencias
Write-Host "Instalando dependencias..." -ForegroundColor Yellow
npm install

# Construir el proyecto
Write-Host "Construyendo el proyecto..." -ForegroundColor Yellow
npm run build

# Iniciar el servidor de desarrollo
Write-Host "Iniciando el servidor de desarrollo..." -ForegroundColor Green
npm run dev
