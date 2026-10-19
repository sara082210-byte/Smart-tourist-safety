
package com.safejourney.backend.service;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class PlaceSearchService {

    private final RestClient restClient;

    public PlaceSearchService() {
        this.restClient = RestClient.builder()
                .baseUrl("https://nominatim.openstreetmap.org")
                .defaultHeader(
                        HttpHeaders.USER_AGENT,
                        "SmartTouristSafety/1.0 (student project)"
                )
                .build();
    }

    public List<Map<String, Object>> searchPlaces(String query) {
        List<Map<String, Object>> results = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search")
                        .queryParam("q", query)
                        .queryParam("format", "jsonv2")
                        .queryParam("limit", 5)
                        .queryParam("addressdetails", 1)
                        .build())
                .retrieve()
                .body(new ParameterizedTypeReference<
                        List<Map<String, Object>>>() {});

        return results == null ? List.of() : results;
    }
}
