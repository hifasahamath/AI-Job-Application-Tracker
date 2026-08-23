package com.jobtracker.repository;

import com.jobtracker.model.ApplicationNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationNoteRepository extends JpaRepository<ApplicationNote, UUID> {

    List<ApplicationNote> findAllByApplicationIdOrderByCreatedAtDesc(UUID applicationId);

    @Query("SELECT n FROM ApplicationNote n WHERE n.application.user.id = :userId AND n.id = :id")
    Optional<ApplicationNote> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);
}
