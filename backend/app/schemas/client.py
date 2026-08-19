from pydantic import BaseModel


class ClientBase(BaseModel):
    username: str


class ClientSignup(ClientBase):
    password: str


class ClientLogin(BaseModel):
    username: str
    password: str


class ClientResponse(ClientBase):
    id: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
