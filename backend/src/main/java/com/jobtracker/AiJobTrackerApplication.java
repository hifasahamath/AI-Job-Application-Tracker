package com.jobtracker;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@SpringBootApplication
public class AiJobTrackerApplication {

    private static final Logger log = LoggerFactory.getLogger(AiJobTrackerApplication.class);

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(AiJobTrackerApplication.class, args);
    }

    private static void loadDotEnv() {
        // Search candidate locations for .env
        Path[] candidatePaths = new Path[]{
                Path.of(".env"),
                Path.of("../.env"),
                Path.of("backend/.env"),
                Path.of(System.getProperty("user.dir"), ".env"),
                Path.of(System.getProperty("user.dir"), "..", ".env")
        };

        for (Path path : candidatePaths) {
            File file = path.toFile();
            if (file.exists() && file.isFile()) {
                log.info("Loading environment variables from: {}", file.getAbsolutePath());
                try {
                    List<String> lines = Files.readAllLines(path);
                    for (String line : lines) {
                        String trimmed = line.trim();
                        if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = trimmed.indexOf('=');
                        if (eqIdx > 0) {
                            String key = trimmed.substring(0, eqIdx).trim();
                            String val = trimmed.substring(eqIdx + 1).trim();
                            // Strip outer quotes if present
                            if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                                val = val.substring(1, val.length() - 1);
                            }
                            // Set system property if not already set by OS environment
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, val);
                            }
                        }
                    }
                    return;
                } catch (Exception e) {
                    log.warn("Could not read .env from {}: {}", file.getAbsolutePath(), e.getMessage());
                }
            }
        }
    }
}
