import { Form, Input, Button } from 'antd';
import { useVerifyOtp } from '../hooks/useVerifyOtp';

const VerifyOtpPage = () => {
  const {
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
  } = useVerifyOtp();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', minWidth: 350 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Verify OTP</h2>
        <div style={{ textAlign: 'center', marginBottom: 12, color: '#1a73e8', fontWeight: 500 }}>
          Thời gian còn lại: {formatTime(timer)}
        </div>
        <Form
          form={form}
          onFinish={() => handleSubmit(otp.join(''))}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
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
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            disabled={otp.some(d => d === '')}
            style={{ marginBottom: 12 }}
          >
            Verify
          </Button>
          <Button
            type="link"
            onClick={handleResend}
            loading={resendLoading}
            disabled={loading}
            style={{ padding: 0 }}
          >
            Resend OTP
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default VerifyOtpPage;