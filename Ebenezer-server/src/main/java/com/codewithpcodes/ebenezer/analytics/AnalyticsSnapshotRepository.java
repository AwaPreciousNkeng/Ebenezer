package com.codewithpcodes.ebenezer.analytics;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AnalyticsSnapshotRepository extends JpaRepository<AnalyticsSnapshot, UUID> {
}