package com.ecom.user.config;

import com.ecom.user.entity.Address;
import com.ecom.user.entity.User;
import com.ecom.user.repository.AddressRepository;
import com.ecom.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           AddressRepository addressRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        userRepository.findByEmail("demo@example.com").ifPresentOrElse(
                demo -> {
                    demo.setPasswordHash(passwordEncoder.encode("password123"));
                    userRepository.save(demo);
                },
                () -> {
                    User demoCustomer = new User(
                            "demo@example.com",
                            passwordEncoder.encode("password123"),
                            "Alex",
                            "Morgan",
                            "+1 (555) 234-5678",
                            "ROLE_CUSTOMER"
                    );
                    User savedDemo = userRepository.save(demoCustomer);

                    Address demoAddress = new Address(
                            savedDemo.getId(),
                            "Alex Morgan",
                            "+1 (555) 234-5678",
                            "742 Evergreen Terrace",
                            "Apt 4B",
                            "Springfield",
                            "OR",
                            "97477",
                            "United States",
                            true
                    );
                    addressRepository.save(demoAddress);
                    log.info("Initialized demo customer account: demo@example.com / password123");
                }
        );

        userRepository.findByEmail("admin@example.com").ifPresentOrElse(
                admin -> {
                    admin.setPasswordHash(passwordEncoder.encode("password123"));
                    admin.setRole("ROLE_ADMIN");
                    userRepository.save(admin);
                },
                () -> {
                    User demoAdmin = new User(
                            "admin@example.com",
                            passwordEncoder.encode("password123"),
                            "Platform",
                            "Administrator",
                            "+1 (555) 999-0000",
                            "ROLE_ADMIN"
                    );
                    userRepository.save(demoAdmin);
                    log.info("Initialized demo admin account: admin@example.com / password123");
                }
        );
    }
}
