# Hashmi Fabrics Business Management System - Laravel Version

Yeh Hashmi Fabrics ka complete Business Management System hai jise **Laravel (PHP)**, **Blade templating**, aur **Tailwind CSS** ke saath likha gaya hai. Yeh **MySQL** ya **SQLite** database ke saath asani se chal sakta hai.

## Features
- **Dashboard:** Aaj ki sales, outstanding udhar, stock levels, aur automatic low stock alerts.
- **Customers Management:** Ledger track karna aur customer se payment received ka voucher print karna.
- **Vendors Management:** Suppliers ka hisab-kitab aur pay kiye gye bakiya payment ka voucher print karna.
- **Products & Stock Management:** Complete fabric stock control.
- **Invoices (Sales Ledger):** Dynamic invoice generation aur immediately **PDF / Receipt Print** option.
- **Expenses & Purchases:** Kharchon aur khareedari ka complete track.
- **Reports & P&L:** Net Profit aur loss reports dynamically filter karna.

---

## Installation & Setup Instructions

### 1. Requirements
Ensure you have the following installed on your machine:
- PHP >= 8.1
- Composer
- MySQL or SQLite
- Web server (Apache/Nginx) or use Laravel Artisan Server.

### 2. Steps to Run

1. **Extract / Download Code:**
   Aap is pure `laravel-app` folder ko apne locally system par extract karein.

2. **Install Dependencies:**
   Run the following command inside the project directory:
   ```bash
   composer install
   ```

3. **Configure Environment File:**
   Rename `.env.example` to `.env` or run:
   ```bash
   cp .env.example .env
   ```
   Ab `.env` file ko open karein aur database configurations set karein:
   
   **For SQLite (Easiest setup):**
   ```env
   DB_CONNECTION=sqlite
   # DB_DATABASE=/absolute/path/to/database.sqlite (or keep empty if using database/database.sqlite)
   ```
   *(Make sure to create an empty `database/database.sqlite` file if using SQLite)*
   
   **For MySQL:**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=hashmi_fabrics
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

4. **Generate Application Key:**
   ```bash
   php artisan key:generate
   ```

5. **Run Migrations & Seeds:**
   Database tables aur basic demo data create karne ke liye run karein:
   ```bash
   php artisan migrate --seed
   ```

6. **Start Local Development Server:**
   ```bash
   php artisan serve
   ```
   Aapka system locally **http://127.0.0.1:8000** par live ho jayega!

---

## Folders & Architecture Created:
- `app/Models/` -> Product, Customer, Vendor, Invoice, InvoiceItem, CustomerPayment, VendorPayment, Expense.
- `app/Http/Controllers/` -> Handles sales, payments, inventory, dashboards, reports.
- `database/migrations/` -> All structured database tables.
- `resources/views/` -> Clean Blade HTML Templates with responsive print views for PDF generation.
- `routes/web.php` -> Standard web routes.
