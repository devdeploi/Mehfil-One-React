// export const API_URL = `http://${window.location.hostname}:5000/api`;

export const API_URL = `https://backend.mehfilone.in/api`;

export const generateAdminLoginUrl = () => {
    const generateHash = (length) => {
        let result = '';
        const characters = 'abcdef0123456789';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };
    
    // Generate random state and nonce
    const stateBase = generateHash(64);
    // Base64 encode the state base to look similar to the example
    const state = btoa(stateBase + ';/orders/').replace(/=/g, '%3D');
    const nonce = generateHash(64);
    
    const queryParams = `?ReturnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fclient_id%3Dsflite%26response_type%3Dcode%26scope%3Dopenid%2520profile%2520email%2520offline_access%2520idp%253Aapi%26redirect_uri%3Dhttps%253A%252F%252Fbusiness.parcel.royalmail.com%252Fcallback&state=${state}&nonce=${nonce}`;

    return `/9fe66b121b3e4c9cabe51b36d5bbcaed/login${queryParams}`;
};