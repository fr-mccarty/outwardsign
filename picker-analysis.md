# **Picker Analysis - Opens to Create Page Behavior**

**Instructions:**
- [x] = Currently opens to create page
- [ ] = Currently opens to search/list page
- Add or remove "x" to change the behavior
- Then run: I'll implement all your changes

---

## **PersonPickerField Usages**

### **Wedding Module**
- [x] Bride
- [x] Groom
- [ ] Presider
- [ ] Homilist
- [] Lead Musician
- [] Cantor
- [ ] Coordinator
- [x] Witness 1
- [x] Witness 2
- [x] First Reader
- [x] Psalm Reader
- [x] Second Reader
- [] Gospel Reader
- [x] Petition Reader

### **Funeral Module**
- [x] Deceased
- [x] Family Contact
- [ ] Presider
- [ ] Homilist
- [ ] Lead Musician
- [ ] Cantor
- [ ] Coordinator
- [x] First Reader
- [x] Psalm Reader
- [x] Second Reader
- [x] Gospel Reader
- [x] Petition Reader

### **Baptism Module**
- [x] Child
- [x] Mother
- [x] Father
- [ ] Presider
- [ ] Homilist
- [x] Godparent 1
- [x] Godparent 2

### **Quinceañera Module**
- [x] Quinceañera Girl
- [x] Family Contact
- [ ] Presider
- [ ] Homilist
- [ ] Lead Musician
- [ ] Cantor
- [x] First Reader
- [x] Psalm Reader
- [x] Second Reader
- [x] Gospel Reader

### **Presentation Module**
- [x] Child
- [x] Mother
- [x] Father
- [ ] Presider
- [ ] Homilist

### **Events Module**
- [ ] Responsible Party

### **Groups Module**
- [ ] Primary Contact

### **Mass Module**
- [ ] Presider
- [ ] Deacon

### **Mass Role Form**
- [ ] (Person selection in role management)

### **Mass Role Members**
- [ ] (Person selection for role membership)

### **Mass Times Templates**
- [ ] Presider

### **Groups - Add Membership Modal**
- [ ] Person (for membership)

---

## **EventPickerField Usages**

### **Wedding Module**
- [x] Wedding Event
- [x] Reception Event
- [x] Rehearsal Event
- [x] Rehearsal Dinner Event

### **Funeral Module**
- [x] Funeral Event
- [x] Funeral Meal Event

### **Baptism Module**
- [x] Baptism Event

### **Quinceañera Module**
- [x] Quinceañera Event
- [x] Reception Event

### **Presentation Module**
- [x] Presentation Event

### **Mass Module**
- [x] Mass Event

---

## **LocationPickerField Usages**

### **Events Module**
- [ ] Event Location

### **Mass Times Templates**
- [ ] Mass Location

### **Event Form Fields Component**
- [ ] Location (in event creation from modules)

---

## **EventTypePickerField Usages**

### **Events Module**
- [ ] Event Type

---

## **Pickers WITHOUT openToNew capability**
*(These cannot be changed - they don't support the openToNew prop)*

### **MassPickerField**
- Mass Intentions Module → Mass selection

### **LiturgicalEventPickerField**
- Mass Module → Liturgical Event (read-only calendar)

### **MassRolePickerField**
- Mass Role Members → Mass Role selection

### **GroupRolePickerField**
- Groups Add Membership Modal → Group Role selection

---

## **Summary of Current Behavior**

**Primary Participants (Opens to Create):**
- Bride, Groom, Deceased, Quinceañera Girl, Child, Mother, Father
- Family Contacts
- Godparents, Witnesses

**Readers & Musicians (Opens to Create):**
- All Readers (First, Psalm, Second, Gospel, Petition)
- Lead Musicians (Wedding only)
- Cantors (Wedding only)

**Clergy & Staff (Opens to Search/List):**
- Presiders, Homilists, Coordinators
- Lead Musicians & Cantors (Funeral/Quinceañera/Presentation)

**Events (Opens to Create):**
- All module-specific events (Wedding, Funeral, Baptism, etc.)

**Infrastructure (Opens to Search/List):**
- Locations, Event Types, Responsible Parties
- Mass Roles, Group Roles, Primary Contacts

---

## **After Making Your Changes:**

Save this file with your "x" marks adjusted, then tell me you're ready and I'll implement all the changes across all the form files.
