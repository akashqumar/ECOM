package com.ecom.cart;

import com.ecom.cart.dto.AddToCartRequest;
import com.ecom.cart.model.Cart;
import com.ecom.cart.service.CartService;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class CartServiceIntegrationTest {

    @Autowired
    private CartService cartService;

    private static final String USER_ID = "test-user-" + UUID.randomUUID();
    private static final String PROD_1 = "prod-keyboard-101";
    private static final String PROD_2 = "prod-mouse-202";

    @Test
    @Order(1)
    void testEmptyCartInitialization() {
        Cart cart = cartService.getCart(USER_ID);
        assertNotNull(cart);
        assertEquals(0, cart.getTotalQuantity());
        assertEquals(BigDecimal.ZERO, cart.getSubtotalAmount());
        assertTrue(cart.getItems().isEmpty());
    }

    @Test
    @Order(2)
    void testAddItemToCart() {
        AddToCartRequest item1 = new AddToCartRequest(
                PROD_1,
                "SKU-KB-01",
                "HyperStrike Keyboard",
                BigDecimal.valueOf(149.99),
                2,
                "https://example.com/kb.jpg"
        );

        Cart cart = cartService.addItem(USER_ID, item1);
        assertNotNull(cart);
        assertEquals(1, cart.getItems().size());
        assertEquals(2, cart.getTotalQuantity());
        assertEquals(BigDecimal.valueOf(299.98), cart.getSubtotalAmount());
    }

    @Test
    @Order(3)
    void testAddSecondItemToCart() {
        AddToCartRequest item2 = new AddToCartRequest(
                PROD_2,
                "SKU-MO-02",
                "Viper Elite Mouse",
                BigDecimal.valueOf(99.00),
                1,
                "https://example.com/mouse.jpg"
        );

        Cart cart = cartService.addItem(USER_ID, item2);
        assertNotNull(cart);
        assertEquals(2, cart.getItems().size());
        assertEquals(3, cart.getTotalQuantity());
        assertEquals(BigDecimal.valueOf(398.98), cart.getSubtotalAmount());
    }

    @Test
    @Order(4)
    void testUpdateItemQuantity() {
        Cart cart = cartService.updateItemQuantity(USER_ID, PROD_1, 3);
        assertNotNull(cart);
        assertEquals(2, cart.getItems().size());
        assertEquals(4, cart.getTotalQuantity()); // 3 keyboards + 1 mouse
        // 3 * 149.99 + 99.00 = 449.97 + 99.00 = 548.97
        assertEquals(BigDecimal.valueOf(548.97), cart.getSubtotalAmount());
    }

    @Test
    @Order(5)
    void testRemoveSingleItem() {
        Cart cart = cartService.removeItem(USER_ID, PROD_2);
        assertNotNull(cart);
        assertEquals(1, cart.getItems().size());
        assertEquals(3, cart.getTotalQuantity());
        assertEquals(BigDecimal.valueOf(449.97), cart.getSubtotalAmount());
    }

    @Test
    @Order(6)
    void testClearCart() {
        cartService.clearCart(USER_ID);
        Cart empty = cartService.getCart(USER_ID);
        assertTrue(empty.getItems().isEmpty());
        assertEquals(0, empty.getTotalQuantity());
        assertEquals(BigDecimal.ZERO, empty.getSubtotalAmount());
    }
}
