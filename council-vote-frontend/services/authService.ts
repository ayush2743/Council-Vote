import { api } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthResponse, LoginRequest, SignupRequest } from '../types';

export const authService = {
  async login(credentials: LoginRequest) {
    const response = await api.post<AuthResponse>('/login', credentials);
    
    if (response.data?.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  async signup(data: SignupRequest) {
    const response = await api.post<AuthResponse>('/signup', data);
    
    if (response.data?.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  async logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  async getCurrentUser() {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  async getToken() {
    return await AsyncStorage.getItem('token');
  },
};
