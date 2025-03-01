import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContent = createContext(); // ✅ Correct context creation

export const AppContentProvider = (props) => {

    axios.defaults.withCredentials=true;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userData, setUserData] = useState(false); // Changed from `false` to `null` (better practice for user data)
    
    // 
    // const getAuthState = async () => {
    //     // if (!backendUrl) {
    //     //     console.error("backendUrl is not defined!");
    //     //     return;
    //     // }
    
    //     try {
    //         const response = await fetch(new URL(`${backendUrl}/api/auth/is-auth`), { 
    //             credentials: "include" 
    //         });
    //         const data = await response.json();
    //         setUserData(data.user);
    //     }
    //      catch (error) {
    //         console.error("Auth State Error:", error);
    //     }
    // }

    const getAuthState=async ()=>{
        try{
            const {data}= await axios.get(backendUrl + '/api/auth/is-auth')
            if(data.success){
                setIsLoggedin(true);
                getUserData()
            }


        }
        catch(error){
            toast.error(error.message);

        }
    }
    
    const getUserData =async()=>{
        try{
            const {data}=await axios.get(backendUrl +'/api/user/data')
            data.success ? setUserData(data.userData):toast.error(data.message)

        }
        catch (error) {
            console.error("Error:", error); // Debugging
            toast.error(error.response?.data?.message || "Something went wrong!");
        }


    }
    useEffect(()=>{
        getAuthState();

    },[])



    const value = {
        backendUrl,
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,getUserData,getAuthState
    };

    return (
        <AppContent.Provider value={value}>  {/* ✅ Correct usage */}
            {props.children}
        </AppContent.Provider>
    );
};




































// import { createContext, useState } from "react";

// export const AppContent=createContext();


// export const AppContentProvider=(props)=>{
//     const backendUrl=import.meta.env.VITE_BACKEND_URL
//     const [isLoggedin,setIsLoggedin]=useState(false);
//     const [userData,setUserData]=useState(false);

//     const value={
//         backendUrl,
//         setIsLoggedin,isLoggedin,setUserData, userData

//     }

//     return (
//         <AppContent.Provider value={value}>
//             {props.children}

//         </AppContent.Provider>
//     )
// }