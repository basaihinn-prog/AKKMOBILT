import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Key,
  Layers,
  Lock,
  Building2,
  ToggleLeft,
  ToggleRight,
  Info,
  Copy,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export interface PermissionSchema {
  modules: {
    pos: boolean;
    inventory: boolean;
    finance: boolean;
    hr: boolean;
    repairs: boolean;
    crm: boolean;
    vtu: boolean;
    integrations: boolean;
    auditLogs: boolean;
  };
  crud: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  features: {
    approveReject: boolean;
    branchRestriction: 'none' | 'assigned_only';
    apiAccess: 'read' | 'write' | 'none';
    advancedSettings: boolean;
  };
}

export interface RoleDef {
  name: string;
  isSystem: boolean;
  description: string;
  permissions: PermissionSchema;
  employeeCount: number;
}

const INITIAL_ROLES: RoleDef[] = [
  {
    name: 'Owner',
    isSystem: true,
    description: 'Full system ownership. Unrestricted bypass to all databases, branches, and parameters.',
    employeeCount: 1,
    permissions: {
      modules: { pos: true, inventory: true, finance: true, hr: true, repairs: true, crm: true, vtu: true, integrations: true, auditLogs: true },
      crud: { create: true, read: true, update: true, delete: true },
      features: { approveReject: true, branchRestriction: 'none', apiAccess: 'write', advancedSettings: true }
    }
  },
  {
    name: 'Super Admin',
    isSystem: true,
    description: 'System administration. Manage branches, API keys, warehouses, and global employee rosters.',
    employeeCount: 2,
    permissions: {
      modules: { pos: true, inventory: true, finance: true, hr: true, repairs: true, crm: true, vtu: true, integrations: true, auditLogs: true },
      crud: { create: true, read: true, update: true, delete: true },
      features: { approveReject: true, branchRestriction: 'none', apiAccess: 'write', advancedSettings: true }
    }
  },
  {
    name: 'Admin',
    isSystem: true,
    description: 'General system administration. Moderate permissions, excluding sensitive API keys.',
    employeeCount: 1,
    permissions: {
      modules: { pos: true, inventory: true, finance: true, hr: true, repairs: true, crm: true, vtu: true, integrations: false, auditLogs: true },
      crud: { create: true, read: true, update: true, delete: false },
      features: { approveReject: true, branchRestriction: 'none', apiAccess: 'read', advancedSettings: false }
    }
  },
  {
    name: 'Branch Manager',
    isSystem: true,
    description: 'Manage sales, inventories, employees, and accounting specifically for their assigned branch.',
    employeeCount: 3,
    permissions: {
      modules: { pos: true, inventory: true, finance: true, hr: true, repairs: true, crm: true, vtu: true, integrations: false, auditLogs: false },
      crud: { create: true, read: true, update: true, delete: false },
      features: { approveReject: true, branchRestriction: 'assigned_only', apiAccess: 'none', advancedSettings: false }
    }
  },
  {
    name: 'Cashier',
    isSystem: true,
    description: 'Execute retail sales transactions, log daily closing, and process customer loyalty points.',
    employeeCount: 5,
    permissions: {
      modules: { pos: true, inventory: false, finance: false, hr: false, repairs: false, crm: true, vtu: true, integrations: false, auditLogs: false },
      crud: { create: true, read: true, update: false, delete: false },
      features: { approveReject: false, branchRestriction: 'assigned_only', apiAccess: 'none', advancedSettings: false }
    }
  },
  {
    name: 'Sales',
    isSystem: true,
    description: 'Handle customer product consultations, show device specs, and log loyalty signups.',
    employeeCount: 4,
    permissions: {
      modules: { pos: true, inventory: true, finance: false, hr: false, repairs: false, crm: true, vtu: false, integrations: false, auditLogs: false },
      crud: { create: true, read: true, update: false, delete: false },
      features: { approveReject: false, branchRestriction: 'assigned_only', apiAccess: 'none', advancedSettings: false }
    }
  },
  {
    name: 'Technician',
    isSystem: true,
    description: 'Access the hardware repair intake ticket queues, log repair diagnoses, and mark repairs complete.',
    employeeCount: 2,
    permissions: {
      modules: { pos: false, inventory: true, finance: false, hr: false, repairs: true, crm: false, vtu: false, integrations: false, auditLogs: false },
      crud: { create: false, read: true, update: true, delete: false },
      features: { approveReject: false, branchRestriction: 'assigned_only', apiAccess: 'none', advancedSettings: false }
    }
  },
  {
    name: 'Warehouse',
    isSystem: true,
    description: 'Handle stock levels, process inter-branch stock shipments, and register raw parts.',
    employeeCount: 2,
    permissions: {
      modules: { pos: false, inventory: true, finance: false, hr: false, repairs: false, crm: false, vtu: false, integrations: false, auditLogs: false },
      crud: { create: true, read: true, update: true, delete: false },
      features: { approveReject: false, branchRestriction: 'none', apiAccess: 'none', advancedSettings: false }
    }
  },
  {
    name: 'Accountant',
    isSystem: true,
    description: 'Oversee corporate accounts, audit closing logs, write down OPEX costs, and review P&L summaries.',
    employeeCount: 1,
    permissions: {
      modules: { pos: false, inventory: false, finance: true, hr: false, repairs: false, crm: false, vtu: false, integrations: false, auditLogs: false },
      crud: { create: true, read: true, update: true, delete: false },
      features: { approveReject: true, branchRestriction: 'none', apiAccess: 'read', advancedSettings: false }
    }
  }
];

