package com.jobtracker.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "BearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("AI Job Application Tracker REST API")
                        .version("v1.0.0")
                        .description("Production-quality REST API for AI Job Application Tracker with Spring Boot, PostgreSQL, Gemini AI Integration, and WSO2 API Platform Cloud Gateway management.")
                        .contact(new Contact()
                                .name("AI Job Tracker Engineering Team")
                                .email("developer@jobtracker.internal"))
                        .license(new License().name("Apache 2.0").url("https://spring.io/licenses/apache-2.0")))
                .servers(List.of(
                        new Server().url("http://localhost:" + serverPort).description("Local Development Server"),
                        new Server().url("https://api.cloud.wso2.com/t/jobtracker/v1").description("WSO2 API Platform Cloud Gateway Production"),
                        new Server().url("https://sandbox.api.cloud.wso2.com/t/jobtracker/v1").description("WSO2 API Platform Cloud Gateway Sandbox")
                ))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Provide the JWT bearer token obtained from /api/v1/auth/login or /api/v1/auth/register")));
    }
}
