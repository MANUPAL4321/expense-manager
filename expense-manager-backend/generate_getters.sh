for file in src/main/java/com/expensemanager/expense_manager/model/*.java src/main/java/com/expensemanager/expense_manager/dto/*.java; do
    echo "Processing $file..."
    # A quick script to generate getters and setters for simple fields.
    # Actually, it's easier to just use multi_replace_file_content or python script.
done
