import { Measurable } from "../entities";

export const Modules = ["Users", "Roles", "To-Dos", "Goals", "Bussiness Plan", "Revenue", "Admin", "Notifications"] as const;


export const modulePrivilages: Record<string, Array<string>> = {
    "ToDos": ["Add", "Update", "Delete", "Get"],
    "Goals": ["Add", "Update", "Delete", "Get"],
    "Measurables": ["Add", "Update", "Delete", "Get"],
    "Revenue": ["Add", "Update", "Delete", "Get"],
    "Retention": ["Add", "Update", "Delete", "Get"],
    "Bussiness Plan": [
        "Manage",
    ],
    "Admin": [
        "Manage Users",
        "Manage Roles",
        "Manage To-Dos",
        "Manage Goals",
        "Manage Measurables",
        "Manage Notifications",
        "Manage Retention Rate",
        "Manage Revenue",
        "See All Score Cards"
    ],
    "Score Card": [
        'See Revenue',
        'See Retention',
    ],
    "Dashboard": [
        "Member Login",
        "Goals",
        "To-Dos",
        "Call Notes",
        "Total Report"
    ],
} as const;