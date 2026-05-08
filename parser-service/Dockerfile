FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-pip python3-venv \
  && python3 -m venv /opt/venv \
  && /opt/venv/bin/pip install --no-cache-dir --upgrade pip \
  && /opt/venv/bin/pip install --no-cache-dir pdfplumber \
  && rm -rf /var/lib/apt/lists/*

COPY parser-service/package.json ./package.json
RUN npm install --omit=dev

COPY parser-service/src ./src

ENV PATH="/opt/venv/bin:$PATH"
ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/server.mjs"]
