FROM redis:7-alpine

HEALTHCHECK --interval=5s --timeout=5s --retries=10 \
  CMD redis-cli ping
