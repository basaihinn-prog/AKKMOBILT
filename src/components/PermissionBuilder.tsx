/**
 * Enterprise Permission Builder Interface
 * Visual RBAC: Create/Edit roles, module permissions, CRUD, branch restrictions, page visibility
 */

import React, { useState, useMemo } from 'react';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Check,
  Copy,
  Settings,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Users,
  Package,
  DollarSign,
  Wrench,
  User,
  GitBranch,
  AlertCircle,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Search,
} from 'lucide-react';

import type { Role, RoleType, PermissionSchema } from '../types';
import { DEFAULT_PERMISSIONS } from '../lib/permissions';

interface PermissionBuilderProps {
  onCreateRole?: (role: Role) => void;
  onUpdateRole?: (roleId: string, role: Role) => void;
  onDeleteRole?: (roleId: string) => void;
}

export default function PermissionBuilder({
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
}: PermissionBuilderProps) {
  const [activeView, setActiveView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock roles
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'role-owner',
      name: 'Owner',
      isSystem: true,
      description: 'Full system access and ownership rights',
      permissions: DEFAULT_PERMISSIONS['Owner'],
      employeeCount: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'role-superadmin',
      name: 'Super Admin',
      isSystem: true,
      description: 'Administrative access across all systems',
      permissions: DEFAULT_PERMISSIONS['Super Admin'],
      employeeCount: 2,
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z',
    },
    {
      id: 'role-admin',
      name: 'Admin',
      isSystem: true,
      description: 'Administrative access with branch restrictions',
      permissions: DEFAULT_PERMISSIONS['Admin'],
      employeeCount: 3,
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z',
    },
    {
      id: 'role-manager',
      name: 'Branch Manager',
      isSystem: true,
      description: 'Manage assigned branch operations',
      permissions: DEFAULT_PERMISSIONS['Branch Manager'],
      employeeCount: 3,
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-01T00:00:00Z',
    },
  ]);

  const [editingPermissions, setEditingPermissions] = useState<PermissionSchema | null>(null);
  const [editingRoleName, setEditingRoleName] = useState<string>('');
  const [editingRoleDescription, setEditingRoleDescription] = useState<string>('');

  // Module icons
  const moduleIcons: Record<string, React.ReactNode> = {
    pos: <DollarSign size={18} />,
    inventory: <Package size={18} />,
    finance: <DollarSign size={18} />,
    hr: <Users size={18} />,
    repairs: <Wrench size={18} />,
    crm: <User size={18} />,
    vtu: <Package size={18} />,
    integrations: <Settings size={18} />,
    auditLogs: <Shield size={18} />,
  };

  const moduleLabels: Record<string, string> = {
    pos: 'Point of Sale',
    inventory: 'Inventory',
    finance: 'Finance',
    hr: 'HR & Payroll',
    repairs: 'Repair Services',
    crm: 'Customer Relations',
    vtu: 'VTU/E-Load',
    integrations: 'Integrations',
    auditLogs: 'Audit Logs',
  };

  // Filter roles
  const filteredRoles = useMemo(() => {
    return roles.filter(role =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [roles, searchQuery]);

  const handleEditRole = (role: Role) => {
    setSelectedRole(role.name as RoleType);
    setEditingRoleName(role.name);
    setEditingRoleDescription(role.description);
    setEditingPermissions(JSON.parse(JSON.stringify(role.permissions)));
    setActiveView('edit');
  };

  const handleSavePermissions = () => {
    if (!selectedRole || !editingPermissions) return;

    const updatedRole = roles.find(r => r.name === selectedRole);
    if (updatedRole) {
      updatedRole.permissions = editingPermissions;
      updatedRole.description = editingRoleDescription;
      onUpdateRole?.(updatedRole.id, updatedRole);
    }

    setActiveView('list');
    setSelectedRole(null);
    setEditingPermissions(null);
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen text-white p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-2">
            <Shield size={32} className="text-blue-400" />
            Permission Builder
          </h1>
          <p className="text-slate-400 mt-1">Create and manage roles, permissions, and access controls</p>
        </div>

        {activeView === 'list' && (
          <button
            onClick={() => setActiveView('create')}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
          >
            <Plus size={18} />
            New Role
          </button>
        )}
      </div>

      {/* LIST VIEW */}
      {activeView === 'list' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map(role => (
              <div
                key={role.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 rounded-lg p-3">
                      <Shield size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{role.name}</h3>
                      {role.isSystem && (
                        <span className="inline-block bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded text-xs font-medium mt-1">
                          System Role
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-slate-400 text-sm mb-4">{role.description}</p>

                <div className="space-y-2 text-sm mb-4 pt-4 border-t border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Assigned to</span>
                    <span className="font-bold">{role.employeeCount} employees</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Module Access</span>
                    <span className="font-bold text-emerald-400">
                      {Object.values(role.permissions.modules).filter(Boolean).length}/9
                    </span>
                  </div>
                </div>

                {/* Permission Summary */}
                <div className="flex flex-wrap gap-2 mb-4 pt-3 border-t border-slate-700">
                  {Object.entries(role.permissions.modules)
                    .filter(([_, enabled]) => enabled)
                    .slice(0, 3)
                    .map(([module]) => (
                      <div key={module} className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        {moduleIcons[module]}
                        {moduleLabels[module].split(' ')[0]}
                      </div>
                    ))}
                  {Object.values(role.permissions.modules).filter(Boolean).length > 3 && (
                    <div className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs font-medium">
                      +{Object.values(role.permissions.modules).filter(Boolean).length - 3} more
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditRole(role)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded font-medium text-sm transition flex items-center justify-center gap-2"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  {!role.isSystem && (
                    <button className="flex-1 bg-red-600/20 hover:bg-red-600/30 px-3 py-2 rounded font-medium text-sm text-red-400 transition flex items-center justify-center gap-2">
                      <Trash2 size={14} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT VIEW */}
      {activeView === 'edit' && editingPermissions && selectedRole && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setActiveView('list');
                setSelectedRole(null);
                setEditingPermissions(null);
              }}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
            >
              <ChevronRight size={18} className="rotate-180" />
              Back to List
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setActiveView('list');
                  setSelectedRole(null);
                }}
                className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
              >
                <X size={18} />
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
              >
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6">
            {/* Role Metadata */}
            <div>
              <h2 className="text-xl font-bold mb-4">Role Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Role Name</label>
                  <input
                    type="text"
                    value={editingRoleName}
                    onChange={(e) => setEditingRoleName(e.target.value)}
                    disabled
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white opacity-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Description</label>
                  <textarea
                    value={editingRoleDescription}
                    onChange={(e) => setEditingRoleDescription(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 h-24 resize-none"
                    placeholder="Role description..."
                  />
                </div>
              </div>
            </div>

            {/* Module Permissions */}
            <div>
              <h2 className="text-xl font-bold mb-4">Module Access</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(editingPermissions.modules).map(([module, enabled]) => (
                  <div key={module} className="bg-slate-700 rounded-lg p-4">
                    <button
                      onClick={() => {
                        setEditingPermissions({
                          ...editingPermissions,
                          modules: {
                            ...editingPermissions.modules,
                            [module]: !enabled,
                          },
                        });
                      }}
                      className="w-full flex items-center justify-between hover:bg-slate-600 p-2 rounded transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-blue-400">{moduleIcons[module]}</div>
                        <span className="font-medium">{moduleLabels[module]}</span>
                      </div>
                      {enabled ? (
                        <ToggleRight size={20} className="text-emerald-400" />
                      ) : (
                        <ToggleLeft size={20} className="text-slate-500" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* CRUD Permissions */}
            <div>
              <h2 className="text-xl font-bold mb-4">Data Operations (CRUD)</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['create', 'read', 'update', 'delete'].map(action => (
                  <div key={action} className="bg-slate-700 rounded-lg p-4">
                    <button
                      onClick={() => {
                        setEditingPermissions({
                          ...editingPermissions,
                          crud: {
                            ...editingPermissions.crud,
                            [action]: !editingPermissions.crud[action as keyof typeof editingPermissions.crud],
                          },
                        });
                      }}
                      className="w-full flex items-center justify-between hover:bg-slate-600 p-2 rounded transition"
                    >
                      <span className="font-medium capitalize">{action}</span>
                      {editingPermissions.crud[action as keyof typeof editingPermissions.crud] ? (
                        <Check size={18} className="text-emerald-400" />
                      ) : (
                        <X size={18} className="text-slate-500" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Features */}
            <div>
              <h2 className="text-xl font-bold mb-4">Advanced Features</h2>
              <div className="space-y-4">
                {/* Approve/Reject */}
                <div className="flex items-center justify-between bg-slate-700 p-4 rounded-lg">
                  <div>
                    <p className="font-medium">Approve/Reject Actions</p>
                    <p className="text-sm text-slate-400">Can approve or reject pending operations</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingPermissions({
                        ...editingPermissions,
                        features: {
                          ...editingPermissions.features,
                          approveReject: !editingPermissions.features.approveReject,
                        },
                      });
                    }}
                    className="transition"
                  >
                    {editingPermissions.features.approveReject ? (
                      <ToggleRight size={24} className="text-emerald-400" />
                    ) : (
                      <ToggleLeft size={24} className="text-slate-500" />
                    )}
                  </button>
                </div>

                {/* Branch Restriction */}
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="font-medium mb-3">Branch Restriction</p>
                  <select
                    value={editingPermissions.features.branchRestriction}
                    onChange={(e) => {
                      setEditingPermissions({
                        ...editingPermissions,
                        features: {
                          ...editingPermissions.features,
                          branchRestriction: e.target.value as any,
                        },
                      });
                    }}
                    className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="none">No Restriction (All Branches)</option>
                    <option value="assigned_only">Assigned Branch Only</option>
                    <option value="assigned_and_downstream">Assigned + Downstream Branches</option>
                  </select>
                </div>

                {/* API Access */}
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="font-medium mb-3">API Access Level</p>
                  <select
                    value={editingPermissions.features.apiAccess}
                    onChange={(e) => {
                      setEditingPermissions({
                        ...editingPermissions,
                        features: {
                          ...editingPermissions.features,
                          apiAccess: e.target.value as any,
                        },
                      });
                    }}
                    className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="none">No API Access</option>
                    <option value="read">Read Only</option>
                    <option value="write">Read & Write</option>
                  </select>
                </div>

                {/* Advanced Settings */}
                <div className="flex items-center justify-between bg-slate-700 p-4 rounded-lg">
                  <div>
                    <p className="font-medium">Advanced Settings</p>
                    <p className="text-sm text-slate-400">Access to system configuration</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingPermissions({
                        ...editingPermissions,
                        features: {
                          ...editingPermissions.features,
                          advancedSettings: !editingPermissions.features.advancedSettings,
                        },
                      });
                    }}
                    className="transition"
                  >
                    {editingPermissions.features.advancedSettings ? (
                      <ToggleRight size={24} className="text-emerald-400" />
                    ) : (
                      <ToggleLeft size={24} className="text-slate-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Permissions Summary */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <CheckCircle size={20} className="text-emerald-400" />
                Permission Summary
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-slate-400">Module Access:</span>{' '}
                  <span className="font-bold">
                    {Object.values(editingPermissions.modules).filter(Boolean).length}/9
                  </span>
                </p>
                <p>
                  <span className="text-slate-400">CRUD Operations:</span>{' '}
                  <span className="font-bold">
                    {Object.values(editingPermissions.crud).filter(Boolean).length}/4
                  </span>
                </p>
                <p>
                  <span className="text-slate-400">Branch Restriction:</span>{' '}
                  <span className="font-bold capitalize">{editingPermissions.features.branchRestriction.replace(/_/g, ' ')}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
