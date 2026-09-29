#!/bin/bash
set -e

echo "Waiting for Kafka to be ready at ${KAFKA_BOOTSTRAP_SERVERS:-kafka:9092}..."
cub kafka-ready -b ${KAFKA_BOOTSTRAP_SERVERS:-kafka:9092} 1 60 2>/dev/null || sleep 10

echo "Creating Kafka topics..."
TOPICS=(
  "order.events:6:1"
  "inventory.events:6:1"
  "payment.events:6:1"
  "notification.events:3:1"
  "order.events.DLT:3:1"
  "inventory.events.DLT:3:1"
  "payment.events.DLT:3:1"
)

for topic_def in "${TOPICS[@]}"; do
  IFS=":" read -r topic partitions replicas <<< "$topic_def"
  echo "Creating topic $topic with $partitions partitions..."
  kafka-topics --bootstrap-server ${KAFKA_BOOTSTRAP_SERVERS:-kafka:9092} \
    --create --if-not-exists \
    --topic "$topic" \
    --partitions "$partitions" \
    --replication-factor "$replicas" || true
done

echo "Kafka topics verified and ready!"
