import requests
import random
from datetime import datetime, timedelta
import sys

BASE_URL = "http://localhost:8080/api"

# User details provided by the user
USER_DATA = {
    "username": "Manu",
    "email": "manujnv2003@gmail.com",
    "password": "123"
}

def add_bulk_data(count=300):
    # 1. Register user (try)
    print(f"--- Starting Data Seeding for {USER_DATA['email']} ---")
    print("Step 1: Checking user registration...")
    try:
        reg_resp = requests.post(f"{BASE_URL}/auth/register", json=USER_DATA)
        if reg_resp.status_code == 200:
            print("User registered successfully.")
        else:
            print(f"User already exists or registration skipped: {reg_resp.text}")
    except Exception as e:
        print(f"Could not connect to backend at {BASE_URL}. Is it running?")
        return

    # 2. Login to get token
    print("Step 2: Logging in to get authentication token...")
    login_resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": USER_DATA["email"],
        "password": USER_DATA["password"]
    })
    
    if login_resp.status_code != 200:
        print(f"Login failed: {login_resp.text}")
        return

    login_json = login_resp.json()
    token = login_json.get("token")
    if not token:
        print("Error: Token not found in login response.")
        return
    print(f"Login successful! User: {login_json.get('username')}")

    # 3. Add transactions
    categories = ["Food", "Transport", "Rent", "Salary", "Shopping", "Entertainment", "Utilities", "Health", "Investment"]
    expense_titles = {
        "Food": ["Lunch at Cafe", "Grocery", "Dinner out", "Swiggy order", "Pizza night", "Coffee block", "Vegetables", "Milk & Eggs"],
        "Transport": ["Uber ride", "Petrol", "Bus ticket", "Train pass", "Auto rickshaw", "Car service", "Parking fee"],
        "Rent": ["Monthly Rent", "Security Deposit"],
        "Shopping": ["New T-shirt", "Amazon kindle", "Sneakers", "Watch", "Gift for friend", "Denim Jacket", "Headphones"],
        "Entertainment": ["Netflix subscription", "Movie ticket", "Bowling", "Game purchase", "Concert ticket", "Spotify Premium"],
        "Utilities": ["Electricity bill", "Water bill", "Internet refuel", "Phone recharge", "Gas connection"],
        "Health": ["Medicine", "Checkup", "Gym membership", "Vitamins", "Dentist visit", "Yoga class"],
        "Investment": ["Stock purchase", "Mutual Fund SIP", "Crypto buy", "Gold bond"]
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    print(f"Step 3: Adding {count} transactions...")
    success_count = 0
    for i in range(count):
        # Salary/Income logic
        if i % 15 == 0:  # Every 15th item is income
            type_ = "income"
            category = "Salary" if i % 30 == 0 else "Investment"
            title = "Freelance payment" if i % 45 == 0 else ("Monthly Salary" if category == "Salary" else "Dividend Payout")
            amount = float(random.randint(5000, 45000))
        else:
            type_ = "expense"
            category = random.choice([c for c in categories if c not in ["Salary", "Investment"]])
            title = random.choice(expense_titles[category])
            amount = float(random.randint(40, 3500))

        # Date logic: spread over last 120 days to show good growth graphs
        date_offset = random.randint(0, 120)
        date = (datetime.now() - timedelta(days=date_offset)).strftime("%Y-%m-%d")

        payload = {
            "title": title,
            "amount": amount,
            "category": category,
            "type": type_,
            "date": date
        }

        try:
            resp = requests.post(f"{BASE_URL}/transactions", json=payload, headers=headers)
            if resp.status_code == 200:
                success_count += 1
                if success_count % 50 == 0:
                    print(f"Progress: Added {success_count} transactions...")
            else:
                print(f"Failed at {i}: {resp.status_code} - {resp.text}")
        except Exception as e:
            print(f"Error adding transaction {i}: {e}")
            break

    print(f"\n--- SUCCESS ---")
    print(f"Added {success_count} transactions to the database!")
    print(f"You can now refresh your dashboard to see the graphs.")

if __name__ == "__main__":
    count = 300
    if len(sys.argv) > 1:
        try:
            count = int(sys.argv[1])
        except:
            pass
    add_bulk_data(count)
