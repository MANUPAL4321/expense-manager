package com.expensemanager.expense_manager.controller;

import com.expensemanager.expense_manager.model.Country;
import com.expensemanager.expense_manager.repository.CountryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/countries")
public class CountryController {

    @Autowired
    private CountryRepository countryRepository;

    @GetMapping
    public ResponseEntity<List<Country>> getCountries(@RequestParam(required = false) String search) {
        List<Country> countries;
        if (search != null && !search.trim().isEmpty()) {
            countries = countryRepository.searchByName(search.trim());
        } else {
            countries = countryRepository.findAllByOrderByNameAsc();
        }
        return ResponseEntity.ok(countries);
    }
}
