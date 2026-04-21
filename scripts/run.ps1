$EnvironmentName = if ($args.Count -gt 0) { $args[0] } else { "dev" }
$Mode = if ($args.Count -gt 1) { $args[1] } else { "local" }

if ($Mode -eq "docker") {
    $ComposeFile = "docker-compose.$EnvironmentName.yml"
    if (-not (Test-Path $ComposeFile)) {
        Write-Host "Compose file not found: $ComposeFile"
        exit 1
    }

    Write-Host "Starting frontend containers with profile '$EnvironmentName'..."
    docker compose -f $ComposeFile up --build
    exit $LASTEXITCODE
}

$StartScript = "start:$EnvironmentName"

Write-Host "Installing dependencies..."
npm install

Write-Host "Starting frontend locally with profile '$EnvironmentName'..."
npm run $StartScript