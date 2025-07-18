// src/utility/intuit-report-utility.ts

import axios from "axios";
import moment from "moment";
import { stringify } from "querystring";

// const QB_API_BASE = "https://quickbooks.api.intuit.com/v3/company";
const QB_API_BASE = "https://sandbox-quickbooks.api.intuit.com/v3/company";

export interface ReportOptions {
  accessToken: string;
  realmId: string;
  start_date: string;
  end_date: string;
  accountingMethod?: "Accrual" | "Cash";
  displayColumns?: string;
  compareTo?: "PriorYear" | "PriorPeriod";
  summarize_column_by?: 'ProductsAndServices' | 'Month'
}

type ReponseData = { amount: number; [key: string]: unknown };
const makeReportRequest = async (
  reportName: string,
  { accessToken, realmId, ...query }: ReportOptions,
): Promise<any> => {
  const url = `${QB_API_BASE}/${realmId}/reports/${reportName}`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    params: query,
  });

  return response.data;
};

export const getProfitAndLossReport = async (opts: ReportOptions) => {
  return await makeReportRequest("ProfitAndLoss", opts);
};

export const getSalesByProductServiceSummary = async (opts: ReportOptions) => {
  return await makeReportRequest("SalesByProductServiceSummary", opts);
};

const extractValueFromRow = (report: any, label: string): number => {
  const rows = report?.Rows?.Row ?? [];
  const row = rows.find((r: any) => r.Summary?.ColData?.[0]?.value === label);
  return parseFloat(row?.Summary?.ColData?.[1]?.value || "0");
};

export const getFinancialOverview = async (
  accessToken: string,
  realmId: string,
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
    }),
    getProfitAndLossReport({
      accessToken,
      realmId,
      start_date: startOfYear,
      end_date:endDate,
    }),
    getProfitAndLossReport({
      accessToken,
      realmId,
      start_date: lastMonthStart,
      end_date: lastMonthEnd,
    }),
    getProfitAndLossReport({
      accessToken,
      realmId,
      start_date: lastYearStart,
      end_date: lastYearEnd,
    }),
  ]);

  const revenueThisMonth = extractValueFromRow(thisMonth, "Total Income");
  const revenueThisYear = extractValueFromRow(thisYear, "Total Income");
  const revenueLastMonth = extractValueFromRow(lastMonth, "Total Income");
  const revenueLastYear = extractValueFromRow(lastYear, "Total Income");

  const expensesThisMonth = extractValueFromRow(thisMonth, "Total Expenses");
  const expensesThisYear = extractValueFromRow(thisYear, "Total Expenses");
  const expensesLastMonth = extractValueFromRow(lastMonth, "Total Expenses");

  const netProfitThisMonth = revenueThisMonth - expensesThisMonth;
  const netProfitLastMonth = revenueLastMonth - expensesLastMonth;
  const netProfitYTD = revenueThisYear - expensesThisYear;

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
      top5Categories: await getTopExpenses(accessToken, realmId),
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
) => {
  const today = moment();
  const startOfYear = moment().startOf("year").format("YYYY-MM-DD");
  const endDate = moment().format("YYYY-MM-DD");

  const report = await getSalesByProductServiceSummary({
    accessToken,
    realmId,
    start_date: startOfYear,
    end_date: endDate,
    summarize_column_by: 'ProductsAndServices'
  });

  return (report?.Rows?.Row ?? [])
    .filter((r: any) => r.ColData)
    .map((r: any) => ({
      name: r.ColData[0]?.value,
      amount: parseFloat(r.ColData[1]?.value || "0"),
    }))
    .sort((a: ReponseData, b: ReponseData) => b.amount - a.amount)
    .slice(0, 5);
};

export const getTopExpenses = async (accessToken: string, realmId: string) => {
  const today = moment();
  const startOfYear = moment().startOf("year").format("YYYY-MM-DD");
  const endDate = moment().format("YYYY-MM-DD");

  const report = await getProfitAndLossReport({
    accessToken,
    realmId,
    start_date: startOfYear,
    end_date: endDate,
    summarize_column_by: 'ProductsAndServices'
  });

  const rows = report?.Rows?.Row ?? [];
  return rows
    .filter(
      (r: any) =>
        r.Summary?.ColData?.[0]?.value?.startsWith("Total ") &&
        r.Summary?.ColData?.[0]?.value !== "Total Income" &&
        r.Summary?.ColData?.[0]?.value !== "Total Expenses",
    )
    .map((r: any) => ({
      name: r.Summary.ColData[0].value.replace("Total ", ""),
      amount: parseFloat(r.Summary.ColData[1]?.value || "0"),
    }))
    .sort((a: ReponseData, b: ReponseData) => b.amount - a.amount)
    .slice(0, 5);
};

export const getMonthlyRevenueAndExpensesTrend = async (
  accessToken: string,
  realmId: string,
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
  });

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
