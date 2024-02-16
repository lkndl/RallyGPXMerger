import { Button, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrenMapTime, mapActions } from '../store/map.reducer.ts';
import { getCurrentTimeStamp } from './hooks/trackSimulationReader.ts';
import { formatDate } from '../../utils/dateUtil.ts';
import { useEffect, useState } from 'react';
import play from '../../assets/play.svg';
import fast from '../../assets/fast.svg';
import stop from '../../assets/stop.svg';
import { MAX_SLIDER_TIME } from '../../common/constants.ts';
import { useIntl } from 'react-intl';

let interval: NodeJS.Timeout | undefined;

let timeMirror = 0;

export function TimeSlider() {
    const intl = useIntl();
    const mapTime = useSelector(getCurrenMapTime);
    const dateValue = useSelector(getCurrentTimeStamp);
    timeMirror = mapTime;
    const dispatch = useDispatch();

    const [playSpeed, setPlaySpeed] = useState<number>();

    useEffect(() => {
        if (interval) {
            clearInterval(interval);
        }
        if (playSpeed !== undefined) {
            interval = setInterval(
                () => dispatch(mapActions.setCurrentTime((timeMirror + playSpeed * 100) % MAX_SLIDER_TIME)),
                100
            );
        }
    }, [playSpeed]);

    return (
        <Form.Group className={'m-2'}>
            <div>{dateValue ? formatDate(dateValue) : intl.formatMessage({ id: 'msg.noCalculatedTracks' })}</div>
            <div className={'d-flex'}>
                <Form.Range
                    min={0}
                    max={MAX_SLIDER_TIME}
                    value={mapTime}
                    onChange={(event) => dispatch(mapActions.setCurrentTime(Number(event.target.value)))}
                />
                <div className={'mx-4 d-flex'}>
                    <Button
                        size={'sm'}
                        variant={'success'}
                        className={'m-1'}
                        disabled={playSpeed === 1}
                        onClick={() => setPlaySpeed(1)}
                        title={intl.formatMessage({ id: 'msg.play.normal' })}
                    >
                        <img src={play} className="m-1" alt="open file" />
                    </Button>
                    <Button
                        size={'sm'}
                        variant={'warning'}
                        className={'m-1'}
                        disabled={playSpeed === 5}
                        onClick={() => setPlaySpeed(5)}
                        title={intl.formatMessage({ id: 'msg.play.fast' })}
                    >
                        <img src={fast} className="m-1" alt="open file" />
                    </Button>
                    <Button
                        size={'sm'}
                        variant={'danger'}
                        className={'m-1'}
                        disabled={!playSpeed}
                        onClick={() => setPlaySpeed(undefined)}
                        title={intl.formatMessage({ id: 'msg.play.stop' })}
                    >
                        <img src={stop} className="m-1" alt="open file" />
                    </Button>
                </div>
            </div>
        </Form.Group>
    );
}
