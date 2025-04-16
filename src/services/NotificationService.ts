import axios from 'axios';
import { API_BASE_URL, APP_SETTINGS, SERVICE_WORKER_SETTINGS } from '../config/envConfig';

interface NotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class NotificationService {
  private static instance: NotificationService;
  
  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Получение статуса push-уведомлений
  public async getNotificationStatus(): Promise<{ permission: NotificationPermission; isSubscribed: boolean }> {
    let permission: NotificationPermission = 'default';
    let isSubscribed = false;

    // Проверяем поддержку уведомлений в браузере
    if ('Notification' in window) {
      permission = Notification.permission;
    }

    // Проверяем статус подписки
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        isSubscribed = !!subscription;
      } catch (error) {
        console.error('Ошибка при проверке статуса подписки:', error);
      }
    }

    return { permission, isSubscribed };
  }

  // Запрос разрешения на отправку уведомлений
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Этот браузер не поддерживает уведомления');
      return 'denied';
    }
    
    try {
      return await Notification.requestPermission();
    } catch (error) {
      console.error('Ошибка при запросе разрешения на уведомления:', error);
      return 'denied';
    }
  }

  // Подписка на push-уведомления
  public async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push-уведомления не поддерживаются этим браузером');
      return null;
    }
    
    try {
      // Получаем регистрацию service worker'а
      const registration = await navigator.serviceWorker.ready;
      
      // Проверяем существующую подписку
      let subscription = await registration.pushManager.getSubscription();
      
      // Если уже подписан, возвращаем существующую подписку
      if (subscription) {
        return subscription;
      }
      
      // Получаем публичный ключ с сервера
      const response = await axios.get(`${API_BASE_URL}/notifications/public-key`);
      const publicKey = response.data.publicKey;
      
      // Создаем новую подписку
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicKey)
      });
      
      // Отправляем подписку на сервер для сохранения
      await this.saveSubscription(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Ошибка при подписке на push-уведомления:', error);
      return null;
    }
  }

  // Отписка от push-уведомлений
  public async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Удаляем подписку с сервера
        await this.deleteSubscription(subscription);
        
        // Отписываемся на клиенте
        const success = await subscription.unsubscribe();
        return success;
      }
      
      return false;
    } catch (error) {
      console.error('Ошибка при отписке от push-уведомлений:', error);
      return false;
    }
  }

  // Сохранение подписки на сервере
  private async saveSubscription(subscription: PushSubscription): Promise<void> {
    const subscriptionObject: NotificationSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: this.arrayBufferToBase64(
          subscription.getKey('p256dh') as ArrayBuffer
        ),
        auth: this.arrayBufferToBase64(
          subscription.getKey('auth') as ArrayBuffer
        )
      }
    };

    try {
      await axios.post(
        `${API_BASE_URL}/notifications/subscribe`,
        subscriptionObject,
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Ошибка при сохранении подписки на сервере:', error);
      throw error;
    }
  }

  // Удаление подписки с сервера
  private async deleteSubscription(subscription: PushSubscription): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/notifications/unsubscribe`,
        { endpoint: subscription.endpoint },
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Ошибка при удалении подписки с сервера:', error);
      throw error;
    }
  }

  // Преобразование ArrayBuffer в Base64
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return btoa(String.fromCharCode.apply(null, Array.from(bytes)));
  }

  // Преобразование base64 в Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }
}

export default NotificationService.getInstance(); 