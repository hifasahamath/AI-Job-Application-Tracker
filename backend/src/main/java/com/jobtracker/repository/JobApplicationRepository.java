package com.jobtracker.repository;

import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.JobApplication;
import com.jobtracker.model.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID>, JpaSpecificationExecutor<JobApplication> {

    Optional<JobApplication> findByIdAndUserId(UUID id, UUID userId);

    List<JobApplication> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    Page<JobApplication> findAllByUserId(UUID userId, Pageable pageable);

    @Query("SELECT j FROM JobApplication j WHERE j.user.id = :userId " +
           "AND (:status IS NULL OR j.status = :status) " +
           "AND (:priority IS NULL OR j.priority = :priority) " +
           "AND (:companyId IS NULL OR j.company.id = :companyId) " +
           "AND (:search IS NULL OR LOWER(j.jobTitle) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(j.company.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<JobApplication> findWithFilters(
            @Param("userId") UUID userId,
            @Param("status") ApplicationStatus status,
            @Param("priority") Priority priority,
            @Param("companyId") UUID companyId,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT j.status, COUNT(j) FROM JobApplication j WHERE j.user.id = :userId GROUP BY j.status")
    List<Object[]> countApplicationsByStatus(@Param("userId") UUID userId);

    @Query("SELECT j FROM JobApplication j WHERE j.user.id = :userId ORDER BY j.createdAt DESC LIMIT 5")
    List<JobApplication> findTop5RecentApplications(@Param("userId") UUID userId);

    long countByUserId(UUID userId);
}
