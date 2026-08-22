import React, { useMemo } from 'react';
import { Modal, Form, Input, Row, Col, Typography } from 'antd';
import { FormInstance,TimePicker } from 'antd';
import type { RangeValue } from 'rc-picker/lib/interface';
// Adjust import path as needed
import moment, { Moment } from 'moment';

import DaysButton from './DaysButton';
import { useTranslation } from 'react-i18next';
import { dayNumberToKey } from './BreaksCard';



interface AddBreakModalProps {
    isModalBreaksVisible: boolean;
    selectedDays: number[];
    form: FormInstance;
   
    setIsModalBreaksVisible: (visible: boolean) => void;
    setSelectedDays: (days: number[]) => void;
    handleAddBreak: () => void;
}

export const AddBreakModal: React.FC<AddBreakModalProps> = ({
    isModalBreaksVisible,
    selectedDays,
    form,
    setIsModalBreaksVisible,
    setSelectedDays,
    handleAddBreak,
}) => {
    const { t } = useTranslation();
    const { RangePicker } = TimePicker;
    // Memoize disabled hours calculation
    const disabledHours = useMemo(() => {
        const hours = [];
        // Disable hours before 8AM (0-7)
        for (let i = 0; i < 8; i++) hours.push(i);
        // Disable hours after 5PM (17-23)
        for (let i = 19; i < 24; i++) hours.push(i);
        return hours;
    }, []);

    // Memoize static times
    const minTime = useMemo(() => moment().set({ hour: 7, minute: 59 }), []);
    const maxTime = useMemo(() => moment().set({ hour: 18, minute: 0 }), []);
    return (
        <Modal
            zIndex = {10} 
            title={t("sched_tool.add_break") }
            open={isModalBreaksVisible}
            onOk={handleAddBreak}
            onCancel={() => setIsModalBreaksVisible(false)}
            okText={t("common.confirm")}
            cancelText={t("common.back")}
        >
            <Form
                form={form}
                layout="vertical"
                onValuesChange={(_, allValues) => {
                    if (allValues.days) {
                        setSelectedDays(allValues.days);
                    }
                }}
            >
                <Form.Item
                    name="description"
                    label={t("sched_tool.description")}
                    rules={[{ required: true, message: 'Please enter a description' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="days"
                    label={t("sched_tool.select_days")}
                    rules={[{ required: true, message: t("sched_tool.one_day")  }]}
                    initialValue={[]}
                >
                    <Row gutter={[8, 8]}>
                        {[1, 2, 3, 4, 5].map((day) => (
                            <Col key={day}>
                                <DaysButton
                                    text={t(`days.${dayNumberToKey[day]}`)}
                                    onClick={() => {
                                        const currentDays = form.getFieldValue('days') || [];
                                        const newDays = currentDays.includes(day)
                                            ? currentDays.filter((d: number) => d !== day)
                                            : [...currentDays, day];
                                        form.setFieldsValue({ days: newDays });
                                        setSelectedDays(newDays);
                                    }}
                                    isSelected={selectedDays.includes(day)}
                                    style={{ marginBottom: 8 }}
                                />
                            </Col>
                        ))}
                    </Row>
                </Form.Item>

                <Form.Item
                    name="timeRange"
                    label={t("sched_tool.time")}
                    rules={[
                        { required: true, message: t("sched_tool.one_range")  },
                        ({ getFieldValue }) => ({
                            validator(_, value: RangeValue<Moment>) {
                                if (!value?.[0] || !value?.[1]) {
                                    return Promise.reject(new Error(t("sched_tool.one_start_end")));
                                }

                                const [start, end] = value;
                                if (start.isBefore(minTime)) {
                                    return Promise.reject(new Error(t("sched_tool.one_before")));
                                }
                                if (end.isAfter(maxTime)) {
                                    return Promise.reject(new Error(t("sched_tool.one_after")));
                                }
                                if (!start.isBefore(end)) {
                                    return Promise.reject(new Error(t("sched_tool.one_order")));
                                }
                                return Promise.resolve();
                            },
                        }),
                    ]}
                >
                    <RangePicker
                        format="HH:mm"
                        minuteStep={15}
                        style={{ width: '100%' }}
                        disabledTime={() => ({
                            disabledHours: () => disabledHours,
                            disabledMinutes: (selectedHour:any) => {
                                if (selectedHour === 17) {
                                    return Array.from({ length: 60 }, (_, i) => i);
                                }
                                return [];
                            }
                        })}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};