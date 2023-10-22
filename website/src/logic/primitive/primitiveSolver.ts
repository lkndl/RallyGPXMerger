import { GpxMergeLogic, Break, instanceOfBreak } from '../types.ts';
import { shiftEndDate } from '../shiftEndDate.ts';
import { mergeGpxSegmentContents, resolveGpxSegments } from '../helper/solvingHelper.ts';
import { SimpleGPX } from '../gpxutils.ts';

export const mergeAndAdjustTimes: GpxMergeLogic = (gpxSegments, trackCompositions, arrivalDateTime) => {
    return trackCompositions.map((track) => {
        const gpxSegmentContents: (SimpleGPX | Break)[] = resolveGpxSegments(track, gpxSegments);

        let shiftedGpxContents: SimpleGPX[] = [];
        let endDate = new Date(arrivalDateTime);

        gpxSegmentContents.reverse().forEach((content) => {
            if (!instanceOfBreak(content)) {
                // adjust this GPX to its intended arrival time
                content.shiftToArrivalTime(endDate);
                endDate = content.start;
                shiftedGpxContents = [content, ...shiftedGpxContents];
            } else {
                // make the next group arrive a bit early
                endDate = shiftEndDate(endDate, content.minutes);
            }
        });

        const trackContent = mergeGpxSegmentContents(shiftedGpxContents);

        return { id: track.id, content: trackContent, filename: track.name! };
    });
};
