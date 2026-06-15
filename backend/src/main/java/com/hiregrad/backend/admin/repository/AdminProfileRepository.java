package com.hiregrad.backend.admin.repository;

import com.hiregrad.backend.admin.entity.AdminProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminProfileRepository extends JpaRepository<AdminProfile, Long> {
    Optional<AdminProfile> findByUser_Username(String username);
}
