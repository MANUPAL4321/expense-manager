package com.expensemanager.expense_manager.controller;

import com.expensemanager.expense_manager.service.AgentTools;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/agent")
public class AgentController {

    private static final Logger log = LoggerFactory.getLogger(AgentController.class);

    private final ChatClient chatClient;

    @Autowired
    private AgentTools agentTools;

    private static final String SYSTEM_PROMPT = """
            You are an expense-management assistant. You have tools to add, list, summarize, and delete transactions.
            
            STRICT RULES:
            1. Call EXACTLY ONE tool per message. Never call multiple tools in the same response.
            2. After a tool returns its result, relay that result to the user as-is — do not rephrase.
            3. type must be lowercase: "expense" for money going out, "income" for money coming in.
            
            TOOL SELECTION:
            - User spent/paid/bought something → addTransaction(type="expense")
            - User earned/received/got paid → addTransaction(type="income")
            - User asks balance/total/summary → getTransactionSummary
              • "this month" → filterType="month", month=<current month number>, year=<current year>
              • "today" → filterType="day", month=0, year=0
              • "this year" → filterType="year", month=0, year=<current year>
              • anything else → filterType="all", month=0, year=0
            - User asks to show/list/see transactions → listRecentTransactions(filterType="all", limit=5)
            - User asks to delete a transaction → deleteTransaction(transactionId=<ID>)
            """;

    // ChatClient.Builder is auto-configured by Spring AI
    public AgentController(ChatClient.Builder builder) {
        this.chatClient = builder
                .defaultSystem(SYSTEM_PROMPT)
                .build();
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> body) {
        String userMessage = body.get("message");
        log.info("Agent chat request received: {}", userMessage);

        if (userMessage == null || userMessage.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("reply", "Please enter a message."));
        }

        try {
            String response = chatClient.prompt()
                    .user(userMessage)
                    .tools(agentTools)
                    .call()
                    .content();

            log.info("Agent chat response: {}", response);

            // Fallback if AI returns null/empty (shouldn't happen but just in case)
            if (response == null || response.isBlank()) {
                response = "I processed your request but didn't get a response. Please try again.";
            }

            return ResponseEntity.ok(Map.of("reply", response));
        } catch (Exception e) {
            log.error("Agent chat error: ", e);
            String errorMsg = e.getMessage();
            // Provide user-friendly error messages
            if (errorMsg != null && errorMsg.contains("rate_limit")) {
                return ResponseEntity.ok(
                        Map.of("reply", "⏳ I'm being rate-limited. Please wait a moment and try again."));
            }
            return ResponseEntity.internalServerError()
                    .body(Map.of("reply", "⚠️ Sorry, I encountered an error. Please try again."));
        }
    }
}