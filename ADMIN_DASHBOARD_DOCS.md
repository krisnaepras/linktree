# 🔐 Admin Dashboard System Documentation

## Overview

Sistem dashboard admin berbasis **Next.js App Router**, **Tailwind CSS**, dan **Prisma ORM** dengan role-based access control untuk mengelola user dan kategori.

## 📋 Role Management

### Role Hierarchy

-   **USER** - User biasa yang dapat membuat linktree
-   **ADMIN** - Administrator yang dapat mengelola user dan kategori
-   **SUPERADMIN** - Super administrator dengan akses penuh

### Test Accounts

```
ADMIN Account:
- Email: admin@linktree.com
- Password: admin123

SUPERADMIN Account:
- Email: superadmin@linktree.com
- Password: superadmin123

USER Account:
- Email: user@test.com
- Password: user123
```

## 🔐 Authentication & Authorization

### NextAuth Configuration

-   **Provider**: Credentials (email/password)
-   **Session**: JWT-based dengan role information
-   **Middleware**: Role-based route protection

### Protected Routes

```typescript
/dashboard/*      → USER only (ADMIN & SUPERADMIN redirected to their dashboards)
/admin/*          → ADMIN + SUPERADMIN
/superadmin/*     → SUPERADMIN only
```

### Route Redirection Logic

```typescript
// After login:
SUPERADMIN → /superadmin
ADMIN      → /admin
USER       → /dashboard

// Access Control:
ADMIN/SUPERADMIN trying to access /dashboard → redirected to their admin panel
USER trying to access /admin → redirected to /login
USER trying to access /superadmin → redirected to /login
```

## 🏗️ Architecture

### File Structure

```
app/
├── admin/
│   ├── page.tsx              # Admin dashboard overview
│   ├── users/page.tsx        # User management (ADMIN view)
│   └── categories/page.tsx   # Category management
├── superadmin/
│   ├── page.tsx              # Superadmin dashboard overview
│   ├── users/page.tsx        # User management (SUPERADMIN view)
│   └── categories/page.tsx   # Category management
├── api/admin/
│   ├── users/
│   │   ├── route.ts          # GET, POST /api/admin/users
│   │   └── [id]/route.ts     # PATCH, DELETE /api/admin/users/[id]
│   └── categories/
│       ├── route.ts          # GET, POST /api/admin/categories
│       └── [id]/route.ts     # PATCH, DELETE /api/admin/categories/[id]
└── components/
    └── AdminLayout.tsx       # Shared admin layout component
```

## 🎯 Features

### 1. Dashboard Overview

-   **Statistics cards** (total users, categories, linktrees, links)
-   **Recent users** with linktree count
-   **Category usage** statistics
-   **Role-based content** display

### 2. User Management (`/admin/users` & `/superadmin/users`)

#### ADMIN Permissions:

-   ✅ View users with role `USER`
-   ✅ Create new `USER` accounts
-   ✅ Edit `USER` information (name, email)
-   ✅ Delete `USER` accounts
-   ❌ Cannot see or manage `ADMIN` accounts

#### SUPERADMIN Permissions:

-   ✅ View all users (`USER` + `ADMIN`)
-   ✅ Create new `USER` or `ADMIN` accounts
-   ✅ Edit user information and change roles
-   ✅ Promote `USER` to `ADMIN`
-   ✅ Demote `ADMIN` to `USER`
-   ✅ Delete any user account

#### Features:

-   **Search functionality** by name or email
-   **Role badges** with color coding
-   **Linktree count** per user
-   **SweetAlert2** confirmations for delete operations
-   **Responsive design** with mobile-friendly interface

### 3. Category Management (`/admin/categories` & `/superadmin/categories`)

#### Permissions (Same for ADMIN & SUPERADMIN):

-   ✅ View all categories
-   ✅ Create new categories
-   ✅ Edit category name and icon
-   ✅ Delete categories (with usage check)
-   ✅ Upload emoji or image icons

#### Features:

-   **Icon support** (emoji and uploaded images)
-   **Usage counter** (how many links use each category)
-   **Safe deletion** (prevents deletion of categories in use)
-   **Image preview** for uploaded icons
-   **Form validation** with Zod schema

