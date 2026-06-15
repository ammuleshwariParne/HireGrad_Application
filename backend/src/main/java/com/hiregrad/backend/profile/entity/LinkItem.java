package com.hiregrad.backend.profile.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A profile link, e.g. GitHub / LeetCode / LinkedIn / Portfolio / a custom link. */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LinkItem {
    private String type;   // github | leetcode | linkedin | portfolio | custom
    private String label;  // display label (editable for custom links)
    @Column(length = 1000)
    private String url;
}
