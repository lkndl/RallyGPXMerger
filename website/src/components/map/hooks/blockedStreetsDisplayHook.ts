import { useSelector } from 'react-redux';
import { MutableRefObject, useEffect } from 'react';
import L, { LayerGroup } from 'leaflet';
import { getCurrenMapSource } from '../../../store/map.reducer.ts';
import { getBlockedStreetInfo } from '../../../mapMatching/getBlockedStreetInfo.ts';
import { getColorFromUuid } from '../../../utils/colorUtil.ts';
import { v4 as uuidv4 } from 'uuid';
import { BlockedStreetInfo } from '../../../mapMatching/types.ts';
import { formatTimeOnly } from '../../../utils/dateUtil.ts';

function createTooltip({ streetName, postCode, frontArrival, backPassage }: BlockedStreetInfo) {
    return `${streetName}, ${postCode} (blocked from ${formatTimeOnly(frontArrival)} until ${formatTimeOnly(
        backPassage
    )})`;
}

const colorStore: Record<string, string> = {};

function getColorForStreetName(streetName: string): string {
    const storedColor = colorStore[streetName];
    if (!storedColor) {
        colorStore[streetName] = getColorFromUuid(uuidv4());
    }
    return storedColor;
}

export function blockedStreetsDisplayHook(blockedStreetsLayer: MutableRefObject<LayerGroup | null>) {
    const blockedStreetInfos = useSelector(getBlockedStreetInfo);
    const mapSource = useSelector(getCurrenMapSource);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        const current = blockedStreetsLayer.current;
        if (!blockedStreetsLayer || !current) {
            return;
        }
        current.clearLayers();
        if (mapSource === 'blocked streets') {
            blockedStreetInfos.forEach((blockedStreet) => {
                const streetPoints = [
                    { lat: blockedStreet.pointFrom.lat, lng: blockedStreet.pointFrom.lon },
                    { lat: blockedStreet.pointTo.lat, lng: blockedStreet.pointTo.lon },
                ];
                const connection = L.polyline(streetPoints, {
                    color: getColorForStreetName(blockedStreet.streetName),
                    weight: 4,
                    dashArray: '5',
                }).bindTooltip(createTooltip(blockedStreet), {
                    sticky: true,
                });
                connection.addTo(current);
            });
        }
    }, [blockedStreetInfos, blockedStreetInfos.length, mapSource]);
}
