import * as ics from 'ics';
import type { eventsType } from '../../../Core/event';

export function toLocalTime(time: string) {
	let date = new Date(time);
	date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
	return date.toISOString().slice(0, 16);
}

export function icsCreateEvents(events: eventsType): string {
	const res = ics.createEvents(
		events.map((event) => {
			const { allDay, start, end, ...rest } = event;
			// shift the start and end time to beginning and end of day
			let startd = new Date(start);
			let endd = new Date(end);
			const icsEvent: ics.EventAttributes = {
				...rest,
				start: startd.getTime(),
				end: endd.getTime()
			};
			if (allDay) {
				icsEvent.start = [startd.getFullYear(), startd.getMonth() + 1, startd.getDate()];
				icsEvent.end = [endd.getFullYear(), endd.getMonth() + 1, endd.getDate()];
				icsEvent.startOutputType = 'utc';
				icsEvent.endOutputType = 'utc';
			}
			return icsEvent;
		})
	);
	if (res.value === undefined) {
		throw res.error;
	}
	return res.value;
}
