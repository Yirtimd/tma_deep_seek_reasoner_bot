import { Provider } from 'react-redux';
import { store } from '../store/store';
import '../styles/globals.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" 
        />
        <title>You_AI_Chat</title>
      </Head>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;