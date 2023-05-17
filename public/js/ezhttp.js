/**
 * ezHTTP Library
 * @version 1.0.0
 * @author AAC
 * @date 21 June 2020
 */

class EzHTTP{
    //HTTP GET Request
    async get(url){
        const res  = await fetch(url);
        const resData = await res.json(); 
        return resData;
    }

    //HTTP POST Request
    async post(url, data){
        const res  = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-type':'application/json'
            },
            body: JSON.stringify(data)            
        });
        if(res.status === 401)
            window.location.href = "users/login";
        if(!res.ok) throw new Error(res.status); 
        return await res.json(); 
    }

    //HTTP PUT Request
    async put(url, data){
        const res  = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-type':'application/json'
            },
            body: JSON.stringify(data)            
        });
        const resData = await res.json(); 
        return resData;
        // return new Promise((resolve, reject) => {
        //     fetch(url,{
        //         method: 'PUT',
        //         headers: {
        //             'Content-type':'application/json'
        //         },
        //         body: JSON.stringify(data)
        //     })
        //     .then(res => res.json())
        //     .then(data => resolve(data))
        //     .catch(err => reject(err));
        // });
    }
    
    //HTTP DELETE Request
    async delete(url){
        const res  = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-type':'application/json'
            }  
        });
        const resData = await res.json(); //'Deleted'; 
        return resData;
    }        
}