import jwt_decode from 'jwt-decode';

interface DecodedToken {
  role: string;
}

export const getRole = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const decoded = jwt_decode<DecodedToken>(token);
    return decoded.role;
  } catch {
    return null;
  }
};