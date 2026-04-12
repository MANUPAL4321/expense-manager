"""
Seed 100 dummy transactions for user: manujnv2003@gmail.com
Backend: http://localhost:8080/api
"""

import requests
import random
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8080/api"
EMAIL = "manujnv2003@gmail.com"
PASSWORD = "123"

# ── Categories & Sources ──────────────────────────────────────
EXPENSE_CATEGORIES = [
    ("Food & Dining",       ["Zomato Order", "Swiggy Dinner", "McDonald's", "Domino's Pizza", "Chai & Snacks", "Restaurant Bill", "Grocery Shopping", "Street Food"]),
    ("Shopping",            ["Amazon Purchase", "Flipkart Order", "Myntra Clothes", "Shoes from Nike", "Phone Accessories", "Headphones", "Watch Purchase", "Gift Shopping"]),
    ("Housing",             ["Monthly Rent", "Electricity Bill", "Water Bill", "Gas Cylinder", "Home Repair", "Society Maintenance", "Internet Bill"]),
    ("Transportation",      ["Uber Ride", "Ola Cab", "Metro Card Recharge", "Petrol Fill-up", "Auto Rickshaw", "Rapido Bike", "Bus Pass", "Parking Fees"]),
    ("Entertainment",       ["Netflix Subscription", "Spotify Premium", "Movie Tickets (PVR)", "Concert Tickets", "Gaming Purchase", "Hotstar Plan", "Book Purchase"]),
    ("Healthcare",          ["Apollo Pharmacy", "Doctor Visit", "Lab Test", "Medicine Purchase", "Gym Membership", "Health Checkup"]),
    ("Education",           ["Udemy Course", "Coursera Subscription", "Stationery Purchase", "Book Purchase", "Exam Fees", "Coaching Fee"]),
    ("Bills & Utilities",   ["Mobile Recharge", "Broadband Bill", "DTH Recharge", "Insurance Premium", "Credit Card Payment"]),
    ("Other",               ["Donation", "Miscellaneous", "Lost Cash", "Laundry", "Haircut", "Pet Supplies"]),
]

INCOME_SOURCES = [
    ("Salary",              ["Monthly Salary", "Salary Credit", "Pay Day"]),
    ("Freelance",           ["Freelance Project", "Web Dev Gig", "Design Work", "Content Writing", "App Development"]),
    ("Investments",         ["Stock Dividend", "Mutual Fund Return", "FD Interest", "Crypto Gains"]),
    ("Business",            ["Business Revenue", "Client Payment", "Product Sale"]),
    ("Rental Income",       ["Rent Received", "Property Income"]),
    ("Interest",            ["Bank Interest", "Savings Interest"]),
    ("Gift",                ["Birthday Gift", "Cashback Reward", "Gift from Family"]),
    ("Other",               ["Refund Received", "Sold Old Items", "Prize Money"]),
]


def login():
    """Login and get JWT token."""
    print(f"🔐 Logging in as {EMAIL}...")
    resp = requests.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": PASSWORD})
    if resp.status_code != 200:
        print(f"❌ Login failed: {resp.text}")
        return None
    data = resp.json()
    token = data.get("token")
    print(f"✅ Login successful! Token: {token[:30]}...")
    return token


def generate_transactions(count=100):
    """Generate a list of realistic dummy transactions."""
    transactions = []
    today = datetime.now()

    for i in range(count):
        # ~75% expenses, ~25% income — realistic ratio
        is_income = random.random() < 0.25

        if is_income:
            source_cat, titles = random.choice(INCOME_SOURCES)
            title = random.choice(titles)
            category = source_cat
            tx_type = "income"
            # Income amounts: ₹1,000 – ₹50,000
            amount = round(random.uniform(1000, 50000), 2)
        else:
            expense_cat, titles = random.choice(EXPENSE_CATEGORIES)
            title = random.choice(titles)
            category = expense_cat
            tx_type = "expense"
            # Expense amounts: ₹50 – ₹5,000
            amount = round(random.uniform(50, 5000), 2)

        # Random date within the last 365 days
        days_ago = random.randint(0, 365)
        tx_date = (today - timedelta(days=days_ago)).strftime("%Y-%m-%d")

        transactions.append({
            "title": title,
            "amount": amount,
            "type": tx_type,
            "category": category,
            "date": tx_date,
        })

    # Sort by date (oldest first)
    transactions.sort(key=lambda t: t["date"])
    return transactions


def seed_transactions(token, transactions):
    """Post all transactions to the backend API."""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }

    success = 0
    failed = 0

    for i, tx in enumerate(transactions, 1):
        resp = requests.post(f"{BASE_URL}/transactions", json=tx, headers=headers)
        if resp.status_code == 200:
            success += 1
            emoji = "💰" if tx["type"] == "income" else "💸"
            print(f"  {emoji} [{i:3d}/100] {tx['type'].upper():7s} | ₹{tx['amount']:>10,.2f} | {tx['date']} | {tx['title']}")
        else:
            failed += 1
            print(f"  ❌ [{i:3d}/100] FAILED  | {tx['title']} — {resp.text}")

    return success, failed


def main():
    print("=" * 60)
    print("  🌱 Expense Manager — Dummy Data Seeder")
    print("=" * 60)

    # Step 1: Login
    token = login()
    if not token:
        print("\n⛔ Cannot proceed without a valid token. Exiting.")
        return

    # Step 2: Generate transactions
    print(f"\n📦 Generating 100 dummy transactions...")
    transactions = generate_transactions(100)

    income_count = sum(1 for t in transactions if t["type"] == "income")
    expense_count = sum(1 for t in transactions if t["type"] == "expense")
    total_income = sum(t["amount"] for t in transactions if t["type"] == "income")
    total_expense = sum(t["amount"] for t in transactions if t["type"] == "expense")

    print(f"   📊 Income:  {income_count} transactions  (₹{total_income:,.2f})")
    print(f"   📊 Expense: {expense_count} transactions (₹{total_expense:,.2f})")
    print(f"   📊 Net:     ₹{total_income - total_expense:,.2f}")

    # Step 3: Seed
    print(f"\n🚀 Sending transactions to backend...\n")
    success, failed = seed_transactions(token, transactions)

    # Summary
    print(f"\n{'=' * 60}")
    print(f"  ✅ Successfully added: {success}")
    if failed:
        print(f"  ❌ Failed:            {failed}")
    print(f"{'=' * 60}")
    print(f"  🎉 Done! Refresh your dashboard to see the data.")


if __name__ == "__main__":
    main()
