package com.hiregrad.backend.admin.service;

import com.hiregrad.backend.admin.dto.AdminMeResponse;
import com.hiregrad.backend.common.exception.ResourceNotFoundException;
import com.hiregrad.backend.user.entity.User;
import com.hiregrad.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;

    public AdminMeResponse getByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found: " + username));

        return AdminMeResponse.builder()
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }
}