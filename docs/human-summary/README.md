# Human Summary

## What Is This?

This folder contains plain-English explanations of how Outward Sign works. No code snippets. No database diagrams. No TypeScript interfaces. Just words that humans can read without needing a computer science degree or three cups of coffee.

## Why Does This Exist?

The `/docs/` folder is full of technical documentation—detailed, precise, and absolutely essential for building and maintaining the application. It's also about as fun to read as a tax form.

These summaries are different. They're written for:

- **Parish staff** who want to understand what the system does without caring how it does it
- **Stakeholders** reviewing features or planning new ones
- **Developers** who need to explain something to a non-technical person
- **Future you** who forgot why we built something this way and doesn't want to read 1,400 lines of technical specs to remember

## What Goes Here?

Summaries of key concepts, systems, and features in Outward Sign. Each file should:

1. **Be short** — If it takes more than 5 minutes to read, it's too long
2. **Use plain language** — Write like you're explaining it to a smart person who doesn't know the jargon
3. **Focus on the "what" and "why"** — Leave the "how" to the technical docs
4. **Tell a story** — Good explanations have a beginning, middle, and end
5. **Have personality** — We're tracking sacraments, not performing surgery. A little warmth is allowed.

## What Doesn't Go Here?

- Code examples
- Database schemas
- API references
- Implementation details
- Anything that would make a normal person's eyes glaze over

If you find yourself typing `interface` or `SELECT * FROM`, you're in the wrong folder.

## Current Summaries

| File | Topic |
|------|-------|
| [how-event-people-assignments-work.md](./how-event-people-assignments-work.md) | How people get assigned to events (the two-level pattern) |

## Adding New Summaries

When a significant feature or system deserves a human-readable explanation, add it here. Name the file descriptively—someone should be able to guess what it's about from the filename alone.

Good: `how-calendar-feeds-work.md`
Bad: `calendar-system-v2-refactor-notes.md`

## A Note on Tone

Technical documentation should be precise. These summaries should be clear. There's a difference.

Precise: "The `calendar_event_id` field uses a NULLABLE pattern where NULL indicates template-level assignment scope."

Clear: "If a role applies to the whole event, we leave the calendar slot empty. If it's for a specific time, we fill it in."

Both are correct. One is for machines (and the humans who program them). The other is for everyone else.

Write for everyone else.
