package com.safejourney.backend.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Custom DataSource configuration to seamlessly support cloud deployments like Render.
 *
 * Cloud providers (Render, Heroku, Railway) inject DATABASE_URL in URI format:
 *   postgres://user:password@host:port/database
 *
 * JDBC requires:
 *   jdbc:postgresql://host:port/database
 *
 * This configuration automatically converts URI-formatted connection strings
 * while preserving standard JDBC URLs and local fallbacks.
 */
@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/safejourney}")
    private String configuredUrl;

    @Value("${spring.datasource.username:postgres}")
    private String configuredUsername;

    @Value("${spring.datasource.password:jeeva2007}")
    private String configuredPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        String dbUrl = System.getenv("SPRING_DATASOURCE_URL");
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = System.getenv("DATABASE_URL");
        }
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = this.configuredUrl;
        }

        String dbUser = System.getenv("SPRING_DATASOURCE_USERNAME");
        if (dbUser == null || dbUser.isBlank()) {
            dbUser = System.getenv("DB_USERNAME");
        }
        if (dbUser == null || dbUser.isBlank()) {
            dbUser = this.configuredUsername;
        }

        String dbPass = System.getenv("SPRING_DATASOURCE_PASSWORD");
        if (dbPass == null || dbPass.isBlank()) {
            dbPass = System.getenv("DB_PASSWORD");
        }
        if (dbPass == null || dbPass.isBlank()) {
            dbPass = this.configuredPassword;
        }

        // Render & standard cloud providers provide URI strings starting with postgres:// or postgresql://
        if (dbUrl != null && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))) {
            try {
                String cleanUriStr = dbUrl.replaceFirst("^postgres(ql)?://", "http://");
                URI uri = URI.create(cleanUriStr);

                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath(); // includes leading slash, e.g., /dbname
                String query = uri.getQuery();

                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
                if (query != null && !query.isBlank()) {
                    jdbcUrl += "?" + query;
                }

                if (uri.getUserInfo() != null && !uri.getUserInfo().isBlank()) {
                    String[] userInfo = uri.getUserInfo().split(":", 2);
                    if (userInfo.length > 0 && !userInfo[0].isBlank()) {
                        dbUser = userInfo[0];
                    }
                    if (userInfo.length > 1 && !userInfo[1].isBlank()) {
                        dbPass = userInfo[1];
                    }
                }

                log.info("Auto-converted Render DATABASE_URL to JDBC: jdbc:postgresql://{}:{}{}", host, port, path);
                dbUrl = jdbcUrl;
            } catch (Exception e) {
                log.warn("Failed to parse DATABASE_URL as URI, prepending jdbc: prefix: {}", e.getMessage());
                if (!dbUrl.startsWith("jdbc:")) {
                    dbUrl = "jdbc:" + dbUrl;
                }
            }
        }

        HikariConfig hikariConfig = new HikariConfig();
        hikariConfig.setJdbcUrl(dbUrl);
        hikariConfig.setUsername(dbUser);
        hikariConfig.setPassword(dbPass);
        hikariConfig.setDriverClassName("org.postgresql.Driver");
        hikariConfig.setMaximumPoolSize(10);
        hikariConfig.setMinimumIdle(2);
        hikariConfig.setIdleTimeout(300000);
        hikariConfig.setConnectionTimeout(20000);

        return new HikariDataSource(hikariConfig);
    }
}
