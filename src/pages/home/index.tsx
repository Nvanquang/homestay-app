import Header from '@/components/client/header.client';
import styles from '@/styles/client.module.scss';
import { ISearchHomestayRequest } from '@/types/backend';
import MainContent from '@/components/client/main.client';
import Footer from '@/components/client/footer.client';

const HomePage = () => {
 
  // const handleSearch = (searchData: ISearchHomestayRequest) => {
  //   console.log('Search data:', searchData);
  //   // Có thể dispatch fetchHomestay({ query }) ở đây nếu muốn search
  // };

  return (
    <div className={styles.homePage}>
      {/* <Header onSearch={handleSearch} /> */}

      {/* Main content */}
      <MainContent showPagination={true}/>

      {/* <Footer /> */}
      
    </div>
  );
};

export default HomePage;
