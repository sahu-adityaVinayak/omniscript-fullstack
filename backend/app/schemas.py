from pydantic import BaseModel, EmailStr, Field


class SignUpRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProfileUpdateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr


class PasswordOtpRequest(BaseModel):
    email: EmailStr


class PasswordOtpVerifyRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(min_length=4, max_length=8)
    new_password: str = Field(min_length=8)


class MessageResponse(BaseModel):
    message: str


class PasswordOtpRequestResponse(MessageResponse):
    dev_otp_code: str | None = None


class ToolRequest(BaseModel):
    text: str = Field(min_length=1)


class ToolResponse(BaseModel):
    output: str
