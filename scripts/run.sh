#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:-dev}"
MODE="${2:-local}"

if [[ "${MODE}" == "docker" ]]; then
  COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"
  if [[ ! -f "${COMPOSE_FILE}" ]]; then
    echo "Compose file not found: ${COMPOSE_FILE}"
    exit 1
  fi

  echo "Starting frontend containers with profile '${ENVIRONMENT}'..."
  docker compose -f "${COMPOSE_FILE}" up --build
  exit $?
fi

START_SCRIPT="start:${ENVIRONMENT}"

echo "Installing dependencies..."
npm install

echo "Starting frontend locally with profile '${ENVIRONMENT}'..."
npm run "${START_SCRIPT}"