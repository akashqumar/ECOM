package com.ecom.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final SecretKey signingKey;

    private static final List<String> PUBLIC_PATH_PREFIXES = List.of(
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/refresh",
            "/api/products",
            "/api/categories",
            "/actuator"
    );

    public JwtAuthenticationFilter(@Value("${app.jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}") String secret) {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // 1. Correlation ID tracking header
        String correlationId = request.getHeaders().getFirst("X-Correlation-Id");
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        ServerHttpRequest.Builder requestBuilder = request.mutate()
                .header("X-Correlation-Id", correlationId);

        // 2. Allow public paths without mandatory JWT (e.g. browsing catalog, login)
        boolean isPublicPath = PUBLIC_PATH_PREFIXES.stream().anyMatch(path::startsWith);
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            if (isPublicPath || path.startsWith("/api/cart")) {
                String existingUserId = request.getHeaders().getFirst("X-User-Id");
                if (existingUserId == null || existingUserId.isBlank()) {
                    requestBuilder.header("X-User-Id", "guest-" + UUID.randomUUID().toString().substring(0, 8));
                }
                return chain.filter(exchange.mutate().request(requestBuilder.build()).build());
            } else {
                log.warn("Missing or invalid Authorization header for secured route: {}", path);
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
        }

        // 3. Validate JWT
        String token = authHeader.substring(7);
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            if (claims.getExpiration().before(new Date())) {
                log.warn("JWT token expired for route: {}", path);
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            String userId = claims.getSubject();
            String email = claims.get("email", String.class);
            String role = claims.get("role", String.class);

            // Forward verified user identity to downstream microservices via trusted headers
            requestBuilder.header("X-User-Id", userId)
                    .header("X-User-Email", email != null ? email : "")
                    .header("X-User-Role", role != null ? role : "ROLE_CUSTOMER");

            return chain.filter(exchange.mutate().request(requestBuilder.build()).build());

        } catch (Exception ex) {
            log.warn("Invalid JWT token provided for route: {}: {}", path, ex.getMessage());
            if (isPublicPath) {
                // If it's a public path but token was invalid/expired, still allow browsing as guest
                return chain.filter(exchange.mutate().request(requestBuilder.build()).build());
            }
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }

    @Override
    public int getOrder() {
        return -100; // High precedence before routing filters
    }
}
