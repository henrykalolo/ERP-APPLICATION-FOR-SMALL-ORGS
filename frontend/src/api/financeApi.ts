import apiClient from './client';

export interface Account {
  id: number;
  code: string;
  name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  description: string;
  parent: number | null;
  is_active: boolean;
  balance: number;
  balance_currency: string;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface AccountingPeriod {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_closed: boolean;
  closed_at: string | null;
  closed_by: number | null;
  closed_by_email: string | null;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: number;
  entry_number: string;
  date: string;
  description: string;
  status: 'draft' | 'posted' | 'cancelled';
  posted_at: string | null;
  posted_by: number | null;
  posted_by_email: string | null;
  period: number;
  period_name: string;
  lines: JournalEntryLine[];
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryLine {
  id: number;
  journal_entry: number;
  account: number;
  account_code: string;
  account_name: string;
  description: string;
  debit_amount: number;
  debit_amount_currency: string;
  credit_amount: number;
  credit_amount_currency: string;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  customer: number;
  customer_name: string;
  date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  subtotal_currency: string;
  tax_amount: number;
  tax_amount_currency: string;
  total_amount: number;
  total_amount_currency: string;
  notes: string;
  posted: boolean;
  posted_at: string | null;
  lines: InvoiceLine[];
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLine {
  id: number;
  invoice: number;
  product: number;
  product_name: string;
  product_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  unit_price_currency: string;
  line_total: number;
  line_total_currency: string;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: number;
  name: string;
  fiscal_year: number;
  status: 'draft' | 'approved' | 'active' | 'closed';
  start_date: string;
  end_date: string;
  total_budget: number;
  total_budget_currency: string;
  notes: string;
  lines: BudgetLine[];
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetLine {
  id: number;
  budget: number;
  account: number;
  account_code: string;
  account_name: string;
  amount: number;
  amount_currency: string;
  notes: string;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export const financeApi = {
  accounts: {
    list: async (params?: { account_type?: string; is_active?: string }) => {
      const response = await apiClient.get<Account[]>('/finance/accounts/', { params });
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<Account>(`/finance/accounts/${id}/`);
      return response.data;
    },
    create: async (data: Partial<Account>) => {
      const response = await apiClient.post<Account>('/finance/accounts/', data);
      return response.data;
    },
    update: async (id: number, data: Partial<Account>) => {
      const response = await apiClient.patch<Account>(`/finance/accounts/${id}/`, data);
      return response.data;
    },
    delete: async (id: number) => {
      await apiClient.delete(`/finance/accounts/${id}/`);
    },
  },

  periods: {
    list: async () => {
      const response = await apiClient.get<AccountingPeriod[]>('/finance/periods/');
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<AccountingPeriod>(`/finance/periods/${id}/`);
      return response.data;
    },
    create: async (data: Partial<AccountingPeriod>) => {
      const response = await apiClient.post<AccountingPeriod>('/finance/periods/', data);
      return response.data;
    },
    update: async (id: number, data: Partial<AccountingPeriod>) => {
      const response = await apiClient.patch<AccountingPeriod>(`/finance/periods/${id}/`, data);
      return response.data;
    },
    close: async (id: number) => {
      const response = await apiClient.post(`/finance/periods/${id}/close/`);
      return response.data;
    },
  },

  journalEntries: {
    list: async (params?: { status?: string; period?: string }) => {
      const response = await apiClient.get<JournalEntry[]>('/finance/journal-entries/', { params });
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<JournalEntry>(`/finance/journal-entries/${id}/`);
      return response.data;
    },
    create: async (data: Partial<JournalEntry>) => {
      const response = await apiClient.post<JournalEntry>('/finance/journal-entries/', data);
      return response.data;
    },
    update: async (id: number, data: Partial<JournalEntry>) => {
      const response = await apiClient.patch<JournalEntry>(`/finance/journal-entries/${id}/`, data);
      return response.data;
    },
    post: async (id: number) => {
      const response = await apiClient.post(`/finance/journal-entries/${id}/post/`);
      return response.data;
    },
    ledger: async (params?: { account?: string; date_from?: string; date_to?: string }) => {
      const response = await apiClient.get<JournalEntryLine[]>('/finance/ledger/', { params });
      return response.data;
    },
  },

  invoices: {
    list: async (params?: { status?: string; customer?: string }) => {
      const response = await apiClient.get<Invoice[]>('/finance/invoices/', { params });
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<Invoice>(`/finance/invoices/${id}/`);
      return response.data;
    },
    create: async (data: Partial<Invoice>) => {
      const response = await apiClient.post<Invoice>('/finance/invoices/', data);
      return response.data;
    },
    update: async (id: number, data: Partial<Invoice>) => {
      const response = await apiClient.patch<Invoice>(`/finance/invoices/${id}/`, data);
      return response.data;
    },
    calculate: async (id: number) => {
      const response = await apiClient.post(`/finance/invoices/${id}/calculate/`);
      return response.data;
    },
    approve: async (id: number) => {
      const response = await apiClient.post(`/finance/invoices/${id}/approve/`);
      return response.data;
    },
    postToLedger: async (id: number) => {
      const response = await apiClient.post(`/finance/invoices/${id}/post_to_ledger/`);
      return response.data;
    },
  },

  budgets: {
    list: async (params?: { fiscal_year?: string; status?: string }) => {
      const response = await apiClient.get<Budget[]>('/finance/budgets/', { params });
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<Budget>(`/finance/budgets/${id}/`);
      return response.data;
    },
    create: async (data: Partial<Budget>) => {
      const response = await apiClient.post<Budget>('/finance/budgets/', data);
      return response.data;
    },
    update: async (id: number, data: Partial<Budget>) => {
      const response = await apiClient.patch<Budget>(`/finance/budgets/${id}/`, data);
      return response.data;
    },
  },
};
