import React, { useState, useRef, FC } from 'react';
import { Input, Space, Button } from 'antd';
import {
    SmileOutlined,
    PaperClipOutlined,
    SendOutlined,
} from '@ant-design/icons';
import 'react-chat-elements/dist/main.css';   // core chat CSS
import { useTranslation } from 'react-i18next';

// 1. Auto-resizing TextArea
const { TextArea } = Input;

const ChatComposer: FC<{

    onSend: (msg: string, file?: File) => void;
}> = ({ onSend }) => {
    const [value, setValue] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // 2. Send handler
    const handleSend = () => {
        if (!value.trim()) return;
        const file = fileInputRef.current?.files?.[0];
        onSend(value.trim(), file);
        setValue('');
    };
    const { t } = useTranslation();
    return (
        <>
            <Space.Compact
                style={{
                    width: '100%',
                    borderRadius: 24,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    padding: 8,
                    background: '#fff',
                    //zIndex: "50",
                    //position: "absolute",
                    //bottom:5
                }}
            >
                {/* Emoji toggle */}
                <Button
                    icon={<SmileOutlined />}
                    onClick={() => setShowEmojiPicker(v => !v)}
                    aria-label="Insert emoji"               // ARIA label :contentReference[oaicite:5]{index=5}
                    type="text"
                />

                {/* File attachment */}
                <Button
                    icon={<PaperClipOutlined />}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Attach file"
                    type="text"
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    aria-hidden="true"
                />

                {/* 3. Auto-resizing TextArea */}
                <TextArea
                    autoSize={{ minRows: 1, maxRows: 6 }}    // autosize docs :contentReference[oaicite:6]{index=6}
                    placeholder={t("chats.type")} 
                    style={{ flex: 1, border: 'none', outline: 'none' }}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onPressEnter={e => {
                        if (!e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />

                {/* 4. Send button */}
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                    disabled={!value.trim()}
                    aria-label="Send message"               // ARIA role/button :contentReference[oaicite:7]{index=7}
                />
            </Space.Compact>

            {/* 5. (Optional) Emoji picker dropdown */}
            {showEmojiPicker && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 60,
                        left: 16,
                        padding: 8,
                        background: '#fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        borderRadius: 8,
                    }}
                >
                    {/* Integrate your favorite emoji picker here */}
                    <p style={{ margin: 0, color: '#999' }}>😊 Emoji picker…</p>
                </div>
            )}
        </>
    );
};

export default ChatComposer;
