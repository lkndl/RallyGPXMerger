import { Form } from 'react-bootstrap';
import { GpxSegment } from '../../store/types.ts';
import { useDispatch } from 'react-redux';
import { gpxSegmentsActions } from '../../store/gpxSegments.reducer.ts';
import { FileDownloader } from './FileDownloader.tsx';
import { ALLOWS_TO_ENTER_PEOPLE_AT_START } from './GpxSegments.tsx';
import { FileChangeButton } from './FileChangeButton.tsx';
import { RemoveFileButton } from './RemoveFileButton.tsx';

function getCount(value: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const number = Number(value.target.value);
    return isNaN(number) ? 0 : number;
}

export function FileDisplay({ gpxSegment }: { gpxSegment: GpxSegment }) {
    const { id, filename, content, peopleCountStart, peopleCountEnd } = gpxSegment;
    const dispatch = useDispatch();

    return (
        <tr>
            <td>
                <td>
                    <Form.Control
                        type="text"
                        placeholder="People at start"
                        value={filename}
                        onChange={(value) =>
                            dispatch(gpxSegmentsActions.setFilename({ id, filename: value.target.value }))
                        }
                    />
                </td>
            </td>
            <td>
                <FileDownloader content={content} name={filename} id={id} onlyIcon={true} />
                <FileChangeButton id={id} name={filename} />
                <RemoveFileButton id={id} name={filename} />
            </td>
            {ALLOWS_TO_ENTER_PEOPLE_AT_START && (
                <td>
                    <Form.Control
                        type="text"
                        placeholder="People at start"
                        value={peopleCountStart}
                        onChange={(value) =>
                            dispatch(gpxSegmentsActions.setPeopleCountStart({ id, count: getCount(value) }))
                        }
                    />
                </td>
            )}
            <td>
                <Form.Control
                    type="text"
                    placeholder="People at end"
                    value={peopleCountEnd}
                    onChange={(value) => dispatch(gpxSegmentsActions.setPeopleCountEnd({ id, count: getCount(value) }))}
                />
            </td>
        </tr>
    );
}
