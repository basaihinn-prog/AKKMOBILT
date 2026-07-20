import { Express } from 'express';
import { ProductService } from './services/ProductService';
import { SalesService } from './services/SalesService';
import { RepairService } from './services/RepairService';
import { CustomerService } from './services/CustomerService';
import { InventoryService } from './services/InventoryService';
import { PurchaseService } from './services/PurchaseService';
import { AccountingService } from './services/AccountingService';
import { IMEIService } from './services/IMEIService';

export function setupDatabaseRoutes(app: Express) {
  // ==========================================
  // PRODUCTS API
  // ==========================================
  app.get('/api/products', (req, res) => {
    try {
      const products = ProductService.getAll();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/products', (req, res) => {
    try {
      const { sku, name, categoryId, brandId, modelId, description, costPrice, sellingPrice, stockQuantity, minStock, maxStock, unit } = req.body;
      const product = ProductService.create({
        sku, name, categoryId, brandId, modelId, description, costPrice, sellingPrice, stockQuantity, minStock, maxStock, unit
      });
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/products/:id', (req, res) => {
    try {
      const product = ProductService.getById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put('/api/products/:id', (req, res) => {
    try {
      const product = ProductService.update(req.params.id, req.body);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/products/:id/adjust-stock', (req, res) => {
    try {
      const { quantity, reason } = req.body;
      const product = ProductService.adjustStock(req.params.id, quantity, reason);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/products/low-stock', (req, res) => {
    try {
      const products = ProductService.getLowStockProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // ==========================================
  // SALES (POS) API
  // ==========================================
  app.post('/api/sales', (req, res) => {
    try {
      const { branchId, cashierId, customerId, saleDate, totalAmount, subtotal, taxAmount, discountAmount, paymentMethod, items, notes } = req.body;
      const sale = SalesService.create({ branchId, cashierId, customerId, saleDate, totalAmount, subtotal, taxAmount, discountAmount, paymentMethod, notes });
      
      if (items && Array.isArray(items)) {
        for (const item of items) {
          SalesService.addItem(sale.id, item);
        }
      }
      
      res.status(201).json(SalesService.getById(sale.id));
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/sales/:id', (req, res) => {
    try {
      const sale = SalesService.getById(req.params.id);
      if (!sale) return res.status(404).json({ error: 'Sale not found' });
      res.json(sale);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/sales/branch/:branchId', (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const sales = SalesService.getByBranch(req.params.branchId, startDate as string, endDate as string);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/sales/daily/:branchId/:date', (req, res) => {
    try {
      const report = SalesService.calculateDailySales(req.params.branchId, req.params.date);
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // ==========================================
  // REPAIRS API
  // ==========================================
  app.post('/api/repairs', (req, res) => {
    try {
      const repair = RepairService.create(req.body);
      res.status(201).json(repair);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/repairs/:id', (req, res) => {
    try {
      const repair = RepairService.getById(req.params.id);
      if (!repair) return res.status(404).json({ error: 'Repair not found' });
      res.json(repair);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/repairs/branch/:branchId', (req, res) => {
    try {
      const { status } = req.query;
      const repairs = RepairService.getByBranch(req.params.branchId, status as string);
      res.json(repairs);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put('/api/repairs/:id/status', (req, res) => {
    try {
      const { status, notes } = req.body;
      const repair = RepairService.updateStatus(req.params.id, status, notes);
      res.json(repair);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/repairs/:id/service', (req, res) => {
    try {
      const { serviceName, cost } = req.body;
      const service = RepairService.addService(req.params.id, serviceName, cost);
      res.status(201).json(service);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/repairs/pending', (req, res) => {
    try {
      const repairs = RepairService.getPendingRepairs();
      res.json(repairs);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // ==========================================
  // CUSTOMERS API
  // ==========================================
  app.post('/api/customers', (req, res) => {
    try {
      const customer = CustomerService.create(req.body);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/customers/:id', (req, res) => {
    try {
      const customer = CustomerService.getById(req.params.id);
      if (!customer) return res.status(404).json({ error: 'Customer not found' });
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/customers', (req, res) => {
    try {
      const customers = CustomerService.getAll();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put('/api/customers/:id', (req, res) => {
    try {
      const customer = CustomerService.update(req.params.id, req.body);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/customers/:id/loyalty/:points', (req, res) => {
    try {
      const customer = CustomerService.addLoyaltyPoints(req.params.id, parseInt(req.params.points));
      res.json(customer);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/customers/search/:name', (req, res) => {
    try {
      const customers = CustomerService.searchByName(req.params.name);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/customers/phone/:phone', (req, res) => {
    try {
      const customer = CustomerService.searchByPhone(req.params.phone);
      if (!customer) return res.status(404).json({ error: 'Customer not found' });
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // ==========================================
  // INVENTORY TRANSFER API
  // ==========================================
  app.post('/api/transfers', (req, res) => {
    try {
      const transfer = InventoryService.createTransfer(req.body);
      
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          InventoryService.addTransferItem(transfer.id, item.productId, item.quantity);
        }
      }
      
      res.status(201).json(InventoryService.getTransferById(transfer.id));
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/transfers/:id', (req, res) => {
    try {
      const transfer = InventoryService.getTransferById(req.params.id);
      if (!transfer) return res.status(404).json({ error: 'Transfer not found' });
      res.json(transfer);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/transfers/pending', (req, res) => {
    try {
      const transfers = InventoryService.getPendingTransfers();
      res.json(transfers);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/transfers/:id/confirm', (req, res) => {
    try {
      const transfer = InventoryService.confirmTransfer(req.params.id);
      res.json(transfer);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // ==========================================
  // PURCHASES API
  // ==========================================
  app.post('/api/purchases', (req, res) => {
    try {
      const purchase = PurchaseService.create(req.body);
      
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          PurchaseService.addItem(purchase.id, item);
        }
      }
      
      res.status(201).json(PurchaseService.getById(purchase.id));
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/purchases/:id', (req, res) => {
    try {
      const purchase = PurchaseService.getById(req.params.id);
      if (!purchase) return res.status(404).json({ error: 'Purchase not found' });
      res.json(purchase);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/purchases/:id/receive', (req, res) => {
    try {
      const purchase = PurchaseService.receivePurchase(req.params.id);
      res.json(purchase);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/purchases/pending', (req, res) => {
    try {
      const purchases = PurchaseService.getPendingPurchases();
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // ==========================================
  // ACCOUNTING API
  // ==========================================
  app.post('/api/expenses', (req, res) => {
    try {
      const expense = AccountingService.recordExpense(req.body);
      res.status(201).json(expense);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/expenses/branch/:branchId', (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const expenses = AccountingService.getExpensesByBranch(req.params.branchId, startDate as string, endDate as string);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/reports/daily/:branchId/:date', (req, res) => {
    try {
      const report = AccountingService.getDailyReport(req.params.branchId, req.params.date);
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/reports/monthly/:branchId/:month/:year', (req, res) => {
    try {
      const report = AccountingService.getMonthlyReport(req.params.branchId, req.params.month, parseInt(req.params.year));
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // ==========================================
  // IMEI API
  // ==========================================
  app.post('/api/imei/register', (req, res) => {
    try {
      const record = IMEIService.register(req.body);
      res.status(201).json(record);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/imei/:imei', (req, res) => {
    try {
      const record = IMEIService.getByIMEI(req.params.imei);
      if (!record) return res.status(404).json({ error: 'IMEI not found' });
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/imei/:imei/status', (req, res) => {
    try {
      const { status, saleDate, customerId, supplierId } = req.body;
      const record = IMEIService.updateStatus(req.params.imei, status, { saleDate, customerId, supplierId });
      res.json(record);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/imei/:imei/warranty', (req, res) => {
    try {
      const warranty = IMEIService.trackWarranty(req.params.imei);
      res.json(warranty);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
}
