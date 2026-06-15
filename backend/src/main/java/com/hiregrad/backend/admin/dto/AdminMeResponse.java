package com.hiregrad.backend.admin.dto;

import com.hiregrad.backend.user.entity.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminMeResponse {
    private String username;
    private String fullName;
    private Role role;
}