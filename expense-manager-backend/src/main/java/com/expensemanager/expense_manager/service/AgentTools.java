package com.expensemanager.expense_manager.service;

import com.expensemanager.expense_manager.dto.PaginatedResponse;
import com.expensemanager.expense_manager.dto.SummaryResponse;
import com.expensemanager.expense_manager.dto.TransactionRequest;
import com.expensemanager.expense_manager.dto.TransactionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class AgentTools {

    private static final Logger log = LoggerFactory.getLogger(AgentTools.class);

    @Autowired
    private TransactionService transactionService;

    // Reads the email from the JWT token already validated by your
    // JwtAuthenticationFilter
    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName(); // returns email (your CustomUserDetailsService uses email as username)
    }

    // ─────────────────────────────────────────────
    // TOOL 1: Add a transaction
    // ─────────────────────────────────────────────
    @Tool(description = "Add a new expense or income transaction for the user. "
            + "Use this when the user mentions spending, paying, buying, receiving, or earning money. "
            + "Example: 'I spent 200 on groceries' → title='Groceries', amount=200, category='food', type='expense'.")
    public String addTransaction(
            @ToolParam(description = "Short title, e.g. 'Coffee', 'Uber ride', 'Salary'") String title,
            @ToolParam(description = "Numeric amount in rupees, e.g. 200 or 1500.50") Double amount,
            @ToolParam(description = "Category: food, travel, entertainment, groceries, salary, medical, utilities, shopping, or other") String category,
            @ToolParam(description = "Must be exactly 'expense' if money going out, or 'income' if money coming in") String type) {

        log.info("TOOL CALLED: addTransaction(title={}, amount={}, category={}, type={})",
                title, amount, category, type);

        try {
            TransactionRequest request = new TransactionRequest();
            request.setTitle(title);
            request.setAmount(BigDecimal.valueOf(amount));
            request.setCategory(category.toLowerCase());
            request.setType(type.toLowerCase()); // DB queries use lowercase: 'expense'/'income'
            request.setDate(LocalDate.now());

            TransactionResponse saved = transactionService.addTransaction(getCurrentUserEmail(), request);

            return String.format(
                    "✅ Added ₹%.0f for '%s' (%s / %s) on %s. Reply with exactly this line.",
                    amount, title, category, type.toLowerCase(), saved.getDate());
        } catch (Exception e) {
            log.error("Error in addTransaction tool: ", e);
            return "❌ Failed to add transaction: " + e.getMessage();
        }
    }

    // ─────────────────────────────────────────────
    // TOOL 2: Get summary (balance, income, expense)
    // ─────────────────────────────────────────────
    @Tool(description = "Get the user's financial summary: total income, total expense, and balance. "
            + "Use when user asks about balance, total spending, how much they earned, etc.")
    public String getTransactionSummary(
            @ToolParam(description = "Filter: 'day' for today, 'month' for a month, 'year' for a year, or 'all' for everything") String filterType,
            @ToolParam(description = "Month number 1-12. Use 0 if not filtering by month.") Integer month,
            @ToolParam(description = "Year like 2026. Use 0 if not filtering by year.") Integer year) {

        log.info("TOOL CALLED: getTransactionSummary(filterType={}, month={}, year={})",
                filterType, month, year);

        try {
            String filter = filterType.equalsIgnoreCase("all") ? null : filterType;
            Integer monthParam = (month != null && month > 0) ? month : null;
            Integer yearParam = (year != null && year > 0) ? year : null;

            SummaryResponse summary = transactionService.getTransactionSummary(
                    getCurrentUserEmail(),
                    filter,
                    monthParam,
                    yearParam,
                    null, // startDate
                    null  // endDate
            );

            double balance = summary.getTotalIncome() - summary.getTotalExpense();
            return String.format(
                    "📊 Summary:\n• Balance:  ₹%.2f\n• Income:   ₹%.2f\n• Expenses: ₹%.2f",
                    balance,
                    summary.getTotalIncome(),
                    summary.getTotalExpense());
        } catch (Exception e) {
            log.error("Error in getTransactionSummary tool: ", e);
            return "❌ Failed to get summary: " + e.getMessage();
        }
    }

    // ─────────────────────────────────────────────
    // TOOL 3: List recent transactions
    // ─────────────────────────────────────────────
    @Tool(description = "List the user's recent transactions. "
            + "Use when user says: show my transactions, what did I spend recently, list expenses, etc.")
    public String listRecentTransactions(
            @ToolParam(description = "Filter: 'day' for today, 'month' for current month, 'year' for current year, or 'all'") String filterType,
            @ToolParam(description = "Number of transactions to return. Default 5.") Integer limit) {

        log.info("TOOL CALLED: listRecentTransactions(filterType={}, limit={})", filterType, limit);

        try {
            String filter = filterType.equalsIgnoreCase("all") ? null : filterType;
            int pageSize = (limit != null && limit > 0) ? limit : 5;

            PaginatedResponse<TransactionResponse> result = transactionService.getTransactions(
                    getCurrentUserEmail(),
                    filter,
                    null, // month
                    null, // year
                    null, // startDate
                    null, // endDate
                    0,    // page
                    pageSize);

            if (result.getContent().isEmpty()) {
                return "No transactions found for the selected period.";
            }

            StringBuilder sb = new StringBuilder("📋 Recent Transactions:\n");
            for (TransactionResponse t : result.getContent()) {
                sb.append(String.format("• [#%d] %s — ₹%.0f (%s / %s) on %s\n",
                        t.getId(), t.getTitle(), t.getAmount().doubleValue(),
                        t.getCategory(), t.getType(), t.getDate()));
            }
            sb.append(String.format("(Showing %d of %d total)",
                    result.getContent().size(), result.getTotalElements()));

            return sb.toString();
        } catch (Exception e) {
            log.error("Error in listRecentTransactions tool: ", e);
            return "❌ Failed to list transactions: " + e.getMessage();
        }
    }

    // ─────────────────────────────────────────────
    // TOOL 4: Delete a transaction
    // ─────────────────────────────────────────────
    @Tool(description = "Delete a specific transaction by its numeric ID. "
            + "Use when user says: delete transaction #5, remove that entry, etc.")
    public String deleteTransaction(
            @ToolParam(description = "The numeric ID of the transaction to delete") Long transactionId) {

        log.info("TOOL CALLED: deleteTransaction(transactionId={})", transactionId);

        try {
            transactionService.deleteTransaction(getCurrentUserEmail(), transactionId);
            return "🗑️ Transaction #" + transactionId + " has been deleted.";
        } catch (Exception e) {
            log.error("Error in deleteTransaction tool: ", e);
            return "❌ Failed to delete transaction: " + e.getMessage();
        }
    }
}