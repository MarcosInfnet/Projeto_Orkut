import axios from "axios";
import toast from "react-simple-toasts";
import { TokenStorage } from "./tokenStorage";
import { globalNavigate } from "./GlobalNavigate";
import { useGlobalStore } from "./useGlobalStore";


const { setIsLoading, setUser } = useGlobalStore.getState();

export const api = axios.create({
baseURL: "http://localhost:8080",

});

api.interceptors.request.use((config) => {
  setIsLoading(true);
  const token =TokenStorage.getToken( );
  if (token) {
  config.headers.Authorization = `Bearer ${token}`;
    console.log("enviando...");
  }
    return config;
  });

  api.interceptors.response.use(
    (config) => {
      setIsLoading(false);
      console.log("recebendo...");
      return config;    
    },
    
    (error) => {
      setIsLoading(false);
       if(error.response.status ===401){   
        const token = TokenStorage.getToken();
        if(token){
          TokenStorage.removeToken();
          setUser({
            id: 0,
            first_name: "",
            last_name: "",
            email: "",
            avatar: "",
          });
          toast('Sua sessão expirou! Por favor, realize um novo sign-in!');
          globalNavigate.navigate('/entrar');
          return;
        }
      }



      if (error.response.data.errors && error.response.status >= 400) {
      const errors = error.response.data.errors.map((issue) => 
      Object.values(issue.constraints).at(0)
      );
      errors.forEach((error) =>
        toast(error, {
          render(message) {
            return (
              <div className="p-2 rounded-md text-gray-100 bg-red-500">
                {message}
              </div>
            );
          },
        })
      );
    }else if (error.response.data.message && error.response.status >= 400) {
      toast(error.response.data.message, {
        render(message) {
          return (
            <div className="p-2 rounded-md text-gray-100 bg-red-500">
              {message}
            </div>
          );
        },
      });
    } else {
      throw error;
    }
  }
);

