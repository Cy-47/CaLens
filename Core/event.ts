import { z } from "zod";

/**
 * Schema for a single calendar event.
 */
const eventSchema = z.object({
  title: z.string().describe("A short title of the calendar event."),
  description: z.string().describe("A brief description of the event."),
  start: z.string().describe("The start time of the event"),
  end: z.string().describe("The end time of the event"),
  allDay: z.boolean().optional().describe("Whether the event is all day."),
  location: z
    .string()
    .optional()
    .describe("The location where the event will take place."),
});

/**
 * Schema for an array of calendar events.
 */
const eventsSchema = z.array(eventSchema);

/**
 * Schema for an object containing a list of calendar events and a flag indicating if it contains at least one event.
 */
const eventListSchema = z.object({
  containsEvent: z
    .boolean()
    .describe("Whether the image contains at least one event."),
  events: eventsSchema.describe("A list of calendar events."),
});

/**
 * TypeScript type for a single calendar event.
 */
type eventType = z.infer<typeof eventSchema>;

/**
 * TypeScript type for an array of calendar events.
 */
type eventsType = z.infer<typeof eventsSchema>;

export { eventSchema, eventsSchema, eventListSchema };
export type { eventType, eventsType };
