

import { Form, Input, Button, message, InputRef } from 'antd';
import styles from 'styles/auth.module.scss';
import { useState, useRef, useEffect } from 'react';
import { callVeriryOtp } from 'config/api';
import { useNavigate } from 'react-router-dom';




const VerifyOtpPage = () => {
    const email = localStorage.getItem("verifyEmail") || '';
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(300); // 5 phút = 300 giây
    const inputRefs = Array.from({ length: 6 }, () => useRef<InputRef>(null));

    // Đếm ngược timer
    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => {
            setTimer(t => t - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timer]);

    // Chỉ cho phép nhập số, tự động focus, xử lý backspace
    const handleChange = (value: string, idx: number) => {
        if (!/^[0-9]?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[idx] = value;
        setOtp(newOtp);
        if (value && idx < 5) {
            inputRefs[idx + 1].current?.focus();
        }
        // Nếu nhập đủ 6 số thì submit tự động
        if (newOtp.every(d => d.length === 1)) {
            handleSubmit(newOtp.join(''));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        if (e.key === 'Backspace') {
            if (otp[idx]) {
                // Xóa số hiện tại
                const newOtp = [...otp];
                newOtp[idx] = '';
                setOtp(newOtp);
            } else if (idx > 0) {
                // Quay lại ô trước
                inputRefs[idx - 1].current?.focus();
            }
        } else if (e.key === 'ArrowLeft' && idx > 0) {
            inputRefs[idx - 1].current?.focus();
        } else if (e.key === 'ArrowRight' && idx < 5) {
            inputRefs[idx + 1].current?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (paste.length === 6) {
            setOtp(paste.split(''));
            handleSubmit(paste);
        }
    };

    const handleSubmit = async (otpValue: string) => {
        if (!email) {
            message.error('Không tìm thấy email xác thực!');
            return;
        }
        setLoading(true);
        try {
            const res = await callVeriryOtp(email, otpValue);
            if (res && (res as any).data) {
                message.success('Xác thực OTP thành công!');
                localStorage.removeItem("verifyEmail");
                navigate('/login')
            } else {
                message.error((res as any)?.detail || 'Xác thực OTP thất bại!');
            }
        } catch (err: any) {
            message.error(err?.detail || 'Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        // TODO: Gọi API gửi lại OTP ở đây nếu có
        setTimeout(() => {
            setResendLoading(false);
            setTimer(300); // Reset lại 5 phút
            message.success('Đã gửi lại mã OTP!');
        }, 1000);
    };

    // Hiển thị mm:ss
    const formatTime = (s: number) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
            <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', minWidth: 350 }}>
                <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Verify OTP</h2>
                <div style={{ textAlign: 'center', marginBottom: 12, color: '#1a73e8', fontWeight: 500 }}>
                    Thời gian còn lại: {formatTime(timer)}
                </div>
                <Form onFinish={() => handleSubmit(otp.join(''))} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                        {otp.map((digit, idx) => (
                            <Input
                                key={idx}
                                ref={inputRefs[idx]}
                                maxLength={1}
                                value={digit}
                                onChange={e => handleChange(e.target.value, idx)}
                                onKeyDown={e => handleKeyDown(e, idx)}
                                onPaste={handlePaste}
                                style={{ width: 40, height: 48, textAlign: 'center', fontSize: 24, borderRadius: 8, border: '1px solid #d9d9d9' }}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                autoFocus={idx === 0}
                            />
                        ))}
                    </div>
                    <Button type="primary" htmlType="submit" loading={loading} block disabled={otp.some(d => d === '')} style={{ marginBottom: 12 }}>
                        Verify
                    </Button>
                    <Button type="link" onClick={handleResend} loading={resendLoading} disabled={loading} style={{ padding: 0 }}>
                        Resend OTP
                    </Button>
                </Form>
            </div>
        </div>
    );
};

export default VerifyOtpPage;