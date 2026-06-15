package com.hiregrad.backend.profile.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LinkDto {
    private String type;
    private String label;
    private String url;
}
