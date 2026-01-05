# AI Tools Permission Matrix

This document defines the permission model for the Unified AI Tools system.

---

## Permission Model Overview

### Scopes (Hierarchical)

Scopes follow a hierarchy where higher scopes include lower ones:

| Scope | Description | Includes |
|-------|-------------|----------|
| `admin` | Full system access, admin-only tools | `delete`, `write`, `read` |
| `delete` | Can delete records | `write`, `read` |
| `write` | Can create/update records | `read` |
| `read` | Can view records | - |
| `write_self` | Can modify own records only | - |

### Consumer Types

| Consumer | Description | Default Scopes |
|----------|-------------|----------------|
| `admin` | Parish administrators with full access | `admin`, `delete`, `write`, `read` |
| `staff` | Staff members (non-admin) | `delete`, `write`, `read` |
| `parishioner` | Self-service via magic link | `read`, `write_self` |
| `mcp` | External OAuth access (Claude.ai) | Based on OAuth grant |

### OAuth Scope Mapping (MCP)

| OAuth Scope | Tool Scopes Granted |
|-------------|---------------------|
| `delete` | `admin`, `delete`, `write`, `read` |
| `write` | `write`, `read` |
| `read` | `read` |

---

## Tools by Category

### People Tools

| Tool | Scope | Admin | Staff | Parishioner | MCP |
|------|-------|:-----:|:-----:|:-----------:|:---:|
| `list_people` | read | ✓ | ✓ | | ✓ |
| `get_person` | read | ✓ | ✓ | | ✓ |
| `search_people_by_name` | read | ✓ | ✓ | | ✓ |
| `get_my_info` | read | | | ✓ | |
| `create_person` | write | ✓ | ✓ | | ✓ |
| `update_person` | write | ✓ | ✓ | | ✓ |
| `update_my_info` | write_self | | | ✓ | |
| `delete_person` | delete | ✓ | ✓ | | ✓ |

### Families Tools

| Tool | Scope | Admin | Staff | Parishioner | MCP |
|------|-------|:-----:|:-----:|:-----------:|:---:|
| `list_families` | read | ✓ | ✓ | | ✓ |
| `get_family` | read | ✓ | ✓ | | ✓ |
| `get_my_family` | read | | | ✓ | |
| `create_family` | write | ✓ | ✓ | | ✓ |
| `add_family_member` | write | ✓ | ✓ | | ✓ |
| `remove_family_member` | write | ✓ | ✓ | | ✓ |
| `set_family_primary_contact` | write | ✓ | ✓ | | ✓ |
| `delete_family` | delete | ✓ | ✓ | | ✓ |

### Groups Tools

| Tool | Scope | Admin | Staff | Parishioner | MCP |
|------|-------|:-----:|:-----:|:-----------:|:---:|
| `list_groups` | read | ✓ | ✓ | ✓ | ✓ |
| `get_group` | read | ✓ | ✓ | | ✓ |
| `get_person_groups` | read | ✓ | ✓ | | ✓ |
| `get_my_groups` | read | | | ✓ | |
| `list_available_groups` | read | | | ✓ | |
| `add_to_group` | write | ✓ | ✓ | | ✓ |
| `remove_from_group` | write | ✓ | ✓ | | ✓ |
| `update_group_member_role` | write | ✓ | ✓ | | ✓ |
| `join_group` | write_self | | | ✓ | |
| `leave_group` | write_self | | | ✓ | |

### Events Tools

| Tool | Scope | Admin | Staff | Parishioner | MCP |
|------|-------|:-----:|:-----:|:-----------:|:---:|
| `list_events` | read | ✓ | ✓ | | ✓ |
| `get_calendar_events` | read | ✓ | ✓ | ✓ | ✓ |
| `get_public_calendar` | read | | | ✓ | |
| `get_my_schedule` | read | | | ✓ | |

### Masses Tools

| Tool | Scope | Admin | Staff | Parishioner | MCP |
|------|-------|:-----:|:-----:|:-----------:|:---:|
| `list_masses` | read | ✓ | ✓ | | ✓ |
| `get_mass` | read | ✓ | ✓ | | ✓ |
| `get_mass_assignments` | read | ✓ | ✓ | | ✓ |
| `find_mass_assignment_gaps` | read | ✓ | ✓ | | ✓ |
| `assign_to_mass` | write | ✓ | ✓ | | ✓ |
| `update_mass_time` | write | ✓ | ✓ | | ✓ |
| `cancel_mass` | write | ✓ | ✓ | | ✓ |
| `remove_mass_assignment` | write | ✓ | ✓ | | ✓ |

### Availability Tools

