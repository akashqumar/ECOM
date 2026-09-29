package com.ecom.user;

import com.ecom.user.dto.AddressRequest;
import com.ecom.user.dto.AuthResponse;
import com.ecom.user.dto.LoginRequest;
import com.ecom.user.dto.RegisterRequest;
import com.ecom.user.service.AddressService;
import com.ecom.user.service.AuthService;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class UserServiceIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private AddressService addressService;

    private static String registeredUserId;
    private static String refreshToken;

    @Test
    @Order(1)
    void testUserRegistration() {
        String uniqueEmail = "testuser_" + System.currentTimeMillis() + "@example.com";
        RegisterRequest registerReq = new RegisterRequest(
                uniqueEmail,
                "StrongPassword123!",
                "Test",
                "Engineer",
                "+1 (555) 123-4567"
        );

        AuthResponse authResponse = authService.register(registerReq);

        assertNotNull(authResponse);
        assertNotNull(authResponse.getAccessToken());
        assertNotNull(authResponse.getRefreshToken());
        assertEquals("ROLE_CUSTOMER", authResponse.getUser().getRole());
        assertEquals(uniqueEmail, authResponse.getUser().getEmail());

        registeredUserId = authResponse.getUser().getId();
        refreshToken = authResponse.getRefreshToken();
    }

    @Test
    @Order(2)
    void testDemoAccountLogin() {
        LoginRequest loginReq = new LoginRequest("demo@example.com", "password123");
        AuthResponse response = authService.login(loginReq);

        assertNotNull(response);
        assertNotNull(response.getAccessToken());
        assertEquals("demo@example.com", response.getUser().getEmail());
    }

    @Test
    @Order(3)
    void testAdminAccountLogin() {
        LoginRequest loginReq = new LoginRequest("admin@example.com", "admin123");
        AuthResponse response = authService.login(loginReq);

        assertNotNull(response);
        assertEquals("ROLE_ADMIN", response.getUser().getRole());
    }

    @Test
    @Order(4)
    void testAddressCreation() {
        AddressRequest addressReq = new AddressRequest(
                "Alex Test",
                "+1 555-0199",
                "100 Silicon Way",
                "Suite 200",
                "San Jose",
                "CA",
                "95110",
                "United States",
                true
        );

        var addressResponse = addressService.createAddress(registeredUserId, addressReq);

        assertNotNull(addressResponse);
        assertNotNull(addressResponse.getId());
        assertEquals("100 Silicon Way", addressResponse.getAddressLine1());
        assertTrue(addressResponse.isDefault());
    }
}
