FROM postgres:16-alpine

HEALTHCHECK --interval=5s --timeout=5s --retries=10 --start-period=10s \
  CMD pg_isready -U ${POSTGRES_USER:-cur10us} -d ${POSTGRES_DB:-cur10us}
