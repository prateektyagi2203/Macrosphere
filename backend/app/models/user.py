"""User preference model."""

from typing import Optional

from sqlalchemy import JSON, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class UserPreference(Base, TimestampMixin):
    """Stores user preferences and settings."""

    __tablename__ = "user_preferences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)

    # UI Preferences
    theme: Mapped[str] = mapped_column(String(20), default="light")  # light, dark
    preferred_currency: Mapped[str] = mapped_column(String(10), default="INR")

    # Default view settings
    default_view: Mapped[str] = mapped_column(String(50), default="dashboard")
    charts_display_type: Mapped[str] = mapped_column(String(50), default="interactive")

    # Notifications
    enable_alerts: Mapped[bool] = mapped_column(default=True)
    alert_thresholds: Mapped[Optional[dict]] = mapped_column(JSON)

    # Saved filter preferences
    custom_settings: Mapped[Optional[dict]] = mapped_column(JSON)

    def __repr__(self) -> str:
        return f"<UserPreference {self.user_id}>"
