package com.hiregrad.backend.student.controller;

import com.hiregrad.backend.common.dto.ApiResponse;
import com.hiregrad.backend.student.dto.StudentMeResponse;
import com.hiregrad.backend.student.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<StudentMeResponse>> me(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok(studentService.getByUsername(principal.getUsername())));
    }
}