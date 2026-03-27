Kısa kurulum ve kontrol adımları — Ters proxy (Nginx)

1) Firewall / Security group
- VPS üzerinde veya bulut sağlayıcınızda inbound 80 ve 443 açık olmalı.
- UFW örnek (Ubuntu):

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
sudo ufw status
```

- AWS CLI (örnek):

```bash
aws ec2 authorize-security-group-ingress --group-id <SG_ID> --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id <SG_ID> --protocol tcp --port 443 --cidr 0.0.0.0/0
```

2) Basit testler (sunucuda)

```bash
# Portların dinlenip dinlenmediğini kontrol et
sudo ss -ltnp | grep -E ":80|:443"

# HTTP / HTTPS yanıtı test etme
curl -I http://your-domain.example
curl -I https://your-domain.example
```

3) Nginx kurma seçenekleri
- A) Host üzerine Nginx kurup `/etc/nginx/conf.d/default.conf` dosyasının içeriğini `deploy/nginx/default.conf` ile değiştirin. SSL sertifikalarını `/etc/letsencrypt/...` yoluna koyun.

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
sudo cp deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
sudo nginx -t && sudo systemctl restart nginx
```

- B) Docker Compose içinde çalıştırmak için:

```bash
cd /path/to/project/deploy
docker compose -f docker-compose.proxy.yml up -d
```

4) Sertifika (Let's Encrypt)
- certbot ile Nginx otomatik ayarı (host Nginx kullanıyorsanız):

```bash
sudo certbot --nginx -d almanakademisi.com -d www.almanakademisi.com
```

- Eğer otomatik `--nginx` entegrasyonu sorun çıkartırsa veya Nginx Docker içinde çalışıyorsa, `webroot` yöntemi ile sertifika almayı kullanabilirsiniz. Bu dosya içindeki `deploy/nginx/default.conf` artık ACME webroot için `/.well-known/acme-challenge/` yolunu `root /var/www/certbot;` olarak açmıştır. Webroot akışı örneği:

```bash
sudo mkdir -p /var/www/certbot
sudo chown www-data:www-data /var/www/certbot
sudo cp /home/$(whoami)/development/langueschool/deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
sudo nginx -t && sudo systemctl reload nginx

# Webroot ile yalnızca sertifika al
sudo certbot certonly --webroot -w /var/www/certbot -d almanakademisi.com -d www.almanakademisi.com

# Sertifika alındıktan sonra nginx'i yeniden yükleyin
sudo systemctl reload nginx
```

- Docker içinde çalışıyorsanız `certbot`'u hostta veya ayrı bir konteynerde çalıştırıp sertifikaları `deploy/letsencrypt` içine koyun ve Nginx konteynerinde bu dizini mount edin. Eğer Nginx de Docker içinde ise ve sertifikaları hostta üretiyorsanız `deploy/letsencrypt` dizinini bind mount ile verin.

5) Nginx config notları
- `deploy/nginx/default.conf` örneği Docker ağında servis isimleri `frontend` ve `backend` olarak proxy yapacak şekilde ayarlı. Eğer host üzerinde standalone servisler çalışıyorsa `proxy_pass` adreslerini `http://127.0.0.1:3000` ve `http://127.0.0.1:8000` olarak değiştirin.

6) Traefik alternatifi
- Otomatik TLS ve Let's Encrypt desteği isterseniz Traefik kullanmayı düşünebilirsiniz; bu repo içinde ister Docker etiketiyle ister ayrı bir service olarak çalıştırabilirsiniz.

İhtiyacınız olursa bu dosyaları sunucuda çalıştırılacak hale getireyim ve domain/sertifika parametrelerini sizin için özelleştireyim.
