import styles from '@/styles/client.module.scss';
import MainContent from '@/components/client/main.client';

const HomePage = () => {

  return (
    <div className={styles.homePage}>

      {/* Main content */}
      <MainContent showPagination={true}/>

    </div>
  );
};

export default HomePage;
