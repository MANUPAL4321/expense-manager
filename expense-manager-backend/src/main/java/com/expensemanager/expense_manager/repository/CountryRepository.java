package com.expensemanager.expense_manager.repository;

import com.expensemanager.expense_manager.model.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CountryRepository extends JpaRepository<Country, Long> {

    @Query("SELECT c FROM Country c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY c.name")
    List<Country> searchByName(@Param("search") String search);

    List<Country> findAllByOrderByNameAsc();
}
