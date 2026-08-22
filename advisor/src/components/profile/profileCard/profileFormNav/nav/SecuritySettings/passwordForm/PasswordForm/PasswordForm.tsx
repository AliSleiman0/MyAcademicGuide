import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BaseButtonsForm } from '@app/components/common/forms/BaseButtonsForm/BaseButtonsForm';
import { ConfirmItemPassword } from '@app/components/profile/profileCard/profileFormNav/nav/SecuritySettings/passwordForm/ConfirmPasswordItem/ConfirmPasswordItem';
import { NewPasswordItem } from '@app/components/profile/profileCard/profileFormNav/nav/SecuritySettings/passwordForm/NewPasswordItem/NewPasswordItem';
import { notificationController } from '@app/controllers/notificationController';
import * as S from './PasswordForm.styles';
import { BaseRow } from '@app/components/common/BaseRow/BaseRow';
import { BaseCol } from '@app/components/common/BaseCol/BaseCol';
import { UpdatePasswordInput } from '../../../../../../../../apiMAG/user';
import { useUser } from '../../../../../../../../Context/UserContext';


export const PasswordForm: React.FC = () => {
    const [isFieldsChanged, setFieldsChanged] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const { t } = useTranslation();
    const { updatePassword } = useUser();
    const onFinish = async (values: any) => {
        try {
            setLoading(true);
       
            const message = await updatePassword({password:values.newPassword, password_confirmation:values.confirmPassword});
            notificationController.success({ message: message || t('profile.successPasswordUpdate') });
            setFieldsChanged(false);
        } catch (error: any) {
            notificationController.error({ message: error.message || t('common.error') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseButtonsForm
            name="newPassword"
            requiredMark="optional"
            isFieldsChanged={isFieldsChanged}
            onFieldsChange={() => setFieldsChanged(true)}
            footer={
                <S.Btn loading={isLoading} type="primary" htmlType="submit">
                    {t('common.confirm')}
                </S.Btn>
            }
            onFinish={onFinish}
        >
            <BaseRow gutter={{ md: 15, xl: 30 }}>
                <BaseCol span={24}>
                    <BaseButtonsForm.Item>
                        <BaseButtonsForm.Title>{t('profile.change_password')}</BaseButtonsForm.Title>
                    </BaseButtonsForm.Item>
                </BaseCol>

                <BaseCol xs={24} md={12} xl={24}>
                    <NewPasswordItem />
                </BaseCol>

                <BaseCol xs={24} md={12} xl={24}>
                    <ConfirmItemPassword />
                </BaseCol>
            </BaseRow>
        </BaseButtonsForm>
    );
};