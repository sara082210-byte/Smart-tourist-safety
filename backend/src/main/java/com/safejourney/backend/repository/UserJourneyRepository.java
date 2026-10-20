package com.safejourney.backend.repository;

import com.safejourney.backend.model.UserJourney;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserJourneyRepository extends JpaRepository<UserJourney, Long> {

    Optional<UserJourney> findByUserId(Long userId);
}
