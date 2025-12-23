# Mass Scheduling

Create recurring Mass schedules and assign liturgical roles systematically.

## Overview

The Mass Scheduling system helps parishes manage their regular Mass schedules and assign liturgical ministers efficiently. Rather than creating individual Mass records one by one, Mass Scheduling allows you to define recurring templates and automatically generate Masses for weeks or months at a time.

## Understanding the Mass Scheduling System

Mass Scheduling consists of five interconnected components:

### 1. Mass Times Templates

**Weekly recurring Mass schedule templates**

Define your parish's regular Mass schedule (e.g., "Saturday 5:00 PM Vigil", "Sunday 9:00 AM", "Monday 12:00 PM Daily Mass"). Each template can include default presiders, locations, and expected duration.

### 2. Mass Types

**Categorization of different Mass celebrations**

Define types like "Sunday Mass", "Daily Mass", "Holy Day", "Funeral Mass", "Wedding Mass". Mass Types help organize and filter Masses, and can have specific settings or requirements.

### 3. Mass Roles

**Parish-specific liturgical role definitions**

Define the liturgical roles needed in your parish (e.g., "Lector", "EMHC", "Altar Server", "Cantor", "Usher"). Each role can have a description and be marked active or inactive.

### 4. Mass Role Templates

**Reusable role configuration sets**

Create templates that define which roles are needed for different liturgical contexts. For example:
- "Sunday Mass Roles" (2 Lectors, 4 EMHCs, 2 Altar Servers, 1 Cantor, 4 Ushers)
- "Daily Mass Roles" (1 Lector, 2 EMHCs, 1 Server)
- "Vigil Mass Roles" (similar to Sunday but with different quantities)

### 5. Mass Role Members

**Directory of people available to serve in liturgical roles**

Track which parishioners serve in which roles, including their availability preferences, blackout dates, and assignment history. This is the bridge between the roles themselves and the people who fill them.

## Creating Your Mass Schedule

### Step 1: Define Mass Types

1. Navigate to **Mass Scheduling** > **Mass Types**
2. Click **New Mass Type**
3. Create types for your parish:
   - Sunday Mass
   - Daily Mass (Weekday)
   - Holy Day
   - Special Liturgy
   - Funeral Mass (if tracked separately)
4. Each type can have description and active status

### Step 2: Define Mass Roles

1. Navigate to **Mass Scheduling** > **Mass Roles**
2. Click **New Role**
3. Create roles your parish uses:
   - Lector (Reader)
   - EMHC (Extraordinary Minister of Holy Communion)
   - Altar Server
   - Cantor
   - Music Minister
   - Usher
   - Sacristan
   - Any other roles specific to your parish

### Step 3: Create Role Templates

1. Navigate to **Mass Scheduling** > **Mass Role Templates**
2. Click **New Template**
3. Name the template (e.g., "Sunday Mass Roles")
4. Add roles needed:
   - Select role (e.g., Lector)
   - Specify quantity (e.g., 2)
   - Repeat for all roles
5. Save template

**Example Templates:**

**Sunday Mass Roles:**
- Lector: 2
- EMHC: 4
- Altar Server: 2
- Cantor: 1
- Usher: 4

**Daily Mass Roles:**
- Lector: 1
- EMHC: 2
- Altar Server: 1

### Step 4: Create Mass Times Templates

1. Navigate to **Mass Scheduling** > **Mass Times Templates**
2. Click **New Template**
3. Enter template information:
   - **Name** - "Saturday 5:00 PM Vigil" or "Sunday 9:00 AM Mass"
   - **Description** - Additional details
   - **Day of Week** - Which day this Mass occurs
   - **Active** - Whether currently in use

4. Add Mass times (specific instances):
   - **Time** - 5:00 PM, 9:00 AM, etc.
   - **Day Type** - "Day Of" or "Vigil (Day Before)"
   - **Default Presider** - Assign if consistent
   - **Default Location** - Church building or chapel
   - **Length** - Expected duration in minutes (optional)
   - **Default Homilist** - If different from presider

5. Save template

**Example:**
- Template Name: "Saturday Evening Mass"
- Day of Week: Saturday
- Mass Time: 5:00 PM, Day Of
- Default Location: Main Church
- Length: 60 minutes

### Step 5: Add Role Members

1. Navigate to **Mass Scheduling** > **Role Members**
2. View directory of people who serve
3. For each person, click **Manage Memberships**
4. Add them to roles they serve:
   - Select role (e.g., Lector)
   - Optionally set preferences (if your parish tracks this)
   - Save

