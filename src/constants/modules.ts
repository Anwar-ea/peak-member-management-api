import { Measurable } from "../entities";

export const Modules = ["Users", "Roles", "To-Dos", "Goals", "Bussiness Plan", "Revenue", "Admin", "Notifications"] as const;


export const modulePrivilages: Record<string, Array<string>> = {
    "ToDos": ["Add", "Update", "Delete", "Get"],
    "Goals": ["Add", "Update", "Delete", "Get"],
    "Measurables": ["Add", "Update", "Delete", "Get"],
    "Admin": [
        "Manage Users",
        "Manage Roles",
        "Manage To-Dos",
        "Manage Goals",
        "Manage Measurables",
        "Manage Bussiness Plan",
        "Manage Notifications",
        "Manage Retention Rate"
    ],
} as const;