package com.expensemanager.expense_manager.service;

import com.expensemanager.expense_manager.dto.AuthRequest;
import com.expensemanager.expense_manager.dto.AuthResponse;
import com.expensemanager.expense_manager.dto.RegisterRequest;
import com.expensemanager.expense_manager.model.Country;
import com.expensemanager.expense_manager.model.User;
import com.expensemanager.expense_manager.repository.CountryRepository;
import com.expensemanager.expense_manager.repository.UserRepository;
import com.expensemanager.expense_manager.security.CustomUserDetails;
import com.expensemanager.expense_manager.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class AuthService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    );

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    private void validateRegistration(RegisterRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().length() < 3) {
            throw new RuntimeException("Username must be at least 3 characters.");
        }
        if (request.getEmail() == null || !EMAIL_PATTERN.matcher(request.getEmail().trim()).matches()) {
            throw new RuntimeException("Please enter a valid email address.");
        }
        String domain = request.getEmail().split("@")[1];
        for (String part : domain.split("\\.")) {
            if (part.length() < 2) {
                throw new RuntimeException("Please enter a valid email address.");
            }
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters.");
        }
        if (request.getCountryId() == null) {
            throw new RuntimeException("Please select a country.");
        }
    }

    public void register(RegisterRequest request) {
        validateRegistration(request);

        Optional<User> existingUser = userRepository.findByEmail(request.getEmail().trim());
        if (existingUser.isPresent()) {
            throw new RuntimeException("This email is already registered.");
        }

        Country country = countryRepository.findById(request.getCountryId())
                .orElseThrow(() -> new RuntimeException("Invalid country selected."));

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setEmail(request.getEmail().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setCountry(country);

        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("This email is already registered.");
        }
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(new CustomUserDetails(user));

        String countryName = null;
        String currencyCode = null;
        String currencySymbol = "$";

        if (user.getCountry() != null) {
            countryName = user.getCountry().getName();
            currencyCode = user.getCountry().getCurrencyCode();
            currencySymbol = user.getCountry().getCurrencySymbol();
        }

        return new AuthResponse(token, user.getUsername(), user.getEmail(),
                countryName, currencyCode, currencySymbol);
    }
}
