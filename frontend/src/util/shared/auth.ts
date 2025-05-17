import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id: string;
  role: string;
}

export const getUserRole = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.role;
  } catch {
    return null;
  }
};

export const getUserId = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.id;
  } catch {
    return null;
  }
};
