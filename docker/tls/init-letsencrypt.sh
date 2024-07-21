#!/usr/bin/env bash

# Script to generate and embed TLS into Dockr
# Credit: https://pentacent.medium.com/nginx-and-lets-encrypt-with-docker-in-less-than-5-minutes-b4b8a60d3a71

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

if ! [ -x "$(command -v docker compose)" ]; then
  echo 'Error: docker compose is not installed.' >&2
  exit 1
fi

domains=(tchoukballtracker.co.uk www.tchoukballtracker.co.uk)
rsa_key_size=4096
data_path="${SCRIPT_DIR}/data/certbot"
email="o.g.smith@icloud.com"  # Adding a valid address is strongly recommended
staging=0  # Set to 1 if you're testing your setup to avoid hitting request limits

if [ -d "$data_path" ]; then
  read -p "Existing data found for $domains. Continue and replace existing certificate? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    exit
  fi
fi

rm -Rf "${SCRIPT_DIR}/data/certbot/"

if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
  echo "### Downloading recommended TLS parameters ..."
  mkdir -p "$data_path/conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
  echo
fi

echo "### Creating dummy certificate for $domains ..."
path="/etc/letsencrypt/live/$domains"
mkdir -p "$data_path/conf/live/$domains"
touch "${SCRIPT_DIR}/data/mongo/mongodb.pem"  # Must be created otherwise Docker volumes will create an empty dir
docker compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1\
    -keyout '$path/privkey.pem' \
    -out '$path/fullchain.pem' \
    -subj '/CN=localhost'" certbot
echo

cp "${SCRIPT_DIR}/data/nginx/app.conf" ./app.conf 
sed -i -n '/upstream /q;p' "${SCRIPT_DIR}/data/nginx/app.conf"  # Extract only the HTTP section (needed to generate certs)
echo "### Starting nginx ..."
docker compose up --force-recreate -d nginx
echo

echo "### Deleting dummy certificate for $domains ..."
docker compose run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$domains && \
  rm -Rf /etc/letsencrypt/archive/$domains && \
  rm -Rf /etc/letsencrypt/renewal/$domains.conf" certbot
echo


echo "### Requesting Let's Encrypt certificate for $domains ..."
#Join $domains to -d args
domain_args=""
for domain in "${domains[@]}"; do
  domain_args="$domain_args -d $domain"
done

# Select appropriate email arg
case "$email" in
  "") email_arg="--register-unsafely-without-email" ;;
  *) email_arg="--email $email" ;;
esac

# Enable staging mode if needed
if [ $staging != "0" ]; then staging_arg="--staging"; fi

docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    $email_arg \
    $domain_args \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --force-renewal" certbot
echo

# Create ca cert
curl -O https://letsencrypt.org/certs/isrgrootx1.pem
curl -O https://letsencrypt.org/certs/lets-encrypt-r3.pem
cat isrgrootx1.pem lets-encrypt-r3.pem > "${SCRIPT_DIR}/data/mongo/ca.pem"
chmod 644 "${SCRIPT_DIR}/data/mongo/ca.pem"
rm "lets-encrypt-r3.pem" && rm "isrgrootx1.pem"

# Create mongo cert
cat "${SCRIPT_DIR}/data/certbot/conf/live/tchoukballtracker.co.uk/fullchain.pem" "${SCRIPT_DIR}/data/certbot/conf/live/tchoukballtracker.co.uk/privkey.pem" > "${SCRIPT_DIR}/data/mongo/mongodb.pem"
chmod 644 "${SCRIPT_DIR}/data/mongo/mongodb.pem"
echo "### Stopping nginx ..."
docker compose stop nginx
rm "${SCRIPT_DIR}/data/nginx/app.conf" && mv ./app.conf "${SCRIPT_DIR}/data/nginx/app.conf"
echo "### Script complete"
