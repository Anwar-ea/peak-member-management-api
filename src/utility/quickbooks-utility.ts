// src/utility/intuit-report-utility.ts

import axios from "axios";
import moment from "moment";
import { CompanyInfo, IntuitUserProfile, QBProfitLossResponse, QBRow, QBRowType } from "../models";

const QB_API_BASE = "https://quickbooks.api.intuit.com/v3/company";
const QB_SANDBOX_API_BASE = "https://sandbox-quickbooks.api.intuit.com/v3/company";
const INTUIT_OPENID_BASE = "https://sandbox-accounts.platform.intuit.com/v1/openid_connect";
const INTUIT_SANDBOX_OPENID_BASE = "https://sandbox-accounts.platform.intuit.com/v1/openid_connect";

export interface ReportOptions {
  accessToken: string;
  realmId: string;
  start_date: string;
  end_date: string;
  accounting_method?: "Accrual" | "Cash";
  displayColumns?: string;
  compareTo?: "PriorYear" | "PriorPeriod";
  summarize_column_by?: "Total" | "Month" | "Week" | "Days" | "Quarter" | "Year" | "Customers" | "Vendors" | "Classes" | "Departments" | "Employees" | "ProductsAndServices"
  summarize_by?: "Total" | "Month" | "Week" | "Days" | "Quarter" | "Year" | "Customers" | "Vendors" | "Classes" | "Departments" | "Employees" | "ProductsAndServices"
}

type ReponseData = { amount: number; [key: string]: unknown };

const makeReportRequest = async (
  reportName: string,
  { accessToken, realmId, ...query }: ReportOptions,
  env: 'sandbox' | 'production'
): Promise<QBProfitLossResponse> => {
  const url = `${env === 'sandbox' ? QB_SANDBOX_API_BASE : QB_API_BASE}/${realmId}/reports/${reportName}`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    params: query,
  });

  return response.data;
};

/**
 * Get user profile information from Intuit OpenID Connect
 */
