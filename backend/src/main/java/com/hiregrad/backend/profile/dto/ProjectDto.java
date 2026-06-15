package com.hiregrad.backend.profile.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDto {
    private String title;
    private String description;
    private String link;
}