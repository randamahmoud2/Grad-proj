import React, {createContext, useState} from "react";
import all_product from '../components/Assets/all_product'

export const  DoctorContext = createContext(null);



const DoctorContextProvider = (props) => {
    
    const [cartItems, setCartItem] = useState();

    const contextValue = {all_product};

    return (
        <DoctorContext.Provider value={contextValue}>
            {props.children};
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider;