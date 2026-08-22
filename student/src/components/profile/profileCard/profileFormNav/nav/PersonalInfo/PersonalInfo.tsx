import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BaseButtonsForm } from '@app/components/common/forms/BaseButtonsForm/BaseButtonsForm';
import { BaseCard } from '@app/components/common/BaseCard/BaseCard';
import { notificationController } from '@app/controllers/notificationController';
import { BaseRow } from '@app/components/common/BaseRow/BaseRow';
import { InputDisplay } from '../../../../../InputDisplay';
import styled from 'styled-components';
import { FONT_SIZE, FONT_WEIGHT } from '../../../../../../styles/themes/constants';
import { UploadOutlined } from '@ant-design/icons';
import { BaseCol } from '@app/components/common/BaseCol/BaseCol';
import { useUser } from '../../../../../../Context/UserContext';
import { updateImage, getImageUrl } from '../../../../../../Supabase/FileUpload';
import { Avatar, Button, Form, Space, Spin, Typography, Upload } from 'antd';

export const PersonalInfo: React.FC = () => {
    const { profile: user, removeImage, uploadImage: uploadImageDatabase } = useUser();

    const [isFieldsChanged, setFieldsChanged] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = BaseButtonsForm.useForm();
    const [file, setFile] = useState<File>();
    const [preview, setPreview] = useState<string | null>(null);
    const { t } = useTranslation();

    const loadImage = (file: File) => {
        setFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const customUpload = async (e: React.MouseEvent<HTMLElement>) => {

        e.preventDefault();
        setSubmitting(true);
        if (!file) {
            notificationController.error({ message: t('common.pleaseSelectAnImage') });
            return;
        }
        try {
            const filePath = await updateImage(user?.image ?? 's', file);
            const imgSrc = getImageUrl(filePath);
            await removeImage();
            await uploadImageDatabase(imgSrc);
            notificationController.success({ message: t('common.success') });
            setSubmitting(false);
        } catch (error) {
            notificationController.error({ message: t('common.failed') });
        }
    };

 

    return (
        <BaseCard>
            <BaseButtonsForm
                onSubmitCapture={(e) =>  e.preventDefault()}
               
                form={form}
                name="info"
              
                isFieldsChanged={isFieldsChanged}
                setFieldsChanged={setFieldsChanged}
                onFieldsChange={() => setFieldsChanged(true)}
               
            >
                <BaseRow gutter={{ xs: 10, md: 15, xl: 30 }}>
                    <BaseCol span={24}>
                        <BaseButtonsForm.Item>
                            <BaseButtonsForm.Title>{t('profile.personal_info')}</BaseButtonsForm.Title>
                        </BaseButtonsForm.Item>
                    </BaseCol>

                    <BaseCol xs={24} md={12}>
                        <InputDisplay title={t('profile.full_name')} />
                    </BaseCol>
                    <BaseCol xs={24} md={12}>
                        <InputDisplay title={t('profile.id')} />
                    </BaseCol>
                    <BaseCol xs={24} md={12}>
                        <InputDisplay title={t('profile.email')} />
                    </BaseCol>
                    <BaseCol xs={24} md={12}>
                        <InputDisplay title={t('profile.campus')} />
                    </BaseCol>
                </BaseRow>
            </BaseButtonsForm>
            <Form layout="vertical">
                <Form.Item label="Change Profile">
                    <Upload
                        accept="image/*"
                        showUploadList={true}
                        beforeUpload={(file) => {
                            loadImage(file as File);
                            return false;
                        }}
                    >
                        <Button icon={<UploadOutlined />}>Select Image</Button>
                    </Upload>
                </Form.Item>

                {preview && (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Typography.Text>Image Preview</Typography.Text>
                        <Avatar shape="square" size={128} src={preview} />
                        <Button type="primary" onClick={customUpload} disabled={submitting} >
                            {submitting ? <Spin /> : "Submit"} 
                        </Button>
                    </Space> 
                )}
            </Form>
        </BaseCard>
    );
};