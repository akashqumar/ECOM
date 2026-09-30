#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$SCRIPT_DIR/.pids"
LOG_DIR="$SCRIPT_DIR/.logs"

mkdir -p "$PID_DIR" "$LOG_DIR"

start_service() {
    local NAME=$1
    local JAR=$2
    local PORT=$3
    echo "Starting $NAME (Port: $PORT)..."
    nohup java -jar "$JAR" > "$LOG_DIR/$NAME.log" 2>&1 &
    local PID=$!
    echo $PID > "$PID_DIR/$NAME.pid"
    echo "$NAME started with PID $PID. Logs: $LOG_DIR/$NAME.log"
}

start_service "user-service" "$SCRIPT_DIR/services/user-service/target/user-service-1.0.0-SNAPSHOT.jar" 8081
start_service "catalog-service" "$SCRIPT_DIR/services/catalog-service/target/catalog-service-1.0.0-SNAPSHOT.jar" 8082
start_service "cart-service" "$SCRIPT_DIR/services/cart-service/target/cart-service-1.0.0-SNAPSHOT.jar" 8083
start_service "order-service" "$SCRIPT_DIR/services/order-service/target/order-service-1.0.0-SNAPSHOT.jar" 8084
start_service "inventory-service" "$SCRIPT_DIR/services/inventory-service/target/inventory-service-1.0.0-SNAPSHOT.jar" 8085
start_service "payment-service" "$SCRIPT_DIR/services/payment-service/target/payment-service-1.0.0-SNAPSHOT.jar" 8086
start_service "notification-service" "$SCRIPT_DIR/services/notification-service/target/notification-service-1.0.0-SNAPSHOT.jar" 8087
start_service "api-gateway" "$SCRIPT_DIR/services/api-gateway/target/api-gateway-1.0.0-SNAPSHOT.jar" 8080

echo "All backend microservices successfully dispatched in background!"

# Start frontend dev server
echo ""
echo "Starting frontend customer app on http://localhost:3000 ..."
cd "$SCRIPT_DIR/frontend" && nohup npx vite --port 3000 > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$PID_DIR/frontend.pid"
echo "Frontend started with PID $FRONTEND_PID. Logs: $LOG_DIR/frontend.log"

# Start admin-dashboard microservice
echo ""
echo "Starting admin dashboard microservice on http://localhost:3001 ..."
cd "$SCRIPT_DIR/admin-dashboard" && nohup npx vite --port 3001 > "$LOG_DIR/admin-dashboard.log" 2>&1 &
ADMIN_PID=$!
echo $ADMIN_PID > "$PID_DIR/admin-dashboard.pid"
echo "Admin Dashboard started with PID $ADMIN_PID. Logs: $LOG_DIR/admin-dashboard.log"
cd "$SCRIPT_DIR"

echo ""
echo "======================================"
echo "  AuraCommerce Microservices Platform"
echo "======================================"
echo "  Customer App   →  http://localhost:3000"
echo "  Admin Dashboard → http://localhost:3001"
echo "  API Gateway    →  http://localhost:8080"
echo "  Services       →  :8081 :8082 :8083 :8084 :8085 :8086 :8087"
echo ""
echo "  Wait ~30s for all Java services to fully boot."
echo "======================================"
