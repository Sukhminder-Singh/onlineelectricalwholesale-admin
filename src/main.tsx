
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import "primereact/resources/themes/lara-light-blue/theme.css";
import { PrimeReactProvider } from 'primereact/api';



createRoot(document.getElementById("root")!).render(

  
    <AppWrapper>
      <PrimeReactProvider>
        <App />
      </PrimeReactProvider>
    </AppWrapper>


);
