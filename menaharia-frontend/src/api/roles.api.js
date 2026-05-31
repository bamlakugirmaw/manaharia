import { api, unwrap } from '../lib/api';

/**
 * Roles API  (requires auth)
 * GET  /v1/roles?search=
 * POST /v1/roles
 * POST /v1/roles/assign
 * DELETE /v1/roles/assign
 */

export const listRoles = (params = {}) =>
    api.get('/roles', { params }).then(unwrap);

export const createRole = (data) =>
    api.post('/roles', data).then(unwrap);

export const assignRole = (data) =>
    api.post('/roles/assign', data).then(unwrap);

export const revokeRole = (data) =>
    api.delete('/roles/assign', { data }).then(unwrap);

export const rolesApi = { listRoles, createRole, assignRole, revokeRole };
