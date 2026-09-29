package com.ecom.notification;

import com.ecom.notification.entity.Notification;
import com.ecom.notification.repository.NotificationRepository;
import com.ecom.notification.service.NotificationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class NotificationServiceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Test
    @DisplayName("Should create, retrieve, and mark notification as read")
    void testNotificationLifecycle() throws Exception {
        String userId = "user-" + UUID.randomUUID().toString().substring(0, 18);
        String orderId = UUID.randomUUID().toString();

        Notification created = notificationService.createNotification(
                userId,
                orderId,
                "EMAIL",
                "Order Confirmed",
                "Your order has been placed successfully."
        );

        assertThat(created.getId()).isNotBlank();
        assertThat(created.getReadAt()).isNull();

        // Retrieve notifications via API
        mockMvc.perform(get("/api/notifications")
                        .header("X-User-Id", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].title").value("Order Confirmed"));

        // Mark as read via API
        mockMvc.perform(put("/api/notifications/" + created.getId() + "/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        Notification updated = notificationRepository.findById(created.getId()).orElseThrow();
        assertThat(updated.getReadAt()).isNotNull();
    }
}
