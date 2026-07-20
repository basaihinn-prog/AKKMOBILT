const API_BASE = '/api';

export class APIClient {
  private static async request<T>(method: string, path: string, data?: unknown): Promise<T> {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (data) options.body = JSON.stringify(data);

    try {
      const response = await fetch(`${API_BASE}${path}`, options);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Products
  static getProducts() {
    return this.request<any>('GET', '/products');
  }

  static getProduct(id: string) {
    return this.request<any>('GET', `/products/${id}`);
  }

  static createProduct(data: unknown) {
    return this.request<any>('POST', '/products', data);
  }

  static updateProduct(id: string, data: unknown) {
    return this.request<any>('PUT', `/products/${id}`, data);
  }

  static adjustStock(id: string, quantity: number, reason: string) {
    return this.request<any>('POST', `/products/${id}/adjust-stock`, { quantity, reason });
  }

  // Sales
  static createSale(data: unknown) {
    return this.request<any>('POST', '/sales', data);
  }

  static getSale(id: string) {
    return this.request<any>('GET', `/sales/${id}`);
  }

  static getBranchSales(branchId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return this.request<any>('GET', `/sales/branch/${branchId}?${params}`);
  }

  static getDailySalesReport(branchId: string, date: string) {
    return this.request<any>('GET', `/sales/daily/${branchId}/${date}`);
  }

  // Repairs
  static createRepair(data: unknown) {
    return this.request<any>('POST', '/repairs', data);
  }

  static getRepair(id: string) {
    return this.request<any>('GET', `/repairs/${id}`);
  }

  static getBranchRepairs(branchId: string, status?: string) {
    const path = status ? `/repairs/branch/${branchId}?status=${status}` : `/repairs/branch/${branchId}`;
    return this.request<any>('GET', path);
  }

  static updateRepairStatus(id: string, status: string, notes?: string) {
    return this.request<any>('PUT', `/repairs/${id}/status`, { status, notes });
  }

  static addRepairService(id: string, serviceName: string, cost: number) {
    return this.request<any>('POST', `/repairs/${id}/service`, { serviceName, cost });
  }

  static getPendingRepairs() {
    return this.request<any>('GET', '/repairs/pending');
  }

  // Customers
  static createCustomer(data: unknown) {
    return this.request<any>('POST', '/customers', data);
  }

  static getCustomer(id: string) {
    return this.request<any>('GET', `/customers/${id}`);
  }

  static getAllCustomers() {
    return this.request<any>('GET', '/customers');
  }

  static updateCustomer(id: string, data: unknown) {
    return this.request<any>('PUT', `/customers/${id}`, data);
  }

  static addLoyaltyPoints(id: string, points: number) {
    return this.request<any>('POST', `/customers/${id}/loyalty/${points}`);
  }

  static searchCustomers(name: string) {
    return this.request<any>('GET', `/customers/search/${encodeURIComponent(name)}`);
  }

  static getCustomerByPhone(phone: string) {
    return this.request<any>('GET', `/customers/phone/${encodeURIComponent(phone)}`);
  }

  // Transfers
  static createTransfer(data: unknown) {
    return this.request<any>('POST', '/transfers', data);
  }

  static getTransfer(id: string) {
    return this.request<any>('GET', `/transfers/${id}`);
  }

  static getPendingTransfers() {
    return this.request<any>('GET', '/transfers/pending');
  }

  static confirmTransfer(id: string) {
    return this.request<any>('POST', `/transfers/${id}/confirm`);
  }

  // Purchases
  static createPurchase(data: unknown) {
    return this.request<any>('POST', '/purchases', data);
  }

  static getPurchase(id: string) {
    return this.request<any>('GET', `/purchases/${id}`);
  }

  static receivePurchase(id: string) {
    return this.request<any>('POST', `/purchases/${id}/receive`);
  }

  static getPendingPurchases() {
    return this.request<any>('GET', '/purchases/pending');
  }

  // Accounting
  static recordExpense(data: unknown) {
    return this.request<any>('POST', '/expenses', data);
  }

  static getBranchExpenses(branchId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return this.request<any>('GET', `/expenses/branch/${branchId}?${params}`);
  }

  static getDailyReport(branchId: string, date: string) {
    return this.request<any>('GET', `/reports/daily/${branchId}/${date}`);
  }

  static getMonthlyReport(branchId: string, month: string, year: number) {
    return this.request<any>('GET', `/reports/monthly/${branchId}/${month}/${year}`);
  }

  // IMEI
  static registerIMEI(data: unknown) {
    return this.request<any>('POST', '/imei/register', data);
  }

  static getIMEI(imei: string) {
    return this.request<any>('GET', `/imei/${encodeURIComponent(imei)}`);
  }

  static updateIMEIStatus(imei: string, status: string, updates?: unknown) {
    return this.request<any>('POST', `/imei/${encodeURIComponent(imei)}/status`, { status, ...updates });
  }

  static getWarranty(imei: string) {
    return this.request<any>('GET', `/imei/${encodeURIComponent(imei)}/warranty`);
  }
}
