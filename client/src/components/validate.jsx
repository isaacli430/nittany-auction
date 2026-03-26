import axios from 'axios';

const validate = async () => {
    var token = localStorage.getItem('token');
    if (token != null) {
        try {
            await axios.get('http://localhost:5000/api/validate', {
                'headers': {
                    'Authorization': token
                }
            });
            return true;

        } catch (error) {
            localStorage.removeItem('token');
            return false;
        }

    } else {
        return false;
    }
}

export default validate;