
package com.safejourney.backend.controller;

import com.safejourney.backend.service.PlaceSearchService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/places")
public class PlaceSearchController {

    private final PlaceSearchService placeSearchService;

    public PlaceSearchController(
            PlaceSearchService placeSearchService) {
        this.placeSearchService = placeSearchService;
    }

    @GetMapping("/search")
    public List<Map<String, Object>> searchPlaces(
            @RequestParam String q) {

        String query = q.trim();

        if (query.length() < 2 || query.length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Search must contain 2 to 100 characters."
            );
        }

        return placeSearchService.searchPlaces(query);
    }
}
