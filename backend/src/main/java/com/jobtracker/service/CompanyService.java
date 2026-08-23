package com.jobtracker.service;

import com.jobtracker.dto.company.CompanyRequest;
import com.jobtracker.dto.company.CompanyResponse;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.model.Company;
import com.jobtracker.model.User;
import com.jobtracker.repository.CompanyRepository;
import com.jobtracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public CompanyService(CompanyRepository companyRepository, UserRepository userRepository) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> getAllCompanies(UUID userId) {
        return companyRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyResponse getCompanyById(UUID companyId, UUID userId) {
        Company company = companyRepository.findByIdAndUserId(companyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));
        return mapToResponse(company);
    }

    @Transactional
    public Company getOrCreateCompany(String name, UUID userId) {
        String trimmedName = name.trim();
        return companyRepository.findByNameIgnoreCaseAndUserId(trimmedName, userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                    Company newCompany = new Company();
                    newCompany.setName(trimmedName);
                    newCompany.setUser(user);
                    return companyRepository.save(newCompany);
                });
    }

    @Transactional
    public CompanyResponse createCompany(CompanyRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Company company = new Company();
        company.setUser(user);
        company.setName(request.getName().trim());
        company.setWebsite(request.getWebsite());
        company.setIndustry(request.getIndustry());
        company.setLocation(request.getLocation());

        Company saved = companyRepository.save(company);
        return mapToResponse(saved);
    }

    @Transactional
    public CompanyResponse updateCompany(UUID companyId, CompanyRequest request, UUID userId) {
        Company company = companyRepository.findByIdAndUserId(companyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        company.setName(request.getName().trim());
        company.setWebsite(request.getWebsite());
        company.setIndustry(request.getIndustry());
        company.setLocation(request.getLocation());

        Company updated = companyRepository.save(company);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteCompany(UUID companyId, UUID userId) {
        Company company = companyRepository.findByIdAndUserId(companyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));
        companyRepository.delete(company);
    }

    public CompanyResponse mapToResponse(Company company) {
        if (company == null) return null;
        return new CompanyResponse(
                company.getId(),
                company.getName(),
                company.getWebsite(),
                company.getIndustry(),
                company.getLocation(),
                company.getCreatedAt()
        );
    }
}
