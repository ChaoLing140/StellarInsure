"""add idempotency records

Revision ID: 006
Revises: 005
Create Date: 2026-05-31
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "006"
down_revision: Union[str, None] = "005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "idempotency_records",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("scope", sa.String(length=64), nullable=False),
        sa.Column("idempotency_key", sa.String(length=128), nullable=False),
        sa.Column("request_fingerprint", sa.String(length=64), nullable=False),
        sa.Column("transaction_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["transaction_id"], ["transactions.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "scope", "idempotency_key", name="uq_idempotency_user_scope_key"),
    )
    op.create_index(op.f("ix_idempotency_records_id"), "idempotency_records", ["id"], unique=False)
    op.create_index(op.f("ix_idempotency_records_user_id"), "idempotency_records", ["user_id"], unique=False)
    op.create_index(op.f("ix_idempotency_records_scope"), "idempotency_records", ["scope"], unique=False)
    op.create_index(op.f("ix_idempotency_records_transaction_id"), "idempotency_records", ["transaction_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_idempotency_records_transaction_id"), table_name="idempotency_records")
    op.drop_index(op.f("ix_idempotency_records_scope"), table_name="idempotency_records")
    op.drop_index(op.f("ix_idempotency_records_user_id"), table_name="idempotency_records")
    op.drop_index(op.f("ix_idempotency_records_id"), table_name="idempotency_records")
    op.drop_table("idempotency_records")
