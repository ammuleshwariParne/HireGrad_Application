package com.hiregrad.backend.dashboard.controller;

import com.hiregrad.backend.common.dto.ApiResponse;
import com.hiregrad.backend.dashboard.dto.StudentDashboardResponse;
import com.hiregrad.backend.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/student/dashboard")
@RequiredArgsConstructor
public class StudentDashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<StudentDashboardResponse>> dashboard(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.studentDashboard(principal.getUsername())));
    }
}
