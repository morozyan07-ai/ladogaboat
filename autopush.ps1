# autopush.ps1 — следит за изменениями и автоматически пушит в GitHub
# Запускать в PowerShell: .\autopush.ps1
# Остановить: Ctrl+C

$repoPath = $PSScriptRoot
$debounceSeconds = 3   # пауза после последнего изменения перед коммитом

Write-Host "Watching $repoPath" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor DarkGray

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $repoPath
$watcher.Filter = "*.*"
$watcher.IncludeSubdirectories = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite -bor [System.IO.NotifyFilters]::FileName

# Игнорируем .git, node_modules, .next
$ignorePatterns = @('.git\', 'node_modules\', '.next\', 'autopush.ps1')

$lastEvent = [datetime]::MinValue
$timer = $null

function Should-Ignore($path) {
    foreach ($pattern in $ignorePatterns) {
        if ($path -like "*$pattern*") { return $true }
    }
    return $false
}

function Do-Push {
    param([string]$changedFile)

    $now = Get-Date
    $script:lastEvent = $now

    # Debounce — ждём $debounceSeconds после последнего изменения
    Start-Sleep -Seconds $debounceSeconds
    if ($script:lastEvent -ne $now) { return }  # пришло новое событие, пропускаем

    Set-Location $repoPath

    $status = git status --porcelain 2>&1
    if (-not $status) { return }  # нечего коммитить

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "`n[$timestamp] Changes detected:" -ForegroundColor Yellow
    git status --short

    git add -A
    git commit -m "auto: $timestamp"

    Write-Host "Pushing..." -ForegroundColor Cyan
    $result = git push 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Pushed OK" -ForegroundColor Green
    } else {
        Write-Host "Push failed: $result" -ForegroundColor Red
    }
}

$onChange = {
    $path = $Event.SourceEventArgs.FullPath
    if (-not (Should-Ignore $path)) {
        Do-Push -changedFile $path
    }
}

Register-ObjectEvent $watcher "Changed" -Action $onChange | Out-Null
Register-ObjectEvent $watcher "Created" -Action $onChange | Out-Null
Register-ObjectEvent $watcher "Deleted" -Action $onChange | Out-Null
Register-ObjectEvent $watcher "Renamed" -Action $onChange | Out-Null

$watcher.EnableRaisingEvents = $true

Write-Host "Watcher active. Waiting for file changes..." -ForegroundColor Green

try {
    while ($true) { Start-Sleep -Seconds 1 }
} finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Write-Host "`nWatcher stopped." -ForegroundColor DarkGray
}
