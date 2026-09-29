package com.ecom.cart.service;

import com.ecom.cart.dto.AddToCartRequest;
import com.ecom.cart.model.Cart;
import com.ecom.cart.model.CartItem;
import com.ecom.common.util.JsonUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.util.Optional;

@Service
public class CartService {

    private static final String CART_PREFIX = "cart:";
    private final StringRedisTemplate redisTemplate;
    private final Duration cartTtl;

    public CartService(StringRedisTemplate redisTemplate,
                       @Value("${app.cart.ttl-days:7}") int ttlDays) {
        this.redisTemplate = redisTemplate;
        this.cartTtl = Duration.ofDays(ttlDays);
    }

    public Cart getCart(String userId) {
        String key = buildCartKey(userId);
        String json = redisTemplate.opsForValue().get(key);

        if (StringUtils.hasText(json)) {
            try {
                return JsonUtils.fromJson(json, Cart.class);
            } catch (Exception ex) {
                // If malformed or schema changed, reset cart
            }
        }

        Cart emptyCart = new Cart(userId);
        saveCart(emptyCart);
        return emptyCart;
    }

    public Cart addItem(String userId, AddToCartRequest request) {
        Cart cart = getCart(userId);

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(request.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            item.setPrice(request.getPrice());
        } else {
            CartItem newItem = new CartItem(
                    request.getProductId(),
                    request.getSku(),
                    request.getName(),
                    request.getPrice(),
                    request.getQuantity(),
                    request.getImageUrl()
            );
            cart.getItems().add(newItem);
        }

        cart.recalculateTotals();
        saveCart(cart);
        return cart;
    }

    public Cart updateItemQuantity(String userId, String productId, int quantity) {
        Cart cart = getCart(userId);

        if (quantity <= 0) {
            cart.getItems().removeIf(item -> item.getProductId().equals(productId));
        } else {
            cart.getItems().stream()
                    .filter(item -> item.getProductId().equals(productId))
                    .findFirst()
                    .ifPresent(item -> item.setQuantity(quantity));
        }

        cart.recalculateTotals();
        saveCart(cart);
        return cart;
    }

    public Cart removeItem(String userId, String productId) {
        Cart cart = getCart(userId);
        cart.getItems().removeIf(item -> item.getProductId().equals(productId));
        cart.recalculateTotals();
        saveCart(cart);
        return cart;
    }

    public void clearCart(String userId) {
        String key = buildCartKey(userId);
        redisTemplate.delete(key);
    }

    private void saveCart(Cart cart) {
        String key = buildCartKey(cart.getUserId());
        String json = JsonUtils.toJson(cart);
        redisTemplate.opsForValue().set(key, json, cartTtl);
    }

    private String buildCartKey(String userId) {
        return CART_PREFIX + userId;
    }
}
