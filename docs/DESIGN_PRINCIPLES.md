# Design Principles

These core design principles guide all development decisions in Outward Sign. Every feature, component, and interaction should embody these virtues:

## Simplicity
- Remove unnecessary elements and complexity
- Make common tasks easy and straightforward
- Avoid feature bloat - focus on essential sacramental workflows
- Prefer clear, direct solutions over clever abstractions

## Clarity
- No ambiguity about what UI elements do or what will happen when interacting with them
- Use clear, descriptive labels and button text
- Ensure form fields clearly indicate what input is expected
- Status indicators and states should be immediately obvious

## Feedback
- System responds to every user action with appropriate feedback
- Show loading states for all asynchronous operations (use `SaveButton`, spinners)
- Display success messages after successful operations (use `toast.success()`)
- Show clear error messages when operations fail (use `toast.error()` with actionable guidance)
- Real-time validation feedback on forms where appropriate

## Affordances
- Things should look like what they do
- Buttons must look clickable (proper hover states, cursor changes)
- Disabled elements should appear visually disabled
- Interactive elements should have clear visual indicators (icons, colors, borders)
- Form fields should look like form fields

## Click Hierarchy
- **NEVER nest clickable elements inside other clickable elements**
- Examples of what to avoid:
  - Button inside a button
  - Link inside a button
  - Button inside a clickable card
  - Link inside a clickable table row
- This prevents:
  - Confusing user interactions (which element responds?)
  - Event propagation issues (both elements triggering)
  - Accessibility problems for keyboard and screen reader users
  - Unpredictable behavior across different browsers and devices
- **Solution patterns:**
  - If a card/row needs to be clickable, put action buttons OUTSIDE the clickable area
  - Use `e.stopPropagation()` only when absolutely necessary (rare cases)
  - Consider making the entire container clickable OR add separate action buttons (not both)
  - Use visual hierarchy to make clear which element is the primary action

## Recognition over Recall
- Show available options rather than requiring users to remember or type them
- Use picker modals (PeoplePicker, EventPicker) instead of free-text input where possible
- Display recently used items, suggestions, or defaults
- Breadcrumbs show current location in the app hierarchy
- Pre-fill forms with sensible defaults when editing

## Forgiving Design
- Make destructive actions reversible where possible
- Require confirmation for irreversible destructive actions (deletions)
- Implement autosave for long forms or critical workflows (where appropriate)
- Allow users to cancel operations and return to previous state
- Gracefully handle errors without losing user data

## Progressive Disclosure
- Show basic, most commonly used options first
- Reveal advanced features and complexity only as needed
- Use collapsible sections for optional or advanced settings
- Don't overwhelm users with all options at once
- Organize forms logically from essential to optional fields

## Efficiency
- Provide keyboard shortcuts for power users where appropriate
- Enable bulk actions when users need to operate on multiple items
- Support keyboard navigation throughout the application
- Minimize clicks required for common workflows
- Allow inline editing and creation (e.g., creating people/events from within forms)
- Use server-side filtering and pagination for performance

## Content & Communication

### Microcopy
- Use helpful, human labels and instructions throughout the interface
- Write in plain language - avoid jargon unless essential to sacramental context
- Button text should clearly describe the action (e.g., "Save Wedding" not just "Save")
- Error messages should explain what went wrong AND how to fix it
- Labels should be concise but descriptive
- **Use "Create" for new item buttons** (e.g., "Create Wedding", "Create Person") - never use "New" or "Add" for primary creation actions
- **Use "Our" prefix for list page titles** (e.g., "Our Weddings", "Our People") to convey ownership and community
- **Use "Manage" for settings/configuration links** (e.g., "Manage Event Types") - avoid technical terms like "Configure"

### Empty States
- Never show a blank screen - always provide helpful guidance
- Empty lists should explain what would go here and how to add the first item
- Include a clear call-to-action button to create the first entry
- Use encouraging, welcoming language for new users
- Example: "No weddings yet. Click 'Create Wedding' to plan your first celebration."

### Onboarding
- Provide smooth, gradual introduction for new users and new features
- First-time experiences should guide users to initial setup steps
- Use progressive disclosure - don't overwhelm with all features at once
- Consider tooltips or brief inline help for complex workflows
- Make it easy to skip or dismiss onboarding for experienced users

### Help & Documentation
- Provide contextual help where users might need it
- Complex forms should include helpful tooltips or info icons
- Link to relevant documentation when available
- Guidelines and best practices should be visible but not intrusive
- Consider inline examples for complex fields (e.g., formatting patterns)

## Specific Patterns

### Similarity/Familiarity
- Use established UI patterns that users already know from other applications
- Follow web conventions for common interactions (links, buttons, forms)
- Maintain consistency with the wedding module pattern across all modules
- Reuse existing components (PeoplePicker, EventPicker) for similar tasks
- Don't reinvent common patterns - leverage user's existing mental models

### Proximity
- Group related items together visually and spatially
- Keep form labels close to their inputs
- Group related form fields in logical sections
- Place actions (buttons) near the content they affect
- Use whitespace to separate unrelated groups

### Continuity
- Create natural flow from one step to the next in multi-step processes
- Maintain context as users navigate through workflows
- Breadcrumbs show the path users have taken
- After creating an entity, smoothly transition to viewing it
- Preserve user input when navigating between related forms/pages

### Closure
- Provide clear endings and confirmations when tasks complete
- Success messages confirm that actions were successful
- Redirect to appropriate next page after creating/editing
- Show final state after bulk operations complete
- Allow users to clearly understand that a workflow is finished

## Application

When implementing new features or reviewing code, ask:
- Is this the simplest solution that could work?
- Will users clearly understand what this does?
- Does the UI provide appropriate feedback?
- Are there any nested clickable elements that will confuse users?
- Can users easily undo or recover from mistakes?
- Are we showing too much complexity upfront?
- Could this common task be made more efficient?
