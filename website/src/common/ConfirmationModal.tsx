import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    onConfirm: () => void;
    closeModal: () => void;
    title: string;
    body: string | ReactNode;
    confirmDisabled?: boolean;
}

export function ConfirmationModal({ onConfirm, closeModal, title, body, confirmDisabled }: Props) {
    return (
        <Modal show={true} onHide={closeModal} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{body}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeModal}>
                    <FormattedMessage id={'msg.close'} />
                </Button>
                <Button variant="primary" onClick={onConfirm} disabled={confirmDisabled}>
                    <FormattedMessage id={'msg.confirm'} />
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
