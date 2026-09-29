package com.ecom.common.event;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

public class CloudEvent<T> implements Serializable {

    private String eventId;
    private EventType eventType;
    private String aggregateType;
    private String aggregateId;
    private String correlationId;
    private String causationId;
    private int schemaVersion = 1;
    private String producer;

    @JsonFormat(shape = JsonFormat.Shape.STRING, timezone = "UTC")
    private Instant timestamp;

    private T payload;

    public CloudEvent() {
        this.eventId = UUID.randomUUID().toString();
        this.timestamp = Instant.now();
        this.schemaVersion = 1;
    }

    public CloudEvent(String eventId, EventType eventType, String aggregateType, String aggregateId,
                      String correlationId, String causationId, int schemaVersion, String producer,
                      Instant timestamp, T payload) {
        this.eventId = eventId != null ? eventId : UUID.randomUUID().toString();
        this.eventType = eventType;
        this.aggregateType = aggregateType;
        this.aggregateId = aggregateId;
        this.correlationId = correlationId;
        this.causationId = causationId;
        this.schemaVersion = schemaVersion > 0 ? schemaVersion : 1;
        this.producer = producer;
        this.timestamp = timestamp != null ? timestamp : Instant.now();
        this.payload = payload;
    }

    public static <T> CloudEvent<T> of(EventType type, String aggregateType, String aggregateId,
                                      String correlationId, String causationId, String producer, T payload) {
        return new CloudEvent<>(
                UUID.randomUUID().toString(),
                type,
                aggregateType,
                aggregateId,
                correlationId != null ? correlationId : UUID.randomUUID().toString(),
                causationId,
                1,
                producer,
                Instant.now(),
                payload
        );
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public EventType getEventType() { return eventType; }
    public void setEventType(EventType eventType) { this.eventType = eventType; }

    public String getAggregateType() { return aggregateType; }
    public void setAggregateType(String aggregateType) { this.aggregateType = aggregateType; }

    public String getAggregateId() { return aggregateId; }
    public void setAggregateId(String aggregateId) { this.aggregateId = aggregateId; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public String getCausationId() { return causationId; }
    public void setCausationId(String causationId) { this.causationId = causationId; }

    public int getSchemaVersion() { return schemaVersion; }
    public void setSchemaVersion(int schemaVersion) { this.schemaVersion = schemaVersion; }

    public String getProducer() { return producer; }
    public void setProducer(String producer) { this.producer = producer; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public T getPayload() { return payload; }
    public void setPayload(T payload) { this.payload = payload; }
}
