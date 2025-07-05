import { redirect } from "next/navigation";

export default function SuperAdminPage() {
    // Redirect superadmin directly to articles management
    redirect("/admin/articles");
}
