import { Measurable } from "../entities";

export const Modules = ["Users", "Roles", "To-Dos", "Goals", "Bussiness Plan", "Revenue", "Admin", "Notifications", "Law Firm"] as const;


export const modulePrivilages: Record<string, Array<string>> = {
    "ToDos": ["Add", "Update", "Delete", "Get"],
    "Goals": ["Add", "Update", "Delete", "Get"],
    "Measurables": ["Add", "Update", "Delete", "Get", "Can See Revenue Data"],
    "Revenue": ["Add", "Update", "Delete", "Get"],
    "Retention": ["Add", "Update", "Delete", "Get"],
    "Call Note": ["Add", "Update", "Delete", "Get"],
    "Law Firm": ["Add", "Update", "Delete", "Get"],
    "Strategic Planning": ["View"],
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
        "See All Score Cards",
        "Manage Law Firms",
        "Manage Strategic Planning"
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
        "Total Report",
        "Law Firm Relative Data"
    ],
    "Intuit":[
        "Quick Books"
    ]
} as const;