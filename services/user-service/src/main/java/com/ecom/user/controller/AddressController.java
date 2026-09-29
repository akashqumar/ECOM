package com.ecom.user.controller;

import com.ecom.common.dto.ApiResponse;
import com.ecom.user.dto.AddressRequest;
import com.ecom.user.dto.AddressResponse;
import com.ecom.user.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/me/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddresses(Authentication authentication) {
        String userId = authentication.getName();
        List<AddressResponse> addresses = addressService.getUserAddresses(userId);
        return ResponseEntity.ok(ApiResponse.success(addresses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> getAddressById(
            Authentication authentication,
            @PathVariable String id) {
        String userId = authentication.getName();
        AddressResponse address = addressService.getAddressById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(address));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> createAddress(
            Authentication authentication,
            @Valid @RequestBody AddressRequest request) {
        String userId = authentication.getName();
        AddressResponse created = addressService.createAddress(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Address created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            Authentication authentication,
            @PathVariable String id,
            @Valid @RequestBody AddressRequest request) {
        String userId = authentication.getName();
        AddressResponse updated = addressService.updateAddress(id, userId, request);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            Authentication authentication,
            @PathVariable String id) {
        String userId = authentication.getName();
        addressService.deleteAddress(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }
}
