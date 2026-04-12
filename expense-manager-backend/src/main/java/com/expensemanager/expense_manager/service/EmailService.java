package com.expensemanager.expense_manager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.Random;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        try {
            if (mailSender != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject("Expense Manager - Email Verification OTP");
                message.setText("Welcome to Expense Manager!\n\nYour OTP for registration is: " + otp + "\n\nThis OTP will expire in 10 minutes.");
                
                mailSender.send(message);
                System.out.println("Real email successfully sent to: " + to);
                return; // If successful, exit
            }
        } catch (Exception e) {
            System.err.println("Failed to send real email: " + e.getMessage());
            System.err.println("Make sure you have configured your SMTP settings in application.properties!");
        }

        // Fallback: If mailSender is not configured or fails, print to console
        System.out.println("=========================================================");
        System.out.println("MOCK EMAIL SENT TO: " + to);
        System.out.println("YOUR OTP IS: " + otp);
        System.out.println("=========================================================");
    }

    public String generateOtp() {
        Random random = new Random();
        int otpValue = 100000 + random.nextInt(900000); // 6 digit OTP
        return String.valueOf(otpValue);
    }
}
