import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db/store.js';
import {
  Customer,
  Product,
  PhysicalInventoryItem,
  Booking,
  AlterationTask,
  ReturnRecord,
  SalesOrder,
  PaymentRecord,
  Expense,
  Supplier,
  StaffMember,
  AuditLog,
  StoreSettings,
} from './src/types/index.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Log API requests in development
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // =====================
  // API ROUTES
  // =====================

  // Health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Current Auth / User simulation
  app.get('/api/auth/me', (req, res) => {
    res.json({
      user: {
        id: 'usr-admin-01',
        name: 'Manojbhai Patel',
        email: 'manoj.patel@vastraveda.in',
        role: 'Admin',
        phone: '+91 98251 00223',
        active: true,
      },
    });
  });

  // Categories
  app.get('/api/categories', (req, res) => {
    res.json({ success: true, data: db.categories });
  });

  app.post('/api/categories', (req, res) => {
    const newCat = {
      id: `cat-${Date.now()}`,
      name: req.body.name,
      gender: req.body.gender || 'unisex',
      subcategories: req.body.subcategories || [],
      isCustom: true,
    };
    db.categories.push(newCat);
    res.status(201).json({ success: true, data: newCat });
  });

  // Products
  app.get('/api/products', (req, res) => {
    const { category, gender, search, type } = req.query;
    let list = [...db.products];

    if (category && category !== 'all') {
      list = list.filter((p) => p.category.toLowerCase() === String(category).toLowerCase());
    }
    if (gender && gender !== 'all') {
      list = list.filter((p) => p.gender === gender);
    }
    if (type && type !== 'all') {
      list = list.filter((p) => p.type === type || p.type === 'both');
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.designer.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q)
      );
    }

    // Attach inventory count to each product for fast UI badge rendering
    const enhanced = list.map((prod) => {
      const items = db.inventoryItems.filter((i) => i.productId === prod.id);
      const availableItems = items.filter((i) => i.status === 'Available');
      return {
        ...prod,
        totalItems: items.length,
        availableCount: availableItems.length,
        physicalItems: items,
      };
    });

    res.json({ success: true, data: enhanced });
  });

  app.get('/api/products/:id', (req, res) => {
    const product = db.products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const items = db.inventoryItems.filter((i) => i.productId === product.id);
    const relatedBookings = db.bookings.filter((b) => b.items.some((bi) => bi.productId === product.id));

    res.json({
      success: true,
      data: {
        ...product,
        physicalItems: items,
        bookingsHistory: relatedBookings,
      },
    });
  });

  app.post('/api/products', (req, res) => {
    const id = `prod-${Date.now().toString().slice(-4)}`;
    const product = {
      id,
      sku: req.body.sku || `SKU-${Date.now().toString().slice(-4)}`,
      name: req.body.name,
      category: req.body.category,
      subcategory: req.body.subcategory || '',
      gender: req.body.gender || 'men',
      brand: req.body.brand || 'VastraVeda Atelier',
      designer: req.body.designer || 'Bespoke In-House',
      color: req.body.color || 'Royal Classic',
      fabric: req.body.fabric || 'Silk',
      sizes: req.body.sizes || ['38', '40', '42'],
      style: req.body.style || 'Classic Indian Wedding',
      description: req.body.description || '',
      images:
        req.body.images && req.body.images.length > 0
          ? req.body.images
          : ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'],
      purchasePrice: Number(req.body.purchasePrice) || 0,
      sellingPrice: Number(req.body.sellingPrice) || 0,
      rentalPrice: Number(req.body.rentalPrice) || 0,
      securityDeposit: Number(req.body.securityDeposit) || 0,
      type: req.body.type || 'rental',
      condition: 'Pristine Luxury',
      location: req.body.location || 'Main Showroom',
      supplierId: req.body.supplierId || '',
      createdDate: new Date().toISOString().split('T')[0],
      featured: Boolean(req.body.featured),
      tags: req.body.tags || [],
    };

    db.products.unshift(product);

    // Auto-create initial physical inventory items if sizes provided
    if (req.body.initialInventory && Array.isArray(req.body.initialInventory)) {
      req.body.initialInventory.forEach((itemDef: any, idx: number) => {
        const itemId = `${product.sku.slice(0, 2)}${String(db.inventoryItems.length + 1 + idx).padStart(3, '0')}`;
        db.inventoryItems.push({
          id: itemId,
          productId: product.id,
          sku: `${product.sku}-${itemDef.size}`,
          barcode: `890${Date.now().toString().slice(-9)}${idx}`,
          size: itemDef.size,
          color: product.color,
          condition: 'Excellent',
          status: 'Available',
          currentLocation: itemDef.location || product.location,
          rentalCount: 0,
          totalRevenue: 0,
          cleaningCount: 0,
          repairsCount: 0,
          notes: 'Freshly stocked inventory piece.',
        });
      });
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN'),
      user: 'Admin',
      action: 'Created Product',
      target: product.sku,
      details: `Added new wedding garment "${product.name}"`,
    });

    res.status(201).json({ success: true, data: product });
  });

  app.put('/api/products/:id', (req, res) => {
    const index = db.products.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    db.products[index] = { ...db.products[index], ...req.body };
    res.json({ success: true, data: db.products[index] });
  });

  app.delete('/api/products/:id', (req, res) => {
    db.products = db.products.filter((p) => p.id !== req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  });

  // Physical Inventory Items
  app.get('/api/inventory', (req, res) => {
    const { productId, status, size, search } = req.query;
    let list = [...db.inventoryItems];

    if (productId) {
      list = list.filter((i) => i.productId === productId);
    }
    if (status && status !== 'all') {
      const st = String(status).toLowerCase();
      list = list.filter((i) => i.status.toLowerCase() === st);
    }
    if (size && size !== 'all') {
      list = list.filter((i) => i.size === size);
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.barcode.includes(q) ||
          i.currentLocation.toLowerCase().includes(q)
      );
    }

    // Attach product title & images
    const enhanced = list.map((item) => {
      const prod = db.products.find((p) => p.id === item.productId);
      return {
        ...item,
        productName: prod ? prod.name : 'Unknown Product',
        productCategory: prod ? prod.category : '',
        productGender: prod ? prod.gender : '',
        rentalPrice: prod ? prod.rentalPrice : 0,
        securityDeposit: prod ? prod.securityDeposit : 0,
        productImage: prod && prod.images.length > 0 ? prod.images[0] : '',
      };
    });

    res.json({ success: true, data: enhanced });
  });

  app.post('/api/inventory', (req, res) => {
    const product = db.products.find((p) => p.id === req.body.productId);
    if (!product) {
      return res.status(400).json({ success: false, message: 'Valid productId is required' });
    }

    const nextId =
      req.body.id || `${product.sku.slice(0, 2)}${String(db.inventoryItems.length + 1).padStart(3, '0')}`;
    const newItem: any = {
      id: nextId,
      productId: product.id,
      sku: req.body.sku || `${product.sku}-${req.body.size || 'STD'}`,
      barcode: req.body.barcode || `890${Date.now().toString().slice(-9)}`,
      size: req.body.size || '40',
      color: req.body.color || product.color,
      condition: req.body.condition || 'Excellent',
      status: req.body.status || 'Available',
      currentLocation: req.body.currentLocation || product.location || 'Rack 1',
      rentalCount: 0,
      totalRevenue: 0,
      cleaningCount: 0,
      repairsCount: 0,
      notes: req.body.notes || '',
    };

    db.inventoryItems.push(newItem);
    res.status(201).json({ success: true, data: newItem });
  });

  app.put('/api/inventory/:id', (req, res) => {
    const index = db.inventoryItems.findIndex((i) => i.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    db.inventoryItems[index] = { ...db.inventoryItems[index], ...req.body };
    res.json({ success: true, data: db.inventoryItems[index] });
  });

  // Smart Date-Based Outfit Availability Search ("20 Nov wedding mate size 42 ma kai sherwani available che?")
  app.post('/api/inventory/check-availability', (req, res) => {
    const { startDate, endDate, category, gender, size, maxBudget, searchQuery } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Both startDate and endDate are required' });
    }

    let candidateProducts = [...db.products];

    if (category && category !== 'all') {
      candidateProducts = candidateProducts.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (gender && gender !== 'all') {
      candidateProducts = candidateProducts.filter((p) => p.gender === gender);
    }
    if (maxBudget && Number(maxBudget) > 0) {
      candidateProducts = candidateProducts.filter((p) => p.rentalPrice <= Number(maxBudget));
    }
    if (searchQuery) {
      const q = String(searchQuery).toLowerCase();
      candidateProducts = candidateProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.style.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q)
      );
    }

    const results = candidateProducts.map((product) => {
      // Find all physical pieces for this product
      let physicalPieces = db.inventoryItems.filter((i) => i.productId === product.id);

      if (size && size !== 'all') {
        physicalPieces = physicalPieces.filter((i) => i.size.toLowerCase() === String(size).toLowerCase());
      }

      // Check each piece for date overlap
      const pieceAvailability = physicalPieces.map((piece) => {
        const check = db.isItemAvailableForDates(piece.id, startDate, endDate);
        return {
          ...piece,
          isDateAvailable: check.available,
          conflictReason: check.reason,
        };
      });

      const availablePieces = pieceAvailability.filter((p) => p.isDateAvailable);

      return {
        product,
        allPieces: pieceAvailability,
        availablePieces,
        isAvailable: availablePieces.length > 0,
        availableCount: availablePieces.length,
      };
    });

    res.json({
      success: true,
      query: { startDate, endDate, category, gender, size, maxBudget },
      data: results,
    });
  });

  // Bookings
  app.get('/api/bookings', (req, res) => {
    const { status, search } = req.query;
    let list = [...db.bookings];

    if (status && status !== 'all') {
      const targetSt = String(status).toLowerCase().replace(/[\s_]+/g, '');
      list = list.filter((b) => {
        const bkSt = b.bookingStatus.toLowerCase().replace(/[\s_]+/g, '');
        return bkSt === targetSt;
      });
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (b) =>
          b.bookingNumber.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.customerPhone.includes(q) ||
          b.weddingTitle.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, data: list });
  });

  app.get('/api/bookings/:id', (req, res) => {
    const booking = db.bookings.find((b) => b.id === req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    const customer = db.customers.find((c) => c.id === booking.customerId);
    const relatedPayments = db.payments.filter((p) => p.bookingId === booking.id);
    const relatedAlterations = db.alterations.filter((a) => a.bookingId === booking.id);
    const relatedReturns = db.returns.filter((r) => r.bookingId === booking.id);

    res.json({
      success: true,
      data: {
        ...booking,
        customer,
        payments: relatedPayments,
        alterations: relatedAlterations,
        returns: relatedReturns,
      },
    });
  });

  app.post('/api/bookings', (req, res) => {
    const body = req.body;

    const effectiveEndDate = body.rentalEndDate || body.returnDate;

    // Validate date overlap on all chosen items
    if (body.items && Array.isArray(body.items)) {
      for (const item of body.items) {
        if (item.physicalItemId) {
          const check = db.isItemAvailableForDates(
            item.physicalItemId,
            body.rentalStartDate,
            effectiveEndDate
          );
          if (!check.available) {
            return res.status(409).json({
              success: false,
              message: `Item ${item.physicalItemId} (${item.productName}) is not available: ${check.reason}`,
            });
          }
        }
      }
    }

    const bookingId = `bk-${Date.now().toString().slice(-4)}`;
    const bookingNumber = `BK-2026-${String(db.bookings.length + 803).padStart(4, '0')}`;

    const effectiveDeposit = Number(body.depositCollected ?? body.depositPaid) || 0;

    const newBooking: any = {
      id: bookingId,
      bookingNumber,
      customerId: body.customerId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerWhatsapp: body.customerWhatsapp || body.customerPhone,
      weddingTitle: body.weddingTitle || `${body.customerName} Wedding`,
      events: body.events || [],
      items: body.items || [],
      rentalStartDate: body.rentalStartDate,
      rentalEndDate: effectiveEndDate,
      pickupDate: body.pickupDate || body.rentalStartDate,
      returnDate: body.returnDate || effectiveEndDate,
      deliveryAddress: body.deliveryAddress || 'Store Pickup',
      rentalAmount: Number(body.rentalAmount) || 0,
      securityDeposit: Number(body.securityDeposit) || 0,
      discount: Number(body.discount) || 0,
      taxRate: Number(body.taxRate) || db.settings.defaultTaxRate,
      taxAmount: Number(body.taxAmount) || 0,
      totalAmount: Number(body.totalAmount) || 0,
      advancePaid: Number(body.advancePaid) || 0,
      remainingAmount: Number(body.remainingAmount) || 0,
      depositCollected: effectiveDeposit,
      depositHeld: effectiveDeposit,
      depositRefunded: 0,
      depositDeducted: 0,
      bookingStatus: body.bookingStatus || 'Confirmed',
      paymentStatus:
        Number(body.advancePaid) >= Number(body.totalAmount)
          ? 'Paid'
          : Number(body.advancePaid) > 0
          ? 'Partial'
          : 'Pending',
      notes: body.notes || '',
      createdDate: new Date().toISOString().split('T')[0],
    };

    db.bookings.unshift(newBooking);

    // Update physical items status to 'Booked' and increment rental count
    if (newBooking.items && Array.isArray(newBooking.items)) {
      for (const item of newBooking.items) {
        const pIndex = db.inventoryItems.findIndex((pi) => pi.id === item.physicalItemId);
        if (pIndex !== -1) {
          db.inventoryItems[pIndex].status = 'Booked';
          db.inventoryItems[pIndex].rentalCount += 1;
          db.inventoryItems[pIndex].lastRentalDate = newBooking.rentalStartDate;
          db.inventoryItems[pIndex].totalRevenue += item.rentalPrice || 0;
        }

        // If alteration details exist, create Alteration task automatically
        if (item.alterationDetails && item.alterationDetails.trim().length > 0) {
          db.alterations.push({
            id: `alt-${Date.now()}-${item.physicalItemId}`,
            bookingId: newBooking.id,
            bookingNumber: newBooking.bookingNumber,
            customerId: newBooking.customerId,
            customerName: newBooking.customerName,
            customerPhone: newBooking.customerPhone,
            productId: item.productId,
            productName: item.productName,
            physicalItemId: item.physicalItemId,
            size: item.size,
            alterationType: item.alterationDetails,
            assignedTailorId: 'stf-003',
            assignedTailorName: 'Ramesh Darji (Master Tailor)',
            dueDate: newBooking.pickupDate,
            status: 'Pending',
            instructions: item.alterationDetails,
            createdDate: new Date().toISOString().split('T')[0],
          });
        }
      }
    }

    // Record Advance Payment if any
    if (Number(newBooking.advancePaid) > 0) {
      db.payments.push({
        id: `pay-${Date.now()}-adv`,
        bookingId: newBooking.id,
        bookingNumber: newBooking.bookingNumber,
        customerId: newBooking.customerId,
        customerName: newBooking.customerName,
        amount: Number(newBooking.advancePaid),
        paymentType: 'Advance',
        paymentMethod: body.paymentMethod || 'UPI',
        transactionReference: body.transactionReference || 'UPI/TOKEN/CONFIRMED',
        invoiceNumber: `INV-${newBooking.bookingNumber}`,
        date: new Date().toISOString().split('T')[0],
        notes: 'Initial booking advance',
        receivedBy: 'Showroom Cashier',
      });
    }

    // Record Security Deposit collection if any
    if (Number(newBooking.depositCollected) > 0) {
      db.payments.push({
        id: `pay-${Date.now()}-dep`,
        bookingId: newBooking.id,
        bookingNumber: newBooking.bookingNumber,
        customerId: newBooking.customerId,
        customerName: newBooking.customerName,
        amount: Number(newBooking.depositCollected),
        paymentType: 'Deposit',
        paymentMethod: body.depositPaymentMethod || 'UPI',
        transactionReference: 'DEP-ESCROW',
        invoiceNumber: `DEP-${newBooking.bookingNumber}`,
        date: new Date().toISOString().split('T')[0],
        notes: 'Security deposit held in escrow ledger',
        receivedBy: 'Showroom Cashier',
      });
    }

    // Update customer stats
    const cIndex = db.customers.findIndex((c) => c.id === newBooking.customerId);
    if (cIndex !== -1) {
      db.customers[cIndex].totalBookings += 1;
      db.customers[cIndex].outstandingAmount += newBooking.remainingAmount;
    }

    // Log Audit
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN'),
      user: 'Admin',
      action: 'Created Rental Booking',
      target: newBooking.bookingNumber,
      details: `Created booking for ${newBooking.customerName} - Total: ₹${newBooking.totalAmount}`,
    });

    res.status(201).json({ success: true, data: newBooking });
  });

  app.patch('/api/bookings/:id/status', (req, res) => {
    const { status } = req.body;
    const index = db.bookings.findIndex((b) => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    db.bookings[index].bookingStatus = status;

    // Update physical items status according to booking lifecycle
    const booking = db.bookings[index];
    if (booking.items && Array.isArray(booking.items)) {
      booking.items.forEach((item) => {
        const piIndex = db.inventoryItems.findIndex((pi) => pi.id === item.physicalItemId);
        if (piIndex !== -1) {
          if (status === 'Picked Up' || status === 'Active Rental' || status === 'Delivered') {
            db.inventoryItems[piIndex].status = 'Rented';
          } else if (status === 'Returned' || status === 'Inspection') {
            db.inventoryItems[piIndex].status = 'Returned';
          } else if (status === 'Completed' || status === 'Cancelled') {
            db.inventoryItems[piIndex].status = 'Available';
          }
        }
      });
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN'),
      user: 'Staff',
      action: 'Updated Booking Status',
      target: booking.bookingNumber,
      details: `Status changed to ${status}`,
    });

    res.json({ success: true, data: db.bookings[index] });
  });

  // Returns & Inspection Workflow
  app.get('/api/returns', (req, res) => {
    res.json({ success: true, data: db.returns });
  });

  app.post('/api/returns', (req, res) => {
    const body = req.body;
    const bookingId = body.bookingId;
    const returnDate = body.returnDate || new Date().toISOString().split('T')[0];
    const inspectedItems = body.inspectedItems || body.itemsInspected || [];
    const lateDays = Number(body.lateDays || 0);
    const lateFeePerDay = Number(body.lateFeePerDay || db.settings.lateFeePerDay);
    const totalLateFee = Number(body.totalLateFee ?? body.lateFeeCharged ?? (lateDays * lateFeePerDay));
    const totalDamageCost = Number(body.totalDamageCost ?? body.damageFeeCharged ?? 0);
    const totalCustomerDeduction = Number(body.totalCustomerDeduction ?? (totalLateFee + totalDamageCost));

    const bookingIndex = db.bookings.findIndex((b) => b.id === bookingId);
    if (bookingIndex === -1) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = db.bookings[bookingIndex];
    const depositHeld = Number(booking.depositHeld || booking.securityDeposit || 0);
    const netDepositRefund = Number(body.depositRefundAmount ?? body.depositRefunded ?? Math.max(0, depositHeld - totalCustomerDeduction));
    const depositDeductedAmount = Number(body.depositDeductedAmount ?? Math.min(depositHeld, totalCustomerDeduction));
    const returnRecordId = `ret-${Date.now()}`;

    const newReturn: ReturnRecord = {
      id: returnRecordId,
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      customerId: booking.customerId,
      customerName: booking.customerName,
      returnDate,
      scheduledReturnDate: booking.returnDate,
      isLate: lateDays > 0,
      lateDays,
      lateFeePerDay,
      totalLateFee,
      inspectedItems: inspectedItems || [],
      totalDamageCost,
      totalCustomerDeduction,
      securityDepositHeld: depositHeld,
      netDepositRefund,
      netCustomerPayable: Math.max(0, totalCustomerDeduction - depositHeld),
      processedBy: body.inspectorName || 'Manojbhai Patel (Store Manager)',
      status: 'Completed',
      notes: body.notes || '',
      createdDate: new Date().toISOString().split('T')[0],
    };

    db.returns.unshift(newReturn);

    // Update booking deposit stats and status
    db.bookings[bookingIndex].depositHeld = 0;
    db.bookings[bookingIndex].depositRefunded = netDepositRefund;
    db.bookings[bookingIndex].depositDeducted = depositDeductedAmount;
    db.bookings[bookingIndex].bookingStatus = 'Completed';

    // Update inventory item conditions & statuses (Cleaning, Repair, or Available)
    if (inspectedItems && Array.isArray(inspectedItems)) {
      inspectedItems.forEach((insp: any) => {
        const itemIdx = db.inventoryItems.findIndex((i) => i.id === insp.physicalItemId);
        if (itemIdx !== -1) {
          db.inventoryItems[itemIdx].condition = insp.condition;
          if (insp.repairRequired) {
            db.inventoryItems[itemIdx].status = 'Repair';
            db.inventoryItems[itemIdx].repairsCount = (db.inventoryItems[itemIdx].repairsCount || 0) + 1;
          } else if (insp.cleaningRequired) {
            db.inventoryItems[itemIdx].status = 'Cleaning';
            db.inventoryItems[itemIdx].cleaningCount = (db.inventoryItems[itemIdx].cleaningCount || 0) + 1;
            db.inventoryItems[itemIdx].lastCleaningDate = new Date().toISOString().split('T')[0];
          } else {
            db.inventoryItems[itemIdx].status = 'Available';
          }
        }
      });
    }

    // Record Deposit Refund Payment entry if refund amount > 0
    if (Number(netDepositRefund) > 0) {
      db.payments.push({
        id: `pay-${Date.now()}-ref`,
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        customerId: booking.customerId,
        customerName: booking.customerName,
        amount: Number(netDepositRefund),
        paymentType: 'Deposit Refund',
        paymentMethod: 'UPI',
        transactionReference: 'REFUND/PROCESSED',
        invoiceNumber: `REF-${booking.bookingNumber}`,
        date: new Date().toISOString().split('T')[0],
        notes: `Deposit refund after return inspection (deductions: ₹${depositDeductedAmount})`,
        receivedBy: 'Store Manager',
      });
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN'),
      user: 'Manager',
      action: 'Processed Return & Inspection',
      target: booking.bookingNumber,
      details: `Return inspected for ${booking.customerName}. Deposit Refunded: ₹${netDepositRefund}, Deducted: ₹${depositDeductedAmount}`,
    });

    res.status(201).json({ success: true, data: newReturn });
  });

  // Customers
  app.get('/api/customers', (req, res) => {
    const { search } = req.query;
    let list = [...db.customers];
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.whatsapp.includes(q) ||
          c.customerId.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q)
      );
    }
    res.json({ success: true, data: list });
  });

  app.get('/api/customers/:id', (req, res) => {
    const customer = db.customers.find((c) => c.id === req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    const customerBookings = db.bookings.filter((b) => b.customerId === customer.id);
    const customerSales = db.salesOrders.filter((s) => s.customerId === customer.id);
    const customerPayments = db.payments.filter((p) => p.customerId === customer.id);
    const customerReturns = db.returns.filter((r) => r.customerId === customer.id);

    res.json({
      success: true,
      data: {
        ...customer,
        bookings: customerBookings,
        salesOrders: customerSales,
        payments: customerPayments,
        returns: customerReturns,
      },
    });
  });

  app.post('/api/customers', (req, res) => {
    const id = `cust-${Date.now().toString().slice(-4)}`;
    const customerId = `CUST-2026-${String(db.customers.length + 1).padStart(3, '0')}`;
    const newCust: Customer = {
      id,
      customerId,
      name: req.body.name,
      phone: req.body.phone,
      whatsapp: req.body.whatsapp || req.body.phone,
      email: req.body.email || '',
      address: req.body.address || '',
      city: req.body.city || 'Ahmedabad',
      dateOfBirth: req.body.dateOfBirth,
      notes: req.body.notes || '',
      menMeasurements: req.body.menMeasurements,
      womenMeasurements: req.body.womenMeasurements,
      totalBookings: 0,
      totalPurchases: 0,
      outstandingAmount: 0,
      createdDate: new Date().toISOString().split('T')[0],
    };

    db.customers.unshift(newCust);
    res.status(201).json({ success: true, data: newCust });
  });

  app.put('/api/customers/:id', (req, res) => {
    const index = db.customers.findIndex((c) => c.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    db.customers[index] = { ...db.customers[index], ...req.body };
    res.json({ success: true, data: db.customers[index] });
  });

  // Measurements
  app.post('/api/measurements', (req, res) => {
    const { customerId, menMeasurements, womenMeasurements } = req.body;
    const index = db.customers.findIndex((c) => c.id === customerId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    if (menMeasurements) db.customers[index].menMeasurements = menMeasurements;
    if (womenMeasurements) db.customers[index].womenMeasurements = womenMeasurements;

    res.json({ success: true, data: db.customers[index] });
  });

  // Alterations / Tailoring Board
  app.get('/api/alterations', (req, res) => {
    res.json({ success: true, data: db.alterations });
  });

  app.post('/api/alterations', (req, res) => {
    const newAlt: AlterationTask = {
      id: `alt-${Date.now()}`,
      bookingId: req.body.bookingId || '',
      bookingNumber: req.body.bookingNumber || '',
      customerId: req.body.customerId || '',
      customerName: req.body.customerName || '',
      customerPhone: req.body.customerPhone || '',
      productId: req.body.productId || '',
      productName: req.body.productName || '',
      physicalItemId: req.body.physicalItemId || '',
      size: req.body.size || '',
      alterationType: req.body.alterationType || 'General Fitting',
      measurements: req.body.measurements,
      assignedTailorId: req.body.assignedTailorId || 'stf-003',
      assignedTailorName: req.body.assignedTailorName || 'Ramesh Darji',
      dueDate: req.body.dueDate || new Date().toISOString().split('T')[0],
      status: req.body.status || 'Pending',
      instructions: req.body.instructions || '',
      createdDate: new Date().toISOString().split('T')[0],
    };
    db.alterations.unshift(newAlt);
    res.status(201).json({ success: true, data: newAlt });
  });

  app.patch('/api/alterations/:id', (req, res) => {
    const index = db.alterations.findIndex((a) => a.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Alteration task not found' });
    }
    db.alterations[index] = { ...db.alterations[index], ...req.body };
    if (req.body.status === 'Ready' || req.body.status === 'Completed') {
      db.alterations[index].completedDate = new Date().toISOString().split('T')[0];
    }
    res.json({ success: true, data: db.alterations[index] });
  });

  // Sales Orders
  app.get('/api/sales-orders', (req, res) => {
    res.json({ success: true, data: db.salesOrders });
  });

  app.post('/api/sales-orders', (req, res) => {
    const orderNumber = `SO-2026-${String(db.salesOrders.length + 42).padStart(4, '0')}`;
    const newOrder: SalesOrder = {
      id: `so-${Date.now()}`,
      orderNumber,
      customerId: req.body.customerId,
      customerName: req.body.customerName,
      customerPhone: req.body.customerPhone,
      items: req.body.items || [],
      subtotal: Number(req.body.subtotal) || 0,
      discount: Number(req.body.discount) || 0,
      taxRate: Number(req.body.taxRate) || 5,
      taxAmount: Number(req.body.taxAmount) || 0,
      finalTotal: Number(req.body.finalTotal) || 0,
      paymentMethod: req.body.paymentMethod || 'UPI',
      paymentStatus: 'Paid',
      deliveryStatus: req.body.deliveryStatus || 'Delivered',
      createdDate: new Date().toISOString().split('T')[0],
      notes: req.body.notes || '',
    };

    db.salesOrders.unshift(newOrder);

    // If any physical items were sold, mark their status as 'Sold'
    if (newOrder.items) {
      newOrder.items.forEach((item) => {
        if (item.physicalItemId) {
          const piIndex = db.inventoryItems.findIndex((pi) => pi.id === item.physicalItemId);
          if (piIndex !== -1) {
            db.inventoryItems[piIndex].status = 'Sold';
          }
        }
      });
    }

    // Record Payment
    db.payments.push({
      id: `pay-${Date.now()}-so`,
      salesOrderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      customerId: newOrder.customerId,
      customerName: newOrder.customerName,
      amount: newOrder.finalTotal,
      paymentType: 'Final Payment',
      paymentMethod: newOrder.paymentMethod,
      invoiceNumber: `INV-${newOrder.orderNumber}`,
      date: new Date().toISOString().split('T')[0],
      notes: 'Direct garment sale full payment',
      receivedBy: 'Showroom Cashier',
    });

    res.status(201).json({ success: true, data: newOrder });
  });

  // Payments
  app.get('/api/payments', (req, res) => {
    res.json({ success: true, data: db.payments });
  });

  app.post('/api/payments', (req, res) => {
    const newPay: PaymentRecord = {
      id: `pay-${Date.now()}`,
      bookingId: req.body.bookingId,
      bookingNumber: req.body.bookingNumber,
      salesOrderId: req.body.salesOrderId,
      orderNumber: req.body.orderNumber,
      customerId: req.body.customerId,
      customerName: req.body.customerName,
      amount: Number(req.body.amount) || 0,
      paymentType: req.body.paymentType || 'Partial Payment',
      paymentMethod: req.body.paymentMethod || 'UPI',
      transactionReference: req.body.transactionReference,
      invoiceNumber: req.body.invoiceNumber || `REC-${Date.now().toString().slice(-4)}`,
      date: req.body.date || new Date().toISOString().split('T')[0],
      notes: req.body.notes || '',
      receivedBy: 'Showroom Cashier',
    };
    db.payments.unshift(newPay);

    // If attached to a booking, adjust remaining balance
    if (req.body.bookingId) {
      const bIndex = db.bookings.findIndex((b) => b.id === req.body.bookingId);
      if (bIndex !== -1) {
        db.bookings[bIndex].advancePaid += newPay.amount;
        db.bookings[bIndex].remainingAmount = Math.max(
          0,
          db.bookings[bIndex].totalAmount - db.bookings[bIndex].advancePaid
        );
        if (db.bookings[bIndex].remainingAmount === 0) {
          db.bookings[bIndex].paymentStatus = 'Paid';
        }
      }
    }

    res.status(201).json({ success: true, data: newPay });
  });

  // Expenses
  app.get('/api/expenses', (req, res) => {
    res.json({ success: true, data: db.expenses });
  });

  app.post('/api/expenses', (req, res) => {
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      category: req.body.category || 'Other',
      title: req.body.title,
      amount: Number(req.body.amount) || 0,
      date: req.body.date || new Date().toISOString().split('T')[0],
      paidTo: req.body.paidTo || 'Vendor',
      paymentMethod: req.body.paymentMethod || 'UPI',
      associatedType: req.body.associatedType || 'Business',
      notes: req.body.notes || '',
    };
    db.expenses.unshift(newExp);
    res.status(201).json({ success: true, data: newExp });
  });

  // Suppliers & Staff
  app.get('/api/suppliers', (req, res) => {
    res.json({ success: true, data: db.suppliers });
  });

  app.post('/api/suppliers', (req, res) => {
    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      name: req.body.name,
      contactPerson: req.body.contactPerson || '',
      phone: req.body.phone || '',
      email: req.body.email || '',
      address: req.body.address || '',
      city: req.body.city || '',
      categoriesProvided: req.body.categoriesProvided || [],
      gstNumber: req.body.gstNumber || '',
      totalSupplied: Number(req.body.totalSupplied) || 0,
      pendingBalance: Number(req.body.pendingBalance) || 0,
      notes: req.body.notes || '',
    };
    db.suppliers.unshift(newSup);
    res.status(201).json({ success: true, data: newSup });
  });

  app.get('/api/staff', (req, res) => {
    res.json({ success: true, data: db.staff });
  });

  app.post('/api/staff', (req, res) => {
    const newStf: StaffMember = {
      id: `stf-${Date.now()}`,
      name: req.body.name,
      role: req.body.role || 'Sales Staff',
      phone: req.body.phone || '',
      email: req.body.email || '',
      salary: Number(req.body.salary) || 25000,
      joiningDate: req.body.joiningDate || new Date().toISOString().split('T')[0],
      active: true,
      tasksAssigned: 0,
      specialization: req.body.specialization || '',
    };
    db.staff.unshift(newStf);
    res.status(201).json({ success: true, data: newStf });
  });

  // Comprehensive Reports & Profitability Analytics
  app.get('/api/reports/summary', (req, res) => {
    const totalRentalRevenue = db.bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalSalesRevenue = db.salesOrders.reduce((sum, s) => sum + (s.finalTotal || 0), 0);
    const totalRevenue = totalRentalRevenue + totalSalesRevenue;
    const totalExpenses = db.expenses.reduce((sum, e) => sum + e.amount, 0);
    const estimatedNetProfit = totalRevenue - totalExpenses;

    const totalSecurityDepositCollected = db.bookings.reduce((sum, b) => sum + (b.depositCollected || 0), 0);
    const totalSecurityDepositHeld = db.bookings.reduce((sum, b) => sum + (b.depositHeld || 0), 0);
    const totalDepositRefunded = db.bookings.reduce((sum, b) => sum + (b.depositRefunded || 0), 0);
    const totalDepositDeducted = db.bookings.reduce((sum, b) => sum + (b.depositDeducted || 0), 0);

    const activeRentalsCount = db.inventoryItems.filter((i) => i.status === 'Rented').length;
    const availablePiecesCount = db.inventoryItems.filter((i) => i.status === 'Available').length;
    const cleaningPiecesCount = db.inventoryItems.filter((i) => i.status === 'Cleaning').length;
    const repairPiecesCount = db.inventoryItems.filter((i) => i.status === 'Repair').length;
    const pendingAlterationsCount = db.alterations.filter((a) => a.status === 'Pending' || a.status === 'In Progress').length;

    // Overdue items check
    const todayStr = new Date().toISOString().split('T')[0];
    const overdueBookings = db.bookings.filter((b) => {
      return (
        (b.bookingStatus === 'Picked Up' || b.bookingStatus === 'Active Rental') &&
        b.returnDate < todayStr
      );
    });

    // Product ROI & Performance Table
    const productPerformance = db.products.map((prod) => {
      const items = db.inventoryItems.filter((i) => i.productId === prod.id);
      const totalItemRevenue = items.reduce((sum, i) => sum + (i.totalRevenue || 0), 0);
      const totalRentals = items.reduce((sum, i) => sum + (i.rentalCount || 0), 0);
      const totalPurchaseCost = prod.purchasePrice * Math.max(1, items.length);
      const maintenanceEst = items.reduce((sum, i) => sum + (i.cleaningCount || 0) * 350 + (i.repairsCount || 0) * 500, 0);
      const netProductProfit = totalItemRevenue - totalPurchaseCost - maintenanceEst;
      const roiPercent = totalPurchaseCost > 0 ? Math.round((netProductProfit / totalPurchaseCost) * 100) : 0;

      return {
        id: prod.id,
        name: prod.name,
        sku: prod.sku,
        category: prod.category,
        image: prod.images[0],
        purchasePrice: prod.purchasePrice,
        rentalPrice: prod.rentalPrice,
        totalPieces: items.length,
        totalRentals,
        totalRevenue: totalItemRevenue,
        maintenanceCost: maintenanceEst,
        netProfit: netProductProfit,
        roiPercent,
      };
    });

    res.json({
      success: true,
      data: {
        kpis: {
          totalRevenue,
          totalRentalRevenue,
          totalSalesRevenue,
          totalExpenses,
          estimatedNetProfit,
          totalSecurityDepositHeld,
          totalDepositRefunded,
          totalDepositDeducted,
          activeRentalsCount,
          availablePiecesCount,
          cleaningPiecesCount,
          repairPiecesCount,
          pendingAlterationsCount,
          overdueReturnsCount: overdueBookings.length,
        },
        overdueBookings,
        productPerformance,
      },
    });
  });

  // Settings
  app.get('/api/settings', (req, res) => {
    res.json({ success: true, data: db.settings });
  });

  app.put('/api/settings', (req, res) => {
    db.settings = { ...db.settings, ...req.body };
    res.json({ success: true, data: db.settings });
  });

  // Audit Logs
  app.get('/api/audit-logs', (req, res) => {
    res.json({ success: true, data: db.auditLogs });
  });

  // WhatsApp Message Generator Link (India phone support + template)
  app.post('/api/whatsapp/generate-link', (req, res) => {
    const { bookingId, type, customNotes } = req.body;
    const booking = db.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    let text = '';
    const cleanPhone = (booking.customerWhatsapp || booking.customerPhone).replace(/[^0-9]/g, '');

    switch (type) {
      case 'confirmation':
        text = `*VastraVeda Bridal & Groom Couture*\n\nNamaste ${booking.customerName} ji! 🙏\n\nYour wedding outfit rental booking *${booking.bookingNumber}* is CONFIRMED.\n\n👑 *Wedding / Event:* ${booking.weddingTitle}\n📅 *Pickup Date:* ${booking.pickupDate}\n🔄 *Scheduled Return:* ${booking.returnDate}\n💰 *Rental Total:* ₹${booking.totalAmount.toLocaleString('en-IN')}\n🛡️ *Security Deposit Held:* ₹${booking.securityDeposit.toLocaleString('en-IN')}\n\nOur stylists look forward to welcoming you for final trial and pickup!\n\n📍 ${db.settings.address}\n📞 ${db.settings.phone}`;
        break;
      case 'pickup':
        text = `*VastraVeda Bridal & Groom Couture*\n\nNamaste ${booking.customerName} ji! ✨\n\nYour outfits for *${booking.bookingNumber}* are altered, steam-pressed, and READY FOR PICKUP at our showroom.\n\n📍 *Showroom:* ${db.settings.address}\n⏰ *Timings:* 10:30 AM to 8:30 PM\n\nPlease carry your original photo ID for security deposit escrow verification.\n\nSee you soon! 🌸`;
        break;
      case 'return_reminder':
        text = `*VastraVeda Return Reminder*\n\nNamaste ${booking.customerName} ji! 🙏\n\nWe hope your wedding celebrations were magical! This is a gentle reminder that the outfits for booking *${booking.bookingNumber}* are scheduled for return on *${booking.returnDate}* before 8:00 PM.\n\nUpon quick inspection, your security deposit of *₹${booking.securityDeposit.toLocaleString('en-IN')}* will be instantly refunded via UPI / Cash.\n\nThank you! 💖`;
        break;
      case 'late':
        text = `*Important Notice - VastraVeda Couture*\n\nNamaste ${booking.customerName} ji,\n\nThe outfits for booking *${booking.bookingNumber}* were due for return on *${booking.returnDate}*. Please arrange for return today to avoid additional late fee accruals (₹${db.settings.lateFeePerDay}/day).\n\nIf you require rental extension, please reply to this message immediately.\n📞 ${db.settings.phone}`;
        break;
      case 'deposit_refund':
        text = `*VastraVeda Deposit Refund Intimation*\n\nNamaste ${booking.customerName} ji! ✅\n\nYour returned wedding outfits for *${booking.bookingNumber}* have been inspected in pristine condition. Your security deposit of *₹${booking.depositRefunded.toLocaleString('en-IN')}* has been released.\n\nThank you for choosing VastraVeda for your special celebrations! ✨`;
        break;
      default:
        text = `Namaste ${booking.customerName} ji, regarding your VastraVeda booking ${booking.bookingNumber}: ${customNotes || ''}`;
    }

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodedText}`;

    res.json({
      success: true,
      text,
      phone: cleanPhone,
      whatsappUrl,
    });
  });

  // =====================
  // VITE MIDDLEWARE / SPA FALLBACK
  // =====================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VastraVeda Server listening on http://localhost:${PORT}`);
  });
}

startServer();