This directory connects people to the roles they fill.

## Generating Masses from Templates

Once templates are configured, generate recurring Masses:

### Method 1: Mass Schedule Generator (Recommended)

1. Navigate to **Mass Scheduling** > **Schedule Masses**
2. Select date range (e.g., next 3 months)
3. Select which templates to use
4. System generates Mass records for all dates
5. Each Mass includes:
   - Date and time from template
   - Default presider from template
   - Location from template
   - Mass type (if configured)
   - Placeholder for role assignments

### Method 2: Manual Mass Creation

1. Navigate to **Masses** > **New Mass**
2. Select from template dropdown
3. Template pre-fills fields
4. Adjust as needed
5. Save individual Mass

## Assigning Ministers to Scheduled Masses

After generating Masses, assign people to roles:

### Manual Assignment

1. Open individual Mass record
2. Go to "Ministers" or "Roles" section
3. For each role:
   - Select person from Role Members
   - Confirm assignment
4. Save

### Bulk Assignment (If Available)

Some parishes use additional tools to:
- Auto-assign based on availability
- Rotate assignments fairly
- Respect blackout dates
- Balance workload

Check with your parish administrator about bulk assignment features.

## Mass Role Members Directory

### Purpose

The Role Members directory shows all people who serve in liturgical roles, making it easy to:
- Contact ministers
- View who serves in each role
- Track availability and preferences
- See assignment history

### Using the Directory

1. Navigate to **Mass Scheduling** > **Role Members**
2. Search for people by name
3. Click person to view:
   - Contact information
   - Roles they serve
   - Current assignments
   - Availability preferences (if tracked)

### Managing Member Information

For each person serving:
- Add them to appropriate roles
- Update contact information
- Track availability preferences
- Record blackout dates
- View assignment history

## Common Workflows

### Setting Up a New Parish Schedule

1. **Week 1: Define Structure**
   - Create Mass Types
   - Create Mass Roles
   - Build Role Templates

2. **Week 2: Create Templates**
   - Create Mass Times Templates for all recurring Masses
   - Test generate Masses for one month
   - Verify templates work correctly

3. **Week 3: Build Directory**
   - Add all ministers to Role Members
   - Assign them to appropriate roles
   - Collect availability preferences

4. **Week 4: Launch**
   - Generate Masses for 3-6 months
   - Begin assigning ministers
   - Train staff on system

### Monthly Mass Preparation

1. **Beginning of Month**
   - Generate next 2-3 months of Masses (if not already done)
   - Review special liturgies (Holy Days, Solemnities)

2. **Mid-Month**
   - Assign ministers to upcoming Masses
   - Confirm presiders for all Masses
   - Send reminders to assigned ministers

3. **End of Month**
   - Finalize assignments for next month
   - Print schedules for sacristy
   - Publish minister schedule

### Handling Changes

**Presider Change:**
1. Open affected Mass(es)
2. Update presider field
3. Save

**Role Need Change:**
1. Update Role Template
2. Regenerate affected Masses, or
3. Manually adjust individual Masses

**Person Unavailable:**
1. Open Role Members for person
2. Add blackout date
3. Reassign their upcoming Masses

## Mass Times Templates in Detail

### Template Structure

Each template represents a recurring Mass time:

- **Name** - Descriptive name for staff use
- **Day of Week** - Which day this Mass occurs
- **Active** - Currently in use?
- **Items** - Specific Mass times within the template

### Template Items

Each item within a template specifies:

- **Time** - Specific time (e.g., 9:00 AM)
- **Day Type** - "Day Of" or "Vigil (Day Before)"
- **Presider** - Default celebrating priest
- **Location** - Where Mass is celebrated
- **Length** - Duration in minutes
- **Homilist** - Who preaches (if not presider)

**Example:**

Template: "Saturday Evening Masses"
- Day of Week: Saturday
- Items:
  - 4:00 PM, Vigil, Fr. Smith, Main Church, 60 min
  - 5:30 PM, Vigil, Fr. Jones, Chapel, 45 min

### Vigil vs. Day Of

- **Day Of** - Mass on the actual liturgical day
- **Vigil (Day Before)** - Mass on the eve fulfilling the next day's obligation

Example: Saturday 5:00 PM Mass set to "Vigil" counts as Sunday Mass.

## Mass Role Templates in Detail

### Purpose

Role Templates define the "standard" minister configuration for different Mass types, making it easy to:
- Apply consistent role needs across similar Masses
- Quickly set up new Masses
- Adjust role quantities systematically

