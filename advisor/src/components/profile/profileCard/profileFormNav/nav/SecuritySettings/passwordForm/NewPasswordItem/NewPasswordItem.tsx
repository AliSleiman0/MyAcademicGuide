import React from 'react';
import { useTranslation } from 'react-i18next';
import { BaseButtonsForm } from '@app/components/common/forms/BaseButtonsForm/BaseButtonsForm';
import { InputPassword } from '@app/components/common/inputs/InputPassword/InputPassword';
import { passwordPattern } from '@app/constants/patterns';

export const NewPasswordItem: React.FC = () => {
  const { t } = useTranslation();

  return (
    <BaseButtonsForm.Item
      name="newPassword"
          label={t('securitySettings.newPassword')}
      dependencies={['password']}
      rules={[
        {
          required: true,
              message: t('securitySettings.requiredPassword'),
        },
        {
          pattern: passwordPattern,
            message: t('securitySettings.notValidPassword'),
        },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue('password') !== value) {
              return Promise.resolve();
            }
                return Promise.reject(new Error(t('securitySettings.samePassword')));
          },
        }),
      ]}
    >
      <InputPassword />
    </BaseButtonsForm.Item>
  );
};
