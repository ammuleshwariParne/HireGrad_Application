package com.hiregrad.backend.application.repository;

import com.hiregrad.backend.application.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByStudentUsernameOrderByCreatedAtDesc(String studentUsername);

    List<Application> findByJob_IdOrderByCreatedAtDesc(Long jobId);

    boolean existsByJob_IdAndStudentUsername(Long jobId, String studentUsername);

    Optional<Application> findByJob_IdAndStudentUsername(Long jobId, String studentUsername);

    long countByJob_Id(Long jobId);
}
