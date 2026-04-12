package com.expensemanager.expense_manager.service;

import com.expensemanager.expense_manager.dto.AuthRequest;
import com.expensemanager.expense_manager.dto.AuthResponse;
import com.expensemanager.expense_manager.dto.RegisterRequest;

import com.expensemanager.expense_manager.model.User;
import com.expensemanager.expense_manager.repository.UserRepository;
import com.expensemanager.expense_manager.security.CustomUserDetails;
import com.expensemanager.expense_manager.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    public void register(RegisterRequest request) {
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Email already taken!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // No verification check needed as per current requirement
        String token = jwtUtil.generateToken(new CustomUserDetails(user));
        return new AuthResponse(token, user.getUsername(), user.getEmail());
    }
}
