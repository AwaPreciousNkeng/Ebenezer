package com.codewithpcodes.ebenezer.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${application.file.uploads.media-output-path}")
    private String uploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolutePath = Paths.get(uploadPath).toAbsolutePath().normalize().toString();
        // Only profile pictures are public — screenshots are served through the API
        registry.addResourceHandler("/uploads/users/**")
                .addResourceLocations("file:" + absolutePath + "/users/");
    }
}
