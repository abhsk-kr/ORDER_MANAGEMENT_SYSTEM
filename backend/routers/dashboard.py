from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Product, Customer, Order
from schemas import DashboardResponse, ProductResponse

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    total_products = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()
    low_stock = db.query(Product).filter(Product.quantity < 10).all()

    return DashboardResponse(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=[ProductResponse.model_validate(p) for p in low_stock]
    )
