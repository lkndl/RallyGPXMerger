/**
 * Assumptions:
 * - for trackpoints with timestamps: calculating "new" times is just a matter of adding or subtracting a delta
 * - delta is duration between desired start-time (likely end time) and recorded time of first trackpoint
 * - for trackpoints without timestamps: not implemented
 *
 * @param parsedGpx the track to join the second to
 * @param endTime this gets joined at the end of the first
 *
 */
export function letTimeInGpxEndAt(parsedGpx: string, endTime: string): string {
    console.log(parsedGpx, endTime);
    return parsedGpx;
}
