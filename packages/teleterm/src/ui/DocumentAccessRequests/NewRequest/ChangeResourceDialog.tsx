import React from 'react';
import { Text, ButtonIcon, ButtonWarning } from 'design';
import DialogConfirmation, {
  DialogContent,
  DialogFooter,
  DialogHeader,
} from 'design/DialogConfirmation';
import { Close } from 'design/Icon';

const updateSelectedResourceWarning =
  'Resource Access Request cannot be combined with Role Access Request. Current items selected will be cleared. Are you sure you want to continue?';

export default function ChangeResourceDialog({
  toResource,
  onClose,
  onConfirm,
}) {
  return (
    <DialogConfirmation
      open={!!toResource}
      onClose={onClose}
      dialogCss={() => ({
        maxWidth: '400px',
        width: '100%',
      })}
    >
      <DialogHeader justifyContent="space-between" mb={0}>
        <Text typography="h5" bold style={{ whiteSpace: 'nowrap' }}>
          Remove selected resources?
        </Text>
        <ButtonIcon onClick={onClose} color="text.secondary">
          <Close fontSize={5} />
        </ButtonIcon>
      </DialogHeader>
      <DialogContent mb={4}>
        <Text color="text.secondary" typography="body1">
          {updateSelectedResourceWarning}
        </Text>
      </DialogContent>
      <DialogFooter>
        <ButtonWarning
          size="large"
          block={true}
          onClick={() => onConfirm(toResource)}
        >
          Confirm
        </ButtonWarning>
      </DialogFooter>
    </DialogConfirmation>
  );
}
