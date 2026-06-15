package com.hiregrad.backend.application.entity;

/**
 * Lifecycle of a student's application to a job posting.
 * APPLIED is the default the moment a student applies; the placement officer
 * advances it to SELECTED or REJECTED. This single value is the source of truth
 * shown both in the student's tracker and the admin's application management view.
 */
public enum ApplicationStatus {
    APPLIED,
    SELECTED,
    REJECTED
}
