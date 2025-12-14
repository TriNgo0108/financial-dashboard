import os
import json
import psycopg2
import pandas as pd
import base64
from datetime import datetime
from dateutil.relativedelta import relativedelta
from pathlib import Path
from dotenv import load_dotenv

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

load_dotenv()

# --- Configuration ---
DATABASE_URL = os.getenv("DATABASE_URL")
DASHBOARD_PASSWORD = os.getenv("DASHBOARD_PASSWORD")

OUTPUT_DIR = Path("public/data")

def get_db_connection():
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is not set")
    return psycopg2.connect(DATABASE_URL)

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding

def generate_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    return kdf.derive(password.encode())

def encrypt_data(data: dict, password: str) -> dict:
    if not password:
        print("WARNING: DASHBOARD_PASSWORD not set. Skipping encryption.")
        return data
        
    salt = os.urandom(16)
    key = generate_key(password, salt)
    
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    encryptor = cipher.encryptor()
    
    json_str = json.dumps(data)
    # Pad data to block size (128 bits)
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(json_str.encode()) + padder.finalize()
    
    encrypted_bytes = encryptor.update(padded_data) + encryptor.finalize()
    
    # Combined IV + Ciphertext
    combined = iv + encrypted_bytes
    
    return {
        "encrypted": True,
        "data": base64.b64encode(combined).decode(),
        "salt": base64.b64encode(salt).decode()
    }

def fetch_data():
    query = """
    SELECT
        transaction_date::date as date,
        amount,
        type,
        category,
        description
    FROM transaction_read_model
    ORDER BY date ASC;
    """
    conn = get_db_connection()
    try:
        df = pd.read_sql(query, conn)
        return df
    finally:
        conn.close()

def process_data(df):
    if df.empty:
        return {}, [], []

    df['date'] = pd.to_datetime(df['date'])
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month
    
    # Ensure amount is numeric
    df['amount'] = pd.to_numeric(df['amount'])

    # Monthly Aggregation
    monthly_groups = df.groupby(['year', 'month'])
    monthly_data = []

    for (year, month), group in monthly_groups:
        income = group[group['type'] == 'income']['amount'].sum()
        expense = group[group['type'] == 'expense']['amount'].sum()
        net = income - expense
        monthly_data.append({
            "year": int(year),
            "month": int(month),
            "income": float(income),
            "expense": float(expense),
            "net": float(net)
        })

    monthly_df = pd.DataFrame(monthly_data)
    
    if monthly_df.empty:
         return {}, [], []

    # Calculate Highest/Lowest Net
    idx_max = monthly_df['net'].idxmax()
    idx_min = monthly_df['net'].idxmin()

    monthly_data_list = monthly_df.to_dict('records')
    for i, row in enumerate(monthly_data_list):
        row['is_highest_net'] = (i == idx_max)
        row['is_lowest_net'] = (i == idx_min)

    # Prepare KPI Data
    latest_month_row = monthly_df.iloc[-1]
    last_month_row = monthly_df.iloc[-2] if len(monthly_df) > 1 else None
    
    current_date = datetime.now()
    current_year = current_date.year
    last_year = current_year - 1

    yearly_groups = df.groupby('year')
    current_year_income = df[(df['year'] == current_year) & (df['type'] == 'income')]['amount'].sum()
    current_year_expense = df[(df['year'] == current_year) & (df['type'] == 'expense')]['amount'].sum()
    
    last_year_income = df[(df['year'] == last_year) & (df['type'] == 'income')]['amount'].sum()
    last_year_expense = df[(df['year'] == last_year) & (df['type'] == 'expense')]['amount'].sum()

    # Forecast (Simple 3 month moving average)
    if len(monthly_df) >= 3:
        last_3_months = monthly_df.iloc[-3:]
        forecast_income = last_3_months['income'].mean()
        forecast_expense = last_3_months['expense'].mean()
    else:
        forecast_income = monthly_df['income'].mean()
        forecast_expense = monthly_df['expense'].mean()

    kpi_summary = {
        "total_income_current_month": float(latest_month_row['income']),
        "total_expense_current_month": float(latest_month_row['expense']),
        "total_income_last_month": float(last_month_row['income']) if last_month_row is not None else 0.0,
        "total_expense_last_month": float(last_month_row['expense']) if last_month_row is not None else 0.0,
        "highest_month": monthly_data_list[idx_max],
        "lowest_month": monthly_data_list[idx_min],
        "forecast_next_month_income": float(forecast_income),
        "forecast_next_month_expense": float(forecast_expense),
        "total_income_current_year": float(current_year_income),
        "total_expense_current_year": float(current_year_expense),
        "total_income_last_year": float(last_year_income),
        "total_expense_last_year": float(last_year_expense)
    }

    # --- Daily Data for Current Month ---
    current_month_data = df[(df['year'] == current_date.year) & (df['month'] == current_date.month)]
    
    daily_groups = current_month_data.groupby(current_month_data['date'].dt.day)
    daily_expense_data = []

    # Iterate 1 to current day (or end of month) to fill gaps? 
    # Or just available data. Let's do available data + gaps fill if needed, but Recharts handles gaps.
    # User request: "all days of current month"
    
    # Create index for all days in month
    import calendar
    _, last_day = calendar.monthrange(current_date.year, current_date.month)
    
    for day in range(1, last_day + 1):
        if day in daily_groups.groups:
            group = daily_groups.get_group(day)
            # Filter for expense only for the chart? Or both? User said "all expense of this day".
            expense_group = group[group['type'] == 'expense']
            total_expense = expense_group['amount'].sum()
            
            # Detailed transactions for tooltip
            transactions = []
            for _, row in expense_group.iterrows():
                transactions.append({
                    "description": row['description'],
                    "amount": float(row['amount']),
                    "category": row['category']
                })
            
            daily_expense_data.append({
                "day": day,
                "amount": float(total_expense),
                "transactions": transactions
            })
        else:
             daily_expense_data.append({
                "day": day,
                "amount": 0.0,
                "transactions": []
            })

    return kpi_summary, monthly_data_list, daily_expense_data

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    try:
        print("Fetching data from database...")
        df = fetch_data()
        print(f"Fetched {len(df)} transactions.")
        
        print("Processing data...")
        kpi_summary, monthly_summary, daily_summary = process_data(df)
        
        # Encrypt logic here
        print("Encrypting and writing output files...")
        
        encrypted_kpi = encrypt_data(kpi_summary, DASHBOARD_PASSWORD)
        encrypted_monthly = encrypt_data(monthly_summary, DASHBOARD_PASSWORD)
        encrypted_daily = encrypt_data(daily_summary, DASHBOARD_PASSWORD)

        with open(OUTPUT_DIR / "kpi_summary.json", "w") as f:
            json.dump(encrypted_kpi, f, indent=2)
            
        with open(OUTPUT_DIR / "monthly_summary.json", "w") as f:
            json.dump(encrypted_monthly, f, indent=2)
            
        with open(OUTPUT_DIR / "current_month_daily.json", "w") as f:
            json.dump(encrypted_daily, f, indent=2)
            
        print("ETL completed successfully.")
        
    except Exception as e:
        print(f"ETL failed: {e}")
        exit(1)

if __name__ == "__main__":
    main()
