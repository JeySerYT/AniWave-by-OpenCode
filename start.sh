#!/bin/sh
BACKEND_URL=${BACKEND_URL:-http://127.0.0.1:8081}
export BACKEND_URL
envsubst '${BACKEND_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
exec /usr/bin/supervisord -c /etc/supervisord.conf