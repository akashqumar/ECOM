package com.ecom.user.service;

import com.ecom.common.exception.BusinessRuleException;
import com.ecom.common.exception.ResourceNotFoundException;
import com.ecom.common.exception.UnauthorizedException;
import com.ecom.user.dto.AuthResponse;
import com.ecom.user.dto.LoginRequest;
import com.ecom.user.dto.RefreshTokenRequest;
import com.ecom.user.dto.RegisterRequest;
import com.ecom.user.dto.UserProfileResponse;
import com.ecom.user.entity.RefreshToken;
import com.ecom.user.entity.User;
import com.ecom.user.repository.RefreshTokenRepository;
import com.ecom.user.repository.UserRepository;
import com.ecom.user.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BusinessRuleException("User with email " + request.getEmail() + " already exists");
        }

        User user = new User(
                request.getEmail().trim().toLowerCase(),
                passwordEncoder.encode(request.getPassword()),
                request.getFirstName().trim(),
                request.getLastName().trim(),
                request.getPhone(),
                "ROLE_CUSTOMER"
        );

        User savedUser = userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole());
        String refreshToken = createAndSaveRefreshToken(savedUser.getId());

        UserProfileResponse profile = toProfileResponse(savedUser);
        return new AuthResponse(accessToken, refreshToken, jwtService.getExpirationMs(), profile);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Revoke older refresh tokens for security
        refreshTokenRepository.revokeAllByUserId(user.getId());

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = createAndSaveRefreshToken(user.getId());

        UserProfileResponse profile = toProfileResponse(user);
        return new AuthResponse(accessToken, refreshToken, jwtService.getExpirationMs(), profile);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String tokenHash = hashToken(request.getRefreshToken());
        RefreshToken token = refreshTokenRepository.findByTokenHashAndRevokedFalse(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Invalid or revoked refresh token"));

        if (token.getExpiresAt().isBefore(Instant.now())) {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            throw new UnauthorizedException("Refresh token has expired");
        }

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Rotate refresh token
        token.setRevoked(true);
        refreshTokenRepository.save(token);

        String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String newRefreshToken = createAndSaveRefreshToken(user.getId());

        UserProfileResponse profile = toProfileResponse(user);
        return new AuthResponse(newAccessToken, newRefreshToken, jwtService.getExpirationMs(), profile);
    }

    @Transactional
    public void logout(String userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
    }

    private String createAndSaveRefreshToken(String userId) {
        String rawToken = jwtService.generateRefreshToken(userId);
        String tokenHash = hashToken(rawToken);
        Instant expiresAt = jwtService.extractExpiration(rawToken).toInstant();

        RefreshToken refreshToken = new RefreshToken(userId, tokenHash, expiresAt);
        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    public UserProfileResponse toProfileResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
