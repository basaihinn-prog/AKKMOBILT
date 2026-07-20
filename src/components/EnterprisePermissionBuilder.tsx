import React, { useState } from 'react';
import { Shield, Plus, Edit2, Trash2, Copy, Users, Lock, Eye, CheckCircle2, AlertCircle, Save, X } from 'lucide-react';
import { RoleType, PermissionSchema, CRUDPermissions } from '../types';
import { RBACEngine } from '../lib/rbac-engine';

interface PermissionBuilderProps {
  currentUserRole: RoleType;
}

interface CustomRole {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: PermissionSchema;
  userCount: number;
}

export default function EnterprisePermissionBuilder({ currentUserRole }: PermissionBuilderProps) {
  const [roles, setRoles] = useState<CustomRole[]>([
    {
      id: 'role-owner',
      name: 'Owner',
      description: 'Full system access with ownership rights',
      isSystem: true,
      permissions: RBACEngine.getRoleDefinition('Owner'),
      userCount: 1,
    },
    {
      id: 'role-super-admin',
      name: 'Super Admin',
      description: 'Complete administrative control across all branches',
      isSystem: true,
      permissions: RBACEngine.getRoleDefinition('Super Admin'),
      userCount: 2,
    },
  ]);

  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedRole, setSelectedRole] = useState<CustomRole | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<PermissionSchema | null>(null);
  const [showDetails, setShowDetails] = useState<CustomRole | null>(null);

  const canCreateRoles = ['Owner', 'Super Admin'].includes(currentUserRole);

  // Module toggles
  const moduleNames = Object.keys(
    RBACEngine.getRoleDefinition('Admin').modules
  ) as Array<keyof PermissionSchema['modules']>;

  // Approval toggles
  const approvalNames = Object.keys(
    RBACEngine.getRoleDefinition('Admin').approvals
  ) as Array<keyof PermissionSchema['approvals']>;

  const handleCreateRole = () => {
    setSelectedRole(null);
    setEditingPermissions(RBACEngine.getRoleDefinition('Admin'));
    setActiveTab('create');
  };

  const handleEditRole = (role: CustomRole) => {
    if (role.isSystem) {
      setShowDetails(role);
      return;
    }
    setSelectedRole(role);
    setEditingPermissions({ ...role.permissions });
    setActiveTab('edit');
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (role?.isSystem) {
      alert('Cannot delete system roles');
      return;
    }
    if (role?.userCount && role.userCount > 0) {
      alert(`Cannot delete role with ${role.userCount} users. Move users to another role first.`);
      return;
    }
    if (confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter((r) => r.id !== roleId));
    }
  };

  const handleCloneRole = (role: CustomRole) => {
    const newRole: CustomRole = {
      id: `role-${Date.now()}`,
      name: `${role.name} (Copy)`,
      description: role.description,
      isSystem: false,
      permissions: { ...role.permissions },
      userCount: 0,
    };
    setRoles([...roles, newRole]);
  };

  const handleSavePermissions = () => {
    if (!editingPermissions) return;

    const roleName = (document.getElementById('roleName') as HTMLInputElement)?.value || 'New Role';
    const roleDescription = (document.getElementById('roleDescription') as HTMLTextAreaElement)?.value || '';

    if (selectedRole) {
      // Update existing role
      setRoles(
        roles.map((r) =>
          r.id === selectedRole.id
            ? { ...r, name: roleName, description: roleDescription, permissions: editingPermissions }
            : r
        )
      );
    } else {
      // Create new role
      const newRole: CustomRole = {
        id: `role-${Date.now()}`,
        name: roleName,
        description: roleDescription,
        isSystem: false,
        permissions: editingPermissions,
        userCount: 0,
      };
      setRoles([...roles, newRole]);
    }

    setActiveTab('list');
    setSelectedRole(null);
    setEditingPermissions(null);
  };

  const handleToggleModule = (module: keyof PermissionSchema['modules']) => {
    if (!editingPermissions) return;
    setEditingPermissions({
      ...editingPermissions,
      modules: {
        ...editingPermissions.modules,
        [module]: !editingPermissions.modules[module],
      },
    });
  };

  const handleToggleCRUD = (operation: keyof CRUDPermissions) => {
    if (!editingPermissions) return;
    setEditingPermissions({
      ...editingPermissions,
      crud: {
        ...editingPermissions.crud,
        [operation]: !editingPermissions.crud[operation],
      },
    });
  };

  const handleToggleApproval = (approval: keyof PermissionSchema['approvals']) => {
    if (!editingPermissions) return;
    setEditingPermissions({
      ...editingPermissions,
      approvals: {
        ...editingPermissions.approvals,
        [approval]: !editingPermissions.approvals[approval],
      },
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Permission Builder</h2>
            <p className="text-sm text-gray-600">Create and manage roles with granular permissions</p>
          </div>
        </div>
        {canCreateRoles && activeTab === 'list' && (
          <button
            onClick={handleCreateRole}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Create Role
          </button>
        )}
      </div>

      {/* LIST VIEW */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                    {role.isSystem && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                        System Role
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{role.userCount} user{role.userCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {Object.values(role.permissions.modules).filter(Boolean).length}/
                        {Object.keys(role.permissions.modules).length} modules
                      </span>
                    </div>
                  </div>
                </div>
                {canCreateRoles && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditRole(role)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      title="View/Edit"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    {!role.isSystem && (
                      <>
                        <button
                          onClick={() => handleCloneRole(role)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                          title="Clone role"
                        >
                          <Copy className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition"
                          title="Delete role"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE/EDIT VIEW */}
      {(activeTab === 'create' || activeTab === 'edit') && editingPermissions && (
        <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {selectedRole ? 'Edit Role' : 'Create New Role'}
            </h3>
            <button
              onClick={() => {
                setActiveTab('list');
                setSelectedRole(null);
                setEditingPermissions(null);
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="space-y-6 pb-6">
            {/* Role Info */}
            <div className="grid grid-cols-2 gap-4">
              <input
                id="roleName"
                type="text"
                defaultValue={selectedRole?.name}
                placeholder="Role name"
                className="px-3 py-2 border border-gray-200 rounded-lg"
              />
              <div />
              <textarea
                id="roleDescription"
                defaultValue={selectedRole?.description}
                placeholder="Role description"
                rows={2}
                className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>

            {/* Module Access */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Module Access
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {moduleNames.map((module) => (
                  <label
                    key={module}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                  >
                    <input
                      type="checkbox"
                      checked={editingPermissions.modules[module]}
                      onChange={() => handleToggleModule(module)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {module.charAt(0).toUpperCase() + module.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* CRUD Operations */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Basic CRUD Operations</h4>
              <div className="grid grid-cols-4 gap-3">
                {Object.keys(editingPermissions.crud).map((op) => (
                  <label
                    key={op}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                  >
                    <input
                      type="checkbox"
                      checked={(editingPermissions.crud as any)[op]}
                      onChange={() => handleToggleCRUD(op as keyof CRUDPermissions)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {op.charAt(0).toUpperCase() + op.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Approval Permissions */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Approval Permissions
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {approvalNames.map((approval) => (
                  <label
                    key={approval}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                  >
                    <input
                      type="checkbox"
                      checked={(editingPermissions.approvals as any)[approval]}
                      onChange={() => handleToggleApproval(approval as keyof PermissionSchema['approvals'])}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {approval
                        .replace(/([A-Z])/g, ' $1')
                        .replace('_', ' ')
                        .trim()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Branch Restriction */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Branch Restriction</h4>
              <select
                value={editingPermissions.features.branchRestriction}
                onChange={(e) =>
                  setEditingPermissions({
                    ...editingPermissions,
                    features: {
                      ...editingPermissions.features,
                      branchRestriction: e.target.value as any,
                    },
                  })
                }
                className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg"
              >
                <option value="none">No Restriction - Access All Branches</option>
                <option value="assigned_only">Assigned Branch Only</option>
                <option value="assigned_and_downstream">Assigned & Downstream Branches</option>
              </select>
            </div>

            {/* Advanced Features */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Advanced Features</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    checked={editingPermissions.features.restrictFinancialData}
                    onChange={() =>
                      setEditingPermissions({
                        ...editingPermissions,
                        features: {
                          ...editingPermissions.features,
                          restrictFinancialData: !editingPermissions.features.restrictFinancialData,
                        },
                      })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Restrict Financial Data</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    checked={editingPermissions.features.twoFactorRequired}
                    onChange={() =>
                      setEditingPermissions({
                        ...editingPermissions,
                        features: {
                          ...editingPermissions.features,
                          twoFactorRequired: !editingPermissions.features.twoFactorRequired,
                        },
                      })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Require 2-Factor Authentication</span>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 border-t border-gray-200 pt-6">
            <button
              onClick={handleSavePermissions}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Save className="w-4 h-4" />
              Save Role
            </button>
            <button
              onClick={() => {
                setActiveTab('list');
                setSelectedRole(null);
                setEditingPermissions(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* DETAILS VIEW (System Roles) */}
      {showDetails && showDetails.isSystem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">{showDetails.name} - Permissions</h3>
              <button onClick={() => setShowDetails(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <p className="text-gray-700">{showDetails.description}</p>
              <div>
                <p className="font-semibold text-gray-900 mb-2">Modules:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(showDetails.permissions.modules).map(([module, hasAccess]) =>
                    hasAccess ? (
                      <span key={module} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {module}
                      </span>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