## 🎨 UI/UX Design

### Layout Components

-   **Responsive sidebar** with mobile toggle
-   **Role-based navigation** menu
-   **User profile** section in sidebar
-   **SweetAlert2** for confirmations
-   **Loading states** and error handling

### Design System

-   **Tailwind CSS** for styling
-   **Heroicons** for consistent iconography
-   **Color-coded badges** for roles:
    -   USER: Green
    -   ADMIN: Blue
    -   SUPERADMIN: Purple

### Mobile Responsiveness

-   **Collapsible sidebar** on mobile
-   **Touch-friendly** buttons and forms
-   **Responsive tables** with horizontal scroll
-   **Mobile-optimized** form layouts

## 📊 API Endpoints

### User Management

```typescript
GET    /api/admin/users          # List users (role-filtered)
POST   /api/admin/users          # Create new user
PATCH  /api/admin/users/[id]     # Update user
DELETE /api/admin/users/[id]     # Delete user
```

### Category Management

```typescript
GET    /api/admin/categories     # List all categories
POST   /api/admin/categories     # Create new category
PATCH  /api/admin/categories/[id] # Update category
DELETE /api/admin/categories/[id] # Delete category
```

### Role-Based Filtering

```typescript
// Users API filters based on requester role:
ADMIN      → Only shows users with role 'USER'
SUPERADMIN → Shows all users (USER + ADMIN)
```

## 🔧 Security Features

### Middleware Protection

```typescript
// middleware.ts
- Route-based access control
- JWT token validation
- Role verification
- Automatic redirects for unauthorized access
```

### API Security

```typescript
// All admin APIs verify:
- Valid session exists
- User has required role (ADMIN or SUPERADMIN)
- Request data validation with Zod
```

### Data Protection

-   **Password hashing** with bcrypt
-   **Input validation** on all forms
-   **SQL injection protection** via Prisma
-   **XSS prevention** with proper escaping

## 🚀 Getting Started

### 1. Setup Database

```bash
npm run db:migrate
npm run db:seed
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Access Admin Panel

-   Visit: `http://localhost:3000/login`
-   Login with admin credentials
-   Will redirect to `/admin` or `/superadmin` based on role

## 📝 Key Implementation Details

### 1. Role-Based Component Rendering

```typescript
const isAdmin = session?.user?.role === "ADMIN";
const isSuperAdmin = session?.user?.role === "SUPERADMIN";

// Conditional rendering based on roles
{
    isSuperAdmin && <RoleManagementSection />;
}
```

### 2. API Route Protection

```typescript
const session = await getServerSession(authOptions);
if (
    !session?.user?.role ||
    !["ADMIN", "SUPERADMIN"].includes(session.user.role)
) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### 3. Dynamic Navigation

```typescript
href={isSuperAdmin ? "/superadmin/users" : "/admin/users"}
```

## 🎯 Best Practices Implemented

1. **Separation of Concerns** - Clear separation between admin and superadmin routes
2. **Reusable Components** - Shared AdminLayout for consistent UI
3. **Type Safety** - Full TypeScript coverage with Prisma types
4. **Error Handling** - Comprehensive error handling with user-friendly messages
5. **Security First** - Role-based access control at every level
6. **User Experience** - Responsive design with loading states and confirmations
7. **Code Reusability** - Smart component sharing between admin and superadmin

## 📈 Statistics & Monitoring

### Dashboard Metrics

-   **Total Users** (by role)
-   **Total Categories** (with usage count)
-   **Total Linktrees** (active/inactive)
-   **Total Links** (visible/hidden)

### Usage Analytics

-   **Recent user registrations**
-   **Category usage statistics**
-   **Linktree activity metrics**

## 🔮 Future Enhancements

Potential improvements that could be added:

-   **Bulk operations** for user management
-   **Advanced filtering** and sorting
-   **Export functionality** (CSV/Excel)
-   **Activity logging** and audit trail
-   **Email notifications** for user actions
-   **Advanced analytics** with charts and graphs
