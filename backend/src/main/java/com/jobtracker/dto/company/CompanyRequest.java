package com.jobtracker.dto.company;

import jakarta.validation.constraints.NotBlank;

public class CompanyRequest {

    @NotBlank(message = "Company name is required")
    private String name;

    private String website;
    private String industry;
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
