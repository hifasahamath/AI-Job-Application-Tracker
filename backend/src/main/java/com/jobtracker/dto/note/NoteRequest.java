package com.jobtracker.dto.note;

import com.jobtracker.model.NoteCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class NoteRequest {

    @NotNull(message = "Application ID is required")
    private UUID applicationId;

    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    @NotBlank(message = "Content cannot be blank")
    @Size(max = 50000, message = "Note content cannot exceed 50000 characters")
    private String content;

    private NoteCategory category = NoteCategory.GENERAL;

    public NoteRequest() {
    }

    public UUID getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(UUID applicationId) {
        this.applicationId = applicationId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public NoteCategory getCategory() {
        return category;
    }

    public void setCategory(NoteCategory category) {
        this.category = category;
    }
}
