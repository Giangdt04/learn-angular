import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import axios from 'axios';

// Tạo instance Axios
const httpClient = axios.create({
    baseURL: 'http://localhost:8080/identity/events',
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

export interface ProductEventRequest {
  productId?: number;
  keyword?: string; // dùng cho search event
  sessionId?: string;
  actionType?: string;
  timestamp?: string;
}

export const sendViewEvent = async (productId: number) => {
  const payload: ProductEventRequest = {
    productId,
    actionType: "VIEW",
  };
  return httpClient.post('/view', payload);
};

export const sendSearchEvent = async (keyword: string) => {
  const payload: ProductEventRequest = {
    keyword,
    actionType: "SEARCH",
  };
  return httpClient.post('/search', payload);
};
