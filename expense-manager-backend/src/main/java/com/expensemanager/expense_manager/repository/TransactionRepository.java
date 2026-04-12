package com.expensemanager.expense_manager.repository;

import com.expensemanager.expense_manager.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Find all by user ID ordered by date descending
    Page<Transaction> findByUserIdOrderByDateDesc(Long userId, Pageable pageable);

    // Filter by exact date
    Page<Transaction> findByUserIdAndDateOrderByDateDesc(Long userId, LocalDate date, Pageable pageable);

    // Filter by month and year
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND MONTH(t.date) = :month AND YEAR(t.date) = :year ORDER BY t.date DESC")
    Page<Transaction> findByUserIdAndMonthAndYear(@Param("userId") Long userId, @Param("month") int month,
            @Param("year") int year, Pageable pageable);

    // Filter by year
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND YEAR(t.date) = :year ORDER BY t.date DESC")
    Page<Transaction> findByUserIdAndYear(@Param("userId") Long userId, @Param("year") int year, Pageable pageable);

    // Filter by date range
    Page<Transaction> findByUserIdAndDateBetweenOrderByDateDesc(Long userId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    // Sum calculations for summary
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'income'")
    BigDecimal sumIncomeByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'expense'")
    BigDecimal sumExpenseByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'income' AND t.date = :date")
    BigDecimal sumIncomeByUserIdAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'expense' AND t.date = :date")
    BigDecimal sumExpenseByUserIdAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'income' AND MONTH(t.date) = :month AND YEAR(t.date) = :year")
    BigDecimal sumIncomeByUserIdAndMonthAndYear(@Param("userId") Long userId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'expense' AND MONTH(t.date) = :month AND YEAR(t.date) = :year")
    BigDecimal sumExpenseByUserIdAndMonthAndYear(@Param("userId") Long userId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'income' AND YEAR(t.date) = :year")
    BigDecimal sumIncomeByUserIdAndYear(@Param("userId") Long userId, @Param("year") int year);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'expense' AND YEAR(t.date) = :year")
    BigDecimal sumExpenseByUserIdAndYear(@Param("userId") Long userId, @Param("year") int year);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'income' AND t.date BETWEEN :startDate AND :endDate")
    BigDecimal sumIncomeByUserIdAndDateBetween(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'expense' AND t.date BETWEEN :startDate AND :endDate")
    BigDecimal sumExpenseByUserIdAndDateBetween(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
