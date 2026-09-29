package com.ecom.order.dto;

import java.time.Instant;
import java.util.List;

public class OrderTimelineResponse {

    private String orderId;
    private String orderNumber;
    private String orderStatus;
    private String sagaStatus;
    private String currentStep;
    private String errorMessage;
    private List<TimelineEventDto> timeline;

    public OrderTimelineResponse() {
    }

    public OrderTimelineResponse(String orderId, String orderNumber, String orderStatus, String sagaStatus,
                                 String currentStep, String errorMessage, List<TimelineEventDto> timeline) {
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.orderStatus = orderStatus;
        this.sagaStatus = sagaStatus;
        this.currentStep = currentStep;
        this.errorMessage = errorMessage;
        this.timeline = timeline;
    }

    public static class TimelineEventDto {
        private String eventType;
        private String title;
        private String description;
        private Instant timestamp;
        private String status; // COMPLETED, PENDING, FAILED

        public TimelineEventDto() {
        }

        public TimelineEventDto(String eventType, String title, String description, Instant timestamp, String status) {
            this.eventType = eventType;
            this.title = title;
            this.description = description;
            this.timestamp = timestamp;
            this.status = status;
        }

        public String getEventType() {
            return eventType;
        }

        public void setEventType(String eventType) {
            this.eventType = eventType;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Instant getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(Instant timestamp) {
            this.timestamp = timestamp;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public String getSagaStatus() {
        return sagaStatus;
    }

    public void setSagaStatus(String sagaStatus) {
        this.sagaStatus = sagaStatus;
    }

    public String getCurrentStep() {
        return currentStep;
    }

    public void setCurrentStep(String currentStep) {
        this.currentStep = currentStep;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public List<TimelineEventDto> getTimeline() {
        return timeline;
    }

    public void setTimeline(List<TimelineEventDto> timeline) {
        this.timeline = timeline;
    }
}
