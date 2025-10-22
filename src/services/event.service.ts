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

/** 💾 Lưu event vào localStorage */
function saveEventToLocalStorage(event: ProductEventRequest) {
  const key = 'product-events';
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  const timestamp = new Date().toISOString();
  existing.push({ ...event, timestamp });
  localStorage.setItem(key, JSON.stringify(existing));
}

export interface ProductEventRequest {
  productId?: number;
  keyword?: string; // dùng cho search event
  sessionId?: string;
  actionType?: number; //1 là VIEW, 2 là SEARCH
  timestamp?: string;
}

export const sendViewEvent = async (productId: number) => {
  const payload: ProductEventRequest = {
    productId,
    actionType: 1,
  };
  return httpClient.post('/view', payload);
};

export const sendSearchEvent = async (keyword: string) => {
  const payload: ProductEventRequest = {
    keyword : keyword.toLowerCase(),
    actionType: 2,
  };
  return httpClient.post('/search', payload);
};
