package com.safejourney.backend.config;

import com.safejourney.backend.model.Destination;
import com.safejourney.backend.repository.DestinationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final DestinationRepository destinationRepository;

    public DataInitializer(DestinationRepository destinationRepository) {
        this.destinationRepository = destinationRepository;
    }

    @Override
    public void run(String... args) {
        try {
            long count = destinationRepository.count();
            if (count == 0) {
                log.info("SafeJourney: Database connected and destination table is empty. Seeding initial destinations...");

                List<Destination> sampleDestinations = List.of(
                    new Destination(
                        "Goa Beach & Heritage",
                        "Goa",
                        "A coastal paradise known for pristine sandy beaches, colonial Portuguese architecture, and safe seaside promenades.",
                        15.2993,
                        74.1240,
                        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80"
                    ),
                    new Destination(
                        "Jaipur Pink City",
                        "Rajasthan",
                        "Historic capital featuring Amber Fort, City Palace, Hawa Mahal, and monitored tourist safety corridors.",
                        26.9124,
                        75.7873,
                        "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80"
                    ),
                    new Destination(
                        "Munnar Tea Highlands",
                        "Kerala",
                        "Serene hill station renowned for lush emerald tea estates, mist-covered mountains, and guided eco-trails.",
                        10.0889,
                        77.0595,
                        "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80"
                    ),
                    new Destination(
                        "Manali Mountain Valley",
                        "Himachal Pradesh",
                        "Scenic Himalayan mountain resort offering snowy peaks, alpine passes, and tourist assistance stations.",
                        32.2432,
                        77.1892,
                        "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80"
                    ),
                    new Destination(
                        "Varanasi Cultural Ghats",
                        "Uttar Pradesh",
                        "Sacred spiritual hub celebrated for river ghats along the Ganga, evening Aarti ceremonies, and rich heritage walks.",
                        25.3176,
                        82.9739,
                        "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80"
                    )
                );

                destinationRepository.saveAll(sampleDestinations);
                log.info("SafeJourney: Successfully seeded {} destinations.", sampleDestinations.size());
            } else {
                log.info("SafeJourney: Database already contains {} destinations. Skipping seed.", count);
            }
        } catch (Exception ex) {
            log.warn("SafeJourney: Could not seed destinations (database might not be reachable or initialized): {}", ex.getMessage());
        }
    }
}
