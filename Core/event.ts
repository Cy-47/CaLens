import { z } from "zod";

const eventSchema = z.object({
  title: z.string().describe("The title of the calendar event."),
  description: z.string().describe("A brief description of the event."),
  start: z.string().describe("The start time of the event"),
  end: z.string().describe("The end time of the event"),
  allDay: z.boolean().optional().describe("Whether the event is all day."),
  location: z
    .string()
    .optional()
    .describe("The location where the event will take place."),
});

const eventsSchema = z.array(eventSchema);

const eventListSchema = z.object({
  events: eventsSchema.describe("A list of calendar events."),
});

type eventType = z.infer<typeof eventSchema>;
type eventsType = z.infer<typeof eventsSchema>;

export { eventSchema, eventsSchema, eventListSchema, eventType, eventsType };
