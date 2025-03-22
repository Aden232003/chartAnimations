# prompt: like the above cells method use the same way to gain data for Reliance stock on daily time frame from 1st Jan 2025 to 23rd Feb 2025

import yfinance as yf
import pandas as pd

def fetch_reliance_daily_data():
    # Define the Reliance Industries ticker (assuming it's RELIANCE.NS on NSE)
    ticker = "RELIANCE.NS"

    # Fetch historical data for the specified date range and interval
    data = yf.download(ticker, start="2025-01-01", end="2025-02-23", interval="1d")

    # Reset index to get the date as a column
    data = data.reset_index()

    # Keep only the Date, Open, High, Low, and Close columns
    daily_data = data[["Date", "Open", "High", "Low", "Close"]]

    # Save data to CSV (optional)
    daily_data.to_csv("reliance_daily_yfinance.csv", index=False)
    print("Data saved to reliance_daily_yfinance.csv")
    print(daily_data)

# Run the function
fetch_reliance_daily_data()

# Load the Reliance CSV file
reliance_csv_file_path = "reliance_daily_yfinance.csv"
reliance_csv_data = pd.read_csv(reliance_csv_file_path)

# Convert Date column to datetime format, handling errors
reliance_csv_data["Date"] = pd.to_datetime(reliance_csv_data["Date"], errors="coerce")

# Convert numeric columns to numeric, handling errors
for col in ["Open", "High", "Low", "Close"]:
    reliance_csv_data[col] = pd.to_numeric(reliance_csv_data[col], errors="coerce")

# Convert DataFrame to JavaScript object format
reliance_js_objects = reliance_csv_data.to_dict(orient="records")

# Format as JavaScript object, handling NaT values
reliance_js_formatted = "const relianceData = [\n" + ",\n".join(
    [
        f'    {{"Date": "{row["Date"].strftime("%Y-%m-%d") if pd.notnull(row["Date"]) else "null"}", '
        f'"Open": {row["Open"]}, "High": {row["High"]}, "Low": {row["Low"]}, "Close": {row["Close"]}}}'
        for row in reliance_js_objects
    ]
) + "\n];"

reliance_js_formatted

import pandas as pd

# Load the Reliance CSV file
reliance_csv_file_path = "reliance_daily_yfinance.csv"
reliance_csv_data = pd.read_csv(reliance_csv_file_path)

# Convert Date column to datetime format, handling errors
reliance_csv_data["Date"] = pd.to_datetime(reliance_csv_data["Date"], errors="coerce")

# Convert 'Close' column to numeric, handling errors
reliance_csv_data["Close"] = pd.to_numeric(reliance_csv_data["Close"], errors="coerce")

# Create the desired list of dictionaries
reliance_data = []
for index, row in reliance_csv_data.iterrows():
    # Check if the Date is valid before formatting
    if pd.notnull(row["Date"]):
        reliance_data.append({"Date": row["Date"].strftime("%Y-%m-%d"), "Close": row["Close"]})
    else:
        # Handle NaT values (e.g., skip them or use a placeholder)
        # Here, we're skipping NaT values
        pass

reliance_data