interface AdminRBACProps {
  onSimulateRoleChange: (roleName: string) => void;
  activeSimulatedRole: string;
}

export default function AdminRBAC({ onSimulateRoleChange, activeSimulatedRole }: AdminRBACProps) {
  const [roles, setRoles] = useState<RoleDef[]>(INITIAL_ROLES);
  const [selectedRoleName, setSelectedRoleName] = useState<string>('Super Admin');
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleBase, setNewRoleBase] = useState('Admin');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedRole = roles.find((r) => r.name === selectedRoleName) || roles[0];

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    if (roles.some((r) => r.name.toLowerCase() === newRoleName.toLowerCase())) {
      alert('A role with this name already exists.');
      return;
    }

    const baseRole = roles.find((r) => r.name === newRoleBase) || roles[0];
    const createdRole: RoleDef = {
      name: newRoleName.trim(),
      isSystem: false,
      description: newRoleDesc.trim() || `Custom defined role based on ${newRoleBase}`,
      employeeCount: 0,
      permissions: JSON.parse(JSON.stringify(baseRole.permissions)) // Deep clone permissions
    };

    setRoles([...roles, createdRole]);
    setSelectedRoleName(createdRole.name);
    setNewRoleName('');
    setNewRoleDesc('');
    setIsCreatingRole(false);
  };

  const handleDeleteRole = (roleName: string) => {
    if (confirm(`Are you sure you want to permanently delete the custom role "${roleName}"?`)) {
      const remaining = roles.filter((r) => r.name !== roleName);
      setRoles(remaining);
      setSelectedRoleName(remaining[0].name);
    }
  };

  const handleToggleModule = (moduleKey: keyof PermissionSchema['modules']) => {
    setRoles(
      roles.map((r) => {
        if (r.name !== selectedRoleName) return r;
        return {
          ...r,
          permissions: {
            ...r.permissions,
            modules: {
              ...r.permissions.modules,
              [moduleKey]: !r.permissions.modules[moduleKey]
            }
          }
        };
      })
    );
  };

  const handleToggleCrud = (crudKey: keyof PermissionSchema['crud']) => {
    setRoles(
      roles.map((r) => {
        if (r.name !== selectedRoleName) return r;
        return {
          ...r,
          permissions: {
            ...r.permissions,
            crud: {
              ...r.permissions.crud,
              [crudKey]: !r.permissions.crud[crudKey]
            }
          }
        };
      })
    );
  };

  const handleFeatureChange = <K extends keyof PermissionSchema['features']>(
    key: K,
    value: PermissionSchema['features'][K]
  ) => {
    setRoles(
      roles.map((r) => {
        if (r.name !== selectedRoleName) return r;
        return {
          ...r,
          permissions: {
            ...r.permissions,
            features: {
              ...r.permissions.features,
              [key]: value
            }
          }
        };
      })
    );
  };

  const handleCloneRole = (role: RoleDef) => {
    const cloneName = `${role.name} Copy`;
    if (roles.some((r) => r.name === cloneName)) {
      alert(`Clone name "${cloneName}" already exists.`);
      return;
    }
    const cloned: RoleDef = {
      ...role,
      name: cloneName,
      isSystem: false,
      description: `Cloned from ${role.name}.`,
      employeeCount: 0
    };
    setRoles([...roles, cloned]);
    setSelectedRoleName(cloneName);
  };

  const handleSaveAllPermissions = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="rbac-manager-root">
      {/* Simulation Banner */}
      <div className="col-span-12 bg-[#1a2554]/40 border border-[#3052a3]/20 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#3052a3]/10 text-[#3052a3] rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#f0f4ff] font-mono uppercase tracking-wider">Enterprise RBAC Sandbox</h4>
            <p className="text-[11px] text-[#8891ac] font-mono mt-0.5 leading-tight">
              Test dynamic system restrictions by switching your active role perspective below.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-[#0f172e] p-1.5 rounded-xl border border-[#222f5a]">
          <span className="text-[10px] text-[#8891ac] font-mono font-bold px-2 uppercase">Simulating:</span>
          <select
            value={activeSimulatedRole}
            onChange={(e) => onSimulateRoleChange(e.target.value)}
            className="bg-[#3052a3]/10 border border-[#3052a3]/20 text-[#3052a3] font-mono font-bold text-xs rounded-lg px-3 py-1 outline-none cursor-pointer"
          >
            {roles.map((r) => (
              <option key={r.name} value={r.name} className="bg-[#0f172e] text-[#b0b8d4]">
                {r.name} {r.isSystem ? '(System)' : '(Custom)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Role list sidebar */}
      <div className="lg:col-span-4 bg-[#1a2554]/15 border border-[#1a2554] p-4 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Roles Registry</span>
          <button
            onClick={() => setIsCreatingRole(true)}
            className="p-1 hover:bg-[#222f5a] rounded text-[#3052a3] transition"
            title="Create Custom Role"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {isCreatingRole ? (
          <form onSubmit={handleCreateRole} className="bg-[#0f172e] p-3 rounded-xl border border-slate-850 space-y-3 font-mono text-xs">
            <span className="text-[10px] text-[#3052a3] font-bold uppercase block">Create Custom Role</span>
            <div className="space-y-1">
              <label className="text-[#8891ac] text-[10px]">Role Name</label>
              <input
                type="text"
                required
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g. Regional Auditor"
                className="w-full bg-[#1a2554] border border-[#222f5a] rounded p-1.5 text-[#b0b8d4]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#8891ac] text-[10px]">Based on Template</label>
              <select
                value={newRoleBase}
                onChange={(e) => setNewRoleBase(e.target.value)}
                className="w-full bg-[#1a2554] border border-[#222f5a] rounded p-1.5 text-[#b0b8d4]"
              >
                {roles.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[#8891ac] text-[10px]">Brief Description</label>
              <textarea
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
                placeholder="Enter role responsibilities..."
                rows={2}
                className="w-full bg-[#1a2554] border border-[#222f5a] rounded p-1.5 text-[#b0b8d4] resize-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreatingRole(false)}
                className="flex-1 bg-[#1a2554] text-[#8891ac] py-1.5 rounded hover:text-[#b0b8d4]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#3052a3] hover:bg-indigo-600 text-slate-950 font-bold py-1.5 rounded"
              >
                Create
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
            {roles.map((role) => (
              <div
                key={role.name}
                onClick={() => setSelectedRoleName(role.name)}
                className={`w-full group relative flex flex-col p-3 rounded-xl font-mono text-xs cursor-pointer border transition ${
                  selectedRoleName === role.name
                    ? 'bg-[#0f172e] border-[#3052a3]/30 shadow'
                    : 'bg-[#1a2554]/10 border-transparent hover:border-[#222f5a] hover:bg-[#1a2554]/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${selectedRoleName === role.name ? 'text-[#3052a3]' : 'text-slate-300'}`}>
                    {role.name}
                  </span>
                  <span className="text-[9px] bg-[#1a2554] border border-[#222f5a] px-1.5 py-0.5 rounded text-slate-500">
                    {role.isSystem ? 'system' : 'custom'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">{role.description}</p>
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#1a2554]/40">
                  <span className="text-[9px] text-[#8891ac]">Roster Count: <strong className="text-[#b0b8d4]">{role.employeeCount} staff</strong></span>
                  
                  {/* Actions */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-2 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloneRole(role);
                      }}
                      className="p-1 hover:bg-[#222f5a] rounded text-[#8891ac] hover:text-[#3052a3] transition"
                      title="Clone Permission Set"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {!role.isSystem && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRole(role.name);
                        }}
                        className="p-1 hover:bg-[#222f5a] rounded text-rose-500 hover:text-rose-400 transition"
                        title="Delete Role"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permission Builder Panel */}
      <div className="lg:col-span-8 bg-[#1a2554]/15 border border-[#1a2554] p-5 rounded-2xl flex flex-col justify-between">
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1a2554] pb-3">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Permission Matrix Mapping</span>
              <h3 className="text-sm font-bold text-[#3052a3] font-mono mt-0.5">
                {selectedRole.name} Permission Config
              </h3>
            </div>
            {saveSuccess && (
              <span className="text-[10px] font-mono text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/25 px-2.5 py-1 rounded-lg animate-fade-in flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Updated role authorizations!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Col: Module Access & CRUD */}
            <div className="space-y-5">
              {/* Module access matrix */}
              <div className="space-y-2.5">
                <span className="text-[10px] text-[#8891ac] font-bold uppercase tracking-wider font-mono flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#3052a3]" />
                  <span>Module Toggles</span>
                </span>
                <div className="bg-[#0f172e]/40 border border-[#1a2554] p-3.5 rounded-xl space-y-2 font-mono text-xs">
                  {[
                    { key: 'pos', label: 'POS Checkout Terminals', desc: 'Allows access to cashier sales screens' },
                    { key: 'inventory', label: 'Warehouse & Catalog Cataloging', desc: 'Allows viewing/editing product stocks' },
                    { key: 'finance', label: 'Accounts & Expense closing', desc: 'Allows reading balance and daily books' },
                    { key: 'hr', label: 'Employee Attendance & Shift logs', desc: 'Allows onboarding staff and checking in' },
                    { key: 'repairs', label: 'Service Repair Diagnostic intake', desc: 'Allows creating and managing repair tickets' },
                    { key: 'crm', label: 'VIP Customer Roster management', desc: 'Allows adding loyalty accounts and managing credit' },
                    { key: 'vtu', label: 'Cellular Topup Gateways dispatch', desc: 'Allows executing airtime/data credit transfer' },
                    { key: 'integrations', label: 'Third-party API Webhooks Core', desc: 'Allows modifying secure system tokens' },
                    { key: 'auditLogs', label: 'Live Enterprise System Audit Logs', desc: 'Allows analyzing chronological audit trails' }
                  ].map((m) => (
                    <div key={m.key} className="flex items-start justify-between gap-4 py-1">
                      <div>
                        <span className="font-extrabold text-slate-300 block">{m.label}</span>
                        <span className="text-[9px] text-slate-500 block leading-tight">{m.desc}</span>
                      </div>
                      <button
                        onClick={() => handleToggleModule(m.key as any)}
                        className="p-1 hover:bg-[#1a2554] rounded transition"
                      >
                        {selectedRole.permissions.modules[m.key as keyof PermissionSchema['modules']] ? (
                          <ToggleRight className="w-6 h-6 text-[#3052a3]" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-slate-600" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: CRUD Operations & Rules */}
            <div className="space-y-5">
              {/* CRUD Matrix */}
              <div className="space-y-2.5">
                <span className="text-[10px] text-[#8891ac] font-bold uppercase tracking-wider font-mono flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>Action CRUD Authorizations</span>
                </span>
                <div className="bg-[#0f172e]/40 border border-[#1a2554] p-3.5 rounded-xl space-y-3 font-mono text-xs">
                  {[
                    { key: 'create', label: 'Create (C)', desc: 'Grant permission to create and onboard database models' },
                    { key: 'read', label: 'Read (R)', desc: 'Grant permission to query catalogs, profiles, and logs' },
                    { key: 'update', label: 'Update (U)', desc: 'Grant permission to modify values or update statuses' },
                    { key: 'delete', label: 'Delete (D)', desc: 'Grant permission to permanently remove ledger records' }
                  ].map((c) => (
                    <label key={c.key} className="flex items-start gap-3 cursor-pointer py-1 select-none">
                      <input
                        type="checkbox"
                        checked={selectedRole.permissions.crud[c.key as keyof PermissionSchema['crud']]}
                        onChange={() => handleToggleCrud(c.key as any)}
                        className="mt-1 accent-indigo-500 rounded cursor-pointer"
                      />
                      <div>
                        <strong className="text-slate-300 font-bold block">{c.label}</strong>
                        <span className="text-[9px] text-slate-500 leading-none">{c.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Special Controls */}
              <div className="space-y-2.5">
                <span className="text-[10px] text-[#8891ac] font-bold uppercase tracking-wider font-mono flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-[#00d4ff]" />
                  <span>Administrative Security Policies</span>
                </span>
                <div className="bg-[#0f172e]/40 border border-[#1a2554] p-3.5 rounded-xl space-y-4 font-mono text-xs">
                  {/* Approve/Reject Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-300 block">Approve & Reject Control</span>
                      <span className="text-[9px] text-slate-500 block leading-none">Allows overriding closing audits or stock transfers</span>
                    </div>
                    <button
                      onClick={() => handleFeatureChange('approveReject', !selectedRole.permissions.features.approveReject)}
                      className="p-1 hover:bg-[#1a2554] rounded transition shrink-0"
                    >
                      {selectedRole.permissions.features.approveReject ? (
                        <ToggleRight className="w-6 h-6 text-[#10b981]" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-600" />
                      )}
                    </button>
                  </div>

                  {/* Branch Restriction Dropdown */}
                  <div className="space-y-1.5 pt-2 border-t border-[#1a2554]/60">
                    <span className="font-extrabold text-slate-300 block">Branch Isolation Lockout</span>
                    <span className="text-[9px] text-slate-500 block leading-none mb-1.5">Isolate visibility of records strictly to assigned branch context</span>
                    <select
                      value={selectedRole.permissions.features.branchRestriction}
                      onChange={(e) => handleFeatureChange('branchRestriction', e.target.value as any)}
                      className="w-full bg-[#1a2554] border border-[#222f5a] rounded p-1.5 text-[#b0b8d4] text-[11px]"
                    >
                      <option value="none">No Isolation (Global Multi-Branch Access)</option>
                      <option value="assigned_only">Assigned Showroom Isolation Only</option>
                    </select>
                  </div>

                  {/* API Authorization level */}
                  <div className="space-y-1.5 pt-2 border-t border-[#1a2554]/60">
                    <span className="font-extrabold text-slate-300 block">System API Credential Token Scope</span>
                    <span className="text-[9px] text-slate-500 block leading-none mb-1.5">Restricts whether role can pull developer integration keys</span>
                    <select
                      value={selectedRole.permissions.features.apiAccess}
                      onChange={(e) => handleFeatureChange('apiAccess', e.target.value as any)}
                      className="w-full bg-[#1a2554] border border-[#222f5a] rounded p-1.5 text-[#b0b8d4] text-[11px]"
                    >
                      <option value="write">Full Read/Write Access (Manage Keys)</option>
                      <option value="read">Read Only (Telemetry check diagnostics)</option>
                      <option value="none">Blocked (Hidden integrations console)</option>
                    </select>
                  </div>

                  {/* Advanced Settings */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#1a2554]/60">
                    <div>
                      <span className="font-extrabold text-slate-300 block">Edit System Master Configuration</span>
                      <span className="text-[9px] text-slate-500 block leading-none">Allows altering legal tax parameters or service rates</span>
                    </div>
                    <button
                      onClick={() => handleFeatureChange('advancedSettings', !selectedRole.permissions.features.advancedSettings)}
                      className="p-1 hover:bg-[#1a2554] rounded transition shrink-0"
                    >
                      {selectedRole.permissions.features.advancedSettings ? (
                        <ToggleRight className="w-6 h-6 text-[#00d4ff]" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveAllPermissions}
          className="w-full mt-6 bg-gradient-to-r from-[#3052a3] to-indigo-600 text-slate-950 font-black py-3 rounded-xl uppercase transition hover:opacity-90 flex items-center justify-center space-x-1.5 shadow"
        >
          <Lock className="w-4 h-4 stroke-[2.5]" />
          <span>Save Changes to Access Policies</span>
        </button>
      </div>
    </div>
  );
}
