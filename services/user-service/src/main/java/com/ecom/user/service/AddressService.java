package com.ecom.user.service;

import com.ecom.common.exception.ResourceNotFoundException;
import com.ecom.user.dto.AddressRequest;
import com.ecom.user.dto.AddressResponse;
import com.ecom.user.entity.Address;
import com.ecom.user.repository.AddressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressService {

    private final AddressRepository addressRepository;

    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> getUserAddresses(String userId) {
        return addressRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AddressResponse getAddressById(String id, String userId) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));
        return toResponse(address);
    }

    @Transactional
    public AddressResponse createAddress(String userId, AddressRequest request) {
        if (request.isDefault()) {
            clearDefaultAddress(userId);
        }

        Address address = new Address(
                userId,
                request.getName().trim(),
                request.getPhone().trim(),
                request.getAddressLine1().trim(),
                request.getAddressLine2() != null ? request.getAddressLine2().trim() : null,
                request.getCity().trim(),
                request.getState().trim(),
                request.getPostalCode().trim(),
                request.getCountry().trim(),
                request.isDefault()
        );

        Address saved = addressRepository.save(address);
        return toResponse(saved);
    }

    @Transactional
    public AddressResponse updateAddress(String id, String userId, AddressRequest request) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));

        if (request.isDefault() && !address.isDefault()) {
            clearDefaultAddress(userId);
        }

        address.setName(request.getName().trim());
        address.setPhone(request.getPhone().trim());
        address.setAddressLine1(request.getAddressLine1().trim());
        address.setAddressLine2(request.getAddressLine2() != null ? request.getAddressLine2().trim() : null);
        address.setCity(request.getCity().trim());
        address.setState(request.getState().trim());
        address.setPostalCode(request.getPostalCode().trim());
        address.setCountry(request.getCountry().trim());
        address.setDefault(request.isDefault());

        Address saved = addressRepository.save(address);
        return toResponse(saved);
    }

    @Transactional
    public void deleteAddress(String id, String userId) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));
        addressRepository.delete(address);
    }

    private void clearDefaultAddress(String userId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .ifPresent(existingDefault -> {
                    existingDefault.setDefault(false);
                    addressRepository.save(existingDefault);
                });
    }

    private AddressResponse toResponse(Address a) {
        return new AddressResponse(
                a.getId(),
                a.getUserId(),
                a.getName(),
                a.getPhone(),
                a.getAddressLine1(),
                a.getAddressLine2(),
                a.getCity(),
                a.getState(),
                a.getPostalCode(),
                a.getCountry(),
                a.isDefault(),
                a.getCreatedAt()
        );
    }
}
