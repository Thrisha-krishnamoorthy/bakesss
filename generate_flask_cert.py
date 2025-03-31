import os
from OpenSSL import crypto

def generate_self_signed_cert(cert_file, key_file):
    # Create a key pair
    k = crypto.PKey()
    k.generate_key(crypto.TYPE_RSA, 2048)

    # Create a self-signed cert
    cert = crypto.X509()
    cert.get_subject().C = "IN"
    cert.get_subject().ST = "Tamil Nadu"
    cert.get_subject().L = "Chennai"
    cert.get_subject().O = "Baked Goods Hub"
    cert.get_subject().OU = "Development"
    cert.get_subject().CN = "localhost"
    cert.set_serial_number(1000)
    cert.gmtime_adj_notBefore(0)
    cert.gmtime_adj_notAfter(10*365*24*60*60)  # 10 years
    cert.set_issuer(cert.get_subject())
    cert.set_pubkey(k)
    cert.sign(k, 'sha256')

    # Save the certificate and private key
    with open(cert_file, "wb") as f:
        f.write(crypto.dump_certificate(crypto.FILETYPE_PEM, cert))
    
    with open(key_file, "wb") as f:
        f.write(crypto.dump_privatekey(crypto.FILETYPE_PEM, k))
    
    print(f"Certificate saved to {cert_file}")
    print(f"Private key saved to {key_file}")

if __name__ == "__main__":
    # Create flask_certs directory if it doesn't exist
    os.makedirs("flask_certs", exist_ok=True)
    
    cert_file = os.path.join("flask_certs", "cert.pem")
    key_file = os.path.join("flask_certs", "key.pem")
    
    generate_self_signed_cert(cert_file, key_file)
    print("Self-signed certificate generated successfully!")
    print("You may need to add this certificate to your trusted certificates.")
