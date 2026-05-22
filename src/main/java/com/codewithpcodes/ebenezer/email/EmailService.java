package com.codewithpcodes.ebenezer.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${application.app.frontend-url}")
    private String frontendUrl;

    public void sendVerificationEmail(String to, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;
        String body = """
            <h2>Welcome to Ebenezer!</h2>
            <p>Please verify your email by clicking the link below:</p>
            <a href="%s">Verify Email</a>
            <p>This link expires in 24 hours.</p>
            """.formatted(link);

        sendHtmlEmail(to, "Verify your Ebenezer account", body);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        String body = """
            <h2>Password Reset</h2>
            <p>Click the link below to reset your password:</p>
            <a href="%s">Reset Password</a>
            <p>This link expires in 1 hour.</p>
            <p>If you did not request this, ignore this email.</p>
            """.formatted(link);

        sendHtmlEmail(to, "Reset your Ebenezer password", body);
    }

    private void sendHtmlEmail(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException(
                    "Failed to send email: " + e.getMessage());
        }
    }
}
