# Multi-stage Docker build for Railway / Cloud Deployment from repository root
# Build stage
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache Maven dependencies
COPY backend/pom.xml ./pom.xml
RUN mvn dependency:go-offline -B

# Copy source code and build production JAR
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# Production runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-privileged security user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=build /app/target/ai-job-tracker-backend-1.0.0.jar app.jar

ENV SERVER_PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
