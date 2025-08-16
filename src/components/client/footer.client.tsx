
import styles from '@/styles/client.module.scss';

const Footer = () => {
    return (
        <footer className={styles.footerAirbnb}>
            <div className={styles.footerContainer}>
                <div className={styles.footerCol}>
                    <h4>Hỗ trợ</h4>
                    <ul>
                        <li>Trung tâm trợ giúp</li>
                        <li>Thông tin an toàn</li>
                        <li>Chính sách hoàn tiền</li>
                        <li>Hỗ trợ người khuyết tật</li>
                    </ul>
                </div>
                <div className={styles.footerCol}>
                    <h4>Cộng đồng</h4>
                    <ul>
                        <li>Airbnb.org</li>
                        <li>Chống phân biệt đối xử</li>
                        <li>Đối tác</li>
                        <li>Blog</li>
                    </ul>
                </div>
                <div className={styles.footerCol}>
                    <h4>Kết nối</h4>
                    <ul className={styles.socials}>
                        <li><a href="#" aria-label="Facebook"><svg width="20" height="20" fill="currentColor"><path d="M18 0h-16c-1.1 0-2 0.9-2 2v16c0 1.1 0.9 2 2 2h8v-7h-2v-3h2v-2c0-2.2 1.3-3.4 3.3-3.4 1 0 2 .1 2 .1v2.3h-1.1c-1.1 0-1.3.5-1.3 1.2v1.8h2.6l-.3 3h-2.3v7h4c1.1 0 2-0.9 2-2v-16c0-1.1-0.9-2-2-2z"/></svg></a></li>
                        <li><a href="#" aria-label="Twitter"><svg width="20" height="20" fill="currentColor"><path d="M20 3.8c-.7.3-1.4.5-2.1.6.8-.5 1.3-1.2 1.6-2-.7.4-1.5.7-2.3.9-.7-.7-1.6-1.1-2.6-1.1-2 0-3.5 1.6-3.5 3.5 0 .3 0 .6.1.8-2.9-.1-5.5-1.5-7.2-3.6-.3.6-.5 1.2-.5 1.9 0 1.3.7 2.4 1.7 3-.6 0-1.2-.2-1.7-.5v.1c0 1.8 1.3 3.2 3 3.5-.3.1-.6.2-.9.2-.2 0-.4 0-.6-.1.4 1.3 1.6 2.3 3.1 2.3-1.1.9-2.5 1.4-4 1.4-.3 0-.6 0-.8-.1 1.4 1 3.1 1.6 4.9 1.6 5.9 0 9.1-4.9 9.1-9.1v-.4c.6-.4 1.2-1 1.6-1.6z"/></svg></a></li>
                        <li><a href="#" aria-label="Instagram"><svg width="20" height="20" fill="currentColor"><circle cx="10" cy="10" r="3.5"/><path d="M14.5 2h-9c-1.4 0-2.5 1.1-2.5 2.5v9c0 1.4 1.1 2.5 2.5 2.5h9c1.4 0 2.5-1.1 2.5-2.5v-9c0-1.4-1.1-2.5-2.5-2.5zm-4.5 12c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5zm5-7.5c-.4 0-.7-.3-.7-.7s.3-.7.7-.7.7.3.7.7-.3.7-.7.7z"/></svg></a></li>
                    </ul>
                </div>
            </div>
            <div className={styles.footerBottom}>
                <span>© {new Date().getFullYear()} Airbnb clone. All rights reserved.</span>
            </div>
        </footer>
    );
}

export default Footer;