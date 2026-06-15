package com.hiregrad.backend.config;

import com.hiregrad.backend.user.entity.Role;
import com.hiregrad.backend.user.entity.User;
import com.hiregrad.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin.username}")    private String adminUsername;
    @Value("${app.seed.admin.password}")    private String adminPassword;
    @Value("${app.seed.admin.full-name}")   private String adminFullName;

    @Value("${app.seed.student.username}")  private String studentUsername;
    @Value("${app.seed.student.password}")  private String studentPassword;
    @Value("${app.seed.student.full-name}") private String studentFullName;

    @Override
    public void run(String... args) {
        seed(adminUsername, adminPassword, adminFullName, Role.ADMIN);
        seed(studentUsername, studentPassword, studentFullName, Role.STUDENT);
    }

    private void seed(String username, String rawPassword, String fullName, Role role) {
        if (!userRepository.existsByUsername(username)) {
            userRepository.save(User.builder()
                    .username(username)
                    .password(passwordEncoder.encode(rawPassword)) // BCrypt hash
                    .fullName(fullName)
                    .role(role)
                    .enabled(true)
                    .build());
        }
    }
}