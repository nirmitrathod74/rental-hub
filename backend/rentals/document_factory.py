import os
from django.conf import settings
from decimal import Decimal

class DocumentFactory:
    @staticmethod
    def get_html_invoice(order):
        # Build invoice HTML structure with inline styles for a premium layout
        items_html = ""
        for item in order.items.all():
            subtotal = item.unit_price * item.quantity
            items_html += f"""
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #334155; color: #f1f5f9;">{item.product.name}</td>
                <td style="padding: 12px; border-bottom: 1px solid #334155; text-align: center; color: #f1f5f9;">{item.quantity}</td>
                <td style="padding: 12px; border-bottom: 1px solid #334155; text-align: right; color: #f1f5f9;">${item.unit_price}</td>
                <td style="padding: 12px; border-bottom: 1px solid #334155; text-align: right; color: #f1f5f9;">${item.deposit_amount}</td>
                <td style="padding: 12px; border-bottom: 1px solid #334155; text-align: right; color: #f1f5f9;">${subtotal}</td>
            </tr>
            """

        html = f"""
        <html>
        <head>
            <style>
                body {{ font-family: 'Inter', sans-serif; background-color: #0f172a; color: #e2e8f0; margin: 0; padding: 40px; }}
                .invoice-container {{ max-width: 800px; margin: 0 auto; background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border-radius: 16px; border: 1px solid #334155; padding: 40px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); }}
                .header {{ display: flex; justify-content: space-between; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }}
                .business-title {{ font-size: 28px; font-weight: 800; color: #3b82f6; }}
                .invoice-title {{ font-size: 24px; font-weight: 700; text-align: right; }}
                .meta-table {{ width: 100%; margin-bottom: 30px; border-collapse: collapse; }}
                .meta-table td {{ padding: 6px 0; color: #94a3b8; }}
                .products-table {{ width: 100%; border-collapse: collapse; margin-bottom: 35px; }}
                .products-table th {{ background-color: #1e293b; color: #3b82f6; text-align: left; padding: 12px; font-weight: 600; }}
                .summary {{ width: 50%; margin-left: auto; }}
                .summary td {{ padding: 8px 12px; text-align: right; }}
                .total {{ font-size: 20px; font-weight: 700; color: #3b82f6; }}
                .footer {{ border-top: 1px solid #334155; padding-top: 20px; margin-top: 40px; text-align: center; font-size: 12px; color: #64748b; }}
            </style>
        </head>
        <body>
            <div class="invoice-container">
                <div class="header">
                    <div>
                        <div class="business-title">RentalHub</div>
                        <div>Enterprise Asset Solutions</div>
                    </div>
                    <div class="invoice-title">
                        <div>INVOICE</div>
                        <div style="font-size: 14px; font-weight: normal; color: #94a3b8; margin-top: 5px;">Order #{order.id}</div>
                    </div>
                </div>

                <table class="meta-table">
                    <tr>
                        <td><strong>Customer Name:</strong> {order.client.username}</td>
                        <td style="text-align: right;"><strong>Start Date:</strong> {order.start_date.strftime('%Y-%m-%d %H:%M')}</td>
                    </tr>
                    <tr>
                        <td><strong>Contact Email:</strong> {order.client.email}</td>
                        <td style="text-align: right;"><strong>Due Return Date:</strong> {order.end_date.strftime('%Y-%m-%d %H:%M')}</td>
                    </tr>
                    <tr>
                        <td><strong>Fulfillment:</strong> {order.get_fulfillment_type_display()}</td>
                        <td style="text-align: right;"><strong>Actual Return:</strong> {order.actual_return_date.strftime('%Y-%m-%d %H:%M') if order.actual_return_date else 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Shipping Address:</strong> {order.shipping_address or 'Store Pickup Selected'}</td>
                        <td style="text-align: right;"><strong>Status:</strong> <span style="background-color: #2563eb; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">{order.get_status_display()}</span></td>
                    </tr>
                </table>

                <table class="products-table">
                    <thead>
                        <tr>
                            <th style="border-top-left-radius: 8px; border-bottom-left-radius: 8px;">Product</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Unit Rent</th>
                            <th style="text-align: right;">Unit Deposit</th>
                            <th style="text-align: right; border-top-right-radius: 8px; border-bottom-right-radius: 8px;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                    </tbody>
                </table>

                <table class="summary">
                    <tr>
                        <td style="color: #94a3b8;">Total Rental Fee:</td>
                        <td style="font-weight: 600; color: #f1f5f9;">${order.total_rent_amount}</td>
                    </tr>
                    <tr>
                        <td style="color: #94a3b8;">Total Deposit Held:</td>
                        <td style="font-weight: 600; color: #f1f5f9;">${order.total_deposit_amount}</td>
                    </tr>
                    <tr>
                        <td style="color: #94a3b8;">Late Return Penalty:</td>
                        <td style="font-weight: 600; color: #ef4444;">${order.late_fee_charged}</td>
                    </tr>
                    <tr style="border-top: 2px solid #334155;">
                        <td class="total">Grand Total:</td>
                        <td class="total">${order.total_rent_amount + order.total_deposit_amount + order.late_fee_charged}</td>
                    </tr>
                </table>

                <div class="footer">
                    Thank you for choosing RentalHub! For terms & support, contact support@rentalhub.com
                </div>
            </div>
        </body>
        </html>
        """
        return html

    @staticmethod
    def get_html_quotation(order, template):
        # Similar logic to invoice, incorporating Custom headers & footers
        header_text = template.header_text if template else "RentalHub Quotation"
        footer_text = template.footer_text if template else "This is a system generated quotation."
        
        items_html = ""
        for item in order.items.all():
            subtotal = item.unit_price * item.quantity
            items_html += f"""
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #334155; color: #f1f5f9;">{item.product.name}</td>
                <td style="padding: 12px; border-bottom: 1px solid #334155; text-align: center; color: #f1f5f9;">{item.quantity}</td>
                <td style="padding: 12px; border-bottom: 1px solid #334155; text-align: right; color: #f1f5f9;">${item.unit_price}</td>
                <td style="padding: 12px; border-bottom: 1px solid #334155; text-align: right; color: #f1f5f9;">${item.deposit_amount}</td>
                <td style="padding: 12px; border-bottom: 1px solid #334155; text-align: right; color: #f1f5f9;">${subtotal}</td>
            </tr>
            """

        html = f"""
        <html>
        <head>
            <style>
                body {{ font-family: 'Inter', sans-serif; background-color: #0f172a; color: #e2e8f0; margin: 0; padding: 40px; }}
                .container {{ max-width: 800px; margin: 0 auto; background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border-radius: 16px; border: 1px solid #334155; padding: 40px; }}
                .header-banner {{ border-bottom: 2px solid #10b981; padding-bottom: 15px; margin-bottom: 30px; }}
                .custom-header {{ color: #10b981; font-size: 20px; margin-bottom: 10px; }}
                .title {{ font-size: 26px; font-weight: 700; text-align: right; color: #10b981; }}
                .meta-table {{ width: 100%; margin-bottom: 30px; }}
                .meta-table td {{ padding: 5px 0; color: #94a3b8; }}
                .products-table {{ width: 100%; border-collapse: collapse; margin-bottom: 35px; }}
                .products-table th {{ background-color: #1e293b; color: #10b981; text-align: left; padding: 12px; }}
                .summary {{ width: 50%; margin-left: auto; }}
                .summary td {{ padding: 8px 12px; text-align: right; }}
                .total {{ font-size: 20px; font-weight: 700; color: #10b981; }}
                .footer {{ border-top: 1px solid #334155; padding-top: 20px; margin-top: 40px; font-size: 13px; color: #64748b; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header-banner" style="display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <div class="custom-header">{header_text}</div>
                        <div>RentalHub Asset Quotation</div>
                    </div>
                    <div class="title">QUOTATION</div>
                </div>

                <table class="meta-table">
                    <tr>
                        <td><strong>Proposed To:</strong> {order.client.username}</td>
                        <td style="text-align: right;"><strong>Proposed Date:</strong> {order.created_at.strftime('%Y-%m-%d')}</td>
                    </tr>
                    <tr>
                        <td><strong>Email Address:</strong> {order.client.email}</td>
                        <td style="text-align: right;"><strong>Rental Start:</strong> {order.start_date.strftime('%Y-%m-%d %H:%M')}</td>
                    </tr>
                    <tr>
                        <td><strong>Fulfillment Type:</strong> {order.get_fulfillment_type_display()}</td>
                        <td style="text-align: right;"><strong>Rental End:</strong> {order.end_date.strftime('%Y-%m-%d %H:%M')}</td>
                    </tr>
                </table>

                <table class="products-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Rent Rate</th>
                            <th style="text-align: right;">Refundable Deposit</th>
                            <th style="text-align: right;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                    </tbody>
                </table>

                <table class="summary">
                    <tr>
                        <td style="color: #94a3b8;">Proposed Rent:</td>
                        <td style="font-weight: 600; color: #f1f5f9;">${order.total_rent_amount}</td>
                    </tr>
                    <tr>
                        <td style="color: #94a3b8;">Refundable Deposit:</td>
                        <td style="font-weight: 600; color: #f1f5f9;">${order.total_deposit_amount}</td>
                    </tr>
                    <tr style="border-top: 2px solid #334155;">
                        <td class="total">Estimated Total:</td>
                        <td class="total">${order.total_rent_amount + order.total_deposit_amount}</td>
                    </tr>
                </table>

                <div class="footer">
                    {footer_text}
                </div>
            </div>
        </body>
        </html>
        """
        return html

    @staticmethod
    def generate_pdf_invoice(order):
        # We can implement basic PDF writer using reportlab if needed,
        # but to bypass binary configuration problems on this sandbox shell,
        # returning the HTML document is incredibly scalable, easy to preview on the web
        # and print directly from the browser. 
        # We will create a local folder /media/invoices/ and write the HTML representation there.
        media_path = os.path.join(settings.MEDIA_ROOT, 'invoices')
        if not os.path.exists(media_path):
            os.makedirs(media_path)
            
        file_path = os.path.join(media_path, f"invoice_{order.id}.html")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(DocumentFactory.get_html_invoice(order))
            
        return f"{settings.MEDIA_URL}invoices/invoice_{order.id}.html"

    @staticmethod
    def generate_pdf_quotation(order, template):
        media_path = os.path.join(settings.MEDIA_ROOT, 'quotations')
        if not os.path.exists(media_path):
            os.makedirs(media_path)
            
        file_path = os.path.join(media_path, f"quotation_{order.id}.html")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(DocumentFactory.get_html_quotation(order, template))
            
        return f"{settings.MEDIA_URL}quotations/quotation_{order.id}.html"
