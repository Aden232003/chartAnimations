from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from datetime import datetime
import yfinance as yf
import logging
from mangum import Adapter

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Define allowed origins
origins = [
    "https://chart-animations.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
]

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,
)

class StockDataRequest(BaseModel):
    ticker: str
    startDate: str
    endDate: str
    timeframe: str

    @validator('startDate', 'endDate')
    def validate_date_format(cls, value):
        try:
            datetime.strptime(value, '%Y-%m-%d')
        except ValueError:
            raise ValueError('Incorrect date format, should be YYYY-MM-DD')
        return value

@app.post("/api/fetch-stock-data")
async def fetch_stock_data(request: StockDataRequest):
    try:
        logger.info(f"Fetching stock data for {request.ticker} from {request.startDate} to {request.endDate}")
        
        # Convert timeframe to yfinance interval
        interval_map = {
            "daily": "1d",
            "weekly": "1wk",
            "monthly": "1mo"
        }
        interval = interval_map.get(request.timeframe, "1d")
        
        # Fetch data from yfinance
        ticker = yf.Ticker(request.ticker)
        df = ticker.history(
            start=request.startDate,
            end=request.endDate,
            interval=interval
        )
        
        if df.empty:
            logger.warning(f"No data found for {request.ticker}")
            return []
            
        # Convert DataFrame to list of dictionaries
        data = []
        for index, row in df.iterrows():
            data_point = {
                "Date": index.strftime("%Y-%m-%d"),
                "Close": float(row["Close"]),
                "Open": float(row["Open"]),
                "High": float(row["High"]),
                "Low": float(row["Low"])
            }
            data.append(data_point)
        
        logger.info(f"Successfully fetched {len(data)} data points")
        return data
        
    except Exception as e:
        logger.error(f"Error fetching stock data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

# Create Mangum handler for AWS Lambda/Vercel
handler = Adapter(app) 