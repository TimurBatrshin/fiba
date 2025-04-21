import { ApiService } from '../api';
import fetchMock from 'jest-fetch-mock';

describe('ApiService', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    ApiService.clearAuthToken();
  });

  describe('Аутентификация', () => {
    test('setAuthToken должен устанавливать токен авторизации', () => {
      ApiService.setAuthToken('test-token');
      
      // Делаем тестовый запрос для проверки, что токен используется
      fetchMock.mockResponseOnce(JSON.stringify({ data: 'success' }));
      
      ApiService.get('/test-endpoint');
      
      const headers = fetchMock.mock.calls[0][1]?.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer test-token');
    });
    
    test('clearAuthToken должен очищать токен авторизации', () => {
      ApiService.setAuthToken('test-token');
      ApiService.clearAuthToken();
      
      fetchMock.mockResponseOnce(JSON.stringify({ data: 'success' }));
      
      ApiService.get('/test-endpoint');
      
      const headers = fetchMock.mock.calls[0][1]?.headers as Headers;
      expect(headers.get('Authorization')).toBeNull();
    });
  });

  describe('HTTP методы', () => {
    test('get должен выполнять GET-запрос с правильными параметрами', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ data: 'success' }));
      
      await ApiService.get('/test', { param1: 'value1', param2: 'value2' });
      
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).toContain('/test');
      expect(url).toContain('param1=value1');
      expect(url).toContain('param2=value2');
      expect(fetchMock.mock.calls[0][1]?.method).toBe('GET');
    });

    test('post должен выполнять POST-запрос с правильным телом', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ data: 'success' }));
      
      const postData = { key1: 'value1', key2: 'value2' };
      await ApiService.post('/test', postData);
      
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toContain('/test');
      expect(fetchMock.mock.calls[0][1]?.method).toBe('POST');
      expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual(postData);
    });

    test('put должен выполнять PUT-запрос с правильным телом', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ data: 'success' }));
      
      const putData = { key1: 'value1', key2: 'value2' };
      await ApiService.put('/test', putData);
      
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toContain('/test');
      expect(fetchMock.mock.calls[0][1]?.method).toBe('PUT');
      expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual(putData);
    });

    test('delete должен выполнять DELETE-запрос', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ data: 'success' }));
      
      await ApiService.delete('/test');
      
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toContain('/test');
      expect(fetchMock.mock.calls[0][1]?.method).toBe('DELETE');
    });
  });

  describe('Обработка ошибок', () => {
    test('должен обрабатывать ошибки HTTP-запросов', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ message: 'Not found' }), { status: 404 });
      
      await expect(ApiService.get('/not-found')).rejects.toThrow();
      
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Трансформация URL', () => {
    test('должен проксировать запросы к определенным URL', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ data: 'success' }));
      
      // Эмулируем private-метод через monkey patching
      const originalRequest = ApiService['request'];
      ApiService['request'] = jest.fn().mockResolvedValue({ data: 'success' });
      
      await ApiService.get('https://static.bro-js.ru/some-resource.js');
      
      expect(ApiService['request']).toHaveBeenCalledTimes(1);
      const args = (ApiService['request'] as jest.Mock).mock.calls[0];
      expect(args[0]).toContain('/proxy/some-resource.js');
      
      // Восстанавливаем оригинальный метод
      ApiService['request'] = originalRequest;
    });
  });
}); 