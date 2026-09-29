package com.ecom.notification.controller;

import com.ecom.common.dto.ApiResponse;
import com.ecom.notification.dto.NotificationResponse;
import com.ecom.notification.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getUserNotifications(
            @RequestHeader(value = "X-User-Id", defaultValue = "user-demo-123") String userId,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<NotificationResponse> notifications = notificationService.getUserNotifications(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", notifications));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getOrderNotifications(@PathVariable("orderId") String orderId) {
        List<NotificationResponse> notifications = notificationService.getOrderNotifications(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order notifications retrieved successfully", notifications));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable("id") String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }
}
