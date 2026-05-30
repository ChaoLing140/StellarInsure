"""add webhook delivery status tracking

Revision ID: 005
Revises: 004
Create Date: 2026-05-30
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "webhook_deliveries",
        sa.Column("delivery_status", sa.String(length=32), nullable=False, server_default="pending"),
    )


def downgrade() -> None:
    op.drop_column("webhook_deliveries", "delivery_status")
