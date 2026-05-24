package com.codewithpcodes.ebenezer;

import com.codewithpcodes.ebenezer.auth.AuthenticationService;
import com.codewithpcodes.ebenezer.auth.CreateAdminRequest;
import com.codewithpcodes.ebenezer.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class EbenezerApplication {

    public static void main(String[] args) {
        SpringApplication.run(EbenezerApplication.class, args);
    }

    @Bean
    CommandLineRunner initAdmin(AuthenticationService service, UserRepository userRepository) {
        return args -> {
            String defaultEmail = "admin@ebenezer.com";

            if (!userRepository.existsByEmail(defaultEmail)) {
                var admin = new CreateAdminRequest(
                        "admin",
                        "pcodes",
                        defaultEmail,
                        "password123"
                );
                System.out.println("Admin token: " + service.createAdmin(admin).accessToken());
            } else {
                System.out.println("Default Admin already exists. Skipping creation...");
            }
        };
    }
}
