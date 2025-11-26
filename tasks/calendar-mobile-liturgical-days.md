# Calendar Mobile: Liturgical Days Handling

## Problem
Liturgical days are not very useful in the mobile calendar view. The current implementation shows small colored dots next to the date number, but this doesn't provide meaningful information to users on small screens.

## Current State
- Mobile/tablet (< 1024px): Liturgical events shown as small colored dots near date number
- Desktop (≥ 1024px): Liturgical events shown as rectangular color blocks
- Tapping a dot opens the day events modal

## Tasks

- [ ] Research how other calendar apps handle liturgical/holiday information on mobile
- [ ] Consider alternative display options:
  - [ ] Show liturgical day name on tap/long-press
  - [ ] Add a subtle background tint to days with liturgical significance
  - [ ] Show abbreviated liturgical info in day cells
  - [ ] Create a dedicated liturgical calendar view for mobile
- [ ] Evaluate if liturgical dots should be hidden on very small screens
- [ ] Consider adding a legend or key for liturgical colors
- [ ] Test with actual parish staff to gather feedback on usefulness

## Notes
- Liturgical colors: white, green, purple, red, rose, black, gold
- White dots require a border to be visible on light backgrounds (implemented)
- Some days have multiple liturgical colors

## Related Files
- `src/components/calendar/calendar-day.tsx`
- `src/components/calendar/event-items/mobile-event-indicators.tsx`
