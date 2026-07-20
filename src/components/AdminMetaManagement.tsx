import React, { useState } from 'react';
import {
  Layers,
  Search,
  Plus,
  Trash2,
  Building,
  Users,
  Briefcase,
  Globe2,
  ShieldAlert,
  Sliders,
  DollarSign,
  Receipt,
  Percent,
  CreditCard,
  HeartHandshake,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface MetaEntity {
  id: string;
  name: string;
  detail1: string;
  detail2: string;
}

interface MetaGroup {
  key: string;
  label: string;
  icon: any;
  color: string;
  description: string;
  fields: { name: string; label: string; placeholder: string; type: string }[];
  initialData: MetaEntity[];
}

const META_GROUPS: MetaGroup[] = [
  {
    key: 'warehouses',
    label: 'Warehouses',
    icon: Building,
    color: 'text-primary',
    description: 'Manage logistics facilities, raw parts inventories, and regional supply chain hubs.',
    fields: [
      { name: 'name', label: 'Warehouse Name', placeholder: 'e.g. Central Mandalay Depot', type: 'text' },
      { name: 'detail1', label: 'Location Address', placeholder: 'e.g. Pyigyidagun Township, Mandalay', type: 'text' },
      { name: 'detail2', label: 'Storage Capacity (m³)', placeholder: 'e.g. 5000', type: 'number' }
    ],
    initialData: [
      { id: 'WH-01', name: 'Yangon Head Warehouse', detail1: 'Insein Rd, Kamayut, Yangon', detail2: '8000 m³' },
      { id: 'WH-02', name: 'Mandalay Logistics Depot', detail1: '73rd Street, Chanayethazan, Mandalay', detail2: '4500 m³' }
    ]
  },
  {
    key: 'departments',
    label: 'Departments',
    icon: Users,
    color: 'text-teal-400',
    description: 'Corporate organizational divisions, reporting structures, and HR clusters.',
    fields: [
      { name: 'name', label: 'Department Name', placeholder: 'e.g. Logistics & Fulfillment', type: 'text' },
      { name: 'detail1', label: 'Department Head (Manager)', placeholder: 'e.g. Daw Aye Aye Myint', type: 'text' },
      { name: 'detail2', label: 'Operational Cost Center Code', placeholder: 'e.g. CC-LOG-04', type: 'text' }
    ],
    initialData: [
      { id: 'DEPT-01', name: 'Retail Store Sales', detail1: 'Daw Su Su', detail2: 'CC-RSL-01' },
      { id: 'DEPT-02', name: 'Hardware Diagnostics & Repair', detail1: 'Ko Aung Win', detail2: 'CC-REP-02' },
      { id: 'DEPT-03', name: 'Finance, Tax & General Ledger', detail1: 'Ma Khin Thida', detail2: 'CC-FIN-03' }
    ]
  },
  {
    key: 'positions',
    label: 'Positions / Jobs',
    icon: Briefcase,
    color: 'text-primary',
    description: 'Job positions, grade specifications, base brackets, and reporting structures.',
    fields: [
      { name: 'name', label: 'Job Title', placeholder: 'e.g. Senior Logic Technician', type: 'text' },
      { name: 'detail1', label: 'Salary Band (MMK)', placeholder: 'e.g. 600,000 - 800,000', type: 'text' },
      { name: 'detail2', label: 'Core Responsibility KPI', placeholder: 'e.g. 95% Repair Success rate', type: 'text' }
    ],
    initialData: [
      { id: 'POS-01', name: 'Showroom Manager', detail1: '800,000 - 1,200,000 MMK', detail2: 'Showroom Sales Targets met' },
      { id: 'POS-02', name: 'Lead Hardware Technician', detail1: '600,000 - 900,000 MMK', detail2: '98% Repairs on-time' },
      { id: 'POS-03', name: 'Retail Sales Specialist', detail1: '400,000 - 600,000 MMK', detail2: 'VIP Signups & Handset upsells' }
    ]
  },
  {
    key: 'suppliers',
    label: 'Suppliers',
    icon: Globe2,
    color: 'text-amber-400',
    description: 'External hardware vendors, handset importers, and spare part distributors.',
    fields: [
      { name: 'name', label: 'Supplier Company', placeholder: 'e.g. Shenzhen Optoelectronic Ltd', type: 'text' },
      { name: 'detail1', label: 'Primary Brand Supplied', placeholder: 'e.g. Apple, Xiaomi, Repair parts', type: 'text' },
      { name: 'detail2', label: 'Contact Tel / Email', placeholder: 'e.g. imports@shenzhen-part.com', type: 'text' }
    ],
    initialData: [
      { id: 'SUPP-01', name: 'Shenzhen Wholesalers Ltd', detail1: 'Xiaomi Handsets & Screens', detail2: 'contacts@sz-wholesale.com' },
      { id: 'SUPP-02', name: 'Yangon Telecom Suppliers', detail1: 'MPT/Ooredoo Topups & SIM cards', detail2: '095001234' },
      { id: 'SUPP-03', name: 'Bangkok Premium Accessories', detail1: 'MagSafe Covers & Batteries', detail2: 'imports@bkk-premium.th' }
    ]
  },
  {
    key: 'services',
    label: 'Repair & Diagnostic Services',
    icon: Sliders,
    color: 'text-rose-400',
    description: 'Configure standard catalog rates for labor and troubleshooting hardware issues.',
    fields: [
      { name: 'name', label: 'Service / Fault Type', placeholder: 'e.g. AMOLED Screen Replacement', type: 'text' },
      { name: 'detail1', label: 'Base Cost Rate (MMK)', placeholder: 'e.g. 75000', type: 'number' },
      { name: 'detail2', label: 'Estimated Turnaround Time', placeholder: 'e.g. 2 hours', type: 'text' }
    ],
    initialData: [
      { id: 'SERV-01', name: 'AMOLED screen restoration', detail1: '120,000 MMK', detail2: '3 Hours' },
      { id: 'SERV-02', name: 'High-density battery replacement', detail1: '45,000 MMK', detail2: '1 Hour' },
      { id: 'SERV-03', name: 'Liquid diagnostics & board cleaning', detail1: '60,000 MMK', detail2: '24 Hours' }
    ]
  },
  {
    key: 'taxes',
    label: 'Taxes & Levies',
    icon: Receipt,
    color: 'text-pink-400',
    description: 'Configure legal commercial tax, VAT, and withholding tax policies for invoice receipts.',
    fields: [
      { name: 'name', label: 'Tax Name', placeholder: 'e.g. Commercial Tax (MFT)', type: 'text' },
      { name: 'detail1', label: 'Percentage Rate (%)', placeholder: 'e.g. 5.0', type: 'number' },
      { name: 'detail2', label: 'Accountancy Classification', placeholder: 'e.g. Liability - Tax Payable', type: 'text' }
    ],
    initialData: [
      { id: 'TAX-01', name: 'Standard Commercial Tax', detail1: '5.0%', detail2: 'Sales VAT Payable' },
      { id: 'TAX-02', name: 'Special Handset Luxury Tax', detail1: '2.0%', detail2: 'Excise Levy Obligation' }
    ]
  },
  {
    key: 'discounts',
    label: 'Discounts & Loyalty',
    icon: Percent,
    color: 'text-success',
    description: 'System discounts, promotional seasonal price markdowns, and CRM membership tiers.',
    fields: [
      { name: 'name', label: 'Discount Campaign', placeholder: 'e.g. Thadingyut Special Promo', type: 'text' },
      { name: 'detail1', label: 'Markdown Rate (%)', placeholder: 'e.g. 10.0', type: 'number' },
      { name: 'detail2', label: 'Applicable Tier Restriction', placeholder: 'e.g. Gold, VIP Only', type: 'text' }
    ],
    initialData: [
      { id: 'DISC-01', name: 'VIP Premium Markdown', detail1: '10.0%', detail2: 'VIP Tier Guests' },
      { id: 'DISC-02', name: 'Seasonal Monsoon festival', detail1: '5.0%', detail2: 'Open to All Clients' }
    ]
  },
  {
    key: 'coupons',
    label: 'Promo Coupons',
    icon: HeartHandshake,
    color: 'text-violet-400',
    description: 'Issue localized alphanumeric coupon codes for e-commerce checkout checkouts.',
    fields: [
      { name: 'name', label: 'Coupon Alphanumeric Code', placeholder: 'e.g. MOBILE_FEST_50', type: 'text' },
      { name: 'detail1', label: 'Deduction Value (MMK)', placeholder: 'e.g. 20000', type: 'number' },
      { name: 'detail2', label: 'Expiry Date', placeholder: 'e.g. 2026-12-31', type: 'text' }
    ],
    initialData: [
      { id: 'COUP-01', name: 'AKK_WELCOME_2026', detail1: '15,000 MMK Off', detail2: 'Expires 2026-12-31' },
      { id: 'COUP-02', name: 'MOBILE_FEST_50', detail1: '50,000 MMK Off', detail2: 'Expires 2026-09-30' }
    ]
  },
  {
    key: 'banks',
    label: 'Merchant Banks',
    icon: CreditCard,
    color: 'text-orange-400',
    description: 'Manage clearing bank accounts, digital e-wallets, and cellular merchant accounts.',
    fields: [
      { name: 'name', label: 'Bank Institution Name', placeholder: 'e.g. KBZ Bank Ltd', type: 'text' },
      { name: 'detail1', label: 'Corporate Account Number', placeholder: 'e.g. 02930219830219', type: 'text' },
      { name: 'detail2', label: 'Connected E-Wallet Gateway', placeholder: 'e.g. KBZPay Merchant Pay', type: 'text' }
    ],
    initialData: [
      { id: 'BANK-01', name: 'Kanbawza Bank (KBZ)', detail1: 'Account: 0943-021-9340', detail2: 'KBZPay E-Wallet linked' },
      { id: 'BANK-02', name: 'Co-operative Bank (CB)', detail1: 'Account: 1043-920-4931', detail2: 'CBPay linked' },
      { id: 'BANK-03', name: 'Ayeyarwady Bank (AYA)', detail1: 'Account: 2043-122-4211', detail2: 'AYAPay linked' }
    ]
  }
];

export default function AdminMetaManagement() {
  const [activeGroupKey, setActiveGroupKey] = useState<string>('warehouses');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Store dynamically updated data for each metadata group
  const [metaStore, setMetaStore] = useState<Record<string, MetaEntity[]>>(() => {
    const store: Record<string, MetaEntity[]> = {};
    META_GROUPS.forEach((g) => {
      store[g.key] = g.initialData;
    });
    return store;
  });

  // Dynamic input values for creation form
  const [formInputs, setFormInputs] = useState<Record<string, string>>({});
  const [addSuccess, setAddSuccess] = useState(false);

  const activeGroup = META_GROUPS.find((g) => g.key === activeGroupKey) || META_GROUPS[0];
  const activeRecords = metaStore[activeGroup.key] || [];

  const handleInputChange = (fieldName: string, val: string) => {
    setFormInputs({
      ...formInputs,
      [fieldName]: val
    });
  };

  const handleAddMetaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required inputs
    let valid = true;
    activeGroup.fields.forEach((f) => {
      if (!formInputs[f.name]) valid = false;
    });

    if (!valid) return;

    const newRecord: MetaEntity = {
      id: `${activeGroup.key.toUpperCase().substring(0, 4)}-${Math.floor(100 + Math.random() * 900)}`,
      name: formInputs['name'] || '',
      detail1: formInputs['detail1'] || '',
      detail2: formInputs['detail2'] || ''
    };

    setMetaStore({
      ...metaStore,
      [activeGroup.key]: [newRecord, ...activeRecords]
    });

    // Clear inputs
    const cleared: Record<string, string> = {};
    activeGroup.fields.forEach((f) => {
      cleared[f.name] = '';
    });
    setFormInputs(cleared);
    
    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 2500);
  };

  const handleDeleteMeta = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this administrative record?')) {
      setMetaStore({
        ...metaStore,
        [activeGroup.key]: activeRecords.filter((r) => r.id !== id)
      });
    }
  };

  const filteredRecords = activeRecords.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.detail1.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.detail2.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="meta-management-root">
      
      {/* 1. Left Nav: Selector Categories */}
      <div className="lg:col-span-4 bg-card/15 border border-border p-4 rounded-2xl space-y-3">
        <span className="text-[10px] text-subtle font-bold uppercase tracking-wider font-mono block px-2">Administrative Master Configuration</span>
        
        <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
          {META_GROUPS.map((g) => {
            const Icon = g.icon;
            return (
              <button
                key={g.key}
                onClick={() => {
                  setActiveGroupKey(g.key);
                  setSearchQuery('');
                  setFormInputs({});
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-mono text-xs font-bold transition-all text-left ${
                  activeGroupKey === g.key
                    ? 'bg-surface border border-slate-850 text-white'
                    : 'text-subtle hover:text-muted hover:bg-card/10'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${g.color}`} />
                <div className="truncate">
                  <span>{g.label}</span>
                  <span className="text-[9px] text-subtle font-normal block truncate">Count: {metaStore[g.key]?.length || 0} entries</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Static Company settings page link */}
        <div className="pt-3.5 border-t border-border">
          <div className="bg-surface/60 p-3.5 border border-border rounded-xl space-y-2 font-mono text-[10px]">
            <span className="text-[8px] font-black text-rose-400 block uppercase">🏢 Company Settings Profile</span>
            <div className="space-y-1 text-subtle">
              <p>Legal Name: <strong>AKK Mobile Suite</strong></p>
              <p>Base Currency: <strong>Myanmar Kyat (MMK)</strong></p>
              <p>Default Tax Model: <strong>5.0% Sales VAT</strong></p>
              <p>Roster Headcount: <strong>14 active staff</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Right: Interactive Grid & Form */}
      <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Registry ledger */}
        <div className="md:col-span-7 bg-card/15 border border-border p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="border-b border-border pb-2.5">
              <span className="text-[10px] text-subtle font-bold uppercase tracking-wider font-mono">Master Registry Ledger</span>
              <h3 className="text-sm font-black text-muted font-mono mt-0.5">{activeGroup.label} Config Table</h3>
              <p className="text-[10px] text-subtle font-mono mt-1 leading-normal">{activeGroup.description}</p>
            </div>

            {/* Search Bar */}
            <div className="relative bg-surface border border-border rounded-xl p-2.5 flex items-center space-x-2 font-mono text-xs">
              <Search className="w-3.5 h-3.5 text-subtle shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search records in ${activeGroup.label.toLowerCase()}...`}
                className="w-full bg-transparent outline-none text-[11px] text-muted"
              />
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 font-mono text-xs">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => (
                  <div key={rec.id} className="group flex items-center justify-between p-3 bg-surface/40 border border-border/60 rounded-xl">
                    <div>
                      <strong className="text-muted block font-bold text-[11px]">{rec.name}</strong>
                      <span className="text-[9px] text-subtle block mt-0.5">{rec.detail1}</span>
                      <span className="text-[9px] text-subtle block">{rec.detail2}</span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[8px] bg-card px-1.5 py-0.5 border border-slate-850 rounded text-subtle">{rec.id}</span>
                      <button
                        onClick={() => handleDeleteMeta(rec.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-card rounded text-rose-500 hover:text-rose-400 transition"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-subtle italic">No records registered in this configuration catalog</div>
              )}
            </div>
          </div>
        </div>

        {/* Creation form */}
        <div className="md:col-span-5 bg-card/15 border border-border p-5 rounded-2xl flex flex-col justify-between">
          <form onSubmit={handleAddMetaSubmit} className="space-y-4 font-mono text-xs">
            <div className="border-b border-border pb-3">
              <span className="text-[10px] text-subtle font-bold uppercase tracking-wider block">Add Register Record</span>
              <strong className="text-[11px] text-primary block mt-0.5 uppercase">New {activeGroup.label.slice(0, -1)} Form</strong>
            </div>

            {addSuccess && (
              <div className="bg-success/10 border border-success/25 p-2.5 rounded-lg text-success text-[10px] text-center font-bold">
                🎉 Entry appended successfully to memory master registers!
              </div>
            )}

            <div className="space-y-3">
              {activeGroup.fields.map((f) => (
                <div key={f.name} className="space-y-1">
                  <label className="text-subtle text-[10px] font-bold">{f.label}</label>
                  <input
                    type={f.type}
                    required
                    placeholder={f.placeholder}
                    value={formInputs[f.name] || ''}
                    onChange={(e) => handleInputChange(f.name, e.target.value)}
                    className="w-full bg-surface border border-border rounded p-2 text-muted text-xs outline-none"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-accent text-slate-950 font-black py-2.5 rounded-xl uppercase transition shadow"
            >
              Commit Configuration
            </button>
          </form>

          {/* Help box */}
          <div className="bg-surface p-3 border border-border rounded-xl space-y-1.5 mt-4 text-[9px] font-mono leading-relaxed text-subtle">
            <div className="flex items-center space-x-1 text-[8px] font-black text-subtle uppercase">
              <HelpCircle className="w-3 h-3 text-subtle" />
              <span>Catalog Guideline</span>
            </div>
            <p>Altering parameters updates live cashier invoice printouts, billing tax computations, and inventory thresholds system-wide instantly.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
