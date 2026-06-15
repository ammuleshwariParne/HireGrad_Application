package com.hiregrad.backend.account.controller;

import com.hiregrad.backend.account.dto.CreateStudentRequest;
import com.hiregrad.backend.account.dto.CreateStudentResponse;
import com.hiregrad.backend.account.service.StudentAccountService;
import com.hiregrad.backend.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/students")
@RequiredArgsConstructor
public class AdminStudentController {

    private final StudentAccountService studentAccountService;

    @PostMapping
    public ResponseEntity<ApiResponse<CreateStudentResponse>> create(@Valid @RequestBody CreateStudentRequest req) {
        CreateStudentResponse created = studentAccountService.createStudent(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created));
    }
}
