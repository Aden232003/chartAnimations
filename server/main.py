from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime
import yfinance as yf
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

# Define allowed origins
origins = [
    "https://chart-animations.vercel.app",  # Production frontend
    "http://localhost:5173",  # Local development
    "http://localhost:5174",
    "http://localhost:5175",
]

# Configure CORS - this must be added before any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["*"],
)

# Add middleware to log all requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    logger.info(f"Headers: {request.headers}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

class StockDataRequest(BaseModel):
    ticker: str
    startDate: str
    endDate: str
    timeframe: str

@app.post("/fetch-stock-data")
async def fetch_stock_data(request: StockDataRequest):
    try:
        logger.debug(f"Received request: {request}")
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
            try:
                data_point = {
                    "Date": index.strftime("%Y-%m-%d"),
                    "Close": float(row["Close"]),
                    "Open": float(row["Open"]),
                    "High": float(row["High"]),
                    "Low": float(row["Low"])
                }
                data.append(data_point)
            except Exception as e:
                logger.error(f"Error processing row {index}: {str(e)}")
                continue
        
        logger.info(f"Successfully fetched {len(data)} data points")
        return data
        
    except Exception as e:
        logger.error(f"Error fetching stock data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 