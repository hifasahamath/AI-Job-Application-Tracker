package com.jobtracker.repository;

import com.jobtracker.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {
    List<Company> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<Company> findByIdAndUserId(UUID id, UUID userId);
    Optional<Company> findByNameIgnoreCaseAndUserId(String name, UUID userId);
}
