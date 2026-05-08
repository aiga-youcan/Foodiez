Write-Host "Demarrage du serveur JSON..." -ForegroundColor Green
Set-Location $PSScriptRoot
npm run server
Read-Host "Appuyez sur Entree pour fermer"