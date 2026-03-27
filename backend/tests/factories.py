import factory
from datetime import datetime
from factory.alchemy import SQLAlchemyModelFactory
from .src.database import SessionLocal
from .src.models import User, Policy, Claim, PolicyType, PolicyStatus

# Mock session for factories
class BaseFactory(SQLAlchemyModelFactory):
    class Meta:
        abstract = True
        sqlalchemy_session = SessionLocal()
        sqlalchemy_session_persistence = "commit"

class UserFactory(BaseFactory):
    class Meta:
        model = User

    id = factory.Sequence(lambda n: n + 1)
    email = factory.Faker("email")
    stellar_address = factory.Sequence(lambda n: f"G{n:055}")
    created_at = factory.LazyFunction(datetime.utcnow)

class PolicyFactory(BaseFactory):
    class Meta:
        model = Policy

    id = factory.Sequence(lambda n: n + 1)
    policyholder = factory.SubFactory(UserFactory)
    policy_type = factory.Iterator([PolicyType.weather, PolicyType.smart_contract, PolicyType.flight])
    coverage_amount = 1000.0
    premium = 100.0
    start_time = factory.Faker("unix_time")
    end_time = factory.LazyAttribute(lambda o: o.start_time + 31536000) # +1 year
    trigger_condition = factory.Faker("sentence")
    status = PolicyStatus.active
    claim_amount = 0.0

class ClaimFactory(BaseFactory):
    class Meta:
        model = Claim

    id = factory.Sequence(lambda n: n + 1)
    policy = factory.SubFactory(PolicyFactory)
    claimant = factory.LazyAttribute(lambda o: o.policy.policyholder)
    claim_amount = 500.0
    proof = factory.Faker("sentence")
    timestamp = factory.Faker("unix_time")
    approved = False
