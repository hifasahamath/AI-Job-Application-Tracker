package com.jobtracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
public class AiJobTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiJobTrackerApplication.class, args);
    }
}
