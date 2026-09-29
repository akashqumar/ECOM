package com.ecom.cart.controller;

import com.ecom.common.constant.CommonConstants;
import com.ecom.common.dto.ApiResponse;
import com.ecom.cart.dto.AddToCartRequest;
import com.ecom.cart.dto.UpdateQuantityRequest;
import com.ecom.cart.model.Cart;
import com.ecom.cart.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Cart>> getCart(
            @RequestHeader(value = CommonConstants.HEADER_USER_ID, defaultValue = "usr-demo") String userId) {
        Cart cart = cartService.getCart(userId);
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<Cart>> addItem(
            @RequestHeader(value = CommonConstants.HEADER_USER_ID, defaultValue = "usr-demo") String userId,
            @Valid @RequestBody AddToCartRequest request) {
        Cart cart = cartService.addItem(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<Cart>> updateQuantity(
            @RequestHeader(value = CommonConstants.HEADER_USER_ID, defaultValue = "usr-demo") String userId,
            @PathVariable String productId,
            @Valid @RequestBody UpdateQuantityRequest request) {
        Cart cart = cartService.updateItemQuantity(userId, productId, request.getQuantity());
        return ResponseEntity.ok(ApiResponse.success("Cart updated", cart));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<Cart>> removeItem(
            @RequestHeader(value = CommonConstants.HEADER_USER_ID, defaultValue = "usr-demo") String userId,
            @PathVariable String productId) {
        Cart cart = cartService.removeItem(userId, productId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @RequestHeader(value = CommonConstants.HEADER_USER_ID, defaultValue = "usr-demo") String userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }
}
