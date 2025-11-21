/**
 * Mass Role Report Builder
 *
 * Generates HTML reports for mass role member lists
 */

import { MassRoleWithRelations } from '@/lib/actions/mass-roles'
import { formatPersonName } from '@/lib/utils/formatters'
import { MASS_ROLE_MEMBERSHIP_TYPE_LABELS } from '@/lib/constants'
import { ReportBuilder } from './types'

interface MassRoleReportParams {
  massRole: MassRoleWithRelations
}

export const buildMassRoleReport: ReportBuilder<MassRoleReportParams> = ({ massRole }) => {
  const activeMembers = massRole.mass_role_members?.filter(m => m.active) || []
  const inactiveMembers = massRole.mass_role_members?.filter(m => !m.active) || []

  const activeRows = activeMembers.map(member => `
    <tr>
      <td>${formatPersonName(member.person)}</td>
      <td>${MASS_ROLE_MEMBERSHIP_TYPE_LABELS[member.membership_type].en}</td>
      <td>${member.person.email || '—'}</td>
      <td>${member.person.phone_number || '—'}</td>
    </tr>
  `).join('')

  const inactiveRows = inactiveMembers.map(member => `
    <tr>
      <td>${formatPersonName(member.person)}</td>
      <td>${MASS_ROLE_MEMBERSHIP_TYPE_LABELS[member.membership_type].en}</td>
      <td>${member.person.email || '—'}</td>
      <td>${member.person.phone_number || '—'}</td>
    </tr>
  `).join('')

  return `
    <h1 class="report-title">${massRole.name}</h1>
    <p class="report-subtitle">Member List</p>

    ${massRole.description ? `
      <div class="report-date-info">
        <p>${massRole.description}</p>
      </div>
    ` : ''}

    <h2>Active Members (${activeMembers.length})</h2>

    ${activeMembers.length === 0 ? `
      <p>No active members assigned to this role.</p>
    ` : `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Email</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          ${activeRows}
        </tbody>
      </table>
    `}

    ${inactiveMembers.length > 0 ? `
      <h2>Inactive Members (${inactiveMembers.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Email</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          ${inactiveRows}
        </tbody>
      </table>
    ` : ''}

    <div class="totals-section">
      <div class="totals-row">
        <span class="totals-label">Total Active Members:</span>
        <span>${activeMembers.length}</span>
      </div>
      ${inactiveMembers.length > 0 ? `
        <div class="totals-row">
          <span class="totals-label">Total Inactive Members:</span>
          <span>${inactiveMembers.length}</span>
        </div>
      ` : ''}
    </div>
  `
}
