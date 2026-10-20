package com.safejourney.backend.repository;

import com.safejourney.backend.model.IncidentReport;
import com.safejourney.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentReportRepository extends JpaRepository<IncidentReport, Long> {
    List<IncidentReport> findByUserOrderByCreatedAtDesc(User user);
}
