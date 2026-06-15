package com.hiregrad.backend.auth.controller;

import com.hiregrad.backend.auth.dto.LoginRequest;
import com.hiregrad.backend.auth.dto.LoginResponse;
import com.hiregrad.backend.auth.service.AuthService;
import com.hiregrad.backend.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}