### Creating Effective Templates

**Think about your Mass types:**

- **Sunday Mass** - Full complement (multiple lectors, EMHCs, servers, ushers)
- **Daily Mass** - Minimal (1 lector, 1-2 EMHCs, 1 server)
- **Holy Day** - Similar to Sunday
- **Special Liturgy** - Custom needs

**Include all roles needed:**
- Don't forget less obvious roles (ushers, sacristans)
- Consider seasonal variations (more servers at Christmas/Easter)
- Account for your parish's unique practices

### Applying Templates

When creating or editing a Mass:
1. Select role template
2. System populates all roles with correct quantities
3. Begin assigning people to each slot
4. Adjust if this specific Mass has different needs

## Best Practices

### Template Management

- **Descriptive Names** - "Saturday 5PM Vigil" not "Template 1"
- **Keep Templates Updated** - When schedule changes, update templates
- **Archive Old Templates** - Mark inactive rather than delete
- **Document Defaults** - Note why certain presiders/locations are defaults

### Role Management

- **Consistent Role Names** - Use same name across templates
- **Clear Descriptions** - Explain what each role does
- **Active Status** - Mark unused roles inactive
- **Review Annually** - Ensure role list matches current needs

### Scheduling Practices

- **Plan Ahead** - Generate 3-6 months of Masses
- **Buffer Time** - Don't wait until last minute to assign ministers
- **Confirm Early** - Contact ministers well in advance
- **Track Changes** - Document when/why presider changes occur

### Minister Management

- **Keep Directory Current** - Update contact info regularly
- **Respect Availability** - Honor blackout dates and preferences
- **Balanced Assignment** - Distribute assignments fairly
- **Thank Ministers** - Regularly acknowledge their service

## Integration with Other Modules

### Masses Module

All scheduled Masses appear in the main Masses module:
- Edit individual Masses as needed
- Override template defaults for specific dates
- Add Mass intentions
- Generate Mass scripts and materials

### Calendar

Scheduled Masses appear on parish calendar:
- View all Masses in calendar view
- Export to external calendar systems
- See Masses alongside other events

### People Module

Ministers are people in the parish directory:
- Contact information comes from People
- Can view person's full profile
- Updates to person record reflect in Role Members

## Reports and Views

### Mass Schedule Report

View upcoming Masses:
- Filter by date range, Mass type, presider
- See which Masses lack minister assignments
- Identify gaps in schedule

### Minister Assignment Report

Track minister assignments:
- Who is assigned to which Masses
- Assignment frequency and distribution
- Identify over/under-utilized ministers

### Role Coverage Report

Ensure all roles are covered:
- Which Masses are missing ministers
- Which roles are hardest to fill
- Recruitment priorities

## Frequently Asked Questions

**Q: Do I have to use the Mass Scheduling system?**
A: No, you can create individual Mass records manually in the Masses module. Mass Scheduling is for parishes with recurring schedules who want automation.

**Q: Can I edit Masses generated from templates?**
A: Yes! Once generated, each Mass is an independent record. Edit as needed without affecting the template.

**Q: What happens if I change a template after generating Masses?**
A: Previously generated Masses are not affected. The template only affects future Mass generation.

**Q: Can one person have multiple roles?**
A: Yes, add them to multiple roles in the Role Members directory. When assigning, they'll appear in dropdowns for all their roles.

**Q: How do I handle Holy Days that aren't on the regular schedule?**
A: Either create a specific template for annual Holy Days, or create those Masses manually with the appropriate Mass Type.

**Q: Can different Masses use different role templates?**
A: Yes, apply the appropriate role template when creating or editing each Mass.

**Q: What if a presider is sick and can't celebrate a scheduled Mass?**
A: Open the Mass record and change the presider. You can also send notifications (outside Outward Sign) to affected ministers and parishioners.

**Q: How far in advance should I schedule Masses?**
A: Most parishes generate 3-6 months at a time. Some go further for annual planning.

## Related Features

- [Managing Masses](./mass-liturgies) - Work with individual Mass celebrations
- [Mass Intentions](./mass-intentions) - Track Mass intention requests
- [Calendar](../user-guides/events) - View all parish events including Masses
- [Managing People](../user-guides/people) - Parish directory
- [Staff Guide](../user-guides/staff-guide) - Complete guide for parish staff

## Need Help?

Contact your parish administrator or visit [outwardsign.church](https://outwardsign.church) for support.
