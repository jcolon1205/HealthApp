export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };
  
  export const isSuperUser = () => {
    return localStorage.getItem('isSuperUser') === 'true';
  };