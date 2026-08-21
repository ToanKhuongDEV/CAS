[CmdletBinding()]
param(
    [switch]$Check
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = Join-Path $projectRoot "frontend"

if ($Check) {
    Push-Location $backendPath
    try {
        .\mvnw.cmd spotless:check
        if ($LASTEXITCODE -ne 0) {
            throw "Backend formatting check failed."
        }
    }
    finally {
        Pop-Location
    }

    Push-Location $frontendPath
    try {
        npm exec prettier -- --check src
        if ($LASTEXITCODE -ne 0) {
            throw "Frontend formatting check failed."
        }
    }
    finally {
        Pop-Location
    }
    exit 0
}

Push-Location $backendPath
try {
    .\mvnw.cmd spotless:apply
    if ($LASTEXITCODE -ne 0) {
        throw "Backend formatting failed."
    }
}
finally {
    Pop-Location
}

Push-Location $frontendPath
try {
    npm run format
    if ($LASTEXITCODE -ne 0) {
        throw "Frontend formatting failed."
    }
}
finally {
    Pop-Location
}
