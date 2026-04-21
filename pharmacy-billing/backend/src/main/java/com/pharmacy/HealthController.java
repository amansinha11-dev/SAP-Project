package com.pharmacy;

import java.sql.Connection;
import java.sql.SQLException;
import java.time.Instant;
import java.util.Map;
import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping({"/api/health", "/api/health/", "/health", "/health/"})
    public Map<String, Object> health() {
        return Map.of(
            "status", "ok",
            "service", "pharmacy-billing",
            "timestamp", Instant.now().toString()
        );
    }

    @GetMapping("/api/health/db")
    public Map<String, Object> dbHealth() {
        DataSource dataSource = jdbcTemplate.getDataSource();
        if (dataSource == null) {
            return Map.of(
                "status", "DOWN",
                "database", "MySQL - pharmacy_db",
                "error", "DataSource is not configured",
                "connected", false,
                "timestamp", Instant.now().toString()
            );
        }

        try (Connection ignored = dataSource.getConnection()) {
            Integer ping = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return Map.of(
                "status", "UP",
                "database", "MySQL - pharmacy_db",
                "connected", ping != null && ping == 1,
                "timestamp", Instant.now().toString()
            );
        } catch (SQLException e) {
            return Map.of(
                "status", "DOWN",
                "database", "MySQL - pharmacy_db",
                "error", e.getMessage(),
                "connected", false,
                "timestamp", Instant.now().toString()
            );
        }
    }

    @GetMapping({"/", "/api", "/api/"})
    public Map<String, String> root() {
        return Map.of(
            "message", "Pharmacy backend is running. Use /api/health or /api/health/db"
        );
    }

    @Autowired
    private JdbcTemplate jdbcTemplate;
}
