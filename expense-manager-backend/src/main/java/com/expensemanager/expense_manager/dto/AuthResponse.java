package com.expensemanager.expense_manager.dto;

public class AuthResponse {
    private String token;
    private String username;
    private String email;
    private String country;
    private String currencyCode;
    private String currencySymbol;

    public AuthResponse() {}

    public AuthResponse(String token, String username, String email,
                        String country, String currencyCode, String currencySymbol) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.country = country;
        this.currencyCode = currencyCode;
        this.currencySymbol = currencySymbol;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getCurrencyCode() { return currencyCode; }
    public void setCurrencyCode(String currencyCode) { this.currencyCode = currencyCode; }

    public String getCurrencySymbol() { return currencySymbol; }
    public void setCurrencySymbol(String currencySymbol) { this.currencySymbol = currencySymbol; }
}
