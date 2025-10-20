import { useState, useEffect, useRef } from 'react';
import { Form, message, InputRef } from 'antd';
import { useNavigate } from 'react-router-dom';
import { callVeriryOtp } from 'config/api';

export const useVerifyOtp = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300); // 5 phút = 300 giây
  const inputRefs = Array.from({ length: 6 }, () => useRef<InputRef>(null));
  const email = localStorage.getItem('verifyEmail') || '';

  // Khôi phục timer từ localStorage khi trang được làm mới
  useEffect(() => {
    const savedStartTime = localStorage.getItem('otpStartTime');
    if (savedStartTime) {
      const startTime = parseInt(savedStartTime, 10);
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      const remainingTime = Math.max(300 - elapsedTime, 0);
      setTimer(remainingTime);
    } else {
      localStorage.setItem('otpStartTime', Date.now().toString());
    }

    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((t) => {
        const newTime = t - 1;
        if (newTime <= 0) {
          localStorage.removeItem('otpStartTime');
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value: string, idx: number) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    if (value && idx < 5) {
      inputRefs[idx + 1].current?.focus();
    }
    if (newOtp.every(d => d.length === 1)) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace') {
      if (otp[idx]) {
        const newOtp = [...otp];
        newOtp[idx] = '';
        setOtp(newOtp);
      } else if (idx > 0) {
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
    // Validate OTP
    if (!otpValue || otpValue.length !== 6 || !/^\d{6}$/.test(otpValue)) {
      message.error('OTP phải gồm đúng 6 chữ số!');
      return;
    }

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.error('Email xác thực không hợp lệ!');
      return;
    }

    setLoading(true);
    try {
      const res = await callVeriryOtp(email, otpValue);
      if (res && (res as any).data) {
        message.success('Xác thực OTP thành công!');
        localStorage.removeItem('verifyEmail');
        localStorage.removeItem('otpStartTime');
        navigate('/login');
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
    // Validate email before resending
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.error('Email xác thực không hợp lệ!');
      return;
    }

    setResendLoading(true);
    // TODO: Gọi API gửi lại OTP ở đây nếu có
    setTimeout(() => {
      setResendLoading(false);
      setTimer(300);
      localStorage.setItem('otpStartTime', Date.now().toString());
      message.success('Đã gửi lại mã OTP!');
    }, 1000);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return {
    form,
    loading,
    resendLoading,
    otp,
    timer,
    inputRefs,
    email,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleSubmit,
    handleResend,
    formatTime,
  };
};