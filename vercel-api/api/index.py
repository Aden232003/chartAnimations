from http.server import BaseHTTPRequestHandler
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
            return {"data": []}
            
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
        return {"data": data}
        
    except Exception as e:
        logger.error(f"Error fetching stock data: {str(e)}")
        return {"error": str(e)}

class Handler(BaseHTTPRequestHandler):
    async def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            request_body = self.rfile.read(content_length).decode('utf-8')
            request_data = json.loads(request_body)
            
            if self.path == "/api/fetch-stock-data":
                stock_request = StockDataRequest(**request_data)
                response_data = await fetch_stock_data(stock_request)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode('utf-8'))
            else:
                self.send_response(404)
                self.end_headers()
                
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

def handler(request, context):
    return Handler.do_POST(request)

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