package com.expensemanager.expense_manager.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionResponse {
    private Long id;
    private String title;
    private BigDecimal amount;
    private String category;
    private String type;
    private LocalDate date;
    private String countryName;
    private String currencyCode;
    private String currencySymbol;

    public TransactionResponse(Long id, String title, BigDecimal amount, String category,
                               String type, LocalDate date,
                               String countryName, String currencyCode, String currencySymbol) {
        this.id = id;
        this.title = title;
        this.amount = amount;
        this.category = category;
        this.type = type;
        this.date = date;
        this.countryName = countryName;
        this.currencyCode = currencyCode;
        this.currencySymbol = currencySymbol;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getCountryName() { return countryName; }
    public void setCountryName(String countryName) { this.countryName = countryName; }

    public String getCurrencyCode() { return currencyCode; }
    public void setCurrencyCode(String currencyCode) { this.currencyCode = currencyCode; }

    public String getCurrencySymbol() { return currencySymbol; }
    public void setCurrencySymbol(String currencySymbol) { this.currencySymbol = currencySymbol; }
}
