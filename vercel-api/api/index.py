from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, validator
from datetime import datetime
import yfinance as yf
import logging
import json

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
            return JSONResponse(content=[], status_code=200)
            
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
        return JSONResponse(content=data, status_code=200)
        
    except Exception as e:
        logger.error(f"Error fetching stock data: {str(e)}")
        return JSONResponse(
            content={"error": str(e)},
            status_code=500
        )

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

# For Vercel serverless functions
async def handler(request: Request):
    if request.method == "OPTIONS":
        return JSONResponse(
            content={},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "*"
            }
        )
    
    try:
        body = await request.json()
        path = request.url.path
        
        if path == "/api/fetch-stock-data":
            stock_request = StockDataRequest(**body)
            return await fetch_stock_data(stock_request)
        elif path == "/api/health":
            return await health_check()
        else:
            return JSONResponse(
                content={"error": "Not found"},
                status_code=404
            )
    except Exception as e:
        logger.error(f"Handler error: {str(e)}")
        return JSONResponse(
            content={"error": str(e)},
            status_code=500
        ) 