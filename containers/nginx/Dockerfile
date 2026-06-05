FROM nginx:alpine

RUN apk add --no-cache openssl

RUN rm /etc/nginx/conf.d/default.conf

COPY conf.d/default.conf /etc/nginx/conf.d/
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --no-check-certificate --spider https://localhost || exit 1

ENTRYPOINT ["/entrypoint.sh"]
