import React from 'react'
import './Errormodal.css'

export const Errormodal = ({isvisible, errormessage=null}) => {

    if (isvisible === true) {
        return (
        <div className='Errormodal'>

            {errormessage.length > 0 && (
                <div>
                    {errormessage.map((err, index) => (
                        <div key={index}>
                            <p>{err}</p>
                        </div> 
                    ))}
                </div>
            )}


        </div>
    ) 
    }
    else {
        return <></>
    }
    
}
export default Errormodal;