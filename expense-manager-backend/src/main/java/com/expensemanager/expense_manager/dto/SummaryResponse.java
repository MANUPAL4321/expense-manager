package com.expensemanager.expense_manager.dto;

public class SummaryResponse {
    private double totalBalance;
    private double totalIncome;
    private double totalExpense;

    public SummaryResponse(double totalBalance, double totalIncome, double totalExpense) {
        this.totalBalance = totalBalance;
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
    }

    // Getters
    public double getTotalBalance() { return totalBalance; }
    public double getTotalIncome() { return totalIncome; }
    public double getTotalExpense() { return totalExpense; }
}
