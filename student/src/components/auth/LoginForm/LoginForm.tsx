import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { notificationController } from '@app/controllers/notificationController';
import * as S from './LoginForm.styles';
import * as Auth from '@app/components/layouts/AuthLayout/AuthLayout.styles';
import { useUser } from '../../../Context/UserContext';

interface LoginFormData {
    userid: number;
    password: string;
    rememberMe: boolean;
}

export const initValues: Partial<LoginFormData> = {
    userid: 8,
    password: 'password',
    rememberMe: false,
};

export const LoginForm: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { loginUser } = useUser();

    const [isLoading, setLoading] = useState(false);

    const handleSubmit = async (values: LoginFormData) => {
        setLoading(true);
        try {
            const loginResponse = await loginUser({ userid: values.userid, password: values.password, rememberMe: values.rememberMe });
            loginResponse.usertype === "Student" && navigate('/');
        } catch (err: any) {
            notificationController.error({ message: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Auth.FormWrapper>
            <BaseForm
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark="optional"
                initialValues={initValues}
            >
                <Auth.FormTitle>{t('login')}</Auth.FormTitle>
                <S.LoginDescription>{t('loginInfo')}</S.LoginDescription>

                <Auth.FormItem
                    name="userid"
                    label={t('id')}
                    rules={[{ required: true, message: t('requiredField') }]}
                >
                    <Auth.FormInput
                        type="number"
                        placeholder={t('id')}
                    />
                </Auth.FormItem>

                <Auth.FormItem
                    name="password"
                    label={t('password')}
                    rules={[{ required: true, message: t('requiredField') }]}
                >
                    <Auth.FormInputPassword placeholder={t('password')} />
                </Auth.FormItem>

                <Auth.ActionsWrapper>
                    <BaseForm.Item name="rememberMe" valuePropName="checked" noStyle>
                        <Auth.FormCheckbox>
                            <S.RememberMeText>{t('rememberMe')}</S.RememberMeText>
                        </Auth.FormCheckbox>
                    </BaseForm.Item>
                
                </Auth.ActionsWrapper>

                <BaseForm.Item noStyle>
                    <Auth.SubmitButton type="primary" htmlType="submit" loading={isLoading}>
                        {t('login')}
                    </Auth.SubmitButton>
                </BaseForm.Item>
            </BaseForm>
        </Auth.FormWrapper>
    );
};
