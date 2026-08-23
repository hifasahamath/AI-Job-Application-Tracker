package com.jobtracker.service;

import com.jobtracker.dto.note.NoteRequest;
import com.jobtracker.dto.note.NoteResponse;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.model.ApplicationNote;
import com.jobtracker.model.JobApplication;
import com.jobtracker.model.NoteCategory;
import com.jobtracker.repository.ApplicationNoteRepository;
import com.jobtracker.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private final ApplicationNoteRepository noteRepository;
    private final JobApplicationRepository applicationRepository;

    public NoteService(ApplicationNoteRepository noteRepository, JobApplicationRepository applicationRepository) {
        this.noteRepository = noteRepository;
        this.applicationRepository = applicationRepository;
    }

    @Transactional(readOnly = true)
    public List<NoteResponse> getNotesByApplicationId(UUID applicationId, UUID userId) {
        // Verify application ownership
        applicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + applicationId));

        return noteRepository.findAllByApplicationIdOrderByCreatedAtDesc(applicationId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public NoteResponse addNote(NoteRequest request, UUID userId) {
        JobApplication application = applicationRepository.findByIdAndUserId(request.getApplicationId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + request.getApplicationId()));

        ApplicationNote note = new ApplicationNote();
        note.setApplication(application);
        note.setTitle(request.getTitle());
        note.setContent(request.getContent().trim());
        note.setCategory(request.getCategory() != null ? request.getCategory() : NoteCategory.GENERAL);

        ApplicationNote saved = noteRepository.save(note);
        return mapToResponse(saved);
    }

    @Transactional
    public NoteResponse updateNote(UUID noteId, NoteRequest request, UUID userId) {
        ApplicationNote note = noteRepository.findByIdAndUserId(noteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + noteId));

        note.setTitle(request.getTitle());
        note.setContent(request.getContent().trim());
        if (request.getCategory() != null) {
            note.setCategory(request.getCategory());
        }

        ApplicationNote updated = noteRepository.save(note);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteNote(UUID noteId, UUID userId) {
        ApplicationNote note = noteRepository.findByIdAndUserId(noteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + noteId));

        noteRepository.delete(note);
    }

    public NoteResponse mapToResponse(ApplicationNote note) {
        if (note == null) return null;
        return new NoteResponse(
                note.getId(),
                note.getApplication().getId(),
                note.getTitle(),
                note.getContent(),
                note.getCategory(),
                note.getCreatedAt(),
                note.getUpdatedAt()
        );
    }
}
