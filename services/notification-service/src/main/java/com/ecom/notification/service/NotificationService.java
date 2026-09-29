package com.ecom.notification.service;

import com.ecom.notification.dto.NotificationResponse;
import com.ecom.notification.entity.Notification;
import com.ecom.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Notification createNotification(String userId, String orderId, String channel, String title, String message) {
        log.info("Sending [{}] notification to user: {} (order: {}) - {}", channel, userId, orderId, title);
        Notification notification = new Notification(userId, orderId, channel, title, message);
        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getUserNotifications(String userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getOrderNotifications(String orderId) {
        return notificationRepository.findByOrderId(orderId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setReadAt(Instant.now());
            notificationRepository.save(n);
        });
    }

    private NotificationResponse toDto(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getUserId(),
                n.getOrderId(),
                n.getChannel(),
                n.getTitle(),
                n.getMessage(),
                n.getStatus(),
                n.getReadAt(),
                n.getCreatedAt()
        );
    }
}
