interface Variant {
    name: string;
    url: string;
    color: string;
}
export const versions: Record<string, Variant[]> = {
    sf24_v1_v3: [
        {
            name: 'Variante 1',
            url: 'https://sebastianhanfland.github.io/RallyGPXMerger/variante1_003.zip',
            color: 'blue',
        },
        {
            name: 'Variante 2',
            url: 'https://sebastianhanfland.github.io/RallyGPXMerger/variante2_002.zip',
            color: 'red',
        },
        {
            name: 'Variante 3',
            url: 'https://sebastianhanfland.github.io/RallyGPXMerger/variante3_002.zip',
            color: 'green',
        },
    ],
    sf24_v1_v2_v3neu: [
        {
            name: 'Variante 1',
            url: 'https://sebastianhanfland.github.io/RallyGPXMerger/variante1_003.zip',
            color: 'blue',
        },
        {
            name: 'Variante 2',
            url: 'https://sebastianhanfland.github.io/RallyGPXMerger/variante2_002.zip',
            color: 'red',
        },
        {
            name: 'Variante 3',
            url: 'https://sebastianhanfland.github.io/RallyGPXMerger/SF24v3_mitPausen.zip',
            color: 'green',
        },
    ],
    kvr_sf_23_sf_24_v3: [
        {
            name: 'SF23',
            url: 'https://sebastianhanfland.github.io/RallyGPXMerger/SF23_like_SF24_gpx_002.zip',
            color: 'blue',
        },
        {
            name: 'SF24',
            url: 'https://sebastianhanfland.github.io/RallyGPXMerger/v3_mitPause.zip',
            color: 'red',
        },
    ],
    kvr_sf_23_sf_24_v3p: [
        {
            name: 'SF23',
            url: 'https://sebastianhanfland.github.io/RallyGPXMerger/SF23like24_mitPausen.zip',
            color: 'blue',
        },
        {
            name: 'SF24',
            url: 'https://sebastianhanfland.github.io/RallyGPXMerger/SF24v3_mitPausen.zip',
            color: 'red',
        },
    ],
    kvr_sf_24_v3p: [
        {
            name: 'SF24',
            url: 'https://sebastianhanfland.github.io/RallyGPXMerger/SF24v3_mitPausen.zip',
            color: 'red',
        },
    ],
    kvr_sf_24_v3p_v3_3p: [
        {
            name: 'SF24',
            url: 'https://sebastianhanfland.github.io/RallyGPXMerger/SF24v3_mitPausen.zip',
            color: 'blue',
        },
        {
            name: 'SF24_0315',
            url: 'https://sebastianhanfland.github.io/RallyGPXMerger/SF24v3_3_mitPausen.zip',
            color: 'red',
        },
    ],
    kvr_sf_24_v3p_v3_3p: [
        {
            name: 'SF24_0315',
            url: 'https://sebastianhanfland.github.io/RallyGPXMerger/SF24v3_3_mitPausen.zip',
            color: 'red',
        },
        {
            name: 'SF24_v1',
            url: 'https://sebastianhanfland.github.io/RallyGPXMerger/SF24v1_mitPausen_20240204.zip',
            color: 'blue',
        },
    ],
};
export const versionKey = window.location.search.replace('?version=', '');

export function getColorOfVersion(versionName: string) {
    return versions[versionKey].find((version) => version.name === versionName)?.color;
}

export function getUrlOfVersion(versionName: string) {
    return versions[versionKey].find((version) => version.name === versionName)?.url;
}
