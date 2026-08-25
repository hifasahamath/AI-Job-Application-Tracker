package com.jobtracker.service;

import com.jobtracker.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    private static final Logger log = LoggerFactory.getLogger(SupabaseStorageService.class);

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp");
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private final String supabaseUrl;
    private final String serviceKey;
    private final String bucket;
    private final RestTemplate restTemplate;

    public SupabaseStorageService(
            @Value("${supabase.url:https://xhdgmzhtexydpcrnciqf.supabase.co}") String supabaseUrl,
            @Value("${supabase.service-key:}") String serviceKey,
            @Value("${supabase.storage.bucket:profile-pictures}") String bucket) {
        this.supabaseUrl = supabaseUrl;
        this.serviceKey = serviceKey;
        this.bucket = bucket;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Uploads a profile picture to Supabase Storage with strict security validation.
     * Returns the public URL of the uploaded file.
     */
    public String uploadProfilePicture(UUID userId, MultipartFile file) {
        validateImageFile(file);

        if (!StringUtils.hasText(serviceKey) || serviceKey.equalsIgnoreCase("placeholder")) {
            log.warn("Supabase service key is not configured; profile picture storage disabled in this environment.");
            throw new BadRequestException("Storage service is not configured. Please configure SUPABASE_SERVICE_KEY.");
        }

        String extension = getValidatedExtension(file);
        // Canonical safe path: <uuid>/avatar.<ext> (no user-supplied path components)
        String filePath = userId.toString() + "/avatar" + extension;

        // Delete any existing avatar first
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
                log.info("Profile picture successfully uploaded for user {}", userId);
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
        if (!StringUtils.hasText(serviceKey)) {
            return;
        }

        for (String ext : ALLOWED_EXTENSIONS) {
            try {
                deleteFile(userId.toString() + "/avatar" + ext);
            } catch (Exception ignored) {}
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

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded image file is empty or missing.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("Image file size exceeds the maximum allowed limit of 5MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid image type: " + contentType + ". Allowed formats: JPG, PNG, WEBP.");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.isBlank()) {
            throw new BadRequestException("Filename cannot be empty.");
        }

        int dotIdx = filename.lastIndexOf('.');
        if (dotIdx == -1) {
            throw new BadRequestException("File must have a valid extension (.jpg, .png, .webp).");
        }

        String ext = filename.substring(dotIdx).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new BadRequestException("File extension " + ext + " is not permitted. Allowed: JPG, PNG, WEBP.");
        }

        // Verify image magic bytes
        try {
            byte[] header = new byte[12];
            int read = file.getInputStream().read(header, 0, Math.min((int) file.getSize(), 12));
            if (read < 4 || !isImageMagicBytesValid(header, ext)) {
                throw new BadRequestException("File content does not match a valid image signature.");
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to read image file header: " + e.getMessage());
        }
    }

    private boolean isImageMagicBytesValid(byte[] header, String extension) {
        // JPEG: FF D8 FF
        if (extension.equals(".jpg") || extension.equals(".jpeg")) {
            return (header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8 && (header[2] & 0xFF) == 0xFF;
        }
        // PNG: 89 50 4E 47
        if (extension.equals(".png")) {
            return (header[0] & 0xFF) == 0x89 && (header[1] & 0xFF) == 0x50 &&
                   (header[2] & 0xFF) == 0x4E && (header[3] & 0xFF) == 0x47;
        }
        // WebP: 52 49 46 46 ... 57 45 42 50
        if (extension.equals(".webp")) {
            return (header[0] & 0xFF) == 0x52 && (header[1] & 0xFF) == 0x49 &&
                   (header[2] & 0xFF) == 0x46 && (header[3] & 0xFF) == 0x46;
        }
        return false;
    }

    private String getValidatedExtension(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename != null && filename.contains(".")) {
            String ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
            if (ALLOWED_EXTENSIONS.contains(ext)) {
                return ext;
            }
        }
        return ".png";
    }
}
