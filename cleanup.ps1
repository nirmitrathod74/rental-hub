$files = @(
    "d:\Code\Projects\rental-hub\frontend\src\pages\AdminDashboard.jsx",
    "d:\Code\Projects\rental-hub\frontend\src\pages\Cart.jsx",
    "d:\Code\Projects\rental-hub\frontend\src\pages\Catalog.jsx",
    "d:\Code\Projects\rental-hub\frontend\src\pages\Checkout.jsx",
    "d:\Code\Projects\rental-hub\frontend\src\pages\Login.jsx",
    "d:\Code\Projects\rental-hub\frontend\src\pages\ProductDetails.jsx",
    "d:\Code\Projects\rental-hub\frontend\src\pages\Profile.jsx",
    "d:\Code\Projects\rental-hub\frontend\src\pages\Signup.jsx",
    "d:\Code\Projects\rental-hub\frontend\src\components\Navbar.jsx",
    "d:\Code\Projects\rental-hub\copy_images.ps1",
    "d:\Code\Projects\rental-hub\get_logs.ps1",
    "d:\Code\Projects\rental-hub\backend\add_images.py"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        Remove-Item $f -Force
        Write-Host "Removed $f"
    }
}

# Remove itself at the end
Remove-Item $MyInvocation.MyCommand.Path -Force
