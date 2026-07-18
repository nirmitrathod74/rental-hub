$DestDir = "d:\Code\Projects\rental-hub\backend\media\products"
New-Item -ItemType Directory -Force -Path $DestDir | Out-Null

$Images = @{
    "exc-001.png" = "C:\Users\jatin\.gemini\antigravity-ide\brain\c8dafe17-3e7a-4e8c-b93e-e67cafd71b76\excavator_img_1784370456102.png"
    "gen-50k.png" = "C:\Users\jatin\.gemini\antigravity-ide\brain\c8dafe17-3e7a-4e8c-b93e-e67cafd71b76\generator_img_1784370468709.png"
    "sca-05.png"  = "C:\Users\jatin\.gemini\antigravity-ide\brain\c8dafe17-3e7a-4e8c-b93e-e67cafd71b76\scaffolding_img_1784370488169.png"
}

foreach ($name in $Images.Keys) {
    Copy-Item -Path $Images[$name] -Destination (Join-Path $DestDir $name) -Force
    Write-Host "Copied $name"
}
