package com.jobtracker.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class SupabaseStorageService {

    private static final Logger log = LoggerFactory.getLogger(SupabaseStorageService.class);

    private final String supabaseUrl;
    private final String serviceKey;
    private final String bucket;
    private final RestTemplate restTemplate;

    public SupabaseStorageService(
            @Value("${supabase.url}") String supabaseUrl,
            @Value("${supabase.service-key}") String serviceKey,
            @Value("${supabase.storage.bucket}") String bucket) {
        this.supabaseUrl = supabaseUrl;
        this.serviceKey = serviceKey;
        this.bucket = bucket;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Uploads a profile picture to Supabase Storage.
     * Returns the public URL of the uploaded file.
     */
    public String uploadProfilePicture(UUID userId, MultipartFile file) {
        String extension = getExtension(file.getOriginalFilename());
        String filePath = userId.toString() + "/avatar" + extension;

        // Delete any existing file first (ignore errors if it doesn't exist)
        try {
            deleteFile(filePath);
        } catch (Exception e) {
            log.debug("No existing avatar to delete for user {}", userId);
        }

        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + filePath;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceKey);
        headers.set("apikey", serviceKey);
        headers.setContentType(MediaType.parseMediaType(
                file.getContentType() != null ? file.getContentType() : "image/png"));
        headers.set("x-upsert", "true");

        try {
            byte[] fileBytes = file.getBytes();
            HttpEntity<byte[]> requestEntity = new HttpEntity<>(fileBytes, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    uploadUrl, HttpMethod.POST, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                String publicUrl = supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + filePath;
                log.info("Profile picture uploaded for user {}: {}", userId, publicUrl);
                return publicUrl;
            } else {
                throw new RuntimeException("Failed to upload profile picture: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Error uploading profile picture for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to upload profile picture: " + e.getMessage(), e);
        }
    }

    /**
     * Deletes the profile picture from Supabase Storage.
     */
    public void deleteProfilePicture(UUID userId) {
        // We need to find and delete all files in the user's folder
        String filePath = userId.toString() + "/";

        // List files in the user folder
        String listUrl = supabaseUrl + "/storage/v1/object/list/" + bucket;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceKey);
        headers.set("apikey", serviceKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String body = "{\"prefix\":\"" + filePath + "\",\"limit\":10}";
        HttpEntity<String> listRequest = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> listResponse = restTemplate.exchange(
                    listUrl, HttpMethod.POST, listRequest, String.class);

            if (listResponse.getStatusCode().is2xxSuccessful() && listResponse.getBody() != null) {
                // Try to delete the known avatar paths
                for (String ext : new String[]{".jpg", ".jpeg", ".png", ".gif", ".webp"}) {
                    try {
                        deleteFile(userId.toString() + "/avatar" + ext);
                    } catch (Exception ignored) {}
                }
            }
        } catch (Exception e) {
            log.debug("Error listing files for user {}: {}", userId, e.getMessage());
        }

        log.info("Profile picture deleted for user {}", userId);
    }

    private void deleteFile(String filePath) {
        String deleteUrl = supabaseUrl + "/storage/v1/object/" + bucket;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceKey);
        headers.set("apikey", serviceKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String body = "{\"prefixes\":[\"" + filePath + "\"]}";
        HttpEntity<String> request = new HttpEntity<>(body, headers);

        restTemplate.exchange(deleteUrl, HttpMethod.DELETE, request, String.class);
    }

    private String getExtension(String filename) {
        if (filename == null) return ".png";
        int dotIdx = filename.lastIndexOf('.');
        if (dotIdx >= 0) {
            return filename.substring(dotIdx).toLowerCase();
        }
        return ".png";
    }
}
