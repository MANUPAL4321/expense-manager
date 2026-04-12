package com.expensemanager.expense_manager.model;

import jakarta.persistence.*;

@Entity
@Table(name = "countries")
public class Country {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true, length = 2)
    private String code;

    @Column(nullable = false, length = 3)
    private String currencyCode;

    @Column(nullable = false, length = 5)
    private String currencySymbol;

    public Country() {}

    public Country(String name, String code, String currencyCode, String currencySymbol) {
        this.name = name;
        this.code = code;
        this.currencyCode = currencyCode;
        this.currencySymbol = currencySymbol;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getCurrencyCode() { return currencyCode; }
    public void setCurrencyCode(String currencyCode) { this.currencyCode = currencyCode; }

    public String getCurrencySymbol() { return currencySymbol; }
    public void setCurrencySymbol(String currencySymbol) { this.currencySymbol = currencySymbol; }
}
