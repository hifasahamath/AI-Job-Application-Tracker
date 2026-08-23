package com.jobtracker.repository;

import com.jobtracker.model.Interview;
import com.jobtracker.model.InterviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, UUID> {

    List<Interview> findAllByApplicationIdOrderByScheduledAtAsc(UUID applicationId);

    @Query("SELECT i FROM Interview i WHERE i.application.user.id = :userId AND i.id = :id")
    Optional<Interview> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("SELECT i FROM Interview i WHERE i.application.user.id = :userId AND i.scheduledAt >= :now AND i.status = :status ORDER BY i.scheduledAt ASC")
    List<Interview> findUpcomingInterviews(
            @Param("userId") UUID userId,
            @Param("now") Instant now,
            @Param("status") InterviewStatus status
    );

    @Query("SELECT COUNT(i) FROM Interview i WHERE i.application.user.id = :userId AND i.scheduledAt >= :now AND i.status = :status")
    long countUpcomingInterviews(
            @Param("userId") UUID userId,
            @Param("now") Instant now,
            @Param("status") InterviewStatus status
    );
}
