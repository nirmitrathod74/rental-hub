import re

with open('backend/seed_data.py', 'r') as f:
    content = f.read()

content = content.replace(
    'from rentals.models import RentalOrder, RentalItem, DepositHistory, RentalInspection',
    'from rentals.models import RentalOrder, RentalItem, RentalInspection\n    from finance.models import Payment, SecurityDeposit'
)
content = re.sub(r"'security_deposit_type': '[^']+',\n\s*", '', content)
content = re.sub(r"'security_deposit_value': Decimal\('[^']+'\),\n\s*", '', content)
content = re.sub(r"'late_fee_type': '[^']+',\n\s*", '', content)
content = re.sub(r"'late_fee_rate': Decimal\('[^']+'\),\n\s*", '', content)
content = re.sub(r"'grace_period_hours': \d+,\n\s*", '', content)
content = re.sub(r"'available_qty': \d+,\n\s*", '', content)

content = re.sub(r"total_rent_amount=Decimal\('[^']+'\),?\s*", '', content)
content = re.sub(r"total_deposit_amount=Decimal\('[^']+'\),?\s*", '', content)
content = re.sub(r"amount_paid=Decimal\('[^']+'\),?\s*", '', content)
content = re.sub(r"deposit_paid=Decimal\('[^']+'\),?\s*", '', content)
content = re.sub(r"deposit_refunded=Decimal\('[^']+'\),?\s*", '', content)
content = re.sub(r"late_fee_charged=Decimal\('[^']+'\),?\s*", '', content)

content = re.sub(r"DepositHistory\.objects\.create\([\s\S]*?\)", '', content)
content = re.sub(r"p\d+\.available_qty -= \d+\s*", '', content)

with open('backend/seed_data.py', 'w') as f:
    f.write(content)
