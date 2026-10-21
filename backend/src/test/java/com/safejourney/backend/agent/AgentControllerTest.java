package com.safejourney.backend.agent;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AgentControllerTest {

    private MockMvc mockMvc;
    private AgentService agentService;

    @BeforeEach
    void setup() {
        agentService = Mockito.mock(AgentService.class);
        AgentController controller = new AgentController(agentService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void whenMissingApiKey_returns503ServiceUnavailable() throws Exception {
        when(agentService.chat(any())).thenThrow(new AgentConfigurationException(
                "GEMINI_API_KEY environment variable is not configured on the backend server. Please set GEMINI_API_KEY to enable the AI Safety Assistant."
        ));

        mockMvc.perform(post("/api/v1/agent/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"message\":\"Is Colva beach safe at night?\"}"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value("configuration_error"))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("GEMINI_API_KEY")));
    }

    @Test
    void whenEmptyMessage_returns400BadRequest() throws Exception {
        mockMvc.perform(post("/api/v1/agent/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"message\":\"   \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("validation_error"));
    }

    @Test
    void whenExcessivelyLongMessage_returns400BadRequest() throws Exception {
        String longMsg = "A".repeat(2001);
        mockMvc.perform(post("/api/v1/agent/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"message\":\"" + longMsg + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("validation_error"));
    }

    @Test
    void whenValidRequest_returnsReplyAndDisclaimer() throws Exception {
        when(agentService.chat(any())).thenReturn(AgentChatResponse.of("Stay in well-lit areas and keep 112 in mind."));

        mockMvc.perform(post("/api/v1/agent/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"message\":\"Safety tips for Goa nightlife?\",\"destination\":\"Goa\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.reply").value("Stay in well-lit areas and keep 112 in mind."))
                .andExpect(jsonPath("$.disclaimer").value(org.hamcrest.Matchers.containsString("112")));
    }

    @Test
    void whenProviderTimeout_returns504GatewayTimeout() throws Exception {
        when(agentService.chat(any())).thenThrow(new AgentServiceException(
                "The AI safety service timed out while processing your request. Please try again.",
                HttpStatus.GATEWAY_TIMEOUT
        ));

        mockMvc.perform(post("/api/v1/agent/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"message\":\"Help me with safe transport.\"}"))
                .andExpect(status().isGatewayTimeout())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("timed out")));
    }
}
