package com.hiregrad.backend.common.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiError {
    private String code;
    private String message;
}