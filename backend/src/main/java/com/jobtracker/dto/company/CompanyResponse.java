package com.jobtracker.dto.company;

import java.time.Instant;
import java.util.UUID;

public class CompanyResponse {

    private UUID id;
    private String name;
    private String website;
    private String industry;
    private String location;
    private Instant createdAt;

    public CompanyResponse() {
    }

    public CompanyResponse(UUID id, String name, String website, String industry, String location, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.website = website;
        this.industry = industry;
        this.location = location;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
