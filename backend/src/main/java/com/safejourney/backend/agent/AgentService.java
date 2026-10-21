package com.safejourney.backend.agent;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AgentService {

    private static final Logger log = LoggerFactory.getLogger(AgentService.class);

    private static final String SYSTEM_PROMPT =
            "You are SafeJourney's Agentic AI Safety Assistant, an expert in tourist safety, travel awareness, journey check-ins, and emergency guidance in India.\n\n" +
            "CORE PRINCIPLES & CRITICAL SAFETY BOUNDARIES:\n" +
            "1. URGENT SOS & EMERGENCIES: If the user indicates an emergency, immediate danger, medical crisis, crime, or harassment, treat it as urgent. Instruct them clearly and prominently to contact India's official emergency helpline: 112 (or 100 for Police, 108/102 for Ambulance, 101 for Fire).\n" +
            "2. DO NOT CLAIM DISPATCH CAPABILITY: Never claim or imply that you or the SafeJourney system can dispatch police, send an ambulance, or automatically track a person's physical location. You are an AI informational advisory assistant, not a live emergency dispatcher.\n" +
            "3. RISK ASSESSMENTS ARE INFORMATIONAL: All risk assessments, hazard warnings, route tips, and local safety notes are strictly informational recommendations based on general travel safety guidelines, not guaranteed predictions or absolute guarantees of safety.\n" +
            "4. JOURNEY CHECK-INS & ADVICE: Provide practical, reassuring guidance on journey check-ins, sharing live status with trusted contacts, identifying well-lit and verified safe zones, local transport precautions, and useful emergency phrases.\n" +
            "5. MULTILINGUAL RESPONSES: Respond naturally, accurately, and fluently in the same language or script the user communicates in (e.g., Hindi, English, Tamil, Telugu, Kannada, Bengali, Spanish, French, German, Japanese, etc.). If asked for translations or emergency phrases in local languages, provide helpful phonetic pronunciations.\n" +
            "6. TONE & READABILITY: Keep answers clear, supportive, calm, actionable, and formatted with bullet points where appropriate for high readability on mobile devices.";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${llm.api.key:}")
    private String configuredApiKey;

    @Value("${llm.api.provider:gemini}")
    private String configuredProvider;

    @Value("${llm.api.model:gemini-1.5-flash}")
    private String configuredModel;

    @Value("${llm.api.url:}")
    private String configuredUrl;

    public AgentService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Resolves the API key from environment variables (GEMINI_API_KEY or LLM_API_KEY) first,
     * then falls back to application.properties.
     */
    public String resolveApiKey() {
        String geminiEnv = System.getenv("GEMINI_API_KEY");
        if (geminiEnv != null && !geminiEnv.trim().isEmpty()) {
            return geminiEnv.trim();
        }
        String llmEnv = System.getenv("LLM_API_KEY");
        if (llmEnv != null && !llmEnv.trim().isEmpty()) {
            return llmEnv.trim();
        }
        String dotEnv = readFromDotEnv();
        if (dotEnv != null && !dotEnv.trim().isEmpty()) {
            return dotEnv.trim();
        }
        if (configuredApiKey != null && !configuredApiKey.trim().isEmpty()) {
            return configuredApiKey.trim();
        }
        return null;
    }

    private String readFromDotEnv() {
        List<Path> potentialPaths = List.of(
            Paths.get(".env"),
            Paths.get("../.env"),
            Paths.get("backend/.env"),
            Paths.get(System.getProperty("user.dir", "."), ".env"),
            Paths.get(System.getProperty("user.dir", "."), "backend/.env")
        );
        for (Path path : potentialPaths) {
            if (Files.exists(path)) {
                try {
                    for (String line : Files.readAllLines(path)) {
                        line = line.trim();
                        if (line.startsWith("#") || !line.contains("=")) continue;
                        String[] parts = line.split("=", 2);
                        String key = parts[0].trim();
                        String val = parts[1].trim();
                        if (val.startsWith("\"") && val.endsWith("\"") && val.length() >= 2) {
                            val = val.substring(1, val.length() - 1);
                        } else if (val.startsWith("'") && val.endsWith("'") && val.length() >= 2) {
                            val = val.substring(1, val.length() - 1);
                        }
                        if ("GEMINI_API_KEY".equalsIgnoreCase(key) || "LLM_API_KEY".equalsIgnoreCase(key)) {
                            if (!val.isBlank()) return val;
                        }
                    }
                } catch (Exception ignored) {}
            }
        }
        return null;
    }

    public AgentChatResponse chat(AgentChatRequest request) {
        String apiKey = resolveApiKey();
        if (apiKey == null || apiKey.isEmpty()) {
            throw new AgentConfigurationException(
                    "GEMINI_API_KEY environment variable is not configured on the backend server. " +
                    "Please set GEMINI_API_KEY in your environment to enable the AI Safety Assistant."
            );
        }

        String userMessage = request.message() != null ? request.message().trim() : "";
        if (userMessage.isEmpty()) {
            throw new AgentServiceException("Message cannot be empty.", HttpStatus.BAD_REQUEST);
        }
        if (userMessage.length() > 2000) {
            throw new AgentServiceException("Message cannot exceed 2000 characters.", HttpStatus.BAD_REQUEST);
        }

        StringBuilder promptBuilder = new StringBuilder();
        if (request.destination() != null && !request.destination().trim().isEmpty()) {
            promptBuilder.append("[Current/Planned Destination: ").append(request.destination().trim()).append("]\n");
        }
        if (request.coordinates() != null && !request.coordinates().trim().isEmpty()) {
            promptBuilder.append("[Coordinates: ").append(request.coordinates().trim()).append("]\n");
        }
        promptBuilder.append(userMessage);

        String fullPrompt = promptBuilder.toString();
        String provider = resolveProvider(apiKey);

        if ("openai".equalsIgnoreCase(provider)) {
            return callOpenAiCompatible(apiKey, fullPrompt);
        } else {
            return callGemini(apiKey, fullPrompt);
        }
    }

    private String resolveProvider(String apiKey) {
        if (configuredProvider != null && !configuredProvider.trim().isEmpty()) {
            return configuredProvider.trim().toLowerCase();
        }
        if (apiKey.startsWith("AIza")) {
            return "gemini";
        }
        if (apiKey.startsWith("sk-") || apiKey.startsWith("gsk-")) {
            return "openai";
        }
        if (configuredUrl != null && configuredUrl.contains("openai")) {
            return "openai";
        }
        return "gemini";
    }

    private static final List<String> GEMINI_MODELS = List.of(
            "gemini-3.5-flash",
            "gemini-3-flash-preview",
            "gemini-3.5-flash-lite",
            "gemini-3.8-flash",
            "gemini-2.5-flash"
    );

    private AgentChatResponse callGemini(String apiKey, String prompt) {
        List<String> modelsToTry = new ArrayList<>();
        if (configuredModel != null && !configuredModel.trim().isEmpty() && !configuredModel.trim().equalsIgnoreCase("gemini-1.5-flash")) {
            modelsToTry.add(configuredModel.trim());
        }
        for (String m : GEMINI_MODELS) {
            if (!modelsToTry.contains(m)) {
                modelsToTry.add(m);
            }
        }

        String lastError = null;

        for (String model : modelsToTry) {
            String url = (configuredUrl != null && !configuredUrl.trim().isEmpty())
                    ? configuredUrl.trim()
                    : "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

            if (!url.contains("key=")) {
                url += (url.contains("?") ? "&" : "?") + "key=" + apiKey;
            }

            try {
                Map<String, Object> body = new HashMap<>();
                body.put("system_instruction", Map.of(
                        "parts", List.of(Map.of("text", SYSTEM_PROMPT))
                ));
                body.put("contents", List.of(
                        Map.of("role", "user", "parts", List.of(Map.of("text", prompt)))
                ));
                body.put("generationConfig", Map.of(
                        "temperature", 0.4,
                        "maxOutputTokens", 1024
                ));

                String requestJson = objectMapper.writeValueAsString(body);

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .timeout(Duration.ofSeconds(20))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                int statusCode = response.statusCode();

                if (statusCode == 200) {
                    JsonNode root = objectMapper.readTree(response.body());
                    JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
                    if (!textNode.isMissingNode() && !textNode.asText().isBlank()) {
                        return AgentChatResponse.of(textNode.asText().trim());
                    }
                } else if (statusCode == 404 || statusCode == 503) {
                    log.warn("Gemini model {} returned HTTP {}. Trying next fallback candidate...", model, statusCode);
                    try {
                        JsonNode errNode = objectMapper.readTree(response.body()).path("error").path("message");
                        if (!errNode.isMissingNode()) {
                            lastError = errNode.asText();
                        }
                    } catch (Exception ignored) {}
                    continue;
                } else if (statusCode == 400 || statusCode == 401 || statusCode == 403) {
                    log.error("Gemini API rejected request: HTTP {} - {}", statusCode, response.body());
                    String details = "External Gemini API authentication failed. Please verify your GEMINI_API_KEY.";
                    try {
                        JsonNode errNode = objectMapper.readTree(response.body()).path("error").path("message");
                        if (!errNode.isMissingNode() && !errNode.asText().isBlank()) {
                            details = "Gemini API error: " + errNode.asText();
                        }
                    } catch (Exception ignored) {}
                    throw new AgentServiceException(details, HttpStatus.BAD_GATEWAY);
                } else if (statusCode == 429) {
                    log.warn("Gemini API rate limited: HTTP 429");
                    throw new AgentServiceException("LLM provider rate limit reached. Please try again shortly.", HttpStatus.TOO_MANY_REQUESTS);
                } else {
                    lastError = "External LLM provider returned an error (HTTP " + statusCode + ").";
                }
            } catch (HttpTimeoutException e) {
                log.warn("Timeout contacting Gemini model {}. Trying fallback...", model);
            } catch (IOException | InterruptedException e) {
                if (e instanceof InterruptedException) {
                    Thread.currentThread().interrupt();
                }
                log.error("Network error contacting Gemini API", e);
                throw new AgentServiceException("Unable to contact external LLM provider. Please check network connectivity.", HttpStatus.BAD_GATEWAY);
            }
        }

        if (lastError != null) {
            throw new AgentServiceException(lastError, HttpStatus.BAD_GATEWAY);
        }
        throw new AgentServiceException("No responsive Gemini model candidate available. Please try again.", HttpStatus.BAD_GATEWAY);
    }

    private AgentChatResponse callOpenAiCompatible(String apiKey, String prompt) {
        String model = (configuredModel != null && !configuredModel.trim().isEmpty())
                ? configuredModel.trim()
                : "gpt-4o-mini";

        String url = (configuredUrl != null && !configuredUrl.trim().isEmpty())
                ? configuredUrl.trim()
                : "https://api.openai.com/v1/chat/completions";

        try {
            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            body.put("messages", List.of(
                    Map.of("role", "system", "content", SYSTEM_PROMPT),
                    Map.of("role", "user", "content", prompt)
            ));
            body.put("temperature", 0.4);
            body.put("max_tokens", 1024);

            String requestJson = objectMapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(20))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            int statusCode = response.statusCode();

            if (statusCode == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode textNode = root.path("choices").path(0).path("message").path("content");
                if (!textNode.isMissingNode() && !textNode.asText().isBlank()) {
                    return AgentChatResponse.of(textNode.asText().trim());
                }
                throw new AgentServiceException("External LLM did not return any content choices.", HttpStatus.BAD_GATEWAY);
            } else if (statusCode == 401 || statusCode == 403) {
                log.error("OpenAI API authentication failed: HTTP {} - {}", statusCode, response.body());
                throw new AgentServiceException("External LLM provider authentication failed. Please verify your LLM_API_KEY.", HttpStatus.BAD_GATEWAY);
            } else if (statusCode == 429) {
                log.warn("OpenAI API rate limited: HTTP 429");
                throw new AgentServiceException("LLM provider rate limit reached. Please try again shortly.", HttpStatus.TOO_MANY_REQUESTS);
            } else {
                log.error("OpenAI API unexpected error: HTTP {} - {}", statusCode, response.body());
                throw new AgentServiceException("External LLM provider returned an error (HTTP " + statusCode + ").", HttpStatus.BAD_GATEWAY);
            }
        } catch (HttpTimeoutException e) {
            log.error("Timeout contacting OpenAI-compatible API", e);
            throw new AgentServiceException("The AI safety service timed out while processing your request. Please try again.", HttpStatus.GATEWAY_TIMEOUT);
        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            log.error("Network error contacting OpenAI API", e);
            throw new AgentServiceException("Unable to contact external LLM provider. Please check network connectivity.", HttpStatus.BAD_GATEWAY);
        }
    }
}
