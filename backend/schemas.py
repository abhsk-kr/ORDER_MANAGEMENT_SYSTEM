from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    name: str
    sku: str
    price: float = Field(gt=0)
    quantity: int = Field(ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    quantity: Optional[int] = Field(default=None, ge=0)


class ProductResponse(ProductBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class CustomerBase(BaseModel):
    full_name: str
    email: str
    phone: str


class CustomerCreate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(ge=1)


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemBase]


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    quantity: int
    unit_price: float

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: Optional[str] = None
    total_amount: float
    status: str
    created_at: datetime
    items: List[OrderItemResponse] = []

    model_config = {"from_attributes": True}


class DashboardResponse(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: List[ProductResponse]
