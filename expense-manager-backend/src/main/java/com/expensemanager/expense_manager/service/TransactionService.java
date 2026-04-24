package com.expensemanager.expense_manager.service;

import com.expensemanager.expense_manager.dto.PaginatedResponse;
import com.expensemanager.expense_manager.dto.SummaryResponse;
import com.expensemanager.expense_manager.dto.TransactionRequest;
import com.expensemanager.expense_manager.dto.TransactionResponse;
import com.expensemanager.expense_manager.model.Country;
import com.expensemanager.expense_manager.model.Transaction;
import com.expensemanager.expense_manager.model.User;
import com.expensemanager.expense_manager.repository.CountryRepository;
import com.expensemanager.expense_manager.repository.TransactionRepository;
import com.expensemanager.expense_manager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CountryRepository countryRepository;

    private Country resolveCountry(Long countryId, User user) {
        if (countryId != null) {
            return countryRepository.findById(countryId).orElse(user.getCountry());
        }
        return user.getCountry();
    }

    public TransactionResponse addTransaction(String email, TransactionRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setTitle(request.getTitle());
        transaction.setAmount(request.getAmount());
        transaction.setCategory(request.getCategory());
        transaction.setType(request.getType());
        transaction.setDate(request.getDate());
        transaction.setCountry(resolveCountry(request.getCountryId(), user));

        Transaction saved = transactionRepository.save(transaction);
        return mapToResponse(saved);
    }

    public TransactionResponse updateTransaction(String email, Long id, TransactionRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        transaction.setTitle(request.getTitle());
        transaction.setAmount(request.getAmount());
        transaction.setCategory(request.getCategory());
        transaction.setType(request.getType());
        transaction.setDate(request.getDate());
        transaction.setCountry(resolveCountry(request.getCountryId(), user));

        Transaction updated = transactionRepository.save(transaction);
        return mapToResponse(updated);
    }

    public void deleteTransaction(String email, Long id) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        transactionRepository.delete(transaction);
    }

    public PaginatedResponse<TransactionResponse> getTransactions(String email, String filterType, Integer month,
            Integer year,
            LocalDate startDate, LocalDate endDate, int page, int size) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Long userId = user.getId();
        Pageable pageable = PageRequest.of(page, size);
        Page<Transaction> transactionPage;

        if (filterType != null) {
            switch (filterType.toLowerCase()) {
                case "day":
                    transactionPage = transactionRepository.findByUserIdAndDateOrderByDateDesc(userId, LocalDate.now(),
                            pageable);
                    break;
                case "month":
                    transactionPage = transactionRepository.findByUserIdAndMonthAndYear(userId,
                            month != null ? month : LocalDate.now().getMonthValue(),
                            year != null ? year : LocalDate.now().getYear(), pageable);
                    break;
                case "year":
                    transactionPage = transactionRepository.findByUserIdAndYear(userId,
                            year != null ? year : LocalDate.now().getYear(), pageable);
                    break;
                case "range":
                    transactionPage = transactionRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, startDate,
                            endDate, pageable);
                    break;
                default:
                    transactionPage = transactionRepository.findByUserIdOrderByDateDesc(userId, pageable);
            }
        } else {
            transactionPage = transactionRepository.findByUserIdOrderByDateDesc(userId, pageable);
        }

        List<TransactionResponse> content = transactionPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PaginatedResponse<>(
                content,
                transactionPage.getNumber(),
                transactionPage.getSize(),
                transactionPage.getTotalElements(),
                transactionPage.getTotalPages(),
                transactionPage.isLast());
    }

    public SummaryResponse getTransactionSummary(String email, String filterType, Integer month, Integer year,
            LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Long userId = user.getId();

        java.math.BigDecimal income = java.math.BigDecimal.ZERO;
        java.math.BigDecimal expense = java.math.BigDecimal.ZERO;

        if (filterType != null) {
            switch (filterType.toLowerCase()) {
                case "day":
                    income = transactionRepository.sumIncomeByUserIdAndDate(userId, LocalDate.now());
                    expense = transactionRepository.sumExpenseByUserIdAndDate(userId, LocalDate.now());
                    break;
                case "month":
                    int m = month != null ? month : LocalDate.now().getMonthValue();
                    int y = year != null ? year : LocalDate.now().getYear();
                    income = transactionRepository.sumIncomeByUserIdAndMonthAndYear(userId, m, y);
                    expense = transactionRepository.sumExpenseByUserIdAndMonthAndYear(userId, m, y);
                    break;
                case "year":
                    int y2 = year != null ? year : LocalDate.now().getYear();
                    income = transactionRepository.sumIncomeByUserIdAndYear(userId, y2);
                    expense = transactionRepository.sumExpenseByUserIdAndYear(userId, y2);
                    break;
                case "range":
                    income = transactionRepository.sumIncomeByUserIdAndDateBetween(userId, startDate, endDate);
                    expense = transactionRepository.sumExpenseByUserIdAndDateBetween(userId, startDate, endDate);
                    break;
                default:
                    income = transactionRepository.sumIncomeByUserId(userId);
                    expense = transactionRepository.sumExpenseByUserId(userId);
            }
        } else {
            income = transactionRepository.sumIncomeByUserId(userId);
            expense = transactionRepository.sumExpenseByUserId(userId);
        }

        double totalIncome = income != null ? income.doubleValue() : 0.0;
        double totalExpense = expense != null ? expense.doubleValue() : 0.0;

        return new SummaryResponse(totalIncome - totalExpense, totalIncome, totalExpense);
    }

    private TransactionResponse mapToResponse(Transaction t) {
        String countryName = null;
        String currencyCode = null;
        String currencySymbol = "₹";

        if (t.getCountry() != null) {
            countryName = t.getCountry().getName();
            currencyCode = t.getCountry().getCurrencyCode();
            currencySymbol = t.getCountry().getCurrencySymbol();
        }

        return new TransactionResponse(t.getId(), t.getTitle(), t.getAmount(), t.getCategory(),
                t.getType(), t.getDate(), countryName, currencyCode, currencySymbol);
    }
}
