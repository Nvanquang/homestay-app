import { Button, Col, Divider, Form, Input, Row, Select, message, notification } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { callRegister } from 'config/api';
import styles from 'styles/auth.module.scss';
import { IBackendError, IUser } from '@/types/backend';
import { isSuccessResponse } from '@/config/utils';
const { Option } = Select;


const RegisterPage = () => {
    const navigate = useNavigate();
    const [isSubmit, setIsSubmit] = useState(false);

    const onFinish = async (values: IUser) => {
        const { userName, password, confirmPassword, email, phoneNumber, fullName, gender } = values;
        setIsSubmit(true);
        const res = await callRegister(userName, password as string, confirmPassword as string, email, phoneNumber, fullName, gender);
        setIsSubmit(false);
        if (isSuccessResponse(res) &&  res?.data?.id) {
            message.success('Đăng ký tài khoản thành công!');
            navigate('/login')
        } else {
            const errRes = res as IBackendError;
            notification.error({
                message: "Có lỗi xảy ra",
                description: errRes.detail,
                    // res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 5
            })
        }
    };


    return (
        <div className={styles["register-page"]} >

            <main className={styles.main} >
                <div className={styles.container} >
                    <section className={styles.wrapper} >
                        <div className={styles.heading} >
                            <h2 className={`${styles.text} ${styles["text-large"]}`}> Đăng Ký Tài Khoản </h2>
                            < Divider />
                        </div>

                        < Form<IUser>
                            name="basic"
                            // style={{ maxWidth: 600, margin: '0 auto' }}
                            onFinish={onFinish}
                            autoComplete="off"
                        >
                            
                            <Form.Item
                                labelCol={{ span: 24 }} //whole column
                                label="User name"
                                name="userName"
                                rules={[{ required: true, message: 'UserName không được để trống!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }} //whole column
                                label="Số điện thoại"
                                name="phoneNumber"
                                rules={[{ required: true, message: 'Số điện thoại không được để trống!' }]}
                            >
                                <Input type='phoneNumber' />
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }
                                } //whole column
                                label="Email"
                                name="email"
                                rules={[{ required: true, message: 'Email không được để trống!' }]}
                            >
                                <Input type='email' />
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }} //whole column
                                label="Mật khẩu"
                                name="password"
                                rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }} //whole column
                                label="Nhập lại mật khẩu"
                                name="confirmPassword"
                                rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }} //whole column
                                label="Họ và tên"
                                name="fullName"
                                rules={[{ required: true, message: 'Họ và tên không được để trống!' }]}
                            >
                                <Input />
                            </Form.Item>


                            <Form.Item
                                labelCol={{ span: 24 }} //whole column
                                name="gender"
                                label="Giới tính"
                                rules={[{ required: true, message: 'Giới tính không được để trống!' }]}
                            >
                                <Select
                                    // placeholder="Select a option and change input text above"
                                    // onChange={onGenderChange}
                                    allowClear
                                >
                                    <Option value="MALE">Nam</Option>
                                    <Option value="FEMALE">Nữ</Option>
                                    <Option value="OTHER">Khác</Option>
                                </Select>
                            </Form.Item>

                            < Form.Item
                            // wrapperCol={{ offset: 6, span: 16 }}
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