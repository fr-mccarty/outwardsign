# AI Tool Permissions

## Overview

The AI Tool Permissions editor is a local development tool that allows developers to configure access control for the AI assistant's capabilities. This page provides a visual interface for managing which user types can access each AI tool and what permission level is required.

## Accessing the Editor

The permissions editor is only available in local development environments and is restricted to developers (users whose email matches the `DEV_USER_EMAIL` environment variable). Access it via the sidebar under **Local Developer > AI Tool Permissions** or navigate directly to `/settings/developer-tools/permissions`.

## Key Concepts

### Scopes

Scopes define the permission level required to use a tool. They follow a hierarchical model where higher scopes include all lower permissions:

- **read**: View-only access to data (e.g., listing masses, viewing people)
- **write**: Create and update records (e.g., creating events, updating schedules)
- **write_self**: Modify only records belonging to the current user (e.g., updating own profile)
- **delete**: Remove records from the system
- **admin**: Full administrative access including system configuration

When a tool requires a certain scope, the user must have at least that permission level to execute the tool.

### Consumers

Consumers represent the different contexts from which AI tools can be invoked:

- **admin**: Parish administrators with full system access
- **staff**: Parish staff members with operational permissions
- **parishioner**: Regular parish members with limited, self-service access
- **mcp**: External integrations via the Model Context Protocol

Each tool can be enabled or disabled for specific consumer types, allowing fine-grained control over who can use which capabilities.

### Categories

Tools are organized into categories based on their function:

- **masses**: Mass scheduling and management
- **people**: Parishioner and contact management
- **families**: Family record operations
- **groups**: Ministry and group management
- **events**: Parish event coordination
- **calendar**: Calendar and scheduling
- **locations**: Venue and facility management
- **settings**: System configuration

## Using the Editor

### Filtering and Search

Use the search box to find tools by name or description. The category dropdown filters tools by functional area. The interface displays a count of visible tools relative to the total.

### Modifying Permissions

For each tool, you can:

1. **Change the Required Scope**: Use the dropdown in the "Required Scope" column to select the minimum permission level needed to execute the tool.

2. **Toggle Consumer Access**: Check or uncheck the boxes under Admin, Staff, Parishioner, and MCP columns to control which user types can access the tool.

### Saving Changes

Click **Save Changes** to write your modifications to the `tool-permissions.json` file. The **Reset** button reverts to the last saved state. A warning indicator appears when you have unsaved changes.

## Deployment Workflow

Changes made in the permissions editor are saved to a local JSON file (`src/lib/ai-tools/unified/tool-permissions.json`). This file is part of the codebase and must be committed and pushed to take effect in production.

**Workflow:**
1. Make permission changes in the local development environment
2. Test the changes locally to verify expected behavior
3. Commit the modified `tool-permissions.json` file
4. Push to your repository and deploy

The permissions are loaded at application startup, so production servers will use the committed configuration.

## Security Considerations

- Always follow the principle of least privilege when assigning permissions
- Parishioner-facing tools should typically use `read` or `write_self` scopes
- Administrative tools should be restricted to `admin` consumers
- Review permission changes carefully before committing to production
