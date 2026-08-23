package com.jobtracker.dto.note;

import com.jobtracker.model.NoteCategory;

import java.time.Instant;
import java.util.UUID;

public class NoteResponse {

    private UUID id;
    private UUID applicationId;
    private String title;
    private String content;
    private NoteCategory category;
    private Instant createdAt;
    private Instant updatedAt;

    public NoteResponse() {
    }

    public NoteResponse(UUID id, UUID applicationId, String title, String content, NoteCategory category, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.applicationId = applicationId;
        this.title = title;
        this.content = content;
        this.category = category;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
