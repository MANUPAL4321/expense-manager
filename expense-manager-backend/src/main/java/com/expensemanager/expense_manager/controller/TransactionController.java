package com.expensemanager.expense_manager.controller;

import com.expensemanager.expense_manager.dto.PaginatedResponse;
import com.expensemanager.expense_manager.dto.SummaryResponse;
import com.expensemanager.expense_manager.dto.TransactionRequest;
import com.expensemanager.expense_manager.dto.TransactionResponse;
import com.expensemanager.expense_manager.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionResponse> addTransaction(Authentication authentication,
            @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(transactionService.addTransaction(authentication.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(Authentication authentication,
            @PathVariable("id") Long id,
            @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(transactionService.updateTransaction(authentication.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTransaction(Authentication authentication, @PathVariable("id") Long id) {
        transactionService.deleteTransaction(authentication.getName(), id);
        return ResponseEntity.ok("Transaction deleted successfully");
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<TransactionResponse>> getTransactions(
            Authentication authentication,
            @RequestParam(name = "filterType", required = false) String filterType,
            @RequestParam(name = "month", required = false) Integer month,
            @RequestParam(name = "year", required = false) Integer year,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(transactionService.getTransactions(authentication.getName(), filterType, month, year,
                startDate, endDate, page, size));
    }

    @GetMapping("/summary")
    public ResponseEntity<SummaryResponse> getSummary(Authentication authentication,
            @RequestParam(name = "filterType", required = false) String filterType,
            @RequestParam(name = "month", required = false) Integer month,
            @RequestParam(name = "year", required = false) Integer year,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(transactionService.getTransactionSummary(authentication.getName(), filterType, month, year,
                startDate, endDate));
    }
}
