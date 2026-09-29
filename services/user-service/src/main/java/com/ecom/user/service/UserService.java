package com.ecom.user.service;

import com.ecom.common.exception.ResourceNotFoundException;
import com.ecom.user.dto.UpdateProfileRequest;
import com.ecom.user.dto.UserProfileResponse;
import com.ecom.user.entity.User;
import com.ecom.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AuthService authService;

    public UserService(UserRepository userRepository, AuthService authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return authService.toProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }

        User savedUser = userRepository.save(user);
        return authService.toProfileResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(authService::toProfileResponse)
                .collect(Collectors.toList());
    }
}
