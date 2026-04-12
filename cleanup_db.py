import subprocess
import os

# Configuration from your application.properties
USER = 'root'
PASSWORD = 'Manu_Kumar' # Change this if needed
DB_NAME = 'expense_manager_db'

def cleanup_database():
    try:
        print(f"Dropping and recreating database '{DB_NAME}' using MySQL CLI...")
        
        # Construct the command
        # Note: -p[PASSWORD] has no space in between
        cmd = f'mysql -u {USER} -p"{PASSWORD}" -e "DROP DATABASE IF EXISTS {DB_NAME}; CREATE DATABASE {DB_NAME};"'
        
        # Execute the command
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("Database cleaned up successfully!")
        else:
            print(f"Error during cleanup:\n{result.stderr}")
            
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    cleanup_database()
