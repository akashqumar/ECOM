package com.ecom.notification.dto;

import java.time.Instant;

public class NotificationResponse {

    private String id;
    private String userId;
    private String orderId;
    private String channel;
    private String title;
    private String message;
    private String status;
    private Instant readAt;
    private Instant createdAt;

    public NotificationResponse() {
    }

    public NotificationResponse(String id, String userId, String orderId, String channel,
                                String title, String message, String status, Instant readAt, Instant createdAt) {
        this.id = id;
        this.userId = userId;
        this.orderId = orderId;
        this.channel = channel;
        this.title = title;
        this.message = message;
        this.status = status;
        this.readAt = readAt;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getReadAt() { return readAt; }
    public void setReadAt(Instant readAt) { this.readAt = readAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
