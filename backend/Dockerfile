# ==============================================================================
# Multi-stage Dockerfile for SafeJourney Spring Boot Backend (Java 21) on Render
# ==============================================================================

# Stage 1: Build JAR using Maven Wrapper and Java 21 JDK
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /app

# Copy Maven wrapper files and pom.xml first to take advantage of Docker layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Ensure maven wrapper executable permissions
RUN chmod +x mvnw

# Download dependencies offline (cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline -B || true

# Copy backend source code
COPY src/ ./src/

# Package executable JAR (skip tests during container image build)
RUN ./mvnw clean package -DskipTests

# Stage 2: Minimal runtime image with Java 21 JRE
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Create non-root user for security best practices
RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring

# Copy built application jar from builder stage
COPY --from=builder --chown=spring:spring /app/target/*.jar app.jar

# Render assigns dynamic port via $PORT environment variable
ENV PORT=8080
EXPOSE 8080

# Launch application using Java 21
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
