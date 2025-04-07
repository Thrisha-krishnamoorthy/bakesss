# Check if OpenSSL is installed
$openssl = Get-Command openssl -ErrorAction SilentlyContinue

if (-not $openssl) {
    Write-Host "OpenSSL is not installed or not in PATH. Please install OpenSSL and try again."
    exit 1
}

# Create certificates directory if it doesn't exist
$certsDir = ".\certificates"
if (-not (Test-Path $certsDir)) {
    New-Item -ItemType Directory -Path $certsDir | Out-Null
}

# Generate a private key
Write-Host "Generating private key..."
openssl genrsa -out "$certsDir\key.pem" 2048

# Generate a certificate signing request
Write-Host "Generating certificate signing request..."
openssl req -new -key "$certsDir\key.pem" -out "$certsDir\csr.pem" -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Generate a self-signed certificate
Write-Host "Generating self-signed certificate..."
openssl x509 -req -days 365 -in "$certsDir\csr.pem" -signkey "$certsDir\key.pem" -out "$certsDir\cert.pem"

# Create .env file for React
Write-Host "Creating .env file for React..."
@"
HTTPS=true
SSL_CRT_FILE=./certificates/cert.pem
SSL_KEY_FILE=./certificates/key.pem
"@ | Out-File -FilePath ".\.env" -Encoding utf8

# Update Flask app.py to use HTTPS
Write-Host "Updating Flask app.py to use HTTPS..."
$appPyPath = ".\app.py"
$appPyContent = Get-Content $appPyPath -Raw

if ($appPyContent -match "if __name__ == '__main__':") {
    $newContent = $appPyContent -replace "if __name__ == '__main__':([\s\S]*?)app\.run\(([\s\S]*?)\)", "if __name__ == '__main__':`$1app.run(ssl_context=('certificates/cert.pem', 'certificates/key.pem')`$2)"
    $newContent | Out-File -FilePath $appPyPath -Encoding utf8
} else {
    Write-Host "Could not find the app.run() line in app.py. Please update it manually."
}

Write-Host "`nCertificates generated successfully!"
Write-Host "You can now start your React app with 'npm start' and it will use HTTPS."
Write-Host "Your Flask app will also use HTTPS when you run it."
Write-Host "Note: You will see security warnings in your browser because these are self-signed certificates."
Write-Host "You can safely proceed past these warnings during development."
