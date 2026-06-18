package com.hiregrad.backend.account.dto;

import lombok.*;

/** Returned once on creation so the admin can hand the credentials to the student. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateStudentResponse {
    private Long id;
    private String username;
    private String fullName;
    private String rollNumber;
    private String instituteEmail;
    private String personalEmail;
    private String temporaryPassword;
}