| Tool | Scope | Admin | Staff | Parishioner | MCP |
|------|-------|:-----:|:-----:|:-----------:|:---:|
| `get_person_availability` | read | ✓ | ✓ | | ✓ |
| `check_availability` | read | ✓ | ✓ | | ✓ |
| `get_my_blackouts` | read | | | ✓ | |
| `add_blackout_date` | write | ✓ | ✓ | | ✓ |
| `remove_blackout_date` | write | ✓ | ✓ | | ✓ |
| `add_my_blackout` | write_self | | | ✓ | |
| `remove_my_blackout` | write_self | | | ✓ | |

### Content Tools

| Tool | Scope | Admin | Staff | Parishioner | MCP |
|------|-------|:-----:|:-----:|:-----------:|:---:|
| `list_contents` | read | ✓ | ✓ | | ✓ |
| `get_content` | read | ✓ | ✓ | ✓ | ✓ |
| `search_content` | read | ✓ | ✓ | ✓ | ✓ |
| `list_content_tags` | read | ✓ | ✓ | ✓ | ✓ |

### Locations Tools

| Tool | Scope | Admin | Staff | Parishioner | MCP |
|------|-------|:-----:|:-----:|:-----------:|:---:|
| `list_locations` | read | ✓ | ✓ | ✓ | ✓ |
| `get_location` | read | ✓ | ✓ | ✓ | ✓ |
| `create_location` | write | ✓ | ✓ | | ✓ |
| `update_location` | write | ✓ | ✓ | | ✓ |
| `delete_location` | delete | ✓ | ✓ | | ✓ |

### Settings Tools

| Tool | Scope | Admin | Staff | Parishioner | MCP |
|------|-------|:-----:|:-----:|:-----------:|:---:|
| `get_parish_info` | read | ✓ | ✓ | ✓ | ✓ |
| `list_event_types` | read | ✓ | ✓ | | ✓ |
| `get_event_type` | read | ✓ | ✓ | | ✓ |
| `list_custom_lists` | read | ✓ | ✓ | | ✓ |
| `get_mass_settings` | read | ✓ | ✓ | | ✓ |
| `get_parish_settings` | read | ✓ | ✓ | | ✓ |

### Documentation Tools

| Tool | Scope | Admin | Staff | Parishioner | MCP |
|------|-------|:-----:|:-----:|:-----------:|:---:|
| `search_documentation` | read | ✓ | ✓ | | |

### Developer Tools (Admin Only)

| Tool | Scope | Admin | Staff | Parishioner | MCP |
|------|-------|:-----:|:-----:|:-----------:|:---:|
| `invite_to_demo_parish` | admin | ✓ | | | ✓* |
| `list_demo_parish_invitations` | admin | ✓ | | | ✓* |
| `revoke_demo_parish_invitation` | admin | ✓ | | | ✓* |

*MCP requires `delete` OAuth scope to access admin tools

### Parishioner-Specific Tools

| Tool | Scope | Admin | Staff | Parishioner | MCP |
|------|-------|:-----:|:-----:|:-----------:|:---:|
| `get_my_schedule` | read | | | ✓ | |
| `get_public_calendar` | read | | | ✓ | |
| `get_mass_times` | read | | | ✓ | |
| `get_liturgical_info` | read | | | ✓ | |
| `get_my_info` | read | | | ✓ | |
| `update_my_info` | write_self | | | ✓ | |
| `get_my_family` | read | | | ✓ | |
| `get_my_groups` | read | | | ✓ | |
| `list_available_groups` | read | | | ✓ | |
| `join_group` | write_self | | | ✓ | |
| `leave_group` | write_self | | | ✓ | |
| `search_readings` | read | | | ✓ | |
| `get_parish_locations` | read | | | ✓ | |

---

## Summary by Consumer

### Admin (39 tools)
Full access to all tools including developer-only tools.

### Staff (36 tools)
Access to most tools except:
- Developer tools (`invite_to_demo_parish`, etc.)
- Parishioner self-service tools (`get_my_*`, `update_my_*`, `join_group`, `leave_group`)

### Parishioner (20 tools)
Limited to self-service operations:
- View own information and family
- View public calendar and Mass times
- Manage own group memberships
- Manage own blackout dates
- Search public content

### MCP (36 tools with full OAuth)
Same as Staff by default. With `delete` OAuth scope, gains access to admin tools.

---

## Implementation Notes

1. **Scope Hierarchy**: A tool requiring `read` scope is accessible to users with `read`, `write`, `delete`, or `admin` scopes.

2. **Consumer + Scope Check**: Both must pass. A tool must be in `allowedConsumers` AND the user must have the `requiredScope`.

3. **write_self Scope**: Special scope that only allows modifications to the user's own records. Used exclusively by parishioner tools.

4. **Admin Detection**: Staff Chat checks `parish_users.roles` to determine if user is admin, granting full tool access.

5. **MCP OAuth Mapping**: The `delete` OAuth scope grants admin-level tool access for external clients.
