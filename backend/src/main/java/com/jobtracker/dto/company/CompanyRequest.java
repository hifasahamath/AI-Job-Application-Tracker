package com.jobtracker.dto.company;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CompanyRequest {

    @NotBlank(message = "Company name is required")
    @Size(max = 255, message = "Company name cannot exceed 255 characters")
    private String name;

    @Size(max = 500, message = "Website URL cannot exceed 500 characters")
    private String website;

    @Size(max = 255, message = "Industry cannot exceed 255 characters")
    private String industry;

    @Size(max = 255, message = "Location cannot exceed 255 characters")
    private String location;

    public CompanyRequest() {
    }

    public CompanyRequest(String name, String website, String industry, String location) {
        this.name = name;
        this.website = website;
        this.industry = industry;
        this.location = location;
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
}
