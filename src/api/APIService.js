const PRODUCT_API='http://localhost:8083/web_order';

class APIService{
    getFoods(){
        return fetch(PRODUCT_API,{
            method:'GET',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            }
        }).then((res=>res.json()));
    }
}
export default new APIService();