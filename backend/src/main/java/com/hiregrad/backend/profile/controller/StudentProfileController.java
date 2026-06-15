package com.hiregrad.backend.profile.controller;

import com.hiregrad.backend.common.dto.ApiResponse;
import com.hiregrad.backend.profile.dto.ProfileDto;
import com.hiregrad.backend.profile.service.StudentProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student/profile")
@RequiredArgsConstructor
public class StudentProfileController {

    private final StudentProfileService service;

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileDto>> get(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok(service.getProfile(principal.getUsername())));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ProfileDto>> update(@AuthenticationPrincipal UserDetails principal,
                                                          @Valid @RequestBody ProfileDto dto) {
        return ResponseEntity.ok(ApiResponse.ok(service.saveProfile(principal.getUsername(), dto)));
    }
}