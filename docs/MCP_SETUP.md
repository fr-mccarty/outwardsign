# MCP Server Setup Guide

This guide explains how to connect Outward Sign to Claude Desktop using the Model Context Protocol (MCP).

## Overview

The Outward Sign MCP server allows Claude Desktop to:
- Query parish data (people, families, groups, events, masses)
- Create and update records
- Manage mass intentions and assignments
- Access content library and locations
- **Developer-only**: Invite users to the demo parish

## Prerequisites

1. An Outward Sign account with admin or staff access
2. Claude Desktop installed ([download](https://claude.ai/download))
3. Node.js 18+ installed (for npx)

---

## Developer Quick Start

If you're the developer (fr.mccarty@gmail.com), a pre-configured API key is seeded automatically:

```json
{
  "mcpServers": {
    "outward-sign": {
      "command": "npx",
      "args": ["-y", "@outwardsign/mcp"],
      "env": {
        "OUTWARD_SIGN_API_KEY": "os_dev_DEVELOPMENT_KEY_12345678"
      }
    }
  }
}
```

This key:
- Is created when you run `npm run db:fresh`
- Has full access (read, write, delete scopes)
- Never expires
- Is linked to the dev user account

The key is also stored in `.env.local` as `MCP_DEV_API_KEY` for reference.

---

## Step 1: Generate an API Key

1. Log in to Outward Sign
2. Go to **Settings > Parish Settings > API Keys**
3. Click **Create API Key**
4. Enter a name (e.g., "Claude Desktop - MacBook")
5. Select scopes:
   - **Read**: Query and list data (always recommended)
   - **Write**: Create and update records
   - **Delete**: Remove records (use with caution)
6. Optionally set an expiration date
7. Click **Create Key**
8. **Copy the API key immediately** - it won't be shown again!

## Step 2: Configure Claude Desktop

### macOS

1. Open the Claude Desktop configuration file:
   ```bash
   open ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

   If the file doesn't exist, create it.

2. Add the Outward Sign MCP server configuration:

```json
{
  "mcpServers": {
    "outward-sign": {
      "command": "npx",
      "args": ["-y", "@outwardsign/mcp"],
      "env": {
        "OUTWARD_SIGN_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

3. Replace `your-api-key-here` with the API key you generated.

4. Save the file and restart Claude Desktop.

### Windows

1. Open the configuration file at:
   ```
   %APPDATA%\Claude\claude_desktop_config.json
   ```

2. Add the same configuration as shown above.

3. Save and restart Claude Desktop.

## Step 3: Verify Connection

After restarting Claude Desktop:

1. Look for the MCP icon (hammer/tools) in the Claude interface
2. Click it to see available tools - you should see Outward Sign tools listed
3. Try a simple query: "List people in my parish"

## Available Tools

### People
- `list_people` - Search and list parish members
- `get_person` - Get details for a specific person
- `search_people_by_name` - Find people by name
- `create_person` - Add a new person (requires write scope)
- `update_person` - Update person details (requires write scope)
- `delete_person` - Soft-delete a person (requires delete scope)

### Families
- `list_families` - List all families
- `get_family` - Get family details with members
- `create_family` - Create a new family
- `add_family_member` - Add person to family
- `remove_family_member` - Remove person from family

### Groups
- `list_groups` - List ministry groups
- `get_group` - Get group details with members
- `get_person_groups` - Get groups a person belongs to
- `add_group_member` - Add person to group
- `remove_group_member` - Remove from group

### Events
- `list_events` - List upcoming events
- `get_event` - Get event details
- `list_event_assignments` - See who's assigned to an event
- `assign_person_to_event` - Assign someone to an event
- `remove_event_assignment` - Remove an assignment

### Masses
- `list_masses` - List upcoming masses
- `get_mass` - Get mass details
- `list_mass_assignments` - See mass assignments
- `assign_person_to_mass` - Assign someone to a mass
- `get_mass_intentions` - Get intentions for a mass

### Availability
- `check_person_availability` - Check if someone is available
- `get_person_blackout_dates` - Get blackout dates

### Content
- `list_contents` - List content library items
- `get_content` - Get content details
- `search_content` - Search by keywords

### Locations
- `list_locations` - List parish locations
- `get_location` - Get location details
- `create_location` - Add a new location
- `update_location` - Update location
- `delete_location` - Remove a location

### Settings
- `get_parish_info` - Get parish information
- `list_event_types` - List event types
- `get_event_type` - Get event type details
- `list_custom_lists` - List custom lists
- `get_mass_settings` - Get mass configuration
- `get_parish_settings` - Get parish settings

### Developer-Only Tools

These tools only work for developer accounts (fr.mccarty@gmail.com):

- `invite_to_demo_parish` - Create an invitation to the demo parish
- `list_demo_parish_invitations` - View all demo parish invitations
- `revoke_demo_parish_invitation` - Revoke a pending invitation

## Example Conversations

### Finding People
> "Find everyone named Smith in the parish"

Claude will use `search_people_by_name` to find matching people.

### Managing Mass Assignments
> "Who is serving at the 10:30 Mass this Sunday?"

Claude will use `list_masses` and `list_mass_assignments` to find the information.

### Creating Records
> "Add John Doe to the Lectors group"

Claude will search for John Doe, find the Lectors group, and use `add_group_member`.

### Developer: Inviting to Demo Parish
> "Invite test@example.com to the demo parish as an admin"

Claude will use `invite_to_demo_parish` to create the invitation.

## Troubleshooting

### "Server not found" or tools not appearing

1. Check that Node.js is installed: `node --version`
2. Verify the config file path is correct
3. Ensure the JSON is valid (no trailing commas)
4. Restart Claude Desktop completely

### "Unauthorized" or "Invalid API key"

1. Verify the API key was copied correctly (no extra spaces)
2. Check if the key has been revoked in Settings
3. Ensure the key hasn't expired
4. Verify you have the required scopes for the operation

### "Insufficient permissions"

1. Check your API key scopes in Settings
2. Write operations require the `write` scope
3. Delete operations require the `delete` scope

### Developer tools not working

1. Only `fr.mccarty@gmail.com` has access to developer tools
2. Ensure your API key is associated with the developer account
3. Developer tools require `write` or `delete` scopes

## Security Best Practices

1. **Use minimal scopes**: Only enable scopes you need
2. **Set expiration dates**: For temporary access, set an expiration
3. **Revoke unused keys**: Remove keys you no longer use
4. **One key per device**: Create separate keys for each device
5. **Don't share keys**: Each user should have their own key

## API Key Management

### Viewing Keys
Go to Settings > Parish Settings > API Keys to see all your keys.

### Revoking Keys
Click the menu on any active key and select "Revoke". This immediately disables the key.

### Deleting Keys
Revoked keys can be permanently deleted by clicking the delete button.

## Support

For issues with the MCP server:
- Check the [Outward Sign GitHub](https://github.com/outwardsign/outwardsign)
- Review Claude Desktop logs for error messages
- Contact support through the app
