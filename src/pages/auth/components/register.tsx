import { Button, Col, Divider, Form, Input, Row, Select } from 'antd';
import { Link } from 'react-router-dom';
import styles from 'styles/auth.module.scss';
import { IUser } from '@/types/backend';
import {
    validateVietnamesePhoneNumber,
} from '@/config/utils';
import { useRegister } from '../hooks/useRegister';
const { Option } = Select;


const RegisterPage = () => {

    const { onFinish, isSubmit, phoneValue, phoneError, handlePhoneChange } = useRegister();

    return (
        <div className={styles["register-page"]} >

            <main className={styles.main} >
                <div className={styles.container} >
                    <section className={styles.wrapper} style={{ maxWidth: 700, margin: '0 auto' }}>
                        <div className={styles.heading} >
                            <h2 className={`${styles.text} ${styles["text-large"]}`}> Đăng Ký Tài Khoản </h2>
                            < Divider />
                        </div>

                        <Form<IUser>
                            name="basic"
                            onFinish={onFinish}
                            autoComplete="off"
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        labelCol={{ span: 24 }}
                                        label="User name"
                                        name="userName"
                                        rules={[
                                            { required: true, message: 'UserName không được để trống!' },
                                            { min: 3, message: 'UserName phải có ít nhất 3 ký tự!' }
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        labelCol={{ span: 24 }}
                                        label="Số điện thoại"
                                        name="phoneNumber"
                                        rules={[
                                            { required: true, message: 'Số điện thoại không được để trống!' },
                                            {
                                                validator: (_, value) => {
                                                    if (!value || validateVietnamesePhoneNumber(value)) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Số điện thoại không hợp lệ'));
                                                }
                                            }
                                        ]}
                                        validateStatus={phoneError ? 'error' : ''}
                                        help={phoneError}
                                    >
                                        <Input
                                            value={phoneValue}
                                            onChange={handlePhoneChange}
                                            placeholder="Nhập số điện thoại (0xxxxxxxxx hoặc +84xxxxxxxxx)"
                                            maxLength={12}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Họ và tên"
                                name="fullName"
                                rules={[{ required: true, message: 'Họ và tên không được để trống!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        labelCol={{ span: 24 }}
                                        label="Email"
                                        name="email"
                                        rules={[
                                            { required: true, message: 'Email không được để trống!' },
                                            { type: 'email', message: 'Email không hợp lệ!' }
                                        ]}
                                    >
                                        <Input type='email' />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        labelCol={{ span: 24 }}
                                        label="Giới tính"
                                        name="gender"
                                        rules={[{ required: true, message: 'Giới tính không được để trống!' }]}
                                    >
                                        <Select allowClear>
                                            <Option value="MALE">Nam</Option>
                                            <Option value="FEMALE">Nữ</Option>
                                            <Option value="OTHER">Khác</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        labelCol={{ span: 24 }}
                                        label="Mật khẩu"
                                        name="password"
                                        rules={[
                                            { required: true, message: 'Mật khẩu không được để trống!' },
                                            {
                                                validator: (_, value) => {
                                                    if (value.length < 8) {
                                                        return Promise.reject(new Error('Mật khẩu phải dài ít nhất 8 ký tự'));
                                                    }
                                                    if (!/[A-Z]/.test(value)) {
                                                        return Promise.reject(new Error('Mật khẩu phải chứa ít nhất một chữ hoa'));
                                                    }
                                                    if (!/[0-9]/.test(value)) {
                                                        return Promise.reject(new Error('Mật khẩu phải chứa ít nhất một số'));
                                                    }
                                                    if (!/[!@#$%^&*]/.test(value)) {
                                                        return Promise.reject(new Error('Mật khẩu phải chứa ít nhất một ký tự đặc biệt'));
                                                    }
                                                    return Promise.resolve();
                                                },
                                            },
                                        ]}
                                    >
                                        <Input.Password />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        labelCol={{ span: 24 }}
                                        label="Nhập lại mật khẩu"
                                        name="confirmPassword"
                                        rules={[
                                            { required: true, message: 'Mật khẩu không được để trống!' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('password') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password />
                                    </Form.Item>
                                </Col>
                            </Row>

                            < Form.Item
                            >
                                <Button type="primary" htmlType="submit" loading={isSubmit} >
                                    Đăng ký
                                </Button>
                            </Form.Item>
                            <Divider> Or </Divider>
                            <p className="text text-normal" > Đã có tài khoản ?
                                <span>
                                    <Link to='/login' > Đăng Nhập </Link>
                                </span>
                            </p>
                        </Form>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default RegisterPage;