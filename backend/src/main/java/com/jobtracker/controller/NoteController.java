package com.jobtracker.controller;

import com.jobtracker.dto.ApiResponse;
import com.jobtracker.dto.note.NoteRequest;
import com.jobtracker.dto.note.NoteResponse;
import com.jobtracker.security.UserPrincipal;
import com.jobtracker.service.NoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notes")
@Tag(name = "Notes", description = "Endpoints for managing notes per job application")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping("/application/{applicationId}")
    @Operation(summary = "Get application notes", description = "Retrieves all notes attached to a job application")
    public ResponseEntity<ApiResponse<List<NoteResponse>>> getNotesByApplication(
            @PathVariable UUID applicationId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<NoteResponse> notes = noteService.getNotesByApplicationId(applicationId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(notes));
    }

    @PostMapping
    @Operation(summary = "Add note", description = "Adds a new note to a job application")
    public ResponseEntity<ApiResponse<NoteResponse>> addNote(
            @Valid @RequestBody NoteRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        NoteResponse response = noteService.addNote(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Note added successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update note", description = "Updates title and content of an existing note")
    public ResponseEntity<ApiResponse<NoteResponse>> updateNote(
            @PathVariable UUID id,
            @Valid @RequestBody NoteRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        NoteResponse response = noteService.updateNote(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Note updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete note", description = "Deletes a note")
    public ResponseEntity<ApiResponse<Void>> deleteNote(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        noteService.deleteNote(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Note deleted successfully"));
    }
}
