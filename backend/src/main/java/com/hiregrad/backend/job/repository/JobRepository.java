package com.hiregrad.backend.job.repository;

import com.hiregrad.backend.job.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findAllByOrderByCreatedAtDesc();
}