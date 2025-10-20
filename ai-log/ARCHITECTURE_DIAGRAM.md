# Vargas Home Service - 3-Tier Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT / BROWSER                                 │
│                  (Users: Admin, Employee, Customer)                      │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER (Routes)                         │
│                         Flask Blueprints                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────────┐   │
│  │   page_bp       │  │  workorder_bp    │  │   warranty_bp       │   │
│  ├─────────────────┤  ├──────────────────┤  ├─────────────────────┤   │
│  │ Frontend Pages  │  │ Workorder API    │  │ Warranty API        │   │
│  │                 │  │                  │  │                     │   │
│  │ GET /           │  │ POST /workorders │  │ POST /api/warranty/ │   │
│  │ GET /login      │  │ GET /workorders  │  │      lookup         │   │
│  │ GET /admin/*    │  │ GET /workorders/ │  │ POST /api/warranty/ │   │
│  │ GET /employee/* │  │     <id>         │  │      request-*      │   │
│  │ GET /customer/* │  │                  │  │                     │   │
│  └────────┬────────┘  └────────┬─────────┘  └──────────┬──────────┘   │
│           │                    │                        │              │
│           │                    │                        │              │
│           │ render_template()  │ WorkorderService       │ WarrantyService
│           │                    │                        │              │
└───────────┼────────────────────┼────────────────────────┼──────────────┘
            │                    │                        │
            │                    ▼                        ▼
            │         ┌──────────────────────────────────────────────┐
            │         │       BUSINESS LOGIC LAYER (Services)        │
            │         ├──────────────────────────────────────────────┤
            │         │                                              │
            │         │  ┌──────────────────┐  ┌─────────────────┐ │
            │         │  │ WorkorderService │  │ WarrantyService │ │
            │         │  ├──────────────────┤  ├─────────────────┤ │
            │         │  │ • Validation     │  │ • Validation    │ │
            │         │  │ • parse_date()   │  │ • Lookup logic  │ │
            │         │  │ • parse_bool()   │  │ • Service req.  │ │
            │         │  │ • create_work... │  │ • Email logic   │ │
            │         │  │ • list_work...   │  │                 │ │
            │         │  └────────┬─────────┘  └────────┬────────┘ │
            │         │           │                     │          │
            │         │           │ Repository calls    │          │
            │         │           │                     │          │
            │         └───────────┼─────────────────────┼──────────┘
            │                     │                     │
            │                     ▼                     ▼
            │         ┌──────────────────────────────────────────────┐
            │         │       DATA ACCESS LAYER (Repositories)       │
            │         ├──────────────────────────────────────────────┤
            │         │                                              │
            │         │  ┌──────────────────┐  ┌─────────────────┐ │
            │         │  │ WorkorderRepo    │  │ WarrantyRepo    │ │
            │         │  ├──────────────────┤  ├─────────────────┤ │
            │         │  │ • create()       │  │ • lookup_by_*() │ │
            │         │  │ • list_all()     │  │ • get_by_id()   │ │
            │         │  │ • get_by_id()    │  │ • create_srv... │ │
            │         │  │ • update()       │  │                 │ │
            │         │  │ • delete()       │  │                 │ │
            │         │  └────────┬─────────┘  └────────┬────────┘ │
            │         │           │                     │          │
            │         │           │  Raw SQL Queries    │          │
            │         │           │                     │          │
            │         │  ┌────────┴─────────────────────┴────────┐ │
            │         │  │       BaseRepository                  │ │
            │         │  ├───────────────────────────────────────┤ │
            │         │  │ • get_db_connection()                 │ │
            │         │  │ • get_cursor() context manager        │ │
            │         │  │ • get_dict_cursor()                   │ │
            │         │  │ • Auto commit/rollback                │ │
            │         │  └───────────────┬───────────────────────┘ │
            │         │                  │                         │
            │         └──────────────────┼─────────────────────────┘
            │                            │
            │                            │ psycopg2
            │                            ▼
            │                  ┌─────────────────────┐
            │                  │   PostgreSQL DB     │
            │                  │                     │
            │                  │ Tables:             │
            │                  │ • workorders        │
            │                  │ • warranties        │
            │                  │ • service_requests  │
            │                  │ • user              │
            │                  │ • ...               │
            │                  └─────────────────────┘
            │
            ▼
  ┌─────────────────────────┐
  │   Static Files          │
  │   (CSS, JS, Images)     │
  ├─────────────────────────┤
  │ server/static/          │
  │ ├── css/                │
  │ │   ├── adminEmployee   │
  │ │   ├── warranty        │
  │ │   └── ... (14 files)  │
  │ └── js/                 │
  │     ├── adminEmployee   │
  │     ├── warranty        │
  │     └── ... (14 files)  │
  └─────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                      CONFIGURATION & UTILITIES                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  config.py              __init__.py (App Factory)      main.py          │
│  ├── Config            ├── create_app()               └── Entry point  │
│  ├── DevelopmentConfig └── Register blueprints                          │
│  ├── ProductionConfig                                                   │
│  └── get_config()                                                       │
│                                                                          │
│  Environment Variables (.env):                                          │
│  • DATABASE_URL                                                         │
│  • SECRET_KEY                                                           │
│  • FLASK_ENV                                                            │
│  • FLASK_DEBUG                                                          │
└─────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
                          DATA FLOW EXAMPLES
═══════════════════════════════════════════════════════════════════════════

Example 1: User accesses home page
───────────────────────────────────
Browser → GET / 
         → page_bp.home() 
         → render_template("home.html") 
         → Returns HTML with CSS/JS links
         → Browser requests /static/css/home.css
         → Flask serves static file

Example 2: Create workorder via API
────────────────────────────────────
Browser → POST /workorders {data}
         → workorder_bp.create_workorder()
         → WorkorderService.create_workorder(data)
              ├── Validates data
              ├── Parses date/bool
              └── WorkorderRepository.create(...)
                   └── Raw SQL INSERT
                        └── PostgreSQL
         ← Returns JSON response {"ok": true, "workorderId": 123}

Example 3: Lookup warranty
───────────────────────────
Browser → POST /api/warranty/lookup {email: "..."}
         → warranty_bp.lookup_warranty()
         → WarrantyService.lookup_warranty(data)
              ├── Validates input
              └── WarrantyRepository.lookup_by_email_or_phone(...)
                   └── Raw SQL SELECT with JOIN
                        └── PostgreSQL
         ← Returns JSON {"success": true, "warranties": [...]}

═══════════════════════════════════════════════════════════════════════════
```

## Key Architecture Principles

### 🎯 Separation of Concerns
- **Routes**: Handle HTTP only
- **Services**: Business logic only
- **Repositories**: Database access only

### 🔄 Request Flow
1. Client → Route (validates HTTP)
2. Route → Service (applies business logic)
3. Service → Repository (executes SQL)
4. Repository → Database
5. Database → Repository → Service → Route → Client

### 📦 Modularity
- Each component is independent
- Easy to test, maintain, and extend
- Can swap implementations without affecting other layers

### 🛡️ Error Handling
- Repositories: Catch DB errors
- Services: Handle business rule violations
- Routes: Format error responses for HTTP

### 🔧 Configuration
- Environment-based (dev, prod, test)
- Centralized in `config.py`
- Loaded from `.env` file