export const getUserProfile = async (accessToken: string, env: 'sandbox' | 'production'): Promise<IntuitUserProfile> => {
  try {
    const response = await axios.get(`${env === 'sandbox' ? INTUIT_SANDBOX_OPENID_BASE : INTUIT_OPENID_BASE}/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile from Intuit");
  }
};

/**
 * Get company information from QuickBooks API
 */
export const getCompanyInfo = async (
  accessToken: string,
  realmId: string,
  env: 'sandbox' | 'production'
): Promise<CompanyInfo> => {
  try {
    const url = `${env === 'sandbox' ? QB_SANDBOX_API_BASE : QB_API_BASE}/${realmId}/companyinfo/${realmId}`;
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching company info:", error);
    throw new Error("Failed to fetch company information from QuickBooks");
  }
};

export const getProfitAndLossReport = async (opts: ReportOptions, env: 'sandbox' | 'production') => {
  return await makeReportRequest("ProfitAndLoss", opts, env);
};

export const getSalesByProductServiceSummary = async (opts: ReportOptions, env: 'sandbox' | 'production') => {
  return await makeReportRequest("ItemSales", opts, env);
};

const extractValueFromRow = (report: QBProfitLossResponse, label?: string, labels?: Array<string>): number => {
  const rows = report?.Rows?.Row ?? [];
  let value = 0.0;
  if(label){
    const row = rows.find((r: any) => r.Summary?.ColData?.[0]?.value === label);
    value = parseFloat(row?.Summary?.ColData?.[1]?.value || "0");
  }
  if(labels){
    const rowsFiltered = rows.filter(x => labels.some(y => x.Summary?.ColData?.[0]?.value.toLowerCase().includes(y.toLocaleLowerCase())));
    value = rowsFiltered.reduce<number>((acc, el) => acc+=parseFloat(el.Summary?.ColData?.[1]?.value || "0"), value)
  }
  return value;
};

export const getFinancialOverview = async (
  accessToken: string,
  realmId: string,
  env: 'sandbox' | 'production'
) => {
  const today = moment();
  const startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
  const startOfYear = moment().startOf("year").format("YYYY-MM-DD");
  const lastMonthStart = moment()
    .subtract(1, "month")
    .startOf("month")
    .format("YYYY-MM-DD");
  const lastMonthEnd = moment()
    .subtract(1, "month")
    .endOf("month")
    .format("YYYY-MM-DD");
  const lastYearStart = moment()
    .subtract(1, "year")
    .startOf("year")
    .format("YYYY-MM-DD");
  const lastYearEnd = moment()
    .subtract(1, "year")
    .endOf("year")
    .format("YYYY-MM-DD");
  const endDate = moment().format("YYYY-MM-DD");

  const [thisMonth, thisYear, lastMonth, lastYear] = await Promise.all([
    getProfitAndLossReport({
      accessToken,
      realmId,
      start_date: startOfMonth,
      end_date: endDate,
    }, env),
    getProfitAndLossReport({
      accessToken,
      realmId,
      start_date: startOfYear,
      end_date:endDate,
    }, env),
    getProfitAndLossReport({
      accessToken,
      realmId,
      start_date: lastMonthStart,
      end_date: lastMonthEnd,
    }, env),
    getProfitAndLossReport({
      accessToken,
      realmId,
      start_date: lastYearStart,
      end_date: lastYearEnd,
    }, env),
  ]);

  const revenueThisMonth = extractValueFromRow(thisMonth, "Total Income");
  const revenueThisYear = extractValueFromRow(thisYear, "Total Income");
  const revenueLastMonth = extractValueFromRow(lastMonth, "Total Income");
  const revenueLastYear = extractValueFromRow(lastYear, "Total Income");

  const expensesThisMonth = extractValueFromRow(thisMonth, undefined, ['expenses', 'cost of goods']);
  const expensesThisYear = extractValueFromRow(thisYear, undefined, ['expenses', 'cost of goods']);
  const expensesLastMonth = extractValueFromRow(lastMonth, undefined, ['expenses', 'cost of goods']);

  const netProfitThisMonth = revenueThisMonth - expensesThisMonth;
  const netProfitLastMonth = revenueLastMonth - expensesLastMonth;
  const netProfitYTD = revenueThisYear - expensesThisYear;
  const topExpensesGroups =  await getTopExpenses(accessToken, realmId, env);
  const totalExpenses = topExpensesGroups.reduce<number>((acc, el) => acc += el.amount, 0)
  const top4Expenses: Array<{name: string, amount:number}> = topExpensesGroups.reduce<Array<{name: string, amount:number}>>((acc, el) => {
    if(el.name.toLowerCase().includes('expense')){
      const summaries = el.rows.filter(x => (x.Header && x.Summary)).map(x => ({name: x.Summary!.ColData[0].value.replace("Total ", ""),
      amount: parseFloat(x.Summary!.ColData[1]?.value || "0"),}));
        acc = [...acc, ...summaries]
        if(el.rows.length === 1) acc = [...acc, {name: el.rows[0].ColData![0].value, amount: parseFloat(el.rows[0].ColData![1].value ||'0')}]
    }
    return acc;
  }, []).sort((a, b)=> b.amount - a.amount).slice(0,4);
  const topExpenses: Array<{name: string, amount:number}> = [...top4Expenses, {name: 'Others', amount: totalExpenses - top4Expenses.reduce<number>((acc, el) => acc += el.amount, 0)}];

  return {
    revenue: {
      total: revenueThisYear,
      thisMonth: revenueThisMonth,
      thisYear: revenueThisYear,
      compareLastMonth: revenueThisMonth - revenueLastMonth,
      compareLastYear: revenueThisYear - revenueLastYear,
    },
    expenses: {
      total: expensesThisYear,
      thisMonth: expensesThisMonth,
      thisYear: expensesThisYear,
      top5Categories: topExpenses,
      compareLastMonth: expensesThisMonth - expensesLastMonth,
    },
    netProfit: {
      thisMonth: netProfitThisMonth,
      lastMonth: netProfitLastMonth,
      thisYear: netProfitYTD,
      compareLastMonth: netProfitThisMonth - netProfitLastMonth,
    },
  };
};

export const getTopIncomeSources = async (
  accessToken: string,
  realmId: string,
  env: 'sandbox' | 'production'
) => {
  const today = moment();
  const startOfYear = moment().startOf("year").format("YYYY-MM-DD");
  const endDate = moment().format("YYYY-MM-DD");

  const report = await getSalesByProductServiceSummary({
    accessToken,
    realmId,
    start_date: startOfYear,
    end_date: endDate,
    summarize_column_by: 'Total',
  }, env);
  // const pathofFile = path.join(process.cwd(),"sampledata", `items-sales-(${new Date().toISOString().split("T")[0]}).json`)
  // await writeFile(pathofFile, JSON.stringify(report, undefined, 2))
  return (report?.Rows?.Row ?? [])
    .filter((r) => r.ColData)
    .map((r) => ({
      name: r.ColData![0]?.value,
      amount: parseFloat(r.ColData![2]?.value || "0"),
      percent: parseFloat(r.ColData![3]?.value.replaceAll(' %','') || "0")
    })).filter(x => x.name.toLowerCase() !== 'total')
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 5);
};

export const getTopExpenses = async (accessToken: string, realmId: string, env: 'sandbox' | 'production') => {
  const today = moment();
  const startOfYear = moment().startOf("year").format("YYYY-MM-DD");
  const endDate = moment().format("YYYY-MM-DD");

  const report = await getProfitAndLossReport({
    accessToken,
    realmId,
    start_date: startOfYear,
    end_date: endDate,
    accounting_method: 'Accrual',
    summarize_column_by: undefined
  }, env);
  const rows = report?.Rows?.Row ?? [];
  // const pathofFile = path.join(process.cwd(),"sampledata", `${new Date().toISOString().split("T")[0]}.json`)
  // await writeFile(pathofFile, JSON.stringify(report, undefined, 2))
  return rows
    .filter(
      (r) =>
        ['expenses', 'cogs'].some(x => r.group ? r.group.toLowerCase().includes(x) : false) 
    )
    .map((r) => ({
      name: r.Summary!.ColData[0].value.replace("Total ", ""),
      amount: parseFloat(r.Summary!.ColData[1]?.value || "0"),
      rows: r.Rows?.Row ?? [] as QBRow<QBRowType>[]
    }))
    .sort((a: ReponseData, b: ReponseData) => b.amount - a.amount)
    .slice(0, 5);
};

export const getMonthlyRevenueAndExpensesTrend = async (
  accessToken: string,
  realmId: string,
  env: 'sandbox' | 'production'
) => {
  const end = moment();
  const start = moment().subtract(12, "month").startOf("month");

  const report = await getProfitAndLossReport({
    accessToken,
    realmId,
    start_date: start.format("YYYY-MM-DD"),
    end_date: end.format("YYYY-MM-DD"),
    displayColumns: "Month",
    summarize_column_by: 'Month'
  }, env);

  const rows = report?.Rows?.Row ?? [];
  const months: string[] = report?.Columns?.Column?.slice(1).map(
    (col: any) => col.ColTitle,
  );

  const trend: { month: string; revenue: number; expenses: number }[] =
    months.map((month) => ({
      month,
      revenue: 0,
      expenses: 0,
    }));

  for (const row of rows) {
    if (row.Summary?.ColData?.[0]?.value === "Total Income") {
      row.Summary.ColData.slice(1).forEach((col: any, idx: number) => {
        trend[idx].revenue = parseFloat(col.value || "0");
      });
    }
    if (row.Summary?.ColData?.[0]?.value === "Total Expenses") {
      row.Summary.ColData.slice(1).forEach((col: any, idx: number) => {
        trend[idx].expenses = parseFloat(col.value || "0");
      });
    }
  }

  return trend;
};
