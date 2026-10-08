# Run locally. Do not post the generated keys or commit them to source control.
function New-MealSecret {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($bytes)
        return ([BitConverter]::ToString($bytes)).Replace('-', '').ToLowerInvariant()
    }
    finally {
        $rng.Dispose()
    }
}

[ordered]@{
    VIEWER_HMAC = New-MealSecret
    DASHBOARD_HMAC = New-MealSecret
    SESSION_SECRET = New-MealSecret
} | ConvertTo-Json
