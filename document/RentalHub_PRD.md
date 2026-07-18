# Product Requirements Document (PRD) – RentalHub

## 1. Executive Summary

RentalHub is a modular ERP platform specifically engineered for equipment and asset rental businesses. In the current operational landscape, businesses struggle with manual, fragmented workflows across diverse asset types. This lack of centralized visibility inevitably leads to double-booking, manual errors in late fee calculations, and severely impacts scalability. Security deposits are often managed outside the rental workflow, making reconciliation difficult.

By transitioning to RentalHub, businesses will adopt a unified, real-time ERP system with fully digital workflows, automated business logic, and powerful operational analytics. Structured as an extensible suite of ERP services—rather than a mere storefront—RentalHub streamlines the entire rental lifecycle to drive operational excellence, ensure financial accuracy, and provide unparalleled visibility into inventory and revenue.

## 2. Goals & Objectives

The primary objective of RentalHub is to eliminate operational friction and enable data-driven decision-making. The expected outcomes for this platform include:
*   **Simplify rental operations** and **reduce manual work**.
*   **Improve operational visibility** via centralized dashboards.
*   **Automate repetitive rental tasks** like late fee calculations.
*   **Enhance customer experience** with self-service portals.
*   **Enable businesses to make faster operational decisions** through real-time insights.

## 3. Core Functional Areas & User Roles

RentalHub caters to two primary user roles, each with specific capabilities and interfaces.

### 3.1. Client / Portal User (Frontend)
Users can log in to the portal to manage their profiles, orders, addresses, and photos.
*   **Authentication:** Splash Screen → Login / Sign Up → Dashboard.
*   **Browsing & Cart:** Browse products, select specific rental periods, and add to cart.
*   **Fulfillment Options:** Choose to add a delivery address or opt to collect the product from the store.
*   **Payment & Invoicing:** Provide payment information (including security deposit) and download invoices from the portal.
*   **Return Process:** Return the product on time to get the full deposit back, or incur automatically calculated penalties deducted from the deposit if late.

### 3.2. Admin (Backend)
Admins have responsibility over organization-wide rental management, customer information, and product records.
*   **System Configuration:** Manage user records and organization-specific rental settings.
*   **Product & Pricing Management:** Create products, product variants (Brand, Manufacturer, Color, Size), pricelists (including time-specific ones), and rental periods.
*   **Workflow Execution:** Confirm on-the-spot quotations, collect payments/deposits, execute return inspections, and process deposit refunds or late fee deductions.
*   **Document Templates:** Create Quotation Templates, including Header & Footer configuration, for faster client communication.

## 4. Key Workflows

### 4.1. Security Deposit Management
*   **Collection:** Collect security deposits during confirmation. Supports fixed amount or percentage-based deposits.
*   **Tracking:** Track deposit payment status and hold deposits until products are successfully returned.
*   **Settlement:** If delivered/returned on time, the security amount is refunded in full. If late, the penalty is deducted, and the remaining amount is refunded. Complete deposit history is maintained.

### 4.2. Late Return Fee Management
*   **Automatic Detection:** Detect overdue returns automatically.
*   **Configurable Rules:** Hourly, daily, weekly, or monthly late fee calculations with configurable grace periods.
*   **Invoicing:** Maximum late fee limits and automatic invoice generation. Provides clear visibility of outstanding penalties.

### 4.3. Pickup & Return Management
**Pickup Workflow:**
*   Daily pickup schedule and route/sequence planning.
*   Customer notifications and pickup confirmation.
*   Barcode or QR code scanning.
*   Execution of a pickup checklist.

**Return Workflow:**
*   Daily return schedule.
*   Product condition inspection and damage reporting.
*   Missing accessories verification.
*   Automatic stock updates, deposit settlement, late fee calculation, and repair workflow initiation if required.
*   Return confirmation.

## 5. Dashboard & Real-Time Visibility

The Admin Rental Operations Dashboard offers real-time visibility to help rental managers quickly identify priorities and take appropriate actions.

**Key Insights & Widgets:**
*   Active Rentals
*   Rentals Due Today
*   Upcoming Pickups & Returns
*   Overdue Rentals
*   Revenue from Rentals
*   Security Deposits Held
*   Late Fee Collection

## 6. Technical Requirements

### 6.1. Architecture
*   **Backend:** Django REST Framework.
*   **Architecture Pattern:** Strict separation of concerns using a Service Layer (all business logic) and a Repository Layer (database abstraction). No business logic resides in views.
*   **Frontend:** React.
*   **Database:** PostgreSQL.
*   **Caching & Queues:** Redis for dashboard caching, session management, and job queues.
*   **Background Processing:** Celery for asynchronous tasks and scheduled jobs.
*   **Deployment:** Docker containerization.

## 7. Design Patterns

*   **Service Layer Pattern:** Encapsulates core business logic (e.g., rental processing) away from HTTP routing.
*   **Repository Pattern:** Abstracts PostgreSQL data access, ensuring decoupled database interactions.
*   **Strategy Pattern:** Manages diverse late fee and pricing calculation algorithms dynamically.
*   **State Machine Pattern:** Strictly governs the rental and inventory lifecycle transitions.
*   **Observer Pattern:** Utilizes Django signals to trigger event-driven notifications without tightly coupling services.
*   **Factory Pattern:** Handles the standardized creation of complex objects like PDF Invoices and Quotations.

## 8. Security & Compliance
*   **Data in Transit:** Enforced HTTPS.
*   **Authentication & Authorization:** Secure authentication and strict role-based access control (RBAC).
*   **Tracking:** Immutable audit logs for financial and state transitions.

## 9. Bonus Ideas & Future Enhancements (Odoo Hackathon Scope)
To go beyond core requirements, the following innovative capabilities can be introduced:
*   **Predictive Maintenance Suggestions:** Anticipating equipment servicing based on usage.
*   **Smart Pickup Route Optimization:** Improving delivery and pickup logistics.
*   **Product Availability Forecasting:** Anticipating inventory shortages.
*   **IoT-enabled Asset Tracking:** Real-time physical tracking of high-value rentals.
*   **Mobile-First Rental Operations & Barcode/QR Scanning:** Empowering field staff.
*   **Advanced Analytics:** Customizable dashboard widgets and deep KPI tracking.
*   **Automatic Customer Reminders:** Enhancing communication to reduce late returns.

## 10. Out of Scope
*   **Microservices Architecture:** The system remains a modular monolith to suit the hackathon delivery timeline.
*   **Third-Party ERP Integrations:** Integration with external accounting software beyond basic API access is excluded from MVP.
