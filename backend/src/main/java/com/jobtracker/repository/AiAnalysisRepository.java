package com.jobtracker.repository;

import com.jobtracker.model.AiAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiAnalysisRepository extends JpaRepository<AiAnalysis, UUID> {

    List<AiAnalysis> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<AiAnalysis> findByIdAndUserId(UUID id, UUID userId);

    List<AiAnalysis> findAllByApplicationIdOrderByCreatedAtDesc(UUID applicationId);

    Optional<AiAnalysis> findTopByApplicationIdOrderByCreatedAtDesc(UUID applicationId);

    long countByUserId(UUID userId);

    void deleteAllByUserId(UUID userId);
